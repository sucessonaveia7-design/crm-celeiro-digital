import type { Request, Response } from 'express';
import { persistIncomingMessage } from '../services/whatsappPersistence.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EvolutionWebhookPayload {
  event?:    string;
  instance?: string;
  data?:     Record<string, any>;
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Normaliza "MESSAGES_UPSERT" → "messages.upsert"
function normalizeEvent(raw: string): string {
  return raw.toLowerCase().replace(/_/g, '.');
}

// Extrai tipo de mensagem do payload Baileys.
function extractMessageType(data: Record<string, any>): string {
  const msg = data?.message ?? {};
  if (msg.conversation)        return 'text';
  if (msg.extendedTextMessage) return 'text';
  if (msg.imageMessage)        return 'image';
  if (msg.videoMessage)        return 'video';
  if (msg.audioMessage)        return 'audio';
  if (msg.documentMessage)     return 'document';
  if (msg.stickerMessage)      return 'sticker';
  if (msg.locationMessage)     return 'location';
  if (msg.contactMessage)      return 'contact';
  if (msg.reactionMessage)     return 'reaction';
  return data?.messageType ?? 'unknown';
}

// Extrai texto legível de qualquer tipo de mensagem.
function extractContent(data: Record<string, any>): string {
  const msg = data?.message ?? {};
  return (
    msg?.conversation                 ??
    msg?.extendedTextMessage?.text    ??
    msg?.imageMessage?.caption        ??
    msg?.videoMessage?.caption        ??
    msg?.documentMessage?.caption     ??
    ''
  );
}

// ── handlers ──────────────────────────────────────────────────────────────────

async function handleMessagesUpsert(
  instance: string,
  rawData:  unknown,
): Promise<void> {
  // rawData pode ser objeto único OU array (depende da versão da Evolution API).
  const items: Record<string, any>[] = Array.isArray(rawData)
    ? rawData
    : [rawData as Record<string, any>];

  console.log(
    `[webhook] messages.upsert instance="${instance}" itens=${items.length}`,
    'keys do primeiro item:', Object.keys(items[0] ?? {}),
  );

  for (const data of items) {
    const msgType = extractMessageType(data);
    const content = extractContent(data);

    console.log('[webhook] processando item:', {
      remoteJid:  data?.key?.remoteJid,
      fromMe:     data?.key?.fromMe,
      messageId:  data?.key?.id,
      pushName:   data?.pushName,
      msgType,
      contentPreview: content.slice(0, 80) || '(sem texto)',
    });

    await persistIncomingMessage(instance, data, content, msgType);
  }
}

function handleConnectionUpdate(instance: string, data: Record<string, any>): void {
  const state = data?.state ?? data?.connection ?? 'unknown';
  console.log(`[webhook] connection.update instance="${instance}" state="${state}"`);
}

function handleQrcodeUpdated(instance: string, data: Record<string, any>): void {
  const hasQr = !!(data?.base64 ?? data?.code ?? data?.qrcode);
  console.log(`[webhook] qrcode.updated instance="${instance}" hasQr=${hasQr}`);
}

// ── handler principal ─────────────────────────────────────────────────────────

export async function evolutionWebhookHandler(req: Request, res: Response): Promise<void> {
  // Responder imediatamente — Evolution API cancela após timeout.
  res.status(200).json({ success: true });

  const payload  = req.body as EvolutionWebhookPayload;
  const rawEvent = payload?.event ?? '';
  const instance = payload?.instance ?? 'unknown';
  const data     = payload?.data ?? {};

  console.log('[webhook] recebido:', {
    event:    rawEvent,
    instance,
    dataType: Array.isArray(payload?.data) ? 'array' : typeof payload?.data,
    dataKeys: payload?.data && !Array.isArray(payload.data)
      ? Object.keys(payload.data).slice(0, 10)
      : `array[${Array.isArray(payload?.data) ? payload.data.length : 0}]`,
  });

  if (!rawEvent) {
    console.warn('[webhook] payload sem campo event:', JSON.stringify(payload).slice(0, 300));
    return;
  }

  const event = normalizeEvent(rawEvent);

  try {
    switch (event) {
      case 'messages.upsert':
        await handleMessagesUpsert(instance, payload?.data ?? {});
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
        console.log(`[webhook] ${event} ignorado`);
        break;

      default:
        console.log(`[webhook] evento não mapeado: "${event}"`);
    }
  } catch (err: any) {
    console.error('[webhook] erro interno ao processar evento:', err?.message ?? err);
  }
}
