/* ─────────────────────────────────────────────────────────────────
 *  Mock local de assinatura para testes sem Supabase
 *
 *  Como usar:
 *  Altere apenas a linha ACTIVE_MOCK abaixo para trocar o cenário.
 *  O sistema todo (banner, FeatureGate, permissões) atualiza sozinho.
 * ───────────────────────────────────────────────────────────────── */

const now = new Date()

/** Retorna ISO string de (hoje + N dias) */
function addDays(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** Hoje às 23:59:59 */
function endOfToday(): string {
  const d = new Date(now)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

/* ─── Presets disponíveis ───────────────────────────────────────── */
const PRESETS = {

  /** Trial com 7 dias cheios */
  TRIAL_ATIVO: {
    plan:         'trial',
    trial_active: true,
    trial_start:  now.toISOString(),
    trial_end:    addDays(7),
  },

  /** Trial com 1 dia restante (amanhã) */
  TRIAL_AMANHA: {
    plan:         'trial',
    trial_active: true,
    trial_start:  addDays(-6),
    trial_end:    addDays(1),
  },

  /** Trial que termina hoje (último dia) */
  TRIAL_HOJE: {
    plan:         'trial',
    trial_active: true,
    trial_start:  addDays(-7),
    trial_end:    endOfToday(),
  },

  /** Trial expirado — sem plano pago */
  TRIAL_EXPIRADO: {
    plan:         'trial',
    trial_active: false,
    trial_start:  addDays(-10),
    trial_end:    addDays(-3),
  },

  /** Plano Essencial ativo */
  PLANO_ESSENCIAL: {
    plan:         'essencial',
    trial_active: false,
    trial_start:  null,
    trial_end:    null,
  },

  /** Plano Profissional ativo */
  PLANO_PROFISSIONAL: {
    plan:         'profissional',
    trial_active: false,
    trial_start:  null,
    trial_end:    null,
  },

  /** Plano Premium ativo */
  PLANO_PREMIUM: {
    plan:         'premium',
    trial_active: false,
    trial_start:  null,
    trial_end:    null,
  },
}

/* ─── TROCAR AQUI PARA MUDAR O CENÁRIO DE TESTE ────────────────── */
export const ACTIVE_MOCK = PRESETS.PLANO_ESSENCIAL
//
// Outras opções:
//   PRESETS.TRIAL_AMANHA
//   PRESETS.TRIAL_HOJE
//   PRESETS.TRIAL_EXPIRADO
//   PRESETS.PLANO_ESSENCIAL
//   PRESETS.PLANO_PROFISSIONAL
//   PRESETS.PLANO_PREMIUM

/* ─── Usuário mock completo ────────────────────────────────────── */
export const MOCK_USER = {
  id:        'mock-local-001',
  email:     'teste@celeiro.com',
  name:      'Usuário Teste',
  role:      'admin',
  is_active: true,
  ...ACTIVE_MOCK,
}

export const MOCK_TOKEN = 'mock-token-local'

/** Alias direto para uso nos componentes */
export const mockSubscription = ACTIVE_MOCK

/**
 * Calcula os dias restantes do trial.
 * Retorna 0 se trial_end for nulo ou já passou.
 */
export function getDaysLeft(trial_end: string | null | undefined): number {
  if (!trial_end) return 0
  const diff = new Date(trial_end).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
