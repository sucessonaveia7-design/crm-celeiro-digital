import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { X, Zap, ArrowRight, Gift, Check } from 'lucide-react'

interface Props {
  onClose:          () => void
  onTrialActivated: () => void
}

export default function TrialOfferModal({ onClose, onTrialActivated }: Props) {
  const navigate       = useNavigate()
  const activateTrial  = useAuthStore(s => s.activateTrial)
  const hasUsedTrial   = useAuthStore(s => s.hasUsedTrial)

  const trialUsed = hasUsedTrial()

  const handleActivate = () => {
    activateTrial()
    onTrialActivated()
    onClose()
  }

  const handleVerPlanos = () => {
    navigate('/planos-assinaturas')
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes _modalBgIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes _modalCardIn {
          from { opacity:0; transform: translateY(18px) scale(0.96) }
          to   { opacity:1; transform: translateY(0)    scale(1)    }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ animation: '_modalBgIn 0.18s ease-out forwards' }}
      >
        <div
          className="absolute inset-0 bg-[#020617]/70 backdrop-blur-[6px]"
          onClick={onClose}
        />

        {/* Card */}
        <div
          className="relative w-full max-w-[420px] overflow-hidden
                     bg-[#0F172A] rounded-[24px]
                     border border-white/[0.08]
                     shadow-[0_40px_80px_rgba(0,0,0,0.50),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ animation: '_modalCardIn 0.26s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          {/* Faixa dourada */}
          <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />

          <div className="p-7">

            {/* Fechar */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center
                         rounded-full text-slate-500
                         hover:text-white hover:bg-white/[0.08]
                         transition-all duration-150"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ícone */}
            <div
              className="w-[56px] h-[56px] rounded-[16px] mb-5
                         bg-[rgba(212,175,55,0.12)] ring-1 ring-[rgba(212,175,55,0.22)]
                         flex items-center justify-center"
            >
              {trialUsed
                ? <Zap  className="w-6 h-6 text-[#D4AF37]" />
                : <Gift className="w-6 h-6 text-[#D4AF37]" />
              }
            </div>

            {/* Título */}
            <h2 className="text-[18px] font-bold text-white leading-snug tracking-tight mb-2">
              {trialUsed ? 'Recurso do plano superior' : 'Teste grátis disponível'}
            </h2>

            {/* Descrição */}
            <p className="text-[13.5px] text-slate-400 leading-relaxed mb-6">
              {trialUsed
                ? 'Seu teste grátis já foi utilizado. Faça upgrade para continuar com esse recurso.'
                : 'Este recurso faz parte de um plano superior. Você pode testar esta ferramenta por 7 dias para conhecer os recursos do plano Profissional ou Premium.'
              }
            </p>

            {/* Lista de benefícios (só no trial não usado) */}
            {!trialUsed && (
              <div className="mb-6 space-y-2">
                {[
                  'Automação de atendimento',
                  'Fluxos avançados',
                  'Atendimento com IA',
                  'API WhatsApp',
                  'Relatórios avançados',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center
                                 bg-[rgba(212,175,55,0.14)]"
                    >
                      <Check className="w-2.5 h-2.5 text-[#D4AF37]" strokeWidth={3} />
                    </div>
                    <span className="text-[12.5px] text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-2.5">

              {/* Ativar trial — só se nunca usou */}
              {!trialUsed && (
                <button
                  onClick={handleActivate}
                  className="w-full flex items-center justify-center gap-2.5
                             py-[13px] rounded-[12px]
                             bg-[#D4AF37] text-[#0F172A] font-bold text-[14px]
                             hover:bg-[#C9A227] active:scale-[0.98]
                             transition-all duration-150
                             shadow-[0_4px_18px_rgba(212,175,55,0.40)]"
                >
                  <Gift className="w-4 h-4" />
                  Ativar teste grátis — 7 dias
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
                Ver planos e preços
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Fechar */}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-[13px] font-medium
                           text-slate-500 hover:text-slate-300
                           transition-colors duration-150"
              >
                Continuar no plano atual
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
