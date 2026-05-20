import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'

const router = Router()

// ─── helpers ────────────────────────────────────────────────
function trialMeta(daysFromNow = 7) {
  const start = new Date().toISOString()
  const end   = new Date(Date.now() + daysFromNow * 86_400_000).toISOString()
  return { start, end }
}

function calcTrial(trial_end: string | null) {
  if (!trial_end) return { trial_expired: false, trial_days_left: 7 }
  const endMs       = new Date(trial_end).getTime()
  const trial_expired     = Date.now() > endMs
  const trial_days_left   = trial_expired
    ? 0
    : Math.max(0, Math.ceil((endMs - Date.now()) / 86_400_000))
  return { trial_expired, trial_days_left }
}

// ── POST /api/auth/signup ─────────────────────────────────────────────
// Cria: usuário Auth + organization + profile + organization_users + subscription
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const {
    name, email, password,
    organization_name, phone,
  } = req.body as Record<string, string>

  // Validação
  if (!name?.trim() || !email?.trim() || !password || !organization_name?.trim()) {
    res.status(400).json({ success: false, error: 'Preencha todos os campos obrigatórios.' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ success: false, error: 'A senha deve ter no mínimo 8 caracteres.' })
    return
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    res.status(400).json({ success: false, error: 'Informe um e-mail válido.' })
    return
  }

  const trial = trialMeta(7)
  let userId: string | null = null
  let orgId:  string | null = null

  try {
    // 1. Criar usuário no Supabase Auth (email pré-confirmado)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email:         email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        name:          name.trim(),
        phone:         phone?.trim() ?? '',
        plan:          'trial',
        trial_active:  true,
        trial_start:   trial.start,
        trial_end:     trial.end,
      },
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? ''
      if (msg.includes('already registered') || msg.includes('duplicate') || msg.includes('already been registered')) {
        res.status(400).json({ success: false, error: 'Este e-mail já está cadastrado. Faça login.' })
        return
      }
      throw authError
    }

    userId = authData.user.id

    // 2. Criar organização
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name:  organization_name.trim(),
        phone: phone?.trim() ?? null,
      })
      .select('id, name')
      .single()

    if (orgError) throw orgError
    orgId = org.id

    // 3. Criar profile — colunas reais: id, full_name, active_organization_id, role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id:                     userId,
        full_name:              name.trim(),
        active_organization_id: org.id,
        role:                   'owner',
      })

    if (profileError) throw profileError

    // 4. Criar vínculo usuário ↔ organização (owner)
    const { error: orgUserError } = await supabaseAdmin
      .from('organization_users')
      .insert({
        organization_id: org.id,
        user_id:         userId,
        role:            'owner',
      })

    if (orgUserError) throw orgUserError

    // 5. Criar subscription trial
    // plan 'trial' not valid in real DB; use 'essencial' + status='trial' to mark trial period
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan:            'essencial',
        status:          'trial',
        trial_start:     trial.start,
        trial_end:       trial.end,
      })

    if (subError) throw subError

    // 6. Retornar organização criada (frontend fará auto-login via Supabase client)
    res.status(201).json({
      success:       true,
      message:       'Conta criada com sucesso! Trial de 7 dias ativo.',
      organization:  { id: org.id, name: org.name },
      trial_days:    7,
    })

  } catch (err: unknown) {
    // Supabase PostgREST builder is PromiseLike, not Promise — use try/catch not .catch()
    try { if (userId) await supabaseAdmin.auth.admin.deleteUser(userId) } catch {}
    try { if (orgId)  await supabaseAdmin.from('organizations').delete().eq('id', orgId) } catch {}
    console.error('[signup]', err)
    const isDev = process.env.NODE_ENV !== 'production'
    res.status(500).json({
      success: false,
      error:   'Erro ao criar conta. Tente novamente.',
      code:    'SIGNUP_FAILED',
      ...(isDev && { details: (err as Error).message ?? String(err) }),
    })
  }
})

