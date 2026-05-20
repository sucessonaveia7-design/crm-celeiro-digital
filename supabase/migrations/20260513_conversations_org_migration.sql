-- ============================================================
-- MIGRAÇÃO: Criar conversations + messages se não existirem
--           e adicionar organization_id (multi-tenant pivot)
-- AUTOCONTIDA: inclui todas as funções auxiliares necessárias
-- Executar no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ── 0. FUNÇÕES AUXILIARES (idempotent) ───────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_in_org(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE organization_id = org_id AND user_id = auth.uid()
  )
$$;

-- ── 1. ADD organization_id to existing contacts ───────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.contacts
      ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 2. CONVERSATIONS (create if not exists) ──────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id      UUID        REFERENCES public.contacts(id)      ON DELETE SET NULL,
  status          TEXT        NOT NULL DEFAULT 'aguardando'
                    CHECK (status IN ('aguardando', 'atendendo', 'resolvido')),
  channel         TEXT        NOT NULL DEFAULT 'WhatsApp',
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count    INTEGER     NOT NULL DEFAULT 0,
  assigned_to     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  instance_name   TEXT,
  tags            JSONB       DEFAULT '[]',
  whatsapp_jid    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. ADD missing columns to existing conversations ─────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.conversations
      ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE public.conversations
      ADD COLUMN contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'channel'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN channel TEXT NOT NULL DEFAULT 'WhatsApp';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE public.conversations
      ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'instance_name'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN instance_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN tags JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'last_message'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN last_message TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'unread_count'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN unread_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- ── 4. MESSAGES (create if not exists) ───────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id      UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  organization_id      UUID        REFERENCES public.organizations(id) ON DELETE CASCADE,
  sender_type          TEXT        NOT NULL DEFAULT 'contact'
                         CHECK (sender_type IN ('contact', 'agent', 'user', 'bot', 'system')),
  content              TEXT,
  message_type         TEXT        NOT NULL DEFAULT 'text'
                         CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'template')),
  media_url            TEXT,
  media_type           TEXT,
  media_name           TEXT,
  evolution_message_id TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. ADD organization_id to existing messages ───────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.messages
      ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'media_url'
  ) THEN ALTER TABLE public.messages ADD COLUMN media_url TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'media_type'
  ) THEN ALTER TABLE public.messages ADD COLUMN media_type TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'media_name'
  ) THEN ALTER TABLE public.messages ADD COLUMN media_name TEXT; END IF;
END $$;

-- ── 6. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_org_id        ON public.conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_last_msg  ON public.conversations(organization_id, last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_status        ON public.conversations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id    ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_jid  ON public.conversations(whatsapp_jid) WHERE whatsapp_jid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_conversation       ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_org                ON public.messages(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_evolution_id
  ON public.messages(evolution_message_id) WHERE evolution_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_org_id             ON public.contacts(organization_id);

-- ── 7. UPDATED_AT trigger for conversations ───────────────────
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 8. RLS ────────────────────────────────────────────────────
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;

-- Drop old church-based or duplicate policies if they exist
DROP POLICY IF EXISTS "Church members can view conversations"   ON public.conversations;
DROP POLICY IF EXISTS "Church members can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS conversations_org_member                  ON public.conversations;
DROP POLICY IF EXISTS "Church members can view messages"        ON public.messages;
DROP POLICY IF EXISTS "Church members can insert messages"      ON public.messages;
DROP POLICY IF EXISTS messages_org_member                       ON public.messages;
DROP POLICY IF EXISTS contacts_org_member                       ON public.contacts;

-- Conversations: members of the org can read/write
CREATE POLICY conversations_org_member
  ON public.conversations FOR ALL
  USING (public.user_in_org(organization_id))
  WITH CHECK (public.user_in_org(organization_id));

-- Messages: members of the org can read/write
CREATE POLICY messages_org_member
  ON public.messages FOR ALL
  USING (
    organization_id IS NOT NULL
    AND public.user_in_org(organization_id)
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND public.user_in_org(organization_id)
  );

-- Contacts: members of the org can read/write
CREATE POLICY contacts_org_member
  ON public.contacts FOR ALL
  USING (
    organization_id IS NOT NULL
    AND public.user_in_org(organization_id)
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND public.user_in_org(organization_id)
  );

-- ── 9. REALTIME ───────────────────────────────────────────────
-- Enable Supabase Realtime for messages and conversations
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
