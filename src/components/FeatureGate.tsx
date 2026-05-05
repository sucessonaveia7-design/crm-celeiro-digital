import { useState, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { hasAccess, type Feature } from '@/lib/permissions'
import UpgradeTrialModal from './UpgradeTrialModal'

interface Props {
  feature:  Feature
  children: ReactNode
}

export default function FeatureGate({ feature, children }: Props) {
  const getEffectivePlan = useAuthStore(s => s.getEffectivePlan)
  const isTrialActive    = useAuthStore(s => s.isTrialActive)
  const [modalOpen, setModalOpen] = useState(true)

  // Todos os hooks devem ser chamados antes de qualquer return
  const allowed = hasAccess(feature, getEffectivePlan(), isTrialActive())

  if (allowed) return <>{children}</>

  return (
    <>
      {/* Conteúdo desfocado — mostra o que o usuário está perdendo */}
      <div
        className="flex-1 flex flex-col pointer-events-none select-none"
        style={{ filter: 'blur(4px)', opacity: 0.25 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Modal de oferta */}
      {modalOpen && (
        <UpgradeTrialModal
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Botão flutuante para reabrir o modal após fechar */}
      {!modalOpen && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-8 right-8 z-50
                     flex items-center gap-2.5 px-5 py-3 rounded-full
                     bg-[#D4AF37] text-[#0F172A] text-[13px] font-bold
                     shadow-[0_6px_24px_rgba(212,175,55,0.45)]
                     hover:bg-[#C9A227] hover:-translate-y-px
                     active:scale-[0.97] transition-all duration-150"
        >
          🔒 Ver planos de upgrade
        </button>
      )}
    </>
  )
}
