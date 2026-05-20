-- ============================================================
-- MIGRAÇÃO: Operações enterprise do chat
-- internal_messages, appointments, conversation_logs, message_templates
-- + media support nas messages
-- ============================================================

-- ── INTERNAL MESSAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id)  ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id)  ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id)            ON DELETE CASCADE,
  message         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── APPOINTMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id)  ON DELETE CASCADE,
  conversation_id UUID        REFERENCES public.conversations(id)           ON DELETE SET NULL,
  assigned_to     UUID        REFERENCES auth.users(id),
  title           TEXT        NOT NULL,
  description     TEXT,
  scheduled_for   TIMESTAMPTZ NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled','done')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CONVERSATION LOGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id)  ON DELETE CASCADE,
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id)  ON DELETE CASCADE,
  actor_id        UUID        REFERENCES auth.users(id),
  action          TEXT        NOT NULL,
  metadata        JSONB       DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── MESSAGE TEMPLATES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_templates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id)  ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  variables       TEXT[]      DEFAULT '{}',
  category        TEXT        NOT NULL DEFAULT 'general',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ALTER messages: media support ────────────────────────────
DO $$ BEGIN
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

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_internal_messages_conv   ON public.internal_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_org    ON public.internal_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_conv        ON public.appointments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org         ON public.appointments(organization_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_conv_logs_conv           ON public.conversation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_logs_org            ON public.conversation_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_templates_org            ON public.message_templates(organization_id);

-- ── TRIGGERS updated_at ──────────────────────────────────────
DROP TRIGGER IF EXISTS trg_appointments_updated_at    ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_templates_updated_at       ON public.message_templates;
CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.internal_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates  ENABLE ROW LEVEL SECURITY;

-- Helper: user belongs to org
CREATE OR REPLACE FUNCTION public.user_in_org(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE organization_id = org_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY internal_messages_member
  ON public.internal_messages FOR ALL
  USING (public.user_in_org(organization_id))
  WITH CHECK (public.user_in_org(organization_id));

CREATE POLICY appointments_member
  ON public.appointments FOR ALL
  USING (public.user_in_org(organization_id))
  WITH CHECK (public.user_in_org(organization_id));

CREATE POLICY conv_logs_member_select
  ON public.conversation_logs FOR SELECT
  USING (public.user_in_org(organization_id));

CREATE POLICY conv_logs_member_insert
  ON public.conversation_logs FOR INSERT
  WITH CHECK (public.user_in_org(organization_id));

CREATE POLICY templates_member
  ON public.message_templates FOR ALL
  USING (public.user_in_org(organization_id))
  WITH CHECK (public.user_in_org(organization_id));

-- ── SEED: default templates ───────────────────────────────────
-- (Optional - only inserts if organization exists)
-- Organizations can run this manually or use the UI to create templates.
