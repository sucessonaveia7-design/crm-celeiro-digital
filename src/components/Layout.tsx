import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import TrialBanner from './TrialBanner'
import { useNotificationStore } from '@/store/notificationStore'
import { useAssinaturaStore } from '@/store/assinaturaStore'
import { checkTrialExpiration } from '@/lib/subscriptionManager'

export default function Layout() {
  const addNotification = useNotificationStore(state => state.addNotification);
  const { assinaturas } = useAssinaturaStore();

  /* ── Verifica expiração do trial ao abrir e a cada 60 s ── */
  useEffect(() => {
    checkTrialExpiration()
    const timer = setInterval(checkTrialExpiration, 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Verificar assinaturas (mock) para o usuário logado
    // No caso real, pegaria apenas a assinatura do usuário logado
    const minhaAssinatura = assinaturas[0]; // Admin
    if (minhaAssinatura) {
      const dataVencimento = new Date(minhaAssinatura.dataVencimento);
      const hoje = new Date();
      const diffTime = dataVencimento.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        addNotification({
          titulo: 'Plano vencido',
          mensagem: 'Acesso expirado.',
          tipo: 'erro'
        });
      } else if (diffDays <= 5) {
        addNotification({
          titulo: 'Plano próximo do vencimento',
          mensagem: 'Seu plano vence em breve.',
          tipo: 'alerta'
        });
      }
    }
  }, [assinaturas, addNotification]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#020617] overflow-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] relative">
      {/* Elementos de fundo decorativos (Opcional, baseado no DashboardPremium) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#D4AF37]/5 dark:from-[#FFD700]/5 to-transparent pointer-events-none"></div>
      <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-gradient-to-br from-[#D4AF37]/10 dark:from-[#FFD700]/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10 flex h-full w-full overflow-visible">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-visible transition-[width] duration-[0.3s] ease-[ease] bg-transparent">
          <Header />
          <TrialBanner />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
