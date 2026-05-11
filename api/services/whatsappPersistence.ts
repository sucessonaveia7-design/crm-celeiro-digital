import { supabaseAdmin } from '../lib/supabase.ts';

// Alias local — todas as queries deste módulo usam supabaseAdmin (service_role).
const supabase = supabaseAdmin;

console.log('[persist] módulo carregado — usando supabaseAdmin (service_role)');

const CHURCH_ID = 'f6266811-ac76-43db-bb18-ffd1cda0a6f7';

// ── helpers ───────────────────────────────────────────────────────────────────

function phoneFromJid(jid: string): string {
  return jid.split('@')[0];
}

function isGroupJid(jid: string): boolean {
  return jid.endsWith('@g.us');
}

// Loga o erro do Supabase completo — nunca imprime chaves secretas.
function logSupabaseError(label: string, error: any): void {
  console.error(`[persist][${label}] Supabase error:`, {
    code:    error?.code,
    message: error?.message,
    details: error?.details,
    hint:    error?.hint,
  });
}

// ── contact ───────────────────────────────────────────────────────────────────

async function upsertContact(
  phone:       string,
  displayName: string,
): Promise<string | null> {
  console.log(`[persist][contact] buscando phone="${phone}"`);

  const { data: found, error: findErr } = await supabase
    .from('contacts')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (findErr) { logSupabaseError('contact:find', findErr); return null; }
  if (found)   { console.log(`[persist][contact] encontrado id=${found.id}`); return found.id; }

  console.log(`[persist][contact] não encontrado — inserindo name="${displayName}"`);

  const { data: created, error: insertErr } = await supabase
    .from('contacts')
    .insert({ name: displayName || phone, phone, church_id: CHURCH_ID })
    .select('id')
    .single();

  if (insertErr) {
    // church_id pode não existir na tabela — tentar sem ele
    if (insertErr.code === '42703') {
      console.warn('[persist][contact] coluna church_id ausente — tentando sem ela');
      const { data: c2, error: e2 } = await supabase
        .from('contacts')
        .insert({ name: displayName || phone, phone })
        .select('id')
        .single();
      if (e2) { logSupabaseError('contact:insert-fallback', e2); return null; }
      console.log(`[persist][contact] criado id=${c2.id}`);
      return c2.id;
    }
    // Race condition
    if (insertErr.code === '23505') {
      const { data: retry } = await supabase
        .from('contacts').select('id').eq('phone', phone).maybeSingle();
      return retry?.id ?? null;
    }
    logSupabaseError('contact:insert', insertErr);
    return null;
  }

  console.log(`[persist][contact] criado id=${created.id}`);
  return created.id;
}

// ── conversation ──────────────────────────────────────────────────────────────

