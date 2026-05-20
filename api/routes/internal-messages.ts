import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { withTenant } from '../middleware/tenant.ts'

const router = Router()

// GET /api/internal-messages/:conversationId
router.get('/:conversationId', ...withTenant(), async (req, res) => {
  const { conversationId } = req.params
  try {
    const { data, error } = await supabaseAdmin
      .from('internal_messages')
      .select('*, sender:sender_id(id)')
      .eq('conversation_id', conversationId)
      .eq('organization_id', req.organizationId!)
      .order('created_at', { ascending: true })
      .limit(100)
    if (error) throw error

    // Enrich with sender name from profiles
    const senderIds = [...new Set((data ?? []).map((m: any) => m.sender_id))]
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .in('id', senderIds)

    const nameMap: Record<string, string> = {}
    ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.name ?? p.id })

    const enriched = (data ?? []).map((m: any) => ({ ...m, sender_name: nameMap[m.sender_id] ?? 'Desconhecido' }))
    res.json({ success: true, data: enriched })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/internal-messages/:conversationId
router.post('/:conversationId', ...withTenant(), async (req, res) => {
  const { conversationId } = req.params
  const { message }        = req.body as { message: string }
  if (!message?.trim()) return res.status(400).json({ success: false, error: 'Mensagem não pode ser vazia.' })
  try {
    const { data, error } = await supabaseAdmin
      .from('internal_messages')
      .insert({
        organization_id: req.organizationId!,
        conversation_id: conversationId,
        sender_id:       req.userId!,
        message:         message.trim(),
      })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
