import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../lib/supabase.ts'
import { requireAuth } from '../middleware/auth.ts'

const router = Router()
const isDev = process.env.NODE_ENV !== 'production'

// ── helpers ────────────────────────────────────────────────────────────────

function errJson(res: Response, status: number, error: string, code: string, details?: string) {
  res.status(status).json({
    success: false, error, code,
    ...(isDev && details ? { details } : {}),
  })
}

async function getOrgId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('active_organization_id')
    .eq('id', userId)
    .maybeSingle()
  return data?.active_organization_id ?? null
}

type AuthRequest = Request & { userId?: string }

// ── GET /api/contacts ────────────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!
  const { page = '1', limit = '50', search } = req.query as Record<string, string>

  try {
    const orgId = await getOrgId(userId)
    if (!orgId) { errJson(res, 403, 'Organização não encontrada.', 'NO_ORG'); return }

    const pageNum  = Math.max(1, parseInt(page)  || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50))
    const from = (pageNum - 1) * limitNum
    const to   = from + limitNum - 1

    let query = supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search?.trim()) {
      const s = search.trim()
      query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    res.json({
      success: true,
      data:    data ?? [],
      total:   count ?? 0,
      page:    pageNum,
      pages:   Math.ceil((count ?? 0) / limitNum),
    })
  } catch (err: unknown) {
    console.error('[contacts GET /]', err)
    errJson(res, 500, 'Erro ao listar contatos.', 'CONTACTS_ERROR', (err as Error).message)
  }
})

// ── GET /api/contacts/:id ────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!
  const { id } = req.params

  try {
    const orgId = await getOrgId(userId)
    if (!orgId) { errJson(res, 403, 'Organização não encontrada.', 'NO_ORG'); return }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .maybeSingle()

    if (error) throw error
    if (!data) { errJson(res, 404, 'Contato não encontrado.', 'NOT_FOUND'); return }

    res.json({ success: true, data })
  } catch (err: unknown) {
    console.error('[contacts GET /:id]', err)
    errJson(res, 500, 'Erro ao buscar contato.', 'CONTACTS_ERROR', (err as Error).message)
  }
})

// ── POST /api/contacts ───────────────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!
  const {
    name, email, phone, type = 'visitante', status = 'novo', origin,
  } = req.body as Record<string, string | undefined>

  if (!name?.trim()) {
    errJson(res, 400, 'Nome é obrigatório.', 'VALIDATION_ERROR')
    return
  }

  try {
    const orgId = await getOrgId(userId)
    if (!orgId) { errJson(res, 403, 'Organização não encontrada.', 'NO_ORG'); return }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        name:            name.trim(),
        email:           email?.trim()  || null,
        phone:           phone?.trim()  || null,
        type:            (type.trim().toLowerCase())   || 'visitante',
        status:          (status.trim().toLowerCase()) || 'novo',
        origin:          origin?.trim() || null,
        organization_id: orgId,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data })
  } catch (err: unknown) {
    console.error('[contacts POST /]', err)
    errJson(res, 500, 'Erro ao criar contato.', 'CONTACTS_ERROR', (err as Error).message)
  }
})

// ── PATCH /api/contacts/:id ──────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!
  const { id } = req.params
  const { name, email, phone, type, status, origin } = req.body as Record<string, string | undefined>

  try {
    const orgId = await getOrgId(userId)
    if (!orgId) { errJson(res, 403, 'Organização não encontrada.', 'NO_ORG'); return }

    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .maybeSingle()

    if (!existing) { errJson(res, 404, 'Contato não encontrado.', 'NOT_FOUND'); return }

    const updates: Record<string, unknown> = {}
    if (name   !== undefined) updates.name   = name.trim()
    if (email  !== undefined) updates.email  = email.trim()  || null
    if (phone  !== undefined) updates.phone  = phone.trim()  || null
    if (type   !== undefined) updates.type   = type.toLowerCase()
    if (status !== undefined) updates.status = status.toLowerCase()
    if (origin !== undefined) updates.origin = origin.trim() || null

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (err: unknown) {
    console.error('[contacts PATCH /:id]', err)
    errJson(res, 500, 'Erro ao atualizar contato.', 'CONTACTS_ERROR', (err as Error).message)
  }
})

// ── DELETE /api/contacts/:id ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!
  const { id } = req.params

  try {
    const orgId = await getOrgId(userId)
    if (!orgId) { errJson(res, 403, 'Organização não encontrada.', 'NO_ORG'); return }

    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .maybeSingle()

    if (!existing) { errJson(res, 404, 'Contato não encontrado.', 'NOT_FOUND'); return }

    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) throw error

    res.json({ success: true, data: { id } })
  } catch (err: unknown) {
    console.error('[contacts DELETE /:id]', err)
    errJson(res, 500, 'Erro ao deletar contato.', 'CONTACTS_ERROR', (err as Error).message)
  }
})

export default router
