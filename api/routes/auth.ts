import { Router, type Request, type Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('=== AUTH MODULE LOADING ===')
console.log('SUPABASE_URL from process.env:', supabaseUrl ? '[SET]' : '[MISSING]')
console.log('SUPABASE_ANON_KEY from process.env:', supabaseAnonKey ? '[SET]' : '[MISSING]')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * User Register
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          plan: 'trial',
          trial_active: true,
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    })

    if (error) {
      throw error
    }

    const user = data.user
    if (!user) {
      throw new Error('No user returned from signUp')
    }

    // Calculate trial info from metadata
    const metadata = user.user_metadata as any
    const plan = metadata?.plan ?? 'trial'
    const trial_active = metadata?.trial_active ?? true
    const trial_start = metadata?.trial_start ?? null
    const trial_end = metadata?.trial_end ?? null

    let trial_expired = false
    let trial_days_left = 0

    if (trial_end) {
      const endDate = new Date(trial_end)
      trial_expired = new Date() > endDate
      if (!trial_expired) {
        const diff = endDate.getTime() - Date.now()
        trial_days_left = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      }
    }

    res.status(201).json({
      message: 'Conta criada com trial de 7 dias',
      user: {
        id: user.id,
        email: user.email,
        name: metadata?.name ?? '',
        role: metadata?.role ?? '',
        plan,
        trial_active,
        trial_start,
        trial_end,
        trial_expired,
        trial_days_left
      },
      trial_days: 7
    })
  } catch (err: any) {
    console.error('Registration error:', err)
    res.status(400).json({ error: err.message || 'Registration failed' })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    const { session, user } = data
    if (!session || !user) {
      throw new Error('No session or user returned from signIn')
    }

    // Extract user metadata
    const metadata = user.user_metadata as any
    const plan = metadata?.plan ?? 'trial'
    const trial_active = metadata?.trial_active ?? true
    const trial_start = metadata?.trial_start ?? null
    const trial_end = metadata?.trial_end ?? null

    let trial_expired = false
    let trial_days_left = 0

    if (trial_end) {
      const endDate = new Date(trial_end)
      trial_expired = new Date() > endDate
      if (!trial_expired) {
        const diff = endDate.getTime() - Date.now()
        trial_days_left = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      }
    }

    res.status(200).json({
      token: session.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: metadata?.name ?? '',
        role: metadata?.role ?? '',
        plan,
        trial_active,
        trial_start,
        trial_end,
        trial_expired,
        trial_days_left
      }
    })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(400).json({ error: err.message || 'Login failed' })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (err: any) {
    console.error('Logout error:', err)
    res.status(500).json({ error: err.message || 'Logout failed' })
  }
})

export default router