import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Gift, Clock, ArrowRight, Sparkles } from 'lucide-react'

export default function TrialBanner() {
  const navigate         = useNavigate()
  const isTrialActive    = useAuthStore(s => s.isTrialActive)
  const trialDaysLeft    = useAuthStore(s => s.trialDaysLeft)

  // Leitura reativa: some automaticamente quando trial_active vira false
  if (!isTrialActive()) return null

  const days = trialDaysLeft()

  const message =
    days > 1
      ? `🎁 Teste grátis ativo — você ainda tem ${days} dias para aproveitar todos os recursos.`
      : days === 1
        ? '⚠️ Seu teste grátis termina amanhã.'
        : '🚨 Seu teste grátis termina hoje.'

  const Icon = days === 0 ? Clock : Gift

  return (
    <div
      className="w-full flex items-center justify-between gap-4
                 px-5 py-4
                 rounded-xl
                 bg-[#0A1628]
                 border border-[rgba(212,175,55,0.35)]
                 shadow-[0_4px_24px_rgba(212,175,55,0.10),inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {/* Esquerda: ícone + textos */}
      <div className="flex items-center gap-4 min-w-0">

        {/* Ícone */}
        <div className="flex-shrink-0 relative">
          <div
            className="w-10 h-10 rounded-[12px]
                       bg-[rgba(212,175,55,0.12)]
                       ring-1 ring-[rgba(212,175,55,0.28)]
                       flex items-center justify-center"
          >
            <Icon className="w-[18px] h-[18px] text-[#D4AF37]" />
          </div>
          {/* Ponto pulsante */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]" />
          </span>
        </div>

        {/* Textos */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
            <span className="text-[12px] font-bold text-[#D4AF37] uppercase tracking-widest">
              Teste grátis ativo
            </span>
          </div>
          <p className="text-[13px] text-slate-300 leading-snug truncate">
            {message}
          </p>
        </div>
      </div>

      {/* Direita: botão */}
      <button
        onClick={() => navigate('/planos-assinaturas')}
        className="flex-shrink-0 flex items-center gap-2
                   px-5 py-2.5 rounded-[10px]
                   bg-[#D4AF37] text-[#0A1628] font-bold text-[13px]
                   hover:bg-[#C9A227] active:scale-[0.97]
                   transition-all duration-150
                   shadow-[0_3px_12px_rgba(212,175,55,0.40)]
                   whitespace-nowrap"
      >
        Ver planos
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
