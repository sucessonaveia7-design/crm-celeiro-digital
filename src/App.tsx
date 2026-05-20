// src/App.tsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
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
import { Wheat } from 'lucide-react'
import './index.css'

type ProfileRow = {
  active_organization_id: string | null
  organization_name:      string | null
} | null

function App() {
  const setAuth   = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user      = useAuthStore((state) => state.user)

  // Start as loading=false when the store already has a valid persisted session
  // so the user sees the app immediately (no spinner flash on every page refresh).
  const [loading, setLoading] = useState(() => {
    const s = useAuthStore.getState()
    return !(s.user?.id && s.token)
  })
  // Blocks routing decisions while GET /api/auth/profile is in-flight.
  // Prevents the onboarding route from flashing before org status is known.
  const [profileResolving, setProfileResolving] = useState(false)

  useEffect(() => {
    // ── Closure-scoped guard ───────────────────────────────────────────────────
    // Using a local `active` boolean (not a ref) means each effect instance has
    // its own closure. When React StrictMode runs the effect twice:
    //   run-1: active=true → cleanup → active=false
    //   run-2: active=true (new closure, independent of run-1)
    // Any async callback from run-1 that resolves after run-2 mounts will still
    // see run-1's `active=false` and correctly abort — no zombie setState.
    let active = true

    // fetchProfile — usa o backend (supabaseAdmin) para bypassar RLS
    async function fetchProfile(token: string): Promise<ProfileRow> {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6_000)
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        clearTimeout(timer)
        if (!res.ok) return null
        const json = await res.json()
        if (!json.success || !json.organization_id) return null
        return { active_organization_id: json.organization_id, organization_name: json.organization_name }
      } catch {
        clearTimeout(timer)
        return null
      }
    }

    // ── onAuthStateChange — single source of auth truth ───────────────────────
    // Supabase v2 fires this immediately on subscribe with the current session
    // (INITIAL_SESSION event), eliminating the need for a separate getSession()
    // call. Having both getSession() and onAuthStateChange was the root cause of
    // duplicate setAuth calls and the race condition.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return

      // ── No session → signed out ─────────────────────────────────────────────
      if (!session?.user) {
        clearAuth()
        if (active) setLoading(false)
        if (active) setProfileResolving(false)
        return
      }

      // ── Build user object from session metadata ─────────────────────────────
      const meta    = (session.user.user_metadata ?? {}) as Record<string, unknown>
      const current = useAuthStore.getState().user

      // Support both metadata key spellings (signup may store 'name' or 'full_name')
      const displayName =
        (meta.name      as string | undefined) ||
        (meta.full_name as string | undefined) ||
        current?.name   ||
        session.user.email?.split('@')[0] ||
        'Usuário'

      // Unblock the UI immediately with whatever we know right now.
      // organization_id will be filled in below once fetchProfile returns.
      setAuth(session.access_token, {
        id:                session.user.id,
        email:             session.user.email ?? '',
        name:              displayName,
        role:              (meta.role as string | undefined) ?? current?.role ?? 'user',
        is_active:         true,
        organization_id:   current?.organization_id,
        organization_name: current?.organization_name ?? '',
        plan:              (meta.plan         as string  | undefined) ?? current?.plan,
        trial_active:      (meta.trial_active as boolean | undefined) ?? current?.trial_active,
        trial_start:       (meta.trial_start  as string  | undefined) ?? current?.trial_start ?? null,
        trial_end:         (meta.trial_end    as string  | undefined) ?? current?.trial_end   ?? null,
      })

      if (active) setLoading(false)

      // If org_id is not yet in the store, block routing until fetchProfile resolves.
      // This prevents the onboarding route from flashing before we know org status.
      if (!useAuthStore.getState().user?.organization_id && active) setProfileResolving(true)

      // ── Background profile fetch — fills in organization_id ─────────────────
      const profile = await fetchProfile(session.access_token)
      if (!active) return

      if (profile?.active_organization_id) {
        const stored = useAuthStore.getState()
        if (stored.user?.organization_id !== profile.active_organization_id) {
          setAuth(session.access_token, {
            ...stored.user!,
            organization_id:   profile.active_organization_id,
            organization_name: profile.organization_name ?? stored.user?.organization_name ?? '',
          })
        }
      }
      // Always release the gate — whether profile has org or not
      if (active) setProfileResolving(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
    // Empty deps: setAuth/clearAuth are stable Zustand actions;
    // setLoading is a stable React 18 dispatch. This effect must run
    // exactly once per mount — adding these to deps would re-subscribe
    // on every render that touches auth state, recreating the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auth bootstrap splash ───────────────────────────────────────────────────
  if (loading || profileResolving) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, rgba(255,215,0,0.05), transparent 60%),
            linear-gradient(180deg, #020617 0%, #020617 60%, #03132a 100%)
          `,
          animation: 'appFadeIn 0.45s ease-out forwards',
        }}
      >
        <style>{`
          @keyframes appFadeIn    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          @keyframes appSpin      { 0%   { transform:rotate(0deg);   } 100% { transform:rotate(360deg);   } }
          @keyframes appPulseGlow { 0%,100% { box-shadow:0 0 8px rgba(255,215,0,0.2); } 50% { box-shadow:0 0 24px rgba(255,215,0,0.55); } }
          @keyframes appFadeText  { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        `}</style>

        <div className="flex flex-col items-center">

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div
              className="flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-2.5 rounded-xl border border-yellow-500/20"
              style={{ animation: 'appPulseGlow 2.5s ease-in-out infinite' }}
            >
              <Wheat className="text-[#eab308] w-8 h-8" strokeWidth={1.5} />
            </div>
            <span className="text-[34px] text-white font-['Great_Vibes'] tracking-wide leading-none mt-1">
              Celeiro Digital
            </span>
          </div>

          {/* Spinner dourado refinado */}
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(255,255,255,0.06)',
              borderTop: '3px solid #FFD700',
              borderRadius: '50%',
              animation: 'appSpin 1s linear infinite',
              filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.55))',
            }}
          />

          {/* Mensagem */}
          <p
            className="mt-7 text-[#9CA3AF] text-[14px] text-center max-w-[280px]"
            style={{ letterSpacing: '0.4px', animation: 'appFadeText 2.4s ease-in-out infinite' }}
          >
            Conectando você ao{' '}
            <span style={{ color: 'rgba(255,215,0,0.75)' }}>propósito</span>
            {' '}da sua{' '}
            <span style={{ color: 'rgba(255,215,0,0.75)' }}>missão</span>
            ...
          </p>

        </div>
      </div>
    )
  }

  // ── Unauthenticated ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Routes>
        <Route path="/cadastro" element={<Signup />} />
        <Route path="*"         element={<Login />} />
      </Routes>
    )
  }

  // ── Authenticated but no organisation → onboarding ────────────────────────
  // Only reached after profileResolving=false, so org status is definitive.
  if (!user.organization_id) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*"           element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // ── Authenticated + org → main application ──────────────────────────────────
  return (
    <Routes>
      <Route path="/onboarding"         element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/"                   element={<DashboardPremium />}   />
        <Route path="/bate-papo"          element={<Chat />}               />
        <Route path="/mensagens"          element={<MessagesPremium />}    />
        <Route path="/whatsapp"           element={<WhatsApp />}           />
        <Route path="/audiencia"          element={<AudiencePremium />}    />
        <Route path="/grupos"             element={<GroupsPremium />}      />
        <Route path="/automacoes"         element={<AutomationsPremium />} />
        <Route path="/transmissoes"       element={<BroadcastsPremium />}  />
        <Route path="/fluxos"             element={<FlowsPremium />}       />
        <Route path="/kanban"             element={<Kanban />}             />
        <Route path="/relatorios"         element={<ReportsPremium />}     />
        <Route path="/configuracoes"      element={<SettingsPremium />}    />
        <Route path="/chat-interno"       element={<InternalChat />}       />
        <Route path="/perfil"             element={<ProfilePremium />}     />
        <Route path="/planos-assinaturas" element={<PlanosAssinaturas />}  />
        <Route path="/assinatura"         element={<PlanosAssinaturas />}  />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
