import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { X, LockOpen, ArrowRight, Check, Clock } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function UpgradeTrialModal({ onClose }: Props) {
  const navigate             = useNavigate()
  const activateTrial        = useAuthStore(s => s.activateTrial)
  const isTrialActive        = useAuthStore(s => s.isTrialActive)
  const hasUsedTrial         = useAuthStore(s => s.hasUsedTrial)
  const trialDaysLeft        = useAuthStore(s => s.trialDaysLeft)

  const trialCurrentlyActive = isTrialActive()
  const alreadyUsed          = hasUsedTrial() && !trialCurrentlyActive
  const daysLeft             = trialCurrentlyActive ? trialDaysLeft() : 0

  const handleActivate = () => {
    activateTrial()
    onClose()
  }

  const handleVerPlanos = () => {
    navigate('/planos-assinaturas')
    onClose()
  }

  /* ── Texto descritivo conforme estado do trial ── */
  function renderDescription() {
    if (trialCurrentlyActive) {
      return (
        <p className="text-[13.5px] text-slate-400 leading-relaxed mb-6">
          Você ainda tem{' '}
          <span className="text-[#D4AF37] font-semibold">
            {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
          </span>{' '}
          restante{daysLeft !== 1 ? 's' : ''} no teste gratuito.
        </p>
      )
    }

    if (alreadyUsed) {
      return (
        <p className="text-[13.5px] text-slate-400 leading-relaxed mb-6">
          Seu teste gratuito expirou. Faça upgrade para continuar usando.
        </p>
      )
    }

    return (
      <>
        <p className="text-[13.5px] text-slate-400 leading-relaxed mb-6">
          Este recurso faz parte de um plano superior. Você pode testar gratuitamente
          por{' '}
          <span className="text-white font-semibold">7 dias</span>{' '}
          todas as ferramentas avançadas do plano Profissional ou Premium.
        </p>

        <div className="mb-6 text-left space-y-2.5">
          {[
            'Automação de atendimento',
            'Fluxos de conversa avançados',
            'Atendimento com IA',
            'API WhatsApp',
            'Relatórios avançados',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div
                className="w-[18px] h-[18px] rounded-full flex-shrink-0
                           flex items-center justify-center
                           bg-[rgba(212,175,55,0.14)]"
              >
                <Check className="w-3 h-3 text-[#D4AF37]" strokeWidth={3} />
              </div>
              <span className="text-[13px] text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes utmBgIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes utmCardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96) }
          to   { opacity: 1; transform: translateY(0)    scale(1)    }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ animation: 'utmBgIn 0.18s ease-out forwards' }}
      >
        <div
          className="absolute inset-0 bg-[#020617]/72 backdrop-blur-[7px]"
          onClick={onClose}
        />

        {/* Card */}
        <div
          className="relative w-full max-w-[400px] overflow-hidden text-center
                     bg-[#0F172A] rounded-[24px]
                     border border-white/[0.08]
                     shadow-[0_40px_90px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ animation: 'utmCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          {/* Faixa dourada */}
          <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />

          <div className="px-8 py-8">

            {/* Botão fechar */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center
                         rounded-full text-slate-500
                         hover:text-white hover:bg-white/[0.08]
                         transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ícone centralizado */}
            <div
              className="w-[62px] h-[62px] rounded-[18px] mx-auto mb-6
                         bg-[rgba(212,175,55,0.12)] ring-1 ring-[rgba(212,175,55,0.25)]
                         flex items-center justify-center"
            >
              {trialCurrentlyActive
                ? <Clock    className="w-[26px] h-[26px] text-[#D4AF37]" />
                : <LockOpen className="w-[26px] h-[26px] text-[#D4AF37]" />
              }
            </div>

            {/* Título */}
            <h2 className="text-[20px] font-bold text-white leading-snug tracking-tight mb-3">
              {trialCurrentlyActive
                ? 'Teste grátis ativo'
                : 'Liberar acesso premium'
              }
            </h2>

            {/* Texto + lista de benefícios */}
            {renderDescription()}

            {/* Botões */}
            <div className="flex flex-col gap-2.5">

              {/* Ativar 7 dias grátis — só se trial nunca foi usado */}
              {!trialCurrentlyActive && !alreadyUsed && (
                <button
                  onClick={handleActivate}
                  className="w-full flex items-center justify-center gap-2.5
                             py-[14px] rounded-[12px]
                             bg-[#D4AF37] text-[#0F172A] font-bold text-[14px]
                             hover:bg-[#C9A227] active:scale-[0.98]
                             transition-all duration-150
                             shadow-[0_4px_20px_rgba(212,175,55,0.42)]"
                >
                  Ativar 7 dias grátis
                </button>
              )}

              {/* Ver planos */}
              <button
                onClick={handleVerPlanos}
                className="w-full flex items-center justify-center gap-2
                           py-[13px] rounded-[12px]
                           bg-white/[0.06] text-white font-semibold text-[13px]
                           border border-white/[0.10]
                           hover:bg-white/[0.10] active:scale-[0.98]
                           transition-all duration-150"
              >
                Ver planos
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Fechar */}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-[13px] font-medium
                           text-slate-500 hover:text-slate-300
                           transition-colors duration-150"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
