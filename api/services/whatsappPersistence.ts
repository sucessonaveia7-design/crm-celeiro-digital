import { supabaseAdmin } from '../lib/supabase.ts';
import { resolveOrgFromInstance } from '../middleware/tenant.ts';

const supabase = supabaseAdmin;

console.log('[persist] módulo carregado — usando supabaseAdmin (service_role)');

// ── helpers ───────────────────────────────────────────────────────────────────

function phoneFromJid(jid: string): string {
  return jid.split('@')[0];
}

function isGroupJid(jid: string): boolean {
  return jid.endsWith('@g.us');
}

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
  orgId:       string,
): Promise<string | null> {
  console.log(`[persist][contact] buscando phone="${phone}" org="${orgId}"`);

  const { data: found, error: findErr } = await supabase
    .from('contacts')
    .select('id')
    .eq('phone', phone)
    .eq('church_id', orgId)
    .maybeSingle();

  if (findErr) { logSupabaseError('contact:find', findErr); return null; }
  if (found)   { console.log(`[persist][contact] encontrado id=${found.id}`); return found.id; }

  console.log(`[persist][contact] não encontrado — inserindo name="${displayName}"`);

  const { data: created, error: insertErr } = await supabase
    .from('contacts')
    .insert({ name: displayName || phone, phone, church_id: orgId })
    .select('id')
    .single();

  if (insertErr) {
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
  orgId:        string,
): Promise<string | null> {
  console.log(`[persist][conversation] buscando jid="${whatsappJid}" org="${orgId}"`);

  const { data: found, error: findErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('whatsapp_jid', whatsappJid)
    .maybeSingle();

  if (findErr) {
    if (findErr.code === '42703') {
      console.error(
        '[persist][conversation] COLUNA whatsapp_jid NÃO EXISTE. ' +
        'Execute a migration 20260511_whatsapp_persistence.sql.'
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
    church_id:     orgId,
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
  instance:  string,
  data:      Record<string, any>,
  content:   string,
  msgType:   string,
  orgId?:    string,  // resolvido pelo webhook controller; fallback via resolveOrgFromInstance
): Promise<void> {
  console.log('[persist] usando supabaseAdmin (service_role)');
  console.log('[persist] ── persistIncomingMessage iniciado ──', {
    instance,
    msgType,
    orgId:          orgId ?? '(pendente resolução)',
    contentPreview: content.slice(0, 80) || '(vazio)',
    dataKeys:       Object.keys(data),
  });

  const key       = data?.key ?? {};
  const remoteJid = key?.remoteJid as string | undefined;
  const fromMe    = (key?.fromMe   as boolean | undefined) ?? false;
  const messageId = key?.id        as string | undefined;
  const pushName  = data?.pushName as string | undefined;

  if (!remoteJid || !messageId) {
    console.warn('[persist] remoteJid ou messageId ausente — abortando. data.key =', key);
    return;
  }

  if (isGroupJid(remoteJid)) {
    console.log(`[persist] grupo ignorado: ${remoteJid}`);
    return;
  }

  // Resolve organização: usa o valor passado pelo controller ou faz lookup pelo instance
  const resolvedOrgId = orgId ?? await resolveOrgFromInstance(instance);
  if (!resolvedOrgId) {
    console.error(`[persist] Não foi possível resolver org para instance="${instance}" — abortando`);
    return;
  }

  const phone = phoneFromJid(remoteJid);
  console.log(`[persist] phone="${phone}" org="${resolvedOrgId}"`);

  const contactId = await upsertContact(phone, pushName ?? phone, resolvedOrgId);
  if (!contactId) {
    console.error('[persist] upsertContact falhou — abortando');
    return;
  }

  const conversationId = await upsertConversation(remoteJid, contactId, instance, resolvedOrgId);
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
    console.log(`[persist] ✓ concluído — conversa=${conversationId} phone=${phone} org=${resolvedOrgId}`);
  }
}
