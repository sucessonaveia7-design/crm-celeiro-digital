import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { withTenant } from '../middleware/tenant.ts'

const router = Router()

// GET /api/appointments?conversation_id=:id
router.get('/', ...withTenant(), async (req, res) => {
  const { conversation_id } = req.query as Record<string, string>
  try {
    let query = supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('organization_id', req.organizationId!)
      .order('scheduled_for', { ascending: true })

    if (conversation_id) query = query.eq('conversation_id', conversation_id)

    const { data, error } = await query
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/appointments
router.post('/', ...withTenant(), async (req, res) => {
  const { conversation_id, assigned_to, title, description, scheduled_for } = req.body as Record<string, string>
  if (!title?.trim())     return res.status(400).json({ success: false, error: 'Título é obrigatório.'         })
  if (!scheduled_for)     return res.status(400).json({ success: false, error: 'Data/hora é obrigatória.'      })
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        organization_id: req.organizationId!,
        conversation_id: conversation_id || null,
        assigned_to:     assigned_to     || req.userId,
        title:           title.trim(),
        description:     description?.trim() || null,
        scheduled_for,
        status:          'pending',
      })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/appointments/:id
router.patch('/:id', ...withTenant(), async (req, res) => {
  const { id } = req.params
  const updates = req.body as Record<string, unknown>
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.organizationId!)
      .select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
