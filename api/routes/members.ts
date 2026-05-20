import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { withTenant } from '../middleware/tenant.ts'

const router = Router()

// GET /api/members — list all members of the active organization
router.get('/', ...withTenant(), async (req, res) => {
  try {
    const { data: orgUsers, error } = await supabaseAdmin
      .from('organization_users')
      .select('user_id, role')
      .eq('organization_id', req.organizationId!)

    if (error) throw error

    const ids = (orgUsers ?? []).map((u: any) => u.user_id as string)
    if (ids.length === 0) return res.json({ success: true, data: [] })

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone')
      .in('id', ids)

    if (pErr) throw pErr

    const roleMap: Record<string, string> = {}
    ;(orgUsers ?? []).forEach((u: any) => { roleMap[u.user_id] = u.role })

    const members = (profiles ?? []).map((p: any) => ({
      id:    p.id,
      name:  p.name ?? p.id,
      phone: p.phone ?? null,
      role:  roleMap[p.id] ?? 'member',
    }))

    res.json({ success: true, data: members })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
