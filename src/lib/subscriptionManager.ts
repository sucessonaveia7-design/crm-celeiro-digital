/* ─────────────────────────────────────────────────────────────────
 *  subscriptionManager — controle central de plano e trial
 *  Todas as verificações de acesso passam por aqui.
 * ───────────────────────────────────────────────────────────────── */

import { useAuthStore } from '@/store/authStore'
import { hasAccess, type Feature, type Plan } from '@/lib/permissions'

/**
 * Verifica se o trial expirou e, se sim, persiste no store:
 *   trial_active = false
 *   plan = 'essencial'  (se ainda estava como 'trial')
 *
 * Chamar no mount da App e a cada 60 s (ver Layout.tsx).
 */
export function checkTrialExpiration(): void {
  const { user } = useAuthStore.getState()
  if (!user?.trial_active || !user.trial_end) return

  const expired = new Date() > new Date(user.trial_end)
  if (!expired) return

  useAuthStore.setState({
    user: {
      ...user,
      trial_active: false,
      plan: user.plan === 'trial' ? 'essencial' : user.plan,
    },
  })
}

/** true se o trial ainda está dentro do prazo */
export function isTrialActive(): boolean {
  return useAuthStore.getState().isTrialActive()
}

/** Retorna o plano efetivo atual ('trial' | 'essencial' | 'profissional' | 'premium') */
export function getCurrentPlan(): Plan {
  return useAuthStore.getState().getEffectivePlan()
}

/** Verifica se a feature está liberada com o plano/trial atual */
export function canAccess(feature: Feature): boolean {
  const state = useAuthStore.getState()
  return hasAccess(feature, state.getEffectivePlan(), state.isTrialActive())
}
