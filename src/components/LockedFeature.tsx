import { Lock, Zap, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type Feature, type Plan, PLAN_LIMITS, FEATURE_LABELS } from '@/lib/permissions'

interface Props {
  feature:      Feature
  requiredPlan: Plan
}

export default function LockedFeature({ feature, requiredPlan }: Props) {
  const navigate   = useNavigate()
  const planInfo   = PLAN_LIMITS[requiredPlan]
  const featureLabel = FEATURE_LABELS[feature]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center
                    bg-[#F8FAFC] dark:bg-[#020617]">

      {/* Ícone com anéis decorativos */}
      <div className="relative mb-8">
        <div className="w-[88px] h-[88px] rounded-[26px]
                        bg-white dark:bg-[#0F172A]
                        border border-slate-200/80 dark:border-white/[0.08]
                        shadow-[0_8px_32px_rgba(15,23,42,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                        flex items-center justify-center">
          <Lock className="w-10 h-10 text-[#D4AF37] opacity-90" />
        </div>
        <div className="absolute inset-[-12px] rounded-[36px]
                        ring-1 ring-[rgba(212,175,55,0.18)] pointer-events-none" />
        <div className="absolute inset-[-24px] rounded-[46px]
                        ring-1 ring-[rgba(212,175,55,0.07)] pointer-events-none" />
      </div>

      {/* Texto */}
      <h2 className="text-[22px] font-bold text-[#0F172A] dark:text-white
                     tracking-tight mb-2">
        Recurso bloqueado
      </h2>

      <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed
                    max-w-[300px] mb-1">
        <span className="font-semibold text-[#0F172A] dark:text-white">{featureLabel}</span>
        {' '}está disponível no plano{' '}
        <span className="font-semibold text-[#D4AF37]">{planInfo.label}</span>
        {' '}ou superior.
      </p>

      <p className="text-[12.5px] text-slate-400 dark:text-slate-600 mb-8">
        Durante o trial de 7 dias você tem acesso a todos os recursos.
      </p>

      {/* Preço do plano mínimo */}
      <div className="mb-6 px-6 py-4 rounded-[18px]
                      bg-white dark:bg-[#0F172A]
                      border border-[rgba(212,175,55,0.25)]
                      shadow-[0_4px_20px_rgba(212,175,55,0.08)]">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          A partir de
        </p>
        <p className="text-[28px] font-bold text-[#0F172A] dark:text-white leading-none">
          R$ {planInfo.price_monthly}
          <span className="text-[14px] font-medium text-slate-400">/mês</span>
        </p>
        <p className="text-[11.5px] text-slate-400 mt-1">{planInfo.label}</p>
      </div>

      {/* Botão de upgrade */}
      <button
        onClick={() => navigate('/planos')}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-[14px]
                   bg-[#D4AF37] text-[#0F172A] font-bold text-[14px]
                   hover:bg-[#C9A227] transition-colors
                   shadow-[0_4px_18px_rgba(212,175,55,0.35)]
                   hover:-translate-y-px active:translate-y-0"
      >
        <Zap className="w-[15px] h-[15px]" />
        Ver planos e preços
        <ArrowRight className="w-[15px] h-[15px]" />
      </button>

      <button
        onClick={() => navigate(-1)}
        className="mt-3 text-[12.5px] text-slate-400 hover:text-slate-600
                   dark:hover:text-slate-300 transition-colors py-2 px-4"
      >
        Voltar
      </button>
    </div>
  )
}
