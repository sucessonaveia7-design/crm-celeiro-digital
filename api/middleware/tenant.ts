import { type Request, type Response, type NextFunction, type RequestHandler } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import { requireAuth } from './auth.ts'

// ── resolveTenant ─────────────────────────────────────────────────────────────
// Deve ser usado APÓS requireAuth (precisa de req.userId).
// Popula req.organizationId e req.userRole.
//
// Fluxo:
//   1. profiles.active_organization_id  → organização ativa do usuário
//   2. organization_users               → valida membership + lê role
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
    // 1. Busca organização ativa do usuário
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('active_organization_id')
      .eq('id', req.userId)
      .maybeSingle()

    if (profileErr) {
      console.error('[tenant] Erro ao buscar perfil:', profileErr.message)
      res.status(500).json({ success: false, error: 'Erro ao resolver organização' })
      return
    }

    const orgId: string | null = (profile as any)?.active_organization_id ?? null

    if (!orgId) {
      res.status(403).json({
        success: false,
        error: 'Usuário sem organização ativa. Configure sua organização no painel.',
      })
      return
    }

    // 2. Valida que o usuário pertence à organização e obtém seu papel
    const { data: membership, error: memberErr } = await supabaseAdmin
      .from('organization_users')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (memberErr) {
      console.error('[tenant] Erro ao validar membership:', memberErr.message)
      res.status(500).json({ success: false, error: 'Erro ao validar acesso à organização' })
      return
    }

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado: usuário não pertence à organização ativa.',
      })
      return
    }

    req.organizationId = orgId
    req.userRole       = (membership as any)?.role ?? 'attendant'

    next()
  } catch (err: any) {
    console.error('[tenant] Erro inesperado:', err?.message)
    res.status(500).json({ success: false, error: 'Erro interno' })
  }
}

// ── resolveOrgFromInstance ────────────────────────────────────────────────────
// Usado pelos webhooks (sem JWT): descobre a organização pelo instance_name.
//
// Estratégia (em ordem de prioridade):
//   1. conversations.organization_id WHERE instance_name = ?  (mais confiável)
//   2. process.env.DEFAULT_ORGANIZATION_ID                    (fallback single-org / cold start)
//
// Preparado para: futura tabela evolution_instances/channels com organization_id.
export async function resolveOrgFromInstance(instanceName: string): Promise<string | null> {
  try {
    // Prioridade 1: lookup por conversas existentes
    const { data } = await supabaseAdmin
      .from('conversations')
      .select('organization_id')
      .eq('instance_name', instanceName)
      .not('organization_id', 'is', null)
      .limit(1)
      .maybeSingle()

    if ((data as any)?.organization_id) {
      return (data as any).organization_id as string
    }

    // Prioridade 2: variável de ambiente (útil no primeiro webhook antes de criar conversas)
    const envOrgId = process.env.DEFAULT_ORGANIZATION_ID
    if (envOrgId) {
      console.warn(
        `[tenant] resolveOrgFromInstance: sem conversas para instance="${instanceName}" — ` +
        `usando DEFAULT_ORGANIZATION_ID do ambiente`
      )
      return envOrgId
    }

    console.error(
      `[tenant] resolveOrgFromInstance: não foi possível resolver org para instance="${instanceName}". ` +
      `Defina DEFAULT_ORGANIZATION_ID no Railway ou crie a tabela evolution_instances.`
    )
    return null
  } catch (err: any) {
    console.error('[tenant] resolveOrgFromInstance erro:', err?.message)
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
    requireAuth   as RequestHandler,
    resolveTenant as RequestHandler,
    ...handlers,
  ]
}
