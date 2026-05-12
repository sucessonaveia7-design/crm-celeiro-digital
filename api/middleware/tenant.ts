import { type Request, type Response, type NextFunction, type RequestHandler } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import { requireAuth } from './auth.ts'

// ── resolveTenant ─────────────────────────────────────────────────────────────
// Deve ser usado APÓS requireAuth (precisa de req.userId).
// Popula req.organizationId e req.userRole a partir de profiles.
//
// Prioridade:
//   1. profiles.active_organization_id  (modelo multi-org novo)
//   2. profiles.church_id               (legado — single-org)
export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ success: false, error: 'Usuário não autenticado' })
    return
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('church_id, active_organization_id, role')
      .eq('id', req.userId)
      .maybeSingle()

    if (error) {
      // active_organization_id pode não existir ainda — tenta só church_id
      if (error.code === '42703') {
        const { data: legacy } = await supabaseAdmin
          .from('profiles')
          .select('church_id, role')
          .eq('id', req.userId)
          .maybeSingle()

        req.organizationId = (legacy as any)?.church_id ?? undefined
        req.userRole       = (legacy as any)?.role       ?? 'attendant'
      } else {
        console.error('[tenant] Erro ao buscar perfil:', error.message)
        res.status(500).json({ success: false, error: 'Erro ao resolver organização' })
        return
      }
    } else {
      req.organizationId =
        (profile as any)?.active_organization_id ??
        (profile as any)?.church_id              ??
        undefined
      req.userRole = (profile as any)?.role ?? 'attendant'
    }

    if (!req.organizationId) {
      res.status(403).json({
        success: false,
        error: 'Usuário sem organização associada. Contate o administrador.',
      })
      return
    }

    next()
  } catch (err: any) {
    console.error('[tenant] Erro inesperado:', err?.message)
    res.status(500).json({ success: false, error: 'Erro interno' })
  }
}

// ── resolveOrgFromInstance ────────────────────────────────────────────────────
// Usado pelos webhooks (sem JWT): descobre a organização pelo instance_name
// da Evolution API consultando conversas já existentes.
export async function resolveOrgFromInstance(instanceName: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from('conversations')
      .select('church_id')
      .eq('instance_name', instanceName)
      .not('church_id', 'is', null)
      .limit(1)
      .maybeSingle()

    return (data as any)?.church_id ?? null
  } catch {
    return null
  }
}

// ── withTenant ────────────────────────────────────────────────────────────────
// Compõe [requireAuth, resolveTenant, ...handlers] para uso em rotas.
// Garante req.userId, req.organizationId e req.userRole preenchidos.
//
// Exemplo:
//   router.get('/conversations', ...withTenant(), async (req, res) => { ... })
export function withTenant(...handlers: RequestHandler[]): RequestHandler[] {
  return [
    requireAuth    as RequestHandler,
    resolveTenant  as RequestHandler,
    ...handlers,
  ]
}
