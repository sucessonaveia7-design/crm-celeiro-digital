-- ============================================================
-- MIGRAÇÃO: Multi-tenancy — organizations, profiles, org_users, subscriptions
-- Executar no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT,
  phone      TEXT,
  plan       TEXT        NOT NULL DEFAULT 'trial'
               CHECK (plan IN ('trial', 'essencial', 'profissional', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROFILES  (estende auth.users — 1:1)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT,
  phone                  TEXT,
  active_organization_id UUID        REFERENCES public.organizations(id) ON DELETE SET NULL,
  trial_end              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORGANIZATION_USERS  (membros de cada organização)
CREATE TABLE IF NOT EXISTS public.organization_users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'owner'
                    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 4. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan            TEXT        NOT NULL DEFAULT 'trial'
                    CHECK (plan IN ('trial', 'essencial', 'profissional', 'premium')),
  status          TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  trial_start     TIMESTAMPTZ DEFAULT now(),
  trial_end       TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  price_cents     INTEGER     DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_org          ON public.profiles(active_organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_org         ON public.organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user        ON public.organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org     ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON public.subscriptions(status, plan);

-- ── TRIGGER updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organizations_updated_at  ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;

-- profiles: usuário acessa apenas o próprio perfil
CREATE POLICY profiles_self
  ON public.profiles FOR ALL
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- organizations: membros podem visualizar
CREATE POLICY organizations_member_select
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid())
  );

-- organizations: owners podem alterar
CREATE POLICY organizations_owner_update
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- organization_users: membros podem visualizar os demais membros do mesmo org
CREATE POLICY org_users_member_select
  ON public.organization_users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
    )
  );

-- organization_users: owners podem gerenciar
CREATE POLICY org_users_owner_all
  ON public.organization_users FOR ALL
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- subscriptions: membros podem visualizar
CREATE POLICY subscriptions_member_select
  ON public.subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
    )
  );
