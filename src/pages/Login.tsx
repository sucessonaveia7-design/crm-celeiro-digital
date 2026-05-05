import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Wheat } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isSuccessLoading, setIsSuccessLoading] = useState(false)

  // Remove o tema global ao montar a tela de login e restaura ao sair
  useEffect(() => {
    const html = document.documentElement;
    // Remove o tema dark global para a tela de login ser independente
    html.classList.remove('dark');
    
    return () => {
      // Restaura o tema baseando-se no estado global ao sair
      if (useThemeStore.getState().isDarkMode) {
        html.classList.add('dark');
      }
    };
  }, []);

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
     setError('')
     const startTime = Date.now() // Registra o início para calcular o tempo de exibição do botão

     try {
       const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
         email: formData.email,
         password: formData.password
       })

       if (supabaseError) {
         throw supabaseError
       }

       console.log("✅ Usuário logado:", data.user);

       // Adiciona um delay artificial mínimo de 800ms para garantir a exibição do botão de loading e a sensação premium
       const elapsedTime = Date.now() - startTime
       if (elapsedTime < 800) {
         await new Promise(resolve => setTimeout(resolve, 800 - elapsedTime))
       }

       // Salvar dados de auth (inclui campos de trial)
       setAuth(data.session?.access_token ?? '', data.user)

       // Se trial expirou, redirecionar para planos em vez do dashboard
       if (data.user?.trial_expired) {
         setIsSuccessLoading(true)
         setTimeout(() => {
           setIsFadingOut(true)
           setTimeout(() => navigate('/planos'), 400)
         }, 2200)
         return
       }

       // Mostra a tela de loading premium (tela cheia)
       setIsSuccessLoading(true)

       // Mantém a tela de loading visível por 2200ms antes do fade-out e navegação
       setTimeout(() => {
         setIsFadingOut(true)
         setTimeout(() => {
           navigate('/')
         }, 400)
       }, 2200)

     } catch (err: any) {
       console.error("Erro login:", err);
       setError(err.message)
       setLoading(false) // Retorna o botão ao estado normal apenas em caso de erro
     }
   }

  return (
    <>
      {/* Tela de Loading Premium após autenticação */}
      {isSuccessLoading && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-[400ms] ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            animation: 'fadeIn 0.4s ease-out forwards',
            background: `
              radial-gradient(circle at center, rgba(255,215,0,0.05), transparent 60%),
              linear-gradient(180deg, #020617 0%, #020617 60%, #03132a 100%)
            `
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes pulseGlow {
                0% { box-shadow: 0 0 8px rgba(255,215,0,0.2); }
                50% { box-shadow: 0 0 22px rgba(255,215,0,0.5); }
                100% { box-shadow: 0 0 8px rgba(255,215,0,0.2); }
              }
              @keyframes fadeText {
                0% { opacity: 0.5; }
                50% { opacity: 1; }
                100% { opacity: 0.5; }
              }
            `}
          </style>
          
          <div className="flex flex-col items-center">
            {/* Logo com animação pulseGlow */}
            <div className="flex items-center justify-center gap-3 mb-[40px]">
              <div 
                className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl flex-shrink-0 border border-yellow-500/20"
                style={{
                  boxShadow: '0 0 12px rgba(255, 215, 0, 0.4), 0 0 24px rgba(255, 215, 0, 0.2)',
                  animation: 'pulseGlow 2.5s ease-in-out infinite'
                }}
              >
                <Wheat className="text-[#eab308] drop-shadow-md w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="text-[36px] text-white font-['Great_Vibes'] tracking-wide leading-none mt-1">Celeiro Digital</span>
            </div>

            {/* Spinner Grande Dourado com Drop Shadow */}
            <div 
              style={{
                width: '52px',
                height: '52px',
                border: '4px solid rgba(255,255,255,0.08)',
                borderTop: '4px solid #FFD700',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
              }}
            />

            {/* Texto Emocional com Fade */}
            <div 
              className="mt-6 text-[#9CA3AF] text-[14px]"
              style={{
                letterSpacing: '0.5px',
                animation: 'fadeText 2s ease-in-out infinite'
              }}
            >
              Conectando você ao propósito...
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Recebe opacity-0 para sumir por trás da tela de loading premium se necessário */}
      <div 
        className={`flex min-h-screen bg-[#0b1120] transition-opacity duration-[400ms] ease-in-out ${isFadingOut || isSuccessLoading ? 'opacity-0' : 'opacity-100'}`}
      >
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-24 xl:px-32 bg-[#fafafa] z-20 relative">
        <div className="mx-auto w-full max-w-[420px] lg:w-[420px]">
          
          {/* Logo Section */}
          <div className="flex items-center justify-center gap-3 mb-[40px]">
            <div className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl flex-shrink-0 border border-yellow-500/20 shadow-[0px_0px_12px_rgba(255,215,0,0.25)]">
              <Wheat className="text-[#eab308] drop-shadow-md w-8 h-8" strokeWidth={1.5} />
            </div>
            <span className="text-[36px] text-[#0f172a] font-['Great_Vibes'] tracking-wide leading-none mt-1">Celeiro Digital</span>
          </div>

          {/* Box Formulário SaaS */}
          <div 
            className="bg-white p-8 rounded-[20px] border border-slate-100/50 backdrop-blur-xl relative z-30"
            style={{ width: '420px', padding: '32px', boxShadow: '0px 20px 40px rgba(0,0,0,0.08), 0px 0px 0px 1px rgba(0,0,0,0.02)' }}
          >
            <div className="text-center flex flex-col items-center">
              {/* Detalhe decorativo premium */}
              <div 
                className="mb-4 rounded-[4px]" 
                style={{ 
                  width: '40px', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #FFD700, #E6B800)' 
                }}
              />
              <h2 className="text-[26px] font-black tracking-tight text-[#0f172a] uppercase">CONECTADO COM DEUS</h2>
              <p 
                className="text-[#64748B] text-[14px] font-normal leading-[1.6] text-center mt-[12px] mb-[24px] max-w-[280px] mx-auto"
              >
                Tecnologia a serviço da fé e do propósito.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-center">
                  {error}
                </div>
              )}

              {/* Banner exibido depois do login se trial expirou */}
              {error === 'trial_expired' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm text-center">
                  <p className="font-bold">Seu trial de 7 dias expirou.</p>
                  <p className="mt-0.5">Escolha um plano para continuar.</p>
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                    Email
                  </label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full h-14 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[15px] transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 pl-1 pr-1">
                    <label htmlFor="password" className="block text-[12px] font-bold uppercase tracking-wider text-slate-500">
                      Senha
                    </label>
                    <a href="#" className="text-[12px] font-bold text-[#eab308] hover:text-[#ca8a04] transition-colors">Esqueceu?</a>
                  </div>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full h-14 rounded-2xl border-0 px-5 text-[#0f172a] bg-[#fafafa] shadow-inner ring-1 ring-inset ring-slate-200/60 placeholder:text-slate-400/60 focus:ring-2 focus:ring-inset focus:ring-[#eab308]/60 focus:bg-white sm:text-[15px] pr-12 transition-all duration-300"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#eab308] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <style>
                  {`
                    @keyframes buttonFadeIn {
                      0% { opacity: 0; transform: translateY(6px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                  `}
                </style>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center rounded-[12px] bg-gradient-to-br from-[#FFD700] to-[#E6B800] h-14 text-[15px] font-[600] tracking-wide uppercase text-[#020617] shadow-[0px_4px_18px_rgba(255,215,0,0.35)] hover:bg-gradient-to-br hover:from-[#FFE44D] hover:to-[#FFD700] hover:shadow-[0px_10px_25px_rgba(255,215,0,0.35),0px_0px_14px_rgba(255,215,0,0.25)] hover:-translate-y-[2px] active:translate-y-[1px] active:shadow-[0px_4px_10px_rgba(255,215,0,0.2)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_3px_rgba(255,215,0,0.35)] disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-[250ms] ease-in-out gap-[8px]"
                  style={{ animation: 'buttonFadeIn 0.3s ease-out forwards' }}
                >
                  {loading ? (
                    <>
                      <div 
                        style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #FFD700',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}
                      />
                      <style>
                        {`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}
                      </style>
                      Entrando...
                    </>
                  ) : (
                    "Acessar"
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center text-[13px] mt-8">
            <span className="text-[#9CA3AF] font-medium">Ainda não tem conta? </span>
            <Link to="/register" className="font-bold text-[#FFD700] hover:text-[#E6B800] transition-colors underline decoration-[#FFD700]/30 hover:decoration-[#FFD700] underline-offset-4 ml-1">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block bg-[#020617] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover scale-[1.02] transform"
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Trigal dourado sob o sol"
        />
        {/* Overlay de contraste e glow dourado — sem escuro na borda esquerda */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 88% 52%, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08), transparent 65%),
              linear-gradient(to right, transparent 0%, rgba(2, 6, 23, 0.28) 45%, rgba(2, 6, 23, 0.58) 62%, rgba(2, 6, 23, 0.38) 78%, rgba(2, 6, 23, 0.15) 90%, transparent 100%)
            `
          }}
        />
        {/* Transição suave branco → imagem, cobrindo a borda esquerda */}
        <div
          className="absolute inset-y-0 left-0 z-20 pointer-events-none"
          style={{
            width: '44%',
            background: 'linear-gradient(to right, #fafafa 0%, rgba(250,250,250,0.93) 18%, rgba(250,250,250,0.76) 34%, rgba(250,250,250,0.50) 52%, rgba(250,250,250,0.20) 70%, rgba(250,250,250,0.05) 86%, transparent 100%)'
          }}
        />
        {/* Overlay extra mix-blend para enriquecer as cores do trigal */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1120]/40 to-[#eab308]/10 mix-blend-multiply" />
        
        {/* Vinheta nas bordas para efeito cinematográfico */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]" />
        
        {/* Luz suave e reflexo no topo */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        
        {/* Frase emocional e inspiradora no canto inferior direito */}
        <div 
          className="absolute bottom-[45px] right-[45px] text-[14px] font-normal text-white/90 z-20"
          style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.6)' }}
        >
          Onde a fé encontra propósito.
        </div>
      </div>
    </div>
    </>
  )
}
