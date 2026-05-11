import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';

const router = Router();

// ── Config ────────────────────────────────────────────────────────────────────

const EVOLUTION_URL    = process.env.EVOLUTION_API_URL?.replace(/\/$/, '') ?? '';
const EVOLUTION_KEY    = process.env.EVOLUTION_API_KEY ?? '';
const DEFAULT_INSTANCE = 'celeiro-teste-001';
const PLACEHOLDERS     = new Set(['sua_chave_aqui', 'your_key_here', 'YOUR_KEY_HERE', '']);

// ── Types ─────────────────────────────────────────────────────────────────────

type BaileysState = 'open' | 'close' | 'connecting' | 'unknown';
interface EvoResult { ok: boolean; status: number; data: unknown }

// ── Core ──────────────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return (
    EVOLUTION_URL.length > 0 && !PLACEHOLDERS.has(EVOLUTION_URL) &&
    EVOLUTION_KEY.length > 0 && !PLACEHOLDERS.has(EVOLUTION_KEY)
  );
}

function evoHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', apikey: EVOLUTION_KEY };
}

function replyNotConfigured(res: Response): Response {
  return res.status(503).json({
    success: false,
    error: 'Evolution API não configurada. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY no .env.',
  });
}

async function evoFetch(path: string, init?: RequestInit): Promise<EvoResult> {
  const response = await fetch(`${EVOLUTION_URL}${path}`, {
    ...init,
    headers: { ...evoHeaders(), ...(init?.headers ?? {}) },
  });
  let data: unknown;
  try { data = await response.json(); } catch { data = null; }
  return { ok: response.ok, status: response.status, data };
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ── Extraction helpers ────────────────────────────────────────────────────────

// Extrai mensagem legível de qualquer formato de erro da Evolution API.
// O bug conhecido: NestJS serializa Error objects como "[object Object]" quando
// o campo message é ele próprio um objeto. Esta função desfaz isso.
function extractError(data: unknown, fallback = 'Erro na Evolution API.'): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  const d = data as Record<string, unknown>;
  if (d.response && typeof d.response === 'object') {
    const r = d.response as Record<string, unknown>;
    if (typeof r.message === 'string') return r.message;
    if (Array.isArray(r.message)) return (r.message as string[]).join(', ');
    if (r.message !== null && typeof r.message === 'object') return JSON.stringify(r.message);
  }
  if (typeof d.message === 'string') return d.message;
  if (d.message !== null && typeof d.message === 'object') return JSON.stringify(d.message);
  if (typeof d.error === 'string' && d.error !== 'true') return d.error;
  return JSON.stringify(data);
}

// Extrai o estado Baileys de qualquer shape de resposta da Evolution API.
// Nunca lança exceção — retorna 'unknown' em caso de dúvida.
function extractState(data: unknown): BaileysState {
  if (!data || typeof data !== 'object') return 'unknown';
  const d = data as Record<string, unknown>;
  const raw: unknown =
    (d.instance as Record<string, unknown> | undefined)?.state ?? d.state;
  if (raw === 'open' || raw === 'close' || raw === 'connecting') return raw;
  return 'unknown';
}

// Extrai base64 QR de qualquer shape de resposta.
// Retorna null se o payload indica erro ou QR ausente.
function extractQr(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, any>;
  if (d.error === true || d.error === 'true') return null;
  const qr: unknown =
    d?.base64 ??
    d?.code ??
    d?.qrcode?.base64 ??
    d?.qrcode?.code ??
    d?.hash?.qrcode?.base64;
  return typeof qr === 'string' && qr.length > 10 ? qr : null;
}

// ── Instance helpers ──────────────────────────────────────────────────────────

