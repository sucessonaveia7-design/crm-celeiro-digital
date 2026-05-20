import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { withTenant } from '../middleware/tenant.ts'

const router = Router()

// GET /api/templates
router.get('/', ...withTenant(), async (req, res) => {
  const { category } = req.query as Record<string, string>
  try {
    let query = supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('organization_id', req.organizationId!)
      .order('title', { ascending: true })

    if (category) query = query.eq('category', category)

    const { data, error } = await query
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/templates
router.post('/', ...withTenant(), async (req, res) => {
  const { title, content, variables, category } = req.body as Record<string, unknown>
  if (!String(title ?? '').trim())   return res.status(400).json({ success: false, error: 'Título é obrigatório.'   })
  if (!String(content ?? '').trim()) return res.status(400).json({ success: false, error: 'Conteúdo é obrigatório.' })
  try {
    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .insert({
        organization_id: req.organizationId!,
        title:           String(title).trim(),
        content:         String(content).trim(),
        variables:       Array.isArray(variables) ? variables : [],
        category:        String(category ?? 'general'),
      })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/templates/:id
router.delete('/:id', ...withTenant(), async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabaseAdmin
      .from('message_templates')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.organizationId!)
    if (error) throw error
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
