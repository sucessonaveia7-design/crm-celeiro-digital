import { Router, type Request, type Response } from 'express'
import { supabase } from '../lib/supabase.ts'

const router = Router()

/**
 * Setup Database Tables
 * POST /api/setup/db
 * This is a helper route to initialize DB tables via SQL query
 * Note: This requires the service role key to have permissions to run raw SQL via rpc if available,
 * or we have to use standard client methods.
 * Since Supabase JS client doesn't support raw SQL execution directly on public schema easily without an RPC function,
 * we will guide the user to run SQL in dashboard, BUT we can try to check if tables exist.
 */
router.post('/db', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if we can access the users table
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })

    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      res.status(404).json({
        success: false,
        message: 'Tables do not exist. You MUST run the SQL migration in Supabase Dashboard.',
        sql_url: 'https://github.com/trae-ai/church-crm/blob/main/supabase/migrations/20240204_initial_schema.sql', // Placeholder
        instruction: 'Please copy the SQL from your project migration file and run it in Supabase SQL Editor.'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Database connection established and users table exists.'
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
