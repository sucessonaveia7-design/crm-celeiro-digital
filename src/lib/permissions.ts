/* ─────────────────────────────────────────────────────────────────
 *  Sistema central de permissões por plano
 * ───────────────────────────────────────────────────────────────── */

export type Plan = 'trial' | 'essencial' | 'profissional' | 'premium'

/* ─── Features controladas por plano ───────────────────────────── */
export type Feature =
  | 'dashboard'
  | 'mensagens'
  | 'kanban'
  | 'audiencia'
  | 'transmissoes'
  | 'reports_basic'
  | 'settings_basic'
  | 'esbocos'
  | 'automacao'
  | 'fluxos'
  | 'ia'
  | 'api_whatsapp'
  | 'biblioteca_esbocos'
  | 'calendario'
  | 'reports_premium'
  | 'support_priority'
  | 'unlimited_users'
  | 'unlimited_contacts'

/* ─── Features por plano ────────────────────────────────────────── */
const ESSENCIAL_FEATURES: Feature[] = [
  'dashboard',
  'mensagens',
  'kanban',
  'audiencia',
  'transmissoes',
  'reports_basic',
  'settings_basic',
]

const PROFISSIONAL_FEATURES: Feature[] = [
  ...ESSENCIAL_FEATURES,
  'automacao',
  'fluxos',
  'ia',
  'api_whatsapp',
  'biblioteca_esbocos',
  'calendario',
  'reports_premium',
]

const ALL_FEATURES: Feature[] = [
  ...PROFISSIONAL_FEATURES,
  'esbocos',
  'support_priority',
  'unlimited_users',
  'unlimited_contacts',
]

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  trial:        ALL_FEATURES,
  essencial:    ESSENCIAL_FEATURES,
  profissional: PROFISSIONAL_FEATURES,
  premium:      ALL_FEATURES,
}

/* ─── Limites por plano ─────────────────────────────────────────── */
export interface PlanLimits {
  label:         string
  max_users:     number    // Infinity = ilimitado
  max_contacts:  number
  price_monthly: number    // BRL
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial:        { label: 'Trial (7 dias)', max_users: Infinity, max_contacts: Infinity, price_monthly: 0   },
  essencial:    { label: 'Essencial',      max_users: 1,        max_contacts: 500,      price_monthly: 49  },
  profissional: { label: 'Profissional',   max_users: 3,        max_contacts: 3000,     price_monthly: 99  },
  premium:      { label: 'Premium',        max_users: Infinity, max_contacts: Infinity, price_monthly: 199 },
}

/* ─── Labels legíveis para features ────────────────────────────── */
export const FEATURE_LABELS: Record<Feature, string> = {
  dashboard:          'Dashboard',
  mensagens:          'Mensagens',
  kanban:             'Kanban',
  audiencia:          'Audiência',
  transmissoes:       'Transmissões',
  reports_basic:      'Relatórios básicos',
  settings_basic:     'Configurações',
  esbocos:            'Esboços para Pregação',
  automacao:          'Automação',
  fluxos:             'Fluxos',
  ia:                 'Atendimento com IA',
  api_whatsapp:       'API WhatsApp',
  biblioteca_esbocos: 'Biblioteca de Esboços',
  calendario:         'Calendário de Eventos',
  reports_premium:    'Relatórios avançados',
  support_priority:   'Suporte prioritário',
  unlimited_users:    'Usuários ilimitados',
  unlimited_contacts: 'Contatos ilimitados',
}

/* ─── Detalhes dos planos para UI ──────────────────────────────── */
export interface PlanDetail {
  id:        Plan
  label:     string
  price:     number
  features:  string[]
  limits:    string
  highlight?: boolean
}

export const PLAN_DETAILS: PlanDetail[] = [
  {
    id:     'essencial',
    label:  'Essencial',
    price:  49,
    limits: '1 usuário · 500 contatos',
    features: [
      'Mensagens',
      'Kanban',
      'Audiência',
      'Transmissões',
      'Relatórios básicos',
    ],
  },
  {
    id:        'profissional',
    label:     'Profissional',
    price:     99,
    limits:    '3 usuários · 3.000 contatos',
    highlight: true,
    features: [
      'Tudo do Essencial',
      'Automação',
      'Fluxos',
      'Atendimento com IA',
      'API WhatsApp',
      'Biblioteca de Esboços',
      'Calendário de Eventos',
      'Relatórios avançados',
    ],
  },
  {
    id:     'premium',
    label:  'Premium',
    price:  199,
    limits: 'Usuários ilimitados · Contatos ilimitados',
    features: [
      'Tudo do Profissional',
      'Esboço para pregação com IA',
      'Geração automática de sermões',
      'Sugestões bíblicas inteligentes',
      'Suporte prioritário',
      'Usuários ilimitados',
      'Contatos ilimitados',
    ],
  },
]

/* ─── Funções de permissão ──────────────────────────────────────── */

/**
 * Retorna true se a feature está liberada.
 * Trial ativo libera tudo; plano expirado/vazio trata como essencial.
 */
export function hasAccess(
  feature:     Feature,
  plan:        Plan,
  trialActive: boolean,
): boolean {
  if (trialActive) return true
  const effectivePlan: Plan = (plan === 'trial') ? 'essencial' : plan
  return (PLAN_FEATURES[effectivePlan] ?? PLAN_FEATURES.essencial).includes(feature)
}

/**
 * Retorna os limites do plano.
 * Se trialActive, retorna limites ilimitados do trial.
 */
export function getPlanLimits(plan: Plan, trialActive: boolean = false): PlanLimits {
  if (trialActive) return PLAN_LIMITS.trial
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.essencial
}

/** Retorna o plano mínimo que contém a feature. */
export function getRequiredPlanForFeature(feature: Feature): Plan {
  if (ESSENCIAL_FEATURES.includes(feature))    return 'essencial'
  if (PROFISSIONAL_FEATURES.includes(feature)) return 'profissional'
  return 'premium'
}

/** @deprecated Use getRequiredPlanForFeature */
export const getRequiredPlan = getRequiredPlanForFeature