// ── POST /api/auth/complete-setup ────────────────────────────────────
// Para usuários autenticados que ainda não possuem organização
router.post('/complete-setup', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId        = (req as Request & { userId?: string }).userId
  const { organization_name, phone } = req.body as Record<string, string>

  if (!userId) {
    res.status(401).json({ success: false, error: 'Não autenticado.' })
    return
  }
  if (!organization_name?.trim()) {
    res.status(400).json({ success: false, error: 'Informe o nome da organização.' })
    return
  }

  try {
    // Checar se já possui org
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('active_organization_id')
      .eq('id', userId)
      .maybeSingle()

    if (existingProfile?.active_organization_id) {
      const { data: existingOrg } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .eq('id', existingProfile.active_organization_id)
        .maybeSingle()
      res.status(200).json({
        success:            true,
        already_configured: true,
        organization:       { id: existingProfile.active_organization_id, name: existingOrg?.name ?? '' },
      })
      return
    }

    const trial = trialMeta(7)

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name:  organization_name.trim(),
        phone: phone?.trim() ?? null,
      })
      .select('id, name')
      .single()

    if (orgError) throw orgError

    // Upsert profile — colunas reais: id, full_name, active_organization_id, role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id:                     userId,
        active_organization_id: org.id,
        role:                   'owner',
      })

    if (profileError) throw profileError

    const { error: orgUserError } = await supabaseAdmin
      .from('organization_users')
      .insert({ organization_id: org.id, user_id: userId, role: 'owner' })

    if (orgUserError) throw orgUserError

    await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan:            'essencial',
        status:          'trial',
        trial_start:     trial.start,
        trial_end:       trial.end,
      })

    res.status(201).json({
      success:      true,
      organization: { id: org.id, name: org.name },
      trial_days:   7,
    })

  } catch (err) {
    console.error('[complete-setup]', err)
    res.status(500).json({ success: false, error: 'Erro ao configurar organização. Tente novamente.' })
  }
})

// ── GET /api/auth/profile ────────────────────────────────────────────
// Retorna active_organization_id e nome da org do usuário autenticado.
// Usa supabaseAdmin para bypassar RLS — seguro pois requireAuth valida o JWT.
router.get('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId?: string }).userId!
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('active_organization_id')
      .eq('id', userId)
      .maybeSingle()

    if (!profile?.active_organization_id) {
      res.status(200).json({ success: true, organization_id: null, organization_name: null })
      return
    }

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('id', profile.active_organization_id)
      .maybeSingle()

    res.status(200).json({
      success:           true,
      organization_id:   profile.active_organization_id,
      organization_name: org?.name ?? null,
    })
  } catch (err) {
    console.error('[profile]', err)
    res.status(500).json({ success: false, error: 'Erro ao buscar perfil.' })
  }
})

// ── POST /api/auth/register (legado) ─────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Campos obrigatórios: email, password, name' })
    return
  }

  const trial = trialMeta(7)

  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role:          role ?? 'owner',
          plan:          'trial',
          trial_active:  true,
          trial_start:   trial.start,
          trial_end:     trial.end,
        },
      },
    })

    if (error) throw error

    const user = data.user!
    const meta = user.user_metadata as Record<string, unknown>
    const { trial_expired, trial_days_left } = calcTrial(meta.trial_end as string)

    res.status(201).json({
      message:     'Conta criada com trial de 7 dias',
      user: {
        id:              user.id,
        email:           user.email,
        name:            meta?.name ?? '',
        role:            meta?.role ?? 'owner',
        plan:            'trial',
        trial_active:    true,
        trial_start:     trial.start,
        trial_end:       trial.end,
        trial_expired,
        trial_days_left,
      },
      trial_days: 7,
    })
  } catch (err: unknown) {
    console.error('Registration error:', err)
    res.status(400).json({ error: (err as Error).message || 'Registration failed' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { session, user } = data
    if (!session || !user) throw new Error('No session or user returned from signIn')

    const meta = user.user_metadata as Record<string, unknown>
    const { trial_expired, trial_days_left } = calcTrial(meta?.trial_end as string)

    res.status(200).json({
      token: session.access_token,
      user: {
        id:              user.id,
        email:           user.email,
        name:            meta?.name ?? '',
        role:            meta?.role ?? 'owner',
        plan:            (meta?.plan as string) ?? 'trial',
        trial_active:    meta?.trial_active ?? true,
        trial_start:     (meta?.trial_start as string) ?? null,
        trial_end:       (meta?.trial_end as string) ?? null,
        trial_expired,
        trial_days_left,
      },
    })
  } catch (err: unknown) {
    console.error('Login error:', err)
    res.status(400).json({ error: (err as Error).message || 'Login failed' })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  try {
    await supabaseAdmin.auth.signOut()
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (err: unknown) {
    console.error('Logout error:', err)
    res.status(500).json({ error: (err as Error).message || 'Logout failed' })
  }
})

export default router
