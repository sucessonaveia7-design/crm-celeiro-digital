import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { User as StoreUser } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Wheat } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function mapSupabaseUser(user: SupabaseUser): StoreUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const trialEnd   = meta.trial_end   as string | null | undefined
  const trialStart = meta.trial_start as string | null | undefined
  let trial_expired   = false
  let trial_days_left = 0
  if (trialEnd) {
    const endMs = new Date(trialEnd).getTime()
    trial_expired = Date.now() > endMs
    if (!trial_expired) {
      trial_days_left = Math.max(0, Math.ceil((endMs - Date.now()) / 86_400_000))
    }
  }
  return {
    id:              user.id,
    email:           user.email ?? '',
    name:            (meta.name  as string | undefined) ?? user.email ?? '',
    role:            (meta.role  as string | undefined) ?? 'owner',
    is_active:       true,
    plan:            (meta.plan as string | undefined) ?? 'trial',
    trial_active:    (meta.trial_active as boolean | undefined) ?? true,
    trial_start:     trialStart ?? null,
    trial_end:       trialEnd   ?? null,
    trial_expired,
    trial_days_left,
  }
}

export default function Signup() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((state) => state.setAuth)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isFadingOut, setIsFadingOut]   = useState(false)
  const [isSuccessLoading, setIsSuccessLoading] = useState(false)
  const [formData, setFormData] = useState({
    name:              '',
    email:             '',
    password:          '',
    organization_name: '',
    phone:             '',
  })

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark')
    return () => {
      if (useThemeStore.getState().isDarkMode) html.classList.add('dark')
    }
  }, [])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const startTime = Date.now()

    try {
      // 1. Create account via backend (org + profile + subscription)
      const res = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              formData.name.trim(),
          email:             formData.email.trim(),
          password:          formData.password,
          organization_name: formData.organization_name.trim(),
          phone:             formData.phone.trim(),
        }),
      })

      let json: Record<string, unknown> = {}
      try { json = await res.json() } catch { /* non-JSON body (proxy error, empty response) */ }
      if (!res.ok || !json.success) {
        if (import.meta.env.DEV) console.error('[signup] backend error:', json)
        throw new Error(
          import.meta.env.DEV && json.details
            ? `${json.error ?? 'Erro ao criar conta.'} — ${json.details}`
            : (json.error as string | undefined) ?? 'Erro ao criar conta.'
        )
      }

      // 2. Sign in with Supabase client to get session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email:    formData.email.trim(),
        password: formData.password,
      })
      if (signInError) throw signInError

      const storeUser = mapSupabaseUser(signInData.user!)
      storeUser.organization_id   = json.organization?.id
      storeUser.organization_name = json.organization?.name
      setAuth(signInData.session?.access_token ?? '', storeUser)

      const elapsed = Date.now() - startTime
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed))

      setIsSuccessLoading(true)
      setTimeout(() => {
        setIsFadingOut(true)
        setTimeout(() => navigate('/'), 400)
      }, 2200)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro desconhecido.')
      setLoading(false)
    }
  }

  return (
    <>
      {isSuccessLoading && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-[400ms] ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          style={{
            animation: 'fadeIn 0.4s ease-out forwards',
            background: `
              radial-gradient(circle at center, rgba(255,215,0,0.05), transparent 60%),
              linear-gradient(180deg, #020617 0%, #020617 60%, #03132a 100%)
            `,
          }}
        >
          <style>{`
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }
            @keyframes pulseGlow { 0%{box-shadow:0 0 8px rgba(255,215,0,.2)} 50%{box-shadow:0 0 22px rgba(255,215,0,.5)} 100%{box-shadow:0 0 8px rgba(255,215,0,.2)} }
            @keyframes fadeText { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
          `}</style>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 mb-[40px]">
              <div
                className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl flex-shrink-0 border border-yellow-500/20"
                style={{ boxShadow: '0 0 12px rgba(255,215,0,0.4),0 0 24px rgba(255,215,0,0.2)', animation: 'pulseGlow 2.5s ease-in-out infinite' }}
              >
                <Wheat className="text-[#eab308] drop-shadow-md w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="text-[36px] text-white font-['Great_Vibes'] tracking-wide leading-none mt-1">Celeiro Digital</span>
            </div>
            <div style={{ width:52, height:52, border:'4px solid rgba(255,255,255,0.08)', borderTop:'4px solid #FFD700', borderRadius:'50%', animation:'spin 1s linear infinite', filter:'drop-shadow(0 0 6px rgba(255,215,0,0.6))' }} />
            <div className="mt-6 text-[#9CA3AF] text-[14px]" style={{ letterSpacing:'0.5px', animation:'fadeText 2s ease-in-out infinite' }}>
              Preparando seu espaço...
            </div>
          </div>
        </div>
      )}

      <div className={`flex min-h-screen bg-[#0b1120] transition-opacity duration-[400ms] ease-in-out ${isFadingOut || isSuccessLoading ? 'opacity-0' : 'opacity-100'}`}>

        {/* Left side – Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-24 xl:px-32 bg-[#fafafa] z-20 relative overflow-y-auto">
          <div className="mx-auto w-full max-w-[420px] lg:w-[420px]">

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-[32px]">
              <div className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl flex-shrink-0 border border-yellow-500/20 shadow-[0px_0px_12px_rgba(255,215,0,0.25)]">
                <Wheat className="text-[#eab308] drop-shadow-md w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="text-[36px] text-[#0f172a] font-['Great_Vibes'] tracking-wide leading-none mt-1">Celeiro Digital</span>
            </div>

            {/* Card */}
            <div
              className="bg-white p-8 rounded-[20px] border border-slate-100/50 backdrop-blur-xl relative z-30"
              style={{ width: '420px', padding: '32px', boxShadow: '0px 20px 40px rgba(0,0,0,0.08),0px 0px 0px 1px rgba(0,0,0,0.02)' }}
            >
              <div className="text-center flex flex-col items-center mb-6">
                <div className="mb-4 rounded-[4px]" style={{ width:'40px', height:'3px', background:'linear-gradient(90deg,#FFD700,#E6B800)' }} />
                <h2 className="text-[22px] font-black tracking-tight text-[#0f172a] uppercase">Criar conta grátis</h2>
                <p className="text-[#64748B] text-[13px] font-normal leading-[1.6] text-center mt-2 max-w-[280px] mx-auto">
                  7 dias de trial completo, sem cartão de crédito.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50/80 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-center text-center">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Nome do responsável
                  </label>
                  <Input
                    required
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className="block w-full h-12 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[14px] transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Email
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="block w-full h-12 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[14px] transition-all duration-300"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={handleChange('password')}
                      className="block w-full h-12 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[14px] pr-12 transition-all duration-300"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#eab308] transition-colors"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Nome da igreja / empresa
                  </label>
                  <Input
                    required
                    placeholder="Ex: Igreja Batista Central"
                    value={formData.organization_name}
                    onChange={handleChange('organization_name')}
                    className="block w-full h-12 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[14px] transition-all duration-300"
                  />
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">
                    Telefone <span className="font-normal normal-case text-slate-400">(opcional)</span>
                  </label>
                  <Input
                    placeholder="(11) 99999-0000"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="block w-full h-12 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[14px] transition-all duration-300"
                  />
                </div>

                <div className="pt-1">
                  <style>{`
                    @keyframes buttonFadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }
                    @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                  `}</style>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center rounded-[12px] bg-gradient-to-br from-[#FFD700] to-[#E6B800] h-14 text-[15px] font-[600] tracking-wide uppercase text-[#020617] shadow-[0px_4px_18px_rgba(255,215,0,0.35)] hover:bg-gradient-to-br hover:from-[#FFE44D] hover:to-[#FFD700] hover:shadow-[0px_10px_25px_rgba(255,215,0,0.35)] hover:-translate-y-[2px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-0 disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-[250ms] ease-in-out gap-[8px]"
                    style={{ animation: 'buttonFadeIn 0.3s ease-out forwards' }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #FFD700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                        Criando conta...
                      </>
                    ) : 'Começar trial grátis'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="text-center text-[13px] mt-6">
              <span className="text-[#9CA3AF] font-medium">Já tem conta? </span>
              <Link to="/login" className="font-bold text-[#FFD700] hover:text-[#E6B800] transition-colors underline decoration-[#FFD700]/30 hover:decoration-[#FFD700] underline-offset-4 ml-1">
                Entrar
              </Link>
            </div>
          </div>
        </div>

        {/* Right side – Image */}
        <div className="relative hidden w-0 flex-1 lg:block bg-[#020617] overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover scale-[1.02] transform"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Trigal dourado sob o sol"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 88% 52%, rgba(255,215,0,0.15), rgba(255,215,0,0.08), transparent 65%),
                linear-gradient(to right, transparent 0%, rgba(2,6,23,0.28) 45%, rgba(2,6,23,0.58) 62%, rgba(2,6,23,0.38) 78%, rgba(2,6,23,0.15) 90%, transparent 100%)
              `,
            }}
          />
          <div
            className="absolute inset-y-0 left-0 z-20 pointer-events-none"
            style={{ width:'44%', background:'linear-gradient(to right,#fafafa 0%,rgba(250,250,250,0.93) 18%,rgba(250,250,250,0.76) 34%,rgba(250,250,250,0.50) 52%,rgba(250,250,250,0.20) 70%,rgba(250,250,250,0.05) 86%,transparent 100%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1120]/40 to-[#eab308]/10 mix-blend-multiply" />
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <div className="absolute bottom-[45px] right-[45px] text-[14px] font-normal text-white/90 z-20" style={{ textShadow:'0px 2px 10px rgba(0,0,0,0.6)' }}>
            Onde a fé encontra propósito.
          </div>
        </div>
      </div>
    </>
  )
}
