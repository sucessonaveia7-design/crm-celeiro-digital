DO $$
BEGIN

  -- ── conversations: whatsapp_jid ──────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'conversations'
      AND column_name  = 'whatsapp_jid'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN whatsapp_jid TEXT;
  END IF;

  -- ── messages: evolution_message_id ───────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'messages'
      AND column_name  = 'evolution_message_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN evolution_message_id TEXT;
  END IF;

END $$;

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_jid
  ON public.conversations (whatsapp_jid)
  WHERE whatsapp_jid IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_evolution_message_id
  ON public.messages (evolution_message_id)
  WHERE evolution_message_id IS NOT NULL;

-- composite: all messages in a conversation ordered by time (used by Chat.tsx)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at ASC);

-- conversations ordered by most recent activity (used by sidebar list)
CREATE INDEX IF NOT EXISTS idx_conversations_church_last_message
  ON public.conversations (church_id, last_message_at DESC NULLS LAST)
  WHERE last_message_at IS NOT NULL;

-- ── function: increment_conversation_unread ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_conversation_unread(
  p_conversation_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.conversations
  SET    unread_count = COALESCE(unread_count, 0) + 1
  WHERE  id = p_conversation_id;
$$;

COMMENT ON FUNCTION public.increment_conversation_unread(uuid) IS
  'Atomically increments unread_count for a conversation. Called by the WhatsApp webhook service on every incoming (fromMe=false) message.';
