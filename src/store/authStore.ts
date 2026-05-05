import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Plan } from '@/lib/permissions'

interface User {
  id: string
  email: string
  name: string
  role: string
  is_active?: boolean
  // Trial / plano fields
  plan?: string
  trial_active?: boolean
  trial_start?: string | null
  trial_end?: string | null
  trial_expired?: boolean
  trial_days_left?: number
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  isTrialActive: () => boolean
  isTrialExpired: () => boolean
  trialDaysLeft: () => number
  getEffectivePlan: () => Plan
  hasPremiumAccess: () => boolean
  /** Verifica se o trial expirou e marca trial_active=false no estado persistido */
  checkAndExpireTrial: () => void
  /** Ativa o trial de 7 dias para o usuário atual */
  activateTrial: () => void
  /** true se o usuário já usou o trial alguma vez */
  hasUsedTrial: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),

      /** true se o trial ainda está ativo (dentro do prazo) */
      isTrialActive: () => {
        const user = get().user
        if (!user?.trial_active || !user.trial_end) return false
        return new Date() <= new Date(user.trial_end)
      },

      /** true se o trial expirou */
      isTrialExpired: () => {
        const user = get().user
        if (!user?.trial_active || !user.trial_end) return false
        return new Date() > new Date(user.trial_end)
      },

      /** Dias restantes do trial (0 se expirado) */
      trialDaysLeft: () => {
        const user = get().user
        if (!user?.trial_active || !user.trial_end) return 0
        const diff = new Date(user.trial_end).getTime() - Date.now()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      },

      /**
       * Retorna o plano efetivo:
       * - 'trial'       se trial ativo
       * - plano do user  se trial expirado e tem plano pago
       * - 'essencial'   como fallback (trial expirado sem plano)
       */
      getEffectivePlan: (): Plan => {
        const state = get()
        const user  = state.user
        if (!user) return 'essencial'
        if (state.isTrialActive()) return 'trial'
        const plan = user.plan as Plan | undefined
        if (plan && plan !== 'trial') return plan
        return 'essencial'
      },

      /** true se tem acesso a recursos premium (plano pago ou trial ativo) */
      hasPremiumAccess: () => {
        const state = get()
        if (state.isTrialActive()) return true
        const plan = state.user?.plan
        return !!plan && plan !== 'trial' && plan !== 'essencial'
      },

      /**
       * Verifica se trial_end já passou e, se sim, persiste trial_active=false.
       * Chamar no mount do Layout e periodicamente.
       */
      checkAndExpireTrial: () => {
        const user = get().user
        if (!user?.trial_active || !user.trial_end) return
        const expired = new Date() > new Date(user.trial_end)
        if (expired) {
          set({
            user: {
              ...user,
              trial_active: false,
              plan: user.plan === 'trial' ? 'essencial' : user.plan,
            },
          })
        }
      },

      /** Ativa o trial de 7 dias imediatamente */
      activateTrial: () => {
        const user = get().user
        if (!user) return
        const now = new Date()
        const end = new Date(now)
        end.setDate(end.getDate() + 7)
        set({
          user: {
            ...user,
            plan:         'trial',
            trial_active: true,
            trial_start:  now.toISOString(),
            trial_end:    end.toISOString(),
          },
        })
      },

      /** true se o usuário já iniciou um trial alguma vez */
      hasUsedTrial: () => {
        const user = get().user
        return !!user?.trial_start
      },
    }),
    { name: 'auth-storage' }
  )
)
