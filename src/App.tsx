// src/App.tsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import DashboardPremium from './pages/DashboardPremium'
import Chat from './pages/Chat'
import MessagesPremium from './pages/MessagesPremium'
import AudiencePremium from './pages/AudiencePremium'
import AutomationsPremium from './pages/AutomationsPremium'
import BroadcastsPremium from './pages/BroadcastsPremium'
import GroupsPremium from './pages/GroupsPremium'
import Kanban from './pages/Kanban'
import FlowsPremium from './pages/FlowsPremium'
import ReportsPremium from './pages/ReportsPremium'
import SettingsPremium from './pages/SettingsPremium'
import InternalChat from './pages/InternalChat'
import ProfilePremium from './pages/ProfilePremium'
import PlanosAssinaturas from './pages/PlanosAssinaturas'
import WhatsApp from './pages/WhatsApp'
import './index.css'

function App() {
  const setAuth   = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user      = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth(session.access_token, {
          id:        session.user.id,
          email:     session.user.email,
          name:      session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role:      session.user.role || 'user',
          is_active: true,
        })
      } else {
        clearAuth()
      }
      setLoading(false)
    }).catch(() => {
      clearAuth()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth(session.access_token, {
          id:        session.user.id,
          email:     session.user.email,
          name:      session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role:      session.user.role || 'user',
          is_active: true,
        })
      } else {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [setAuth, clearAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-t-yellow-400 h-12 w-12" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"                  element={<DashboardPremium />}  />
        <Route path="/bate-papo"         element={<Chat />}              />
        <Route path="/mensagens"         element={<MessagesPremium />}   />
        <Route path="/whatsapp"          element={<WhatsApp />}          />
        <Route path="/audiencia"         element={<AudiencePremium />}   />
        <Route path="/grupos"            element={<GroupsPremium />}     />
        <Route path="/automacoes"        element={<AutomationsPremium />}/>
        <Route path="/transmissoes"      element={<BroadcastsPremium />} />
        <Route path="/fluxos"            element={<FlowsPremium />}      />
        <Route path="/kanban"            element={<Kanban />}            />
        <Route path="/relatorios"        element={<ReportsPremium />}    />
        <Route path="/configuracoes"     element={<SettingsPremium />}   />
        <Route path="/chat-interno"      element={<InternalChat />}      />
        <Route path="/perfil"            element={<ProfilePremium />}    />
        <Route path="/planos-assinaturas" element={<PlanosAssinaturas />}/>
        <Route path="/assinatura"        element={<PlanosAssinaturas />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
