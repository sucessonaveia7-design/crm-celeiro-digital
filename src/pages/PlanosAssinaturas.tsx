import React, { useState } from 'react'
import { useAssinaturaStore, Plano, Assinatura, Pagamento } from '../store/assinaturaStore'
import { useAuthStore } from '@/store/authStore'
import { PLAN_LIMITS } from '@/lib/permissions'
import {
  Clock, CheckCircle2, X, AlertTriangle, Plus, Pencil, Trash2,
  Wheat, CreditCard, Crown, Zap, Sparkles, MessageSquare,
} from 'lucide-react'

/* ─── Billing ────────────────────────────────────────────── */

type BillingPeriod = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'

const BILLING: Record<BillingPeriod, { mult: number; saving: string | null }> = {
  Mensal:     { mult: 1,    saving: null       },
  Trimestral: { mult: 0.90, saving: '10% off'  },
  Semestral:  { mult: 0.85, saving: '15% off'  },
  Anual:      { mult: 0.80, saving: '20% off'  },
}

/* ─── Plan definitions ───────────────────────────────────── */

const PLANS = [
  {
    id:          'essencial' as const,
    name:        'Essencial',
    description: 'Para começar com organização.',
    basePrice:   49,
    badge:       null as string | null,
    style:       'default' as const,
    Icon:        Zap,
    features: [
      'Bate-papo ao vivo',
      'Kanban',
      'Audiência',
      'Transmissões',
      'Relatórios básicos',
      '1 usuário · 500 contatos',
    ],
  },
  {
    id:          'profissional' as const,
    name:        'Profissional',
    description: 'Para automatizar o atendimento.',
    basePrice:   99,
    badge:       'Mais escolhido',
    style:       'highlight' as const,
    Icon:        Sparkles,
    features: [
      'Tudo do Essencial',
      'Automação',
      'Fluxos de conversa',
      'Atendimento com IA',
      'API WhatsApp',
      '3 usuários · 3.000 contatos',
    ],
  },
  {
    id:          'premium' as const,
    name:        'Premium',
    description: 'Acesso completo à plataforma.',
    basePrice:   199,
    badge:       'Completo',
    style:       'premium' as const,
    Icon:        Crown,
    features: [
      'Tudo do Profissional',
      'Esboço para Pregação com IA',
      'Biblioteca de Esboços',
      'Relatórios avançados',
      'Usuários ilimitados',
      'Contatos ilimitados',
      'Suporte prioritário',
    ],
  },
]

/* ─── Component ──────────────────────────────────────────── */

