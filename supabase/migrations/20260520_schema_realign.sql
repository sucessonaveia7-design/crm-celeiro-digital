-- ============================================================
-- REALINHAMENTO DE SCHEMA — 2026-05-20
-- ============================================================
-- As tabelas abaixo foram criadas MANUALMENTE no Supabase antes
-- das migrations existirem. As migrations anteriores usaram
-- CREATE TABLE IF NOT EXISTS e foram no-op — as colunas
-- definidas nelas NUNCA foram adicionadas ao banco real.
--
-- Este script documenta a diferença entre o schema das
-- migrations e o schema real confirmado via REST API.
--
-- ATENÇÃO: Este script é idempotente (usa IF NOT EXISTS /
-- DO NOTHING). Execute apenas se necessário para alinhar
-- um banco de staging/desenvolvimento.
-- NÃO execute em produção sem testar antes.
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
-- Migration 20260512 diz: name TEXT, phone TEXT, trial_end TIMESTAMPTZ
-- Banco real tem:         full_name TEXT, avatar_url TEXT, role TEXT
-- (sem name, phone, trial_end)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url  TEXT,
  ADD COLUMN IF NOT EXISTS role        TEXT DEFAULT 'owner';

-- Se a coluna 'name' existir com dados, renomear para full_name:
-- (comentado — executar manualmente se necessário)
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.columns
--              WHERE table_name='profiles' AND column_name='name') THEN
--     ALTER TABLE public.profiles RENAME COLUMN name TO full_name;
--   END IF;
-- END $$;

-- ── organizations ─────────────────────────────────────────────
-- Migration 20260512 diz: plan TEXT NOT NULL DEFAULT 'trial' CHECK (...)
-- Banco real: sem plan; tem email, city, state, status

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS email  TEXT,
  ADD COLUMN IF NOT EXISTS city   TEXT,
  ADD COLUMN IF NOT EXISTS state  TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Coluna 'plan' em organizations NÃO deve existir — plan vive em subscriptions.
-- Se existir, pode ser removida após confirmar que nenhum código a usa:
-- ALTER TABLE public.organizations DROP COLUMN IF EXISTS plan;

-- ── subscriptions ─────────────────────────────────────────────
-- Migration 20260512 define:
--   plan   CHECK IN ('trial','essencial','profissional','premium')
--   status CHECK IN ('active','expired','cancelled','pending')
--
-- Banco real aceita:
--   plan   CHECK IN ('essencial','pro','premium')
--   status CHECK IN ('active','trial','past_due')
--
-- Para alinhar (substitui constraint existente):
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check,
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
    CHECK (plan IN ('essencial', 'pro', 'premium')),
  ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'trial', 'past_due'));

-- Adicionar colunas de billing se não existirem:
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS current_period_start    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_provider        TEXT,
  ADD COLUMN IF NOT EXISTS payment_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS payment_subscription_id TEXT;

-- ── organization_users ────────────────────────────────────────
-- Migration não define 'status'; banco real tem
ALTER TABLE public.organization_users
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ── contacts — organization_id (multitenancy) ─────────────────
-- A tabela contacts foi criada pela migration inicial (20240204)
-- referenciando apenas users.id. Multitenancy adicionado depois.
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_contacts_org ON public.contacts(organization_id);

-- ── Fim ───────────────────────────────────────────────────────
-- Após executar, verificar via:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('profiles','organizations','subscriptions','organization_users','contacts')
--   ORDER BY table_name, ordinal_position;
