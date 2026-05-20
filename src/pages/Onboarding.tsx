import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wheat } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const user           = useAuthStore(s => s.user)
  const setAuth        = useAuthStore(s => s.setAuth)
  const token          = useAuthStore(s => s.token)
  const organizationId = useAuthStore(s => s.user?.organization_id)
  const [orgName, setOrgName]   = useState('')
  const [phone, setPhone]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // If user already has an org, send them home
  useEffect(() => {
    if (organizationId) navigate('/', { replace: true })
  }, [organizationId, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) { setError('Informe o nome da organização.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/complete-setup', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ organization_name: orgName.trim(), phone: phone.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Erro ao configurar organização.')

      // Patch the user in store with the new org info
      if (user) {
        setAuth(token!, {
          ...user,
          organization_id:   json.organization.id,
          organization_name: json.organization.name,
        })
      }
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro desconhecido.')
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background: `
          radial-gradient(circle at center, rgba(255,215,0,0.04), transparent 60%),
          linear-gradient(180deg, #020617 0%, #020617 60%, #03132a 100%)
        `,
      }}
    >
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ animation:'fadeUp 0.5s ease-out both' }} className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl flex-shrink-0 border border-yellow-500/20"
            style={{ boxShadow:'0 0 12px rgba(255,215,0,0.3)' }}
          >
            <Wheat className="text-[#eab308] w-8 h-8" strokeWidth={1.5} />
          </div>
          <span className="text-[32px] text-white font-['Great_Vibes'] tracking-wide leading-none mt-1">Celeiro Digital</span>
        </div>

        {/* Card */}
        <div
          className="rounded-[20px] p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border:     '1px solid rgba(255,255,255,0.08)',
            boxShadow:  '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div className="text-center mb-6">
            <div className="inline-block mb-3 rounded-[4px]" style={{ width:40, height:3, background:'linear-gradient(90deg,#FFD700,#E6B800)' }} />
            <h1 className="text-[22px] font-black tracking-tight text-white uppercase">Configurar organização</h1>
            <p className="text-[#64748B] text-[13px] mt-2 leading-[1.6]">
              Informe o nome da sua igreja ou empresa para começar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                Nome da igreja / empresa
              </label>
              <Input
                required
                placeholder="Ex: Igreja Batista Central"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                style={{
                  height:     '48px',
                  borderRadius: '12px',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color:      '#F5F7FA',
                  padding:    '0 20px',
                  fontSize:   '14px',
                }}
                className="w-full placeholder:text-slate-500 focus:ring-2 focus:ring-[#FFD700]/40 focus:border-[#FFD700]/40 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                Telefone <span className="font-normal normal-case text-slate-500">(opcional)</span>
              </label>
              <Input
                placeholder="(11) 99999-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  height:     '48px',
                  borderRadius: '12px',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color:      '#F5F7FA',
                  padding:    '0 20px',
                  fontSize:   '14px',
                }}
                className="w-full placeholder:text-slate-500 focus:ring-2 focus:ring-[#FFD700]/40 focus:border-[#FFD700]/40 transition-all duration-200"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center rounded-[12px] bg-gradient-to-br from-[#FFD700] to-[#E6B800] h-12 text-[15px] font-[600] tracking-wide uppercase text-[#020617] shadow-[0px_4px_18px_rgba(255,215,0,0.25)] hover:shadow-[0px_8px_24px_rgba(255,215,0,0.35)] hover:-translate-y-[1px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 gap-2"
              >
                {loading ? (
                  <>
                    <div style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #020617', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                    Salvando...
                  </>
                ) : 'Continuar'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-[12px] text-slate-600 mt-5">
          Você tem 7 dias de acesso completo gratuitamente.
        </p>
      </div>
    </div>
  )
}