async function upsertConversation(
  whatsappJid:  string,
  contactId:    string,
  instanceName: string,
): Promise<string | null> {
  console.log(`[persist][conversation] buscando jid="${whatsappJid}"`);

  const { data: found, error: findErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('whatsapp_jid', whatsappJid)
    .maybeSingle();

  if (findErr) {
    // whatsapp_jid ainda não existe — migration não foi rodada
    if (findErr.code === '42703') {
      console.error(
        '[persist][conversation] COLUNA whatsapp_jid NÃO EXISTE em conversations. ' +
        'Execute a migration 20260511_whatsapp_persistence.sql no Supabase SQL Editor.'
      );
      return null;
    }
    logSupabaseError('conversation:find', findErr);
    return null;
  }

  if (found) {
    console.log(`[persist][conversation] encontrada id=${found.id}`);
    return found.id;
  }

  console.log(`[persist][conversation] não encontrada — inserindo`);

  const payload: Record<string, unknown> = {
    church_id:     CHURCH_ID,
    contact_id:    contactId,
    whatsapp_jid:  whatsappJid,
    instance_name: instanceName,
    status:        'aguardando',
    unread_count:  0,
  };

  const { data: created, error: insertErr } = await supabase
    .from('conversations')
    .insert(payload)
    .select('id')
    .single();

  if (insertErr) {
    // instance_name pode não existir — tentar sem ela
    if (insertErr.code === '42703' && String(insertErr.message).includes('instance_name')) {
      console.warn('[persist][conversation] coluna instance_name ausente — tentando sem ela');
      const { instance_name: _drop, ...payloadWithout } = payload;
      const { data: c2, error: e2 } = await supabase
        .from('conversations')
        .insert(payloadWithout)
        .select('id')
        .single();
      if (e2) { logSupabaseError('conversation:insert-fallback', e2); return null; }
      console.log(`[persist][conversation] criada id=${c2.id}`);
      return c2.id;
    }
    if (insertErr.code === '23505') {
      const { data: retry } = await supabase
        .from('conversations').select('id').eq('whatsapp_jid', whatsappJid).maybeSingle();
      return retry?.id ?? null;
    }
    logSupabaseError('conversation:insert', insertErr);
    return null;
  }

  console.log(`[persist][conversation] criada id=${created.id}`);
  return created.id;
}

// ── message ───────────────────────────────────────────────────────────────────

async function insertMessage(opts: {
  conversationId:  string;
  content:         string;
  msgType:         string;
  fromMe:          boolean;
  evolutionMsgId:  string;
  rawData:         Record<string, any>;
}): Promise<boolean> {
  // Schema real de public.messages:
  // id, conversation_id, sender_type, sender_id, message_type,
  // content, media_url, metadata, evolution_message_id, created_at
  // Colunas NÃO existentes: church_id → nunca incluir.
  const payload: Record<string, unknown> = {
    conversation_id:      opts.conversationId,
    sender_type:          opts.fromMe ? 'agent' : 'contact',
    message_type:         opts.msgType || 'text',
    content:              opts.content || null,
    metadata:             opts.rawData,
    evolution_message_id: opts.evolutionMsgId,
  };

  console.log('[persist][message] payload insert:', {
    conversation_id:      payload.conversation_id,
    sender_type:          payload.sender_type,
    message_type:         payload.message_type,
    content_preview:      String(payload.content ?? '').slice(0, 80),
    has_metadata:         !!payload.metadata,
    evolution_message_id: payload.evolution_message_id,
  });

  const { error } = await supabase.from('messages').insert(payload);

  if (error) {
    if (error.code === '23505') {
      console.log('[persist][message] duplicata — já persistida anteriormente');
      return false;
    }
    console.error('[persist][message] ERRO no insert:', {
      code:    error.code,
      message: error.message,
      details: error.details,
      hint:    error.hint,
    });
    return false;
  }

  console.log('[persist][message] inserida com sucesso');
  return true;
}

// ── preview ───────────────────────────────────────────────────────────────────

async function updateConversationPreview(
  conversationId: string,
  lastMessage:    string,
  fromMe:         boolean,
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({
      last_message:    lastMessage || '(mídia)',
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  if (error) logSupabaseError('conversation:preview', error);

  if (!fromMe) {
    const { error: rpcErr } = await supabase.rpc('increment_conversation_unread', {
      p_conversation_id: conversationId,
    });
    if (rpcErr) {
      console.warn('[persist][unread] RPC não existe ou falhou:', rpcErr.message,
        '— execute a migration 20260511_whatsapp_persistence.sql');
    }
  }
}

// ── entry point ───────────────────────────────────────────────────────────────

export async function persistIncomingMessage(
  instance: string,
  data:     Record<string, any>,
  content:  string,
  msgType:  string,
): Promise<void> {
  // Confirma client usado — aparece em cada webhook recebido.
  console.log('[persist] usando supabaseAdmin (service_role)');

  // Log de entrada — confirma que a função foi chamada.
  console.log('[persist] ── persistIncomingMessage iniciado ──', {
    instance,
    msgType,
    contentPreview: content.slice(0, 80) || '(vazio)',
    dataKeys:       Object.keys(data),
  });

  const key       = data?.key ?? {};
  const remoteJid = key?.remoteJid as string | undefined;
  const fromMe    = (key?.fromMe   as boolean | undefined) ?? false;
  const messageId = key?.id        as string | undefined;
  const pushName  = data?.pushName as string | undefined;

  console.log('[persist] payload extraído:', { remoteJid, fromMe, messageId, pushName });

  if (!remoteJid || !messageId) {
    console.warn('[persist] remoteJid ou messageId ausente — abortando. data.key =', key);
    return;
  }

  if (isGroupJid(remoteJid)) {
    console.log(`[persist] grupo ignorado: ${remoteJid}`);
    return;
  }

  const phone = phoneFromJid(remoteJid);
  console.log(`[persist] phone normalizado: "${phone}"`);

  const contactId = await upsertContact(phone, pushName ?? phone);
  if (!contactId) {
    console.error('[persist] upsertContact falhou — abortando');
    return;
  }

  const conversationId = await upsertConversation(remoteJid, contactId, instance);
  if (!conversationId) {
    console.error('[persist] upsertConversation falhou — abortando');
    return;
  }

  const inserted = await insertMessage({
    conversationId,
    content,
    msgType,
    fromMe,
    evolutionMsgId: messageId,
    rawData:        data,
  });

  if (inserted) {
    await updateConversationPreview(conversationId, content, fromMe);
    console.log(`[persist] ✓ concluído — conversa=${conversationId} phone=${phone}`);
  }
}
