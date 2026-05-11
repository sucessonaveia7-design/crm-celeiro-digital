import type { Request, Response } from 'express';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface EvolutionWebhookPayload {
  event?:    string;
  instance?: string;
  data?:     Record<string, any>;
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEV = process.env.NODE_ENV !== 'production';

function log(label: string, ...args: unknown[]): void {
  if (DEV) console.log(`[EvolutionWebhook] ${label}`, ...args);
}

// Normaliza nomes de evento para um formato único (ex: "messages.upsert" ou "MESSAGES_UPSERT" → "messages.upsert").
function normalizeEvent(raw: string): string {
  return raw.toLowerCase().replace(/_/g, '.');
}

// Extrai o tipo de mensagem do payload Baileys.
function extractMessageType(data: Record<string, any>): string {
  const msg = data?.message ?? {};
  if (msg.conversation)           return 'text';
  if (msg.extendedTextMessage)    return 'text';
  if (msg.imageMessage)           return 'image';
  if (msg.videoMessage)           return 'video';
  if (msg.audioMessage)           return 'audio';
  if (msg.documentMessage)        return 'document';
  if (msg.stickerMessage)         return 'sticker';
  if (msg.locationMessage)        return 'location';
  if (msg.contactMessage)         return 'contact';
  if (msg.reactionMessage)        return 'reaction';
  return data?.messageType ?? 'unknown';
}

// Extrai texto legível de qualquer tipo de mensagem.
function extractContent(data: Record<string, any>): string {
  const msg = data?.message ?? {};
  return (
    msg?.conversation                      ??
    msg?.extendedTextMessage?.text         ??
    msg?.imageMessage?.caption             ??
    msg?.videoMessage?.caption             ??
    msg?.documentMessage?.caption          ??
    ''
  );
}

// ── Handlers por evento ───────────────────────────────────────────────────────

function handleMessagesUpsert(instance: string, data: Record<string, any>): void {
  const key        = data?.key ?? {};
  const remoteJid  = key?.remoteJid  as string | undefined;
  const fromMe     = key?.fromMe     as boolean | undefined;
  const messageId  = key?.id         as string | undefined;
  const pushName   = data?.pushName  as string | undefined;
  const msgType    = extractMessageType(data);
  const content    = extractContent(data);

  log('MESSAGES_UPSERT', {
    event:       'messages.upsert',
    instance,
    remoteJid,
    fromMe,
    messageId,
    pushName,
    messageType: msgType,
    content:     content.slice(0, 120) || '(mídia/sem texto)',
  });

  // TODO: persistir em conversations/messages via Supabase
}

function handleConnectionUpdate(instance: string, data: Record<string, any>): void {
  const state = data?.state ?? data?.connection ?? 'unknown';

  log('CONNECTION_UPDATE', {
    event:    'connection.update',
    instance,
    state,
  });

  // TODO: atualizar status da instância no banco
}

function handleQrcodeUpdated(instance: string, data: Record<string, any>): void {
  const hasQr = !!(data?.base64 ?? data?.code ?? data?.qrcode);

  log('QRCODE_UPDATED', {
    event:    'qrcode.updated',
    instance,
    hasQr,
  });

  // TODO: transmitir QR via WebSocket/Supabase Realtime se necessário
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function evolutionWebhookHandler(req: Request, res: Response): Promise<void> {
  // Responder imediatamente — Evolution API cancela a requisição após timeout.
  res.status(200).json({ success: true });

  const payload  = req.body as EvolutionWebhookPayload;
  const rawEvent = payload?.event ?? '';
  const instance = payload?.instance ?? 'unknown';
  const data     = payload?.data ?? {};

  if (!rawEvent) {
    log('payload sem campo event recebido:', JSON.stringify(payload).slice(0, 200));
    return;
  }

  const event = normalizeEvent(rawEvent);

  try {
    switch (event) {
      case 'messages.upsert':
        handleMessagesUpsert(instance, data);
        break;

      case 'connection.update':
        handleConnectionUpdate(instance, data);
        break;

      case 'qrcode.updated':
        handleQrcodeUpdated(instance, data);
        break;

      case 'send.message':
      case 'messages.update':
      case 'messages.delete':
        log(`${event} (ignorado por ora)`, { instance });
        break;

      default:
        log(`evento não mapeado: ${event}`, { instance });
    }
  } catch (err: any) {
    // Nunca deixar exceção chegar ao Express depois do res.json() acima.
    console.error('[EvolutionWebhook] erro interno ao processar evento:', err?.message ?? err);
  }
}