export default function PlanosAssinaturas() {

  const [activeTab,     setActiveTab]     = useState<'Meu Plano' | 'Planos' | 'Assinaturas' | 'Pagamentos'>('Meu Plano')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('Mensal')

  // Auth / trial
  const getEffectivePlan = useAuthStore(s => s.getEffectivePlan)
  const isTrialActive    = useAuthStore(s => s.isTrialActive)
  const trialDaysLeft    = useAuthStore(s => s.trialDaysLeft)
  const effectivePlan    = getEffectivePlan()
  const trialOn          = isTrialActive()
  const daysLeft         = trialDaysLeft()

  // Store
  const {
    planos, addPlano,
    assinaturas, addAssinatura,
    pagamentos, addPagamento,
  } = useAssinaturaStore()

  // Modal states
  const [isPlanoModalOpen,     setIsPlanoModalOpen]     = useState(false)
  const [isAssinaturaModalOpen, setIsAssinaturaModalOpen] = useState(false)
  const [isPagamentoModalOpen,  setIsPagamentoModalOpen]  = useState(false)

  // Form states
  const [planoForm,      setPlanoForm]      = useState<Partial<Plano>>({})
  const [assinaturaForm, setAssinaturaForm] = useState<Partial<Assinatura>>({})
  const [pagamentoForm,  setPagamentoForm]  = useState<Partial<Pagamento>>({})

  // Helpers
  const getDiasParaVencer = (dataVencimento: string) => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const venc = new Date(dataVencimento)
    return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  const checkVencimentoStatus = (dataVencimento: string, statusAtual: string) => {
    const dias = getDiasParaVencer(dataVencimento)
    if (dias < 0 && statusAtual !== 'Expirada') return 'Bloqueado Automaticamente'
    if (dias >= 0 && dias <= 3 && statusAtual === 'Ativa') return `Vence em ${dias} dias`
    return null
  }

  const computePrice = (basePrice: number) =>
    Math.round(basePrice * BILLING[billingPeriod].mult)

  // Handlers
  const handleSavePlano = () => {
    if (!planoForm.nome || !planoForm.valor) return
    addPlano({ ...planoForm, id: Math.random().toString(), status: 'Ativo' } as Plano)
    setIsPlanoModalOpen(false); setPlanoForm({})
  }

  const handleSaveAssinatura = () => {
    if (!assinaturaForm.usuarioNome || !assinaturaForm.planoId) return
    const plano = planos.find(p => p.id === assinaturaForm.planoId)
    if (!plano) return
    const hoje     = new Date()
    const vencimento = new Date(hoje.getTime() + plano.duracaoDias * 86_400_000)
    addAssinatura({
      ...assinaturaForm, id: Math.random().toString(),
      dataInicio:     hoje.toISOString().split('T')[0],
      dataVencimento: vencimento.toISOString().split('T')[0],
      status: 'Ativa',
    } as Assinatura)
    setIsAssinaturaModalOpen(false); setAssinaturaForm({})
  }

  const handleSavePagamento = () => {
    if (!pagamentoForm.usuarioNome || !pagamentoForm.planoId || !pagamentoForm.valor) return
    addPagamento({
      ...pagamentoForm, id: Math.random().toString(),
      data: new Date().toISOString().split('T')[0],
      status: 'Pago',
    } as Pagamento)
    setIsPagamentoModalOpen(false); setPagamentoForm({})
  }

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 transition-opacity duration-[220ms] ease-in-out">
        <div className="max-w-[1280px] mx-auto w-full">

          {/* ── Top nav tabs ── */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1.5 rounded-[16px]
                            border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              {(['Meu Plano', 'Planos', 'Assinaturas', 'Pagamentos'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-[12px] text-[13px] font-[600] transition-all
                    ${activeTab === tab
                      ? 'bg-[#D4AF37] text-[#0F172A] shadow-[0_3px_10px_rgba(212,175,55,0.35)]'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              ABA — MEU PLANO (pricing showcase)
          ════════════════════════════════════════════════ */}
          {activeTab === 'Meu Plano' && (
            <div>

              {/* Trial warning banner */}
              {trialOn && (
                <div className="mb-8 px-6 py-4 rounded-[18px]
                                bg-gradient-to-r from-[#D4AF37]/12 to-[#D4AF37]/4
                                border border-[rgba(212,175,55,0.28)]
                                flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-[700] text-[#0F172A] dark:text-white">
                      Trial ativo — {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                    </p>
                    <p className="text-[12.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Você tem acesso completo a todos os recursos durante o período de avaliação.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-[rgba(15,23,42,0.08)] dark:bg-[rgba(255,255,255,0.08)] rounded-full h-1.5 w-32">
                      <div
                        className="bg-[#D4AF37] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (daysLeft / 7) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#94A3B8] text-right mt-1">{daysLeft}/7 dias</p>
                  </div>
                </div>
              )}

              {/* ── Hero ── */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2
                                bg-[#D4AF37]/10 border border-[#D4AF37]/25
                                rounded-full px-4 py-1.5 mb-5">
                  <Wheat className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[11px] font-[800] text-[#D4AF37] tracking-widest uppercase">
                    Celeiro Digital
                  </span>
                </div>

                <h1 className="text-[38px] font-[800] text-[#0F172A] dark:text-white tracking-tight leading-tight mb-3">
                  Planos e Assinaturas
                </h1>
                <p className="text-[16px] text-[#64748B] dark:text-[#94A3B8] max-w-[480px] mx-auto mb-6">
                  Escolha o plano ideal para sua igreja ou ministério.
                </p>

                {/* Badges row */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                   bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[12px] font-[700] text-[#D4AF37]">
                      Plano atual: {effectivePlan === 'trial' ? 'Trial (7 dias)' : PLAN_LIMITS[effectivePlan]?.label ?? effectivePlan}
                    </span>
                  </span>
                  {trialOn && (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                     bg-amber-50 dark:bg-amber-500/10
                                     border border-amber-200 dark:border-amber-500/25">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-[12px] font-[700] text-amber-700 dark:text-amber-400">
                        {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'} de trial
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* ── Billing selector ── */}
              <div className="flex justify-center mb-12">
                <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1E293B]
                                rounded-[16px] p-1.5 gap-1
                                border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                  {(['Mensal', 'Trimestral', 'Semestral', 'Anual'] as BillingPeriod[]).map(period => {
                    const isActive = billingPeriod === period
                    const saving   = BILLING[period].saving
                    return (
                      <button
                        key={period}
                        onClick={() => setBillingPeriod(period)}
                        className="relative"
                      >
                        {saving && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2
                                           text-[9px] font-[800] text-emerald-500 whitespace-nowrap">
                            {saving}
                          </span>
                        )}
                        <span className={`block px-5 py-2.5 rounded-[12px] text-[13px] font-[600] transition-all
                          ${isActive
                            ? 'bg-[#D4AF37] text-[#0F172A] shadow-[0_3px_10px_rgba(212,175,55,0.35)]'
                            : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}>
                          {period}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Plan cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {PLANS.map(plan => {
                  const isCurrent = effectivePlan === plan.id || (trialOn && effectivePlan === 'trial')
                  const price     = computePrice(plan.basePrice)
                  const isHL      = plan.style === 'highlight'
                  const isPrem    = plan.style === 'premium'

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-[26px] p-7 flex flex-col gap-6 transition-all duration-300
                        ${isHL
                          ? 'bg-[#0A1628] border-2 border-[#D4AF37] shadow-[0_24px_60px_rgba(212,175,55,0.22)] hover:shadow-[0_32px_70px_rgba(212,175,55,0.30)] hover:-translate-y-1'
                          : isPrem
                            ? 'bg-gradient-to-b from-[#06091A] to-[#0A0F20] border-2 border-[#D4AF37] hover:-translate-y-1 transition-all'
                            : 'bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.10)] hover:-translate-y-1'}`}
                      style={isPrem ? {
                        boxShadow: '0 0 0 1px rgba(212,175,55,0.20), 0 0 60px rgba(212,175,55,0.14), 0 24px 60px rgba(6,9,26,0.50)',
                      } : undefined}
                    >
                      {/* Badge */}
                      {plan.badge && (
                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full
                                         text-[11px] font-[800] uppercase tracking-wider whitespace-nowrap
                          ${isPrem
                            ? 'bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840] text-[#0F172A] shadow-[0_4px_16px_rgba(212,175,55,0.55)]'
                            : 'bg-[#D4AF37] text-[#0F172A] shadow-[0_4px_12px_rgba(212,175,55,0.40)]'}`}>
                          {plan.badge}
                        </div>
                      )}

                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center
                            ${isHL || isPrem
                              ? 'bg-[#D4AF37]/20'
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B]'}`}>
                            <plan.Icon className={`w-4.5 h-4.5 ${isHL || isPrem ? 'text-[#D4AF37]' : 'text-[#64748B] dark:text-[#94A3B8]'}`} style={{ width: 18, height: 18 }} />
                          </div>
                          <p className={`text-[12px] font-[800] uppercase tracking-[0.12em]
                            ${isHL || isPrem ? 'text-[#D4AF37]' : 'text-[#94A3B8]'}`}>
                            {plan.name}
                          </p>
                        </div>

                        <div className="flex items-end gap-1.5 mb-2">
                          <span className={`text-[13px] font-[600] mb-1 ${isHL || isPrem ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>R$</span>
                          <span className={`text-[42px] font-[800] leading-none tracking-tight
                            ${isHL ? 'text-white' : isPrem ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>
                            {price}
                          </span>
                          <span className={`text-[13px] font-[500] mb-1.5 ${isHL || isPrem ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>/mês</span>
                        </div>

                        {billingPeriod !== 'Mensal' && (
                          <p className="text-[11px] text-emerald-500 font-[600] mb-2">
                            {BILLING[billingPeriod].saving} em relação ao mensal
                          </p>
                        )}

                        <p className={`text-[13px] leading-relaxed
                          ${isHL || isPrem ? 'text-[#64748B]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                          {plan.description}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className={`h-px ${isHL || isPrem ? 'bg-white/[0.06]' : 'bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)]'}`} />

                      {/* Features */}
                      <ul className="space-y-3 flex-1">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-[15px] h-[15px] flex-shrink-0 mt-[2px]
                              ${isHL || isPrem ? 'text-[#D4AF37]' : 'text-emerald-500'}`} />
                            <span className={`text-[13px] leading-snug
                              ${isHL || isPrem ? 'text-[#CBD5E1]' : 'text-[#475569] dark:text-[#94A3B8]'}`}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button
                        disabled={isCurrent && !trialOn}
                        className={`w-full py-3.5 rounded-[14px] text-[14px] font-[700] transition-all
                          ${isCurrent && !trialOn
                            ? 'bg-[rgba(15,23,42,0.06)] dark:bg-white/[0.06] text-[#94A3B8] cursor-default'
                            : isPrem
                              ? 'bg-gradient-to-r from-[#C9A227] via-[#D4AF37] to-[#F0C840] text-[#0F172A] hover:opacity-90 shadow-[0_6px_20px_rgba(212,175,55,0.45)]'
                              : isHL
                                ? 'bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] shadow-[0_6px_20px_rgba(212,175,55,0.35)]'
                                : 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:opacity-90 shadow-[0_4px_14px_rgba(15,23,42,0.18)]'}`}
                      >
                        {isCurrent && !trialOn
                          ? 'Plano atual'
                          : isPrem
                            ? 'Assinar Premium'
                            : `Fazer upgrade`}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* ── Custom plan card ── */}
              <div className="rounded-[26px] p-8 flex flex-col md:flex-row items-center gap-6
                              border-2 border-dashed border-[rgba(212,175,55,0.30)]
                              bg-[#D4AF37]/[0.03] dark:bg-[#D4AF37]/[0.02]
                              hover:border-[rgba(212,175,55,0.50)] transition-all duration-300">
                <div className="w-14 h-14 rounded-[16px] bg-[#D4AF37]/10 border border-[#D4AF37]/20
                                flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[11px] font-[800] uppercase tracking-widest text-[#D4AF37] mb-1">
                    Plano Personalizado
                  </p>
                  <h3 className="text-[22px] font-[800] text-[#0F172A] dark:text-white tracking-tight mb-1.5">
                    Sob medida
                  </h3>
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] max-w-[420px]">
                    Monte um plano conforme a necessidade da sua igreja.
                    Número de usuários, contatos e recursos personalizados.
                  </p>
                </div>
                <button className="flex-shrink-0 flex items-center gap-2.5 px-7 py-3.5 rounded-[14px]
                                   bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]
                                   text-[14px] font-[700]
                                   hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-200">
                  <MessageSquare className="w-4 h-4" />
                  Falar com suporte
                </button>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════
              ABA — PLANOS (admin)
          ════════════════════════════════════════════════ */}
          {activeTab === 'Planos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-[800] text-[#0F172A] dark:text-white tracking-tight">Planos Disponíveis</h2>
                <button
                  onClick={() => setIsPlanoModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[700]
                             bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors
                             shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
                >
                  <Plus className="w-4 h-4" /> Novo Plano
                </button>
              </div>

              {planos.length === 0 ? (
                <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-14 text-center
                                border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                  <div className="w-16 h-16 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-2">Nenhum plano criado ainda.</h3>
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mb-6">
                    Crie seu primeiro plano para começar a gerenciar assinaturas.
                  </p>
                  <button
                    onClick={() => setIsPlanoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-[13px] font-[700]
                               bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Criar primeiro plano
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {planos.map(plano => (
                    <div key={plano.id}
                         className="bg-white dark:bg-[#0F172A] rounded-[20px] p-6
                                    shadow-[0_10px_26px_rgba(15,23,42,0.06)]
                                    border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                    hover:-translate-y-1 transition-transform duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">{plano.nome}</h3>
                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                                         px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider">
                          {plano.status}
                        </span>
                      </div>
                      <div className="text-[28px] font-[800] text-[#D4AF37] mb-1">
                        R$ {plano.valor.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-[12px] text-[#94A3B8] mb-5">/ {plano.duracaoDias} dias</div>
                      <div className="space-y-2.5 mb-5">
                        {[
                          `${plano.limiteContatos} contatos`,
                          `${plano.limiteTransmissoes} transmissões`,
                          `${plano.limiteUsuarios} usuários`,
                        ].map(f => (
                          <div key={f} className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#94A3B8]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f}
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2.5 rounded-[12px] text-[13px] font-[600]
                                         bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]
                                         hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                        Editar Plano
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              ABA — ASSINATURAS
          ════════════════════════════════════════════════ */}
          {activeTab === 'Assinaturas' && (
            <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-6
                            shadow-[0_10px_26px_rgba(15,23,42,0.06)]
                            border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-[800] text-[#0F172A] dark:text-white tracking-tight">Assinaturas</h2>
                <button
                  onClick={() => setIsAssinaturaModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[700]
                             bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
                >
                  <Plus className="w-4 h-4" /> Nova assinatura
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                   text-[11px] font-[700] uppercase tracking-wider text-[#94A3B8]">
                      {['Nome', 'Plano', 'Início', 'Vencimento', 'Status', ''].map(h => (
                        <th key={h} className="py-4 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assinaturas.map(assinatura => {
                      const plano            = planos.find(p => p.id === assinatura.planoId)
                      const avisoVencimento  = checkVencimentoStatus(assinatura.dataVencimento, assinatura.status)
                      const isExpired        = getDiasParaVencer(assinatura.dataVencimento) < 0
                      return (
                        <tr key={assinatura.id}
                            className="border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]
                                       hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="py-4 pr-4 font-[600] text-[14px] text-[#0F172A] dark:text-white">{assinatura.usuarioNome}</td>
                          <td className="py-4 pr-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{plano?.nome || '—'}</td>
                          <td className="py-4 pr-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{new Date(assinatura.dataInicio).toLocaleDateString('pt-BR')}</td>
                          <td className="py-4 pr-4 text-[13px]">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">{new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}</span>
                            {avisoVencimento && (
                              <span className={`flex items-center gap-1 text-[10px] font-[700] mt-0.5 ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                                <AlertTriangle className="w-3 h-3" /> {avisoVencimento}
                              </span>
                            )}
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider
                              ${isExpired || assinatura.status === 'Expirada'
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                : assinatura.status === 'Ativa'
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                              {isExpired ? 'Bloqueado' : assinatura.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="text-[12px] font-[600] text-[#D4AF37] px-3 py-1.5 rounded-[8px]
                                                 hover:bg-[#D4AF37]/10 transition-colors">Renovar</button>
                              <button className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white
                                                 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-red-500
                                                 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              ABA — PAGAMENTOS
          ════════════════════════════════════════════════ */}
          {activeTab === 'Pagamentos' && (
            <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-6
                            shadow-[0_10px_26px_rgba(15,23,42,0.06)]
                            border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-[800] text-[#0F172A] dark:text-white tracking-tight">Registro de Pagamentos</h2>
                <button
                  onClick={() => setIsPagamentoModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[700]
                             bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
                >
                  <Plus className="w-4 h-4" /> Registrar pagamento
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                   text-[11px] font-[700] uppercase tracking-wider text-[#94A3B8]">
                      {['Usuário', 'Plano', 'Valor', 'Data', 'Status'].map(h => (
                        <th key={h} className="py-4 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map(pagamento => {
                      const plano = planos.find(p => p.id === pagamento.planoId)
                      return (
                        <tr key={pagamento.id}
                            className="border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]
                                       hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="py-4 pr-4 font-[600] text-[14px] text-[#0F172A] dark:text-white">{pagamento.usuarioNome}</td>
                          <td className="py-4 pr-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{plano?.nome || '—'}</td>
                          <td className="py-4 pr-4 text-[13px] font-[600] text-[#0F172A] dark:text-white">
                            R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-4 pr-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                            {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider
                              ${pagamento.status === 'Pago'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : pagamento.status === 'Pendente'
                                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                              {pagamento.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MODAL — Novo Plano
      ════════════════════════════════════════════════════ */}
      {isPlanoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />
            <div className="flex items-center justify-between p-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">Criar novo plano</h2>
              <button onClick={() => setIsPlanoModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nome do plano',          key: 'nome',               type: 'text',   val: planoForm.nome         },
                { label: 'Valor (R$)',              key: 'valor',              type: 'number', val: planoForm.valor        },
                { label: 'Duração (dias)',          key: 'duracaoDias',        type: 'number', val: planoForm.duracaoDias  },
                { label: 'Limite de contatos',     key: 'limiteContatos',     type: 'number', val: planoForm.limiteContatos },
                { label: 'Limite de transmissões', key: 'limiteTransmissoes', type: 'number', val: planoForm.limiteTransmissoes },
                { label: 'Limite de usuários',     key: 'limiteUsuarios',     type: 'number', val: planoForm.limiteUsuarios },
              ].map(({ label, key, type, val }) => (
                <div key={key}>
                  <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">{label}</label>
                  <input type={type} value={val ?? ''} onChange={e => setPlanoForm({ ...planoForm, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                         className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                                    border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                    rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                                    focus:outline-none focus:border-[rgba(212,175,55,0.40)] transition-colors" />
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex justify-end gap-3">
              <button onClick={() => setIsPlanoModalOpen(false)}
                      className="px-5 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]
                                 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSavePlano}
                      className="px-5 py-2.5 text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                                 rounded-[12px] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL — Nova Assinatura
      ════════════════════════════════════════════════════ */}
      {isAssinaturaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />
            <div className="flex items-center justify-between p-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">Nova assinatura</h2>
              <button onClick={() => setIsAssinaturaModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">Nome do usuário</label>
                <input type="text" placeholder="Ex: João da Silva"
                       value={assinaturaForm.usuarioNome || ''}
                       onChange={e => setAssinaturaForm({ ...assinaturaForm, usuarioNome: e.target.value })}
                       className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                                  border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                  rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                                  focus:outline-none focus:border-[rgba(212,175,55,0.40)] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">Selecionar plano</label>
                <select value={assinaturaForm.planoId || ''}
                        onChange={e => setAssinaturaForm({ ...assinaturaForm, planoId: e.target.value })}
                        className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                                   border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                   rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                                   focus:outline-none focus:border-[rgba(212,175,55,0.40)] transition-colors">
                  <option value="">Selecione um plano...</option>
                  {planos.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.duracaoDias} dias)</option>)}
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Vencimento calculado automaticamente.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex justify-end gap-3">
              <button onClick={() => setIsAssinaturaModalOpen(false)}
                      className="px-5 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]
                                 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveAssinatura}
                      className="px-5 py-2.5 text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                                 rounded-[12px] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL — Registrar Pagamento
      ════════════════════════════════════════════════════ */}
      {isPagamentoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />
            <div className="flex items-center justify-between p-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">Registrar Pagamento</h2>
              <button onClick={() => setIsPagamentoModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">Usuário / Igreja</label>
                <input type="text" placeholder="Ex: João da Silva"
                       value={pagamentoForm.usuarioNome || ''}
                       onChange={e => setPagamentoForm({ ...pagamentoForm, usuarioNome: e.target.value })}
                       className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                                  border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                  rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                                  focus:outline-none focus:border-[rgba(212,175,55,0.40)] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">Plano</label>
                <select value={pagamentoForm.planoId || ''}
                        onChange={e => {
                          const pId = e.target.value
                          const p   = planos.find(pl => pl.id === pId)
                          setPagamentoForm({ ...pagamentoForm, planoId: pId, valor: p?.valor })
                        }}
                        className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                                   border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                   rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                                   focus:outline-none focus:border-[rgba(212,175,55,0.40)] transition-colors">
                  <option value="">Selecione um plano</option>
                  {planos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} — R$ {p.valor.toFixed(2).replace('.', ',')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">Valor (R$)</label>
                <input type="number" value={pagamentoForm.valor || ''} readOnly
                       className="w-full bg-[#F1F5F9] dark:bg-[rgba(255,255,255,0.04)]
                                  border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                  rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white cursor-not-allowed" />
              </div>
            </div>
            <div className="p-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex justify-end gap-3">
              <button onClick={() => setIsPagamentoModalOpen(false)}
                      className="px-5 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]
                                 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSavePagamento}
                      className="px-5 py-2.5 text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                                 rounded-[12px] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]">
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