async function fetchConnectionState(instanceName: string): Promise<BaileysState> {
  try {
    const result = await evoFetch(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`
    );
    return result.ok ? extractState(result.data) : 'unknown';
  } catch {
    return 'unknown';
  }
}

// Verifica se a instância existe na Evolution API (qualquer estado).
async function instanceExists(instanceName: string): Promise<boolean> {
  try {
    const result = await evoFetch('/instance/fetchInstances');
    if (!result.ok || !Array.isArray(result.data)) return false;
    return (result.data as Array<Record<string, unknown>>).some(
      inst => inst.name === instanceName || inst.instanceName === instanceName
    );
  } catch {
    return false;
  }
}

// Cria uma nova instância. Lança erro em caso de falha.
// Usa "WHATSAPP-BAILEYS" com hífen — obrigatório no fork evoapicloud.
// Omite qrcode:true — causa TypeError: Cannot read state of undefined neste fork.
async function createInstance(instanceName: string): Promise<void> {
  const result = await evoFetch('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      integration: 'WHATSAPP-BAILEYS',
    }),
  });
  if (!result.ok) {
    throw new Error(extractError(result.data, 'Falha ao criar instância.'));
  }
}

// Remove uma instância silenciosamente (ignora erros e 404).
async function removeInstance(instanceName: string): Promise<void> {
  try {
    await evoFetch(`/instance/delete/${encodeURIComponent(instanceName)}`, {
      method: 'DELETE',
    });
  } catch { /* intencional */ }
}

// ── QR Code helpers ───────────────────────────────────────────────────────────

// Uma tentativa de buscar QR via /instance/connect.
// Retorna null se o endpoint retornar erro ou QR indisponível.
// Nunca lança — a Evolution API retorna 200 com { error:true } em bugs.
async function attemptQrFetch(instanceName: string): Promise<string | null> {
  try {
    const result = await evoFetch(
      `/instance/connect/${encodeURIComponent(instanceName)}`
    );
    if (!result.ok) return null;
    return extractQr(result.data);
  } catch {
    return null;
  }
}

// Faz polling de QR até obtê-lo ou esgotar o timeout.
// Baileys é assíncrono — o QR pode levar alguns segundos após a criação.
async function pollForQr(
  instanceName: string,
  totalMs    = 30_000,
  intervalMs = 3_000,
): Promise<string | null> {
  const deadline = Date.now() + totalMs;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt++;
    const qr = await attemptQrFetch(instanceName);
    if (qr) {
      console.log(`[whatsapp][${instanceName}] QR obtido na tentativa ${attempt}`);
      return qr;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    console.log(`[whatsapp][${instanceName}] tentativa ${attempt}: QR indisponível, aguardando ${intervalMs}ms`);
    await sleep(Math.min(intervalMs, remaining));
  }

  console.log(`[whatsapp][${instanceName}] timeout após ${attempt} tentativas`);
  return null;
}

// ── POST /api/whatsapp/connect ────────────────────────────────────────────────
// Fluxo:
//   1. Se instância já existe → reutiliza (evita erro "name already in use")
//   2. Se não existe → cria + aguarda init do Baileys
//   3. Se state = "open" → já conectado, retorna sem QR
//   4. Busca QR via /instance/connect com polling (até 10s)
//   5. Se QR não disponível → 202, frontend continua polling via GET /qrcode
//
// Body: { instanceName?: string }   (default: "celeiro-teste-001")
router.post('/connect', async (req: Request, res: Response) => {
  if (!isConfigured()) return replyNotConfigured(res);

  const instanceName = (req.body?.instanceName as string | undefined)?.trim()
    || DEFAULT_INSTANCE;
  const log = (msg: string) => console.log(`[whatsapp/connect][${instanceName}] ${msg}`);

  try {
    // 1. Verificar existência antes de criar (evita "name already in use")
    const exists = await instanceExists(instanceName);
    log(`instância ${exists ? 'existe — reutilizando' : 'não existe — criando'}`);

    if (!exists) {
      await createInstance(instanceName);
      log('instância criada. Aguardando init do Baileys...');
      await sleep(2500); // Baileys precisa de tempo para inicializar
    }

    // 2. Verificar estado atual
    const state = await fetchConnectionState(instanceName);
    log(`state: ${state}`);

    if (state === 'open') {
      log('já conectado — nenhuma ação necessária');
      return res.json({ success: true, state: 'open', instanceName });
    }

    // 3. Buscar QR (máx 10s inline; se falhar → 202 e frontend faz polling)
    log('iniciando busca de QR Code...');
    const qrCode = await pollForQr(instanceName, 10_000, 2_500);

    if (qrCode) {
      log('QR disponível — retornando 201');
      return res.status(201).json({ success: true, qrCode, instanceName });
    }

    log('QR ainda não disponível — retornando 202 para polling');
    return res.status(202).json({
      success: true,
      qrCode: null,
      instanceName,
      message: 'Instância pronta. Continue polling via GET /api/whatsapp/qrcode.',
    });

  } catch (err: any) {
    const msg = err?.message ?? 'Erro interno ao conectar WhatsApp.';
    console.error(`[whatsapp/connect][${instanceName}] erro:`, msg);
    return res.status(500).json({ success: false, error: msg });
  }
});

// ── GET /api/whatsapp/qrcode ──────────────────────────────────────────────────
// Endpoint de polling — frontend chama a cada 3s após receber 202.
// Query: ?instanceName=celeiro-teste-001
router.get('/qrcode', async (req: Request, res: Response) => {
  if (!isConfigured()) return replyNotConfigured(res);

  // Impede que browser/proxy/Vite sirvam resposta cacheada (evita 304).
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma':        'no-cache',
    'Expires':       '0',
    'Surrogate-Control': 'no-store',
  });

  const instanceName = (req.query?.instanceName as string | undefined)?.trim()
    || DEFAULT_INSTANCE;

  try {
    const qrCode = await attemptQrFetch(instanceName);
    return res.json({ success: true, qrCode: qrCode ?? null });
  } catch (err: any) {
    console.error(`[whatsapp/qrcode][${instanceName}] erro:`, err?.message ?? err);
    return res.status(500).json({ success: false, error: err?.message ?? 'Erro ao obter QR Code.' });
  }
});

// ── GET /api/whatsapp/status ──────────────────────────────────────────────────
// Query: ?instanceName=celeiro-teste-001
router.get('/status', async (req: Request, res: Response) => {
  if (!isConfigured()) return replyNotConfigured(res);

  const instanceName = (req.query?.instanceName as string | undefined)?.trim()
    || DEFAULT_INSTANCE;

  try {
    const state = await fetchConnectionState(instanceName);
    return res.json({ success: true, state, instanceName });
  } catch (err: any) {
    console.error(`[whatsapp/status][${instanceName}] erro:`, err?.message ?? err);
    return res.status(500).json({ success: false, error: err?.message ?? 'Erro ao verificar status.' });
  }
});

// ── DELETE /api/whatsapp/instance ─────────────────────────────────────────────
// Reset manual: remove a instância para forçar recriação no próximo /connect.
// Query: ?instanceName=celeiro-teste-001
router.delete('/instance', async (req: Request, res: Response) => {
  if (!isConfigured()) return replyNotConfigured(res);

  const instanceName = (req.query?.instanceName as string | undefined)?.trim()
    || DEFAULT_INSTANCE;

  try {
    const result = await evoFetch(
      `/instance/delete/${encodeURIComponent(instanceName)}`,
      { method: 'DELETE' },
    );
    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        error: extractError(result.data),
      });
    }
    console.log(`[whatsapp/instance DELETE][${instanceName}] removida com sucesso`);
    return res.json({ success: true, deleted: instanceName });
  } catch (err: any) {
    console.error(`[whatsapp/instance DELETE][${instanceName}] erro:`, err?.message ?? err);
    return res.status(500).json({ success: false, error: err?.message ?? 'Erro ao deletar instância.' });
  }
});

// ── GET /api/whatsapp/conversations ──────────────────────────────────────────
// Lista conversas WhatsApp ordenadas por atividade recente.
router.get('/conversations', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        unread_count,
        last_message,
        last_message_at,
        whatsapp_jid,
        contacts ( id, name, phone )
      `)
      .not('whatsapp_jid', 'is', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error('[whatsapp/conversations] Supabase error:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[whatsapp/conversations] unexpected error:', err?.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ── GET /api/whatsapp/messages/:conversationId ────────────────────────────────
// Retorna as mensagens de uma conversa, ordenadas por data de criação.
router.get('/messages/:conversationId', async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  if (!conversationId) return res.status(400).json({ success: false, error: 'conversationId obrigatório' });

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_type, message_type, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[whatsapp/messages] Supabase error:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('[whatsapp/messages] unexpected error:', err?.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ── POST /api/whatsapp/webhook ────────────────────────────────────────────────
// Recebe eventos push da Evolution API.
// Configurar no Railway: https://seu-backend.com/api/whatsapp/webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const event = req.body as { event?: string; instance?: string; data?: any };
  const tag   = `[whatsapp/webhook][${event?.instance ?? '-'}]`;

  // Responder imediatamente — Evolution API cancela se timeout
  res.status(200).json({ success: true });

  try {
    switch (event?.event) {
      case 'messages.upsert': {
        if (event.data?.key?.fromMe) break;

        const msg       = event.data;
        const remoteJid = msg?.key?.remoteJid as string | undefined;
        const content: string =
          msg?.message?.conversation                  ??
          msg?.message?.extendedTextMessage?.text     ??
          msg?.message?.imageMessage?.caption         ??
          '';

        if (!remoteJid || !content || !event.instance) break;

        const { data: conv } = await supabase
          .from('conversations')
          .select('id, church_id')
          .eq('whatsapp_jid', remoteJid)
          .eq('instance_name', event.instance)
          .maybeSingle();

        if (!conv) break;

        await supabase.from('messages').insert({
          conversation_id: conv.id,
          church_id:       conv.church_id,
          sender_type:     'contact',
          message_type:    'text',
          content,
        });
        await supabase
          .from('conversations')
          .update({ last_message: content, last_message_at: new Date().toISOString() })
          .eq('id', conv.id);

        console.log(`${tag} mensagem recebida de ${remoteJid}`);
        break;
      }

      case 'connection.update': {
        const state = extractState(event.data);
        console.log(`${tag} conexão atualizada → ${state}`);
        break;
      }

      case 'qrcode.updated': {
        const qr = extractQr(event.data);
        console.log(`${tag} QR Code atualizado via webhook (disponível: ${!!qr})`);
        break;
      }

      default:
        console.log(`${tag} evento: ${event?.event ?? 'unknown'}`);
    }
  } catch (err: any) {
    console.error(`${tag} erro ao processar:`, err?.message ?? err);
  }
});

export default router;
