import { type Request, type Response, type NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    res.status(401).json({ success: false, error: 'Token de autenticação obrigatório' })
    return
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ success: false, error: 'Token inválido ou expirado' })
      return
    }

    req.userId = user.id
    next()
  } catch (err: any) {
    console.error('[auth] Erro ao validar token:', err?.message)
    res.status(500).json({ success: false, error: 'Erro interno ao validar autenticação' })
  }
}
