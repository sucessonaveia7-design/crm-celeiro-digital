import { X, Lock, Zap, ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type Feature, type Plan, PLAN_LIMITS, PLAN_DETAILS, FEATURE_LABELS } from '@/lib/permissions'

interface Props {
  feature:      Feature
  requiredPlan: Plan
  onClose:      () => void
}

export default function UpgradeModal({ feature, requiredPlan, onClose }: Props) {
  const navigate   = useNavigate()
  const planInfo   = PLAN_LIMITS[requiredPlan]
  const planDetail = PLAN_DETAILS.find(p => p.id === requiredPlan)

  const handleUpgrade = () => {
    navigate('/planos')
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ animation: 'modalBackdropIn 0.2s ease-out forwards' }}
      >
        <div
          className="absolute inset-0 bg-[#020617]/65 backdrop-blur-[6px]"
          onClick={onClose}
        />

        {/* ── Card ── */}
        <div
          className="relative w-full max-w-[440px] overflow-hidden
                     bg-white dark:bg-[#0F172A]
                     rounded-[28px]
                     border border-slate-200/70 dark:border-white/[0.08]
                     shadow-[0_40px_100px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ animation: 'modalCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          {/* Faixa dourada no topo */}
          <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />

          <div className="p-8">

            {/* Botão fechar */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center
                         rounded-full text-slate-400
                         hover:text-slate-700 dark:hover:text-white
                         hover:bg-slate-100 dark:hover:bg-white/[0.08]
                         transition-all duration-150"
            >
              <X className="w-[15px] h-[15px]" />
            </button>

            {/* Ícone */}
            <div className="w-[60px] h-[60px] rounded-[18px]
                            bg-[rgba(212,175,55,0.12)] dark:bg-[rgba(212,175,55,0.10)]
                            flex items-center justify-center mb-6
                            ring-1 ring-[rgba(212,175,55,0.20)]">
              <Lock className="w-[26px] h-[26px] text-[#D4AF37]" />
            </div>

            {/* Título */}
            <h2 className="text-[19px] font-bold text-[#0F172A] dark:text-white
                           tracking-tight leading-snug mb-2">
              Recurso disponível no plano superior
            </h2>

            {/* Descrição */}
            <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              <span className="font-semibold text-[#0F172A] dark:text-white">
                {FEATURE_LABELS[feature]}
              </span>
              {' '}está incluído no plano{' '}
              <span className="font-semibold text-[#D4AF37]">{planInfo.label}</span>
              {' '}e superiores. Faça upgrade para desbloquear este e outros recursos avançados.
            </p>

            {/* Card do plano necessário */}
            <div className="mb-6 p-5 rounded-[18px]
                            bg-[#0A1628] dark:bg-[#020617]
                            border border-[rgba(212,175,55,0.22)]
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">

              {/* Header do plano */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10.5px] font-bold text-[#D4AF37] uppercase tracking-widest">
                    {planInfo.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[26px] font-bold text-white leading-none">
                      R$ {planInfo.price_monthly}
                    </span>
                    <span className="text-[12px] text-slate-500">/mês</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[rgba(212,175,55,0.15)]
                                border border-[rgba(212,175,55,0.25)]
                                text-[#D4AF37] text-[10.5px] font-semibold">
                  {planInfo.max_users === Infinity ? 'Ilimitado' : `${planInfo.max_users} usuário${planInfo.max_users > 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Features incluídas */}
              <div className="space-y-2">
                {(planDetail?.features ?? []).map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[rgba(212,175,55,0.15)]
                                    flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#D4AF37]" strokeWidth={3} />
                    </div>
                    <span className="text-[12px] text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleUpgrade}
                className="w-full flex items-center justify-center gap-2.5
                           py-[14px] rounded-[14px]
                           bg-[#D4AF37] text-[#0F172A] font-bold text-[14px]
                           hover:bg-[#C9A227] active:scale-[0.98]
                           transition-all duration-150
                           shadow-[0_4px_18px_rgba(212,175,55,0.40)]"
              >
                <Zap className="w-[15px] h-[15px]" />
                Ver planos e fazer upgrade
                <ArrowRight className="w-[15px] h-[15px]" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-[14px] text-[13px] font-medium
                           text-slate-400 dark:text-slate-500
                           hover:text-slate-600 dark:hover:text-slate-300
                           hover:bg-slate-50 dark:hover:bg-white/[0.04]
                           transition-all duration-150"
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
