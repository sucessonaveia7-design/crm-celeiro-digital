import { Router } from 'express'
import { requireAuth } from '../middleware/auth.ts'

const router = Router()

// MOCK BROADCASTS DATABASE
let mockBroadcasts = [
  { 
    id: '1', 
    user_id: 'mock-user-id', 
    name: 'Aviso Culto de Domingo', 
    message: 'Olá! Lembramos que nosso culto começará às 19h. Te esperamos!',
    contact_list_id: '1', // Membros Ativos
    schedule_at: new Date().toISOString(),
    interval_minutes: 1,
    status: 'completed',
    created_at: new Date().toISOString() 
  },
  { 
    id: '2', 
    user_id: 'mock-user-id', 
    name: 'Boas-vindas Visitantes', 
    message: 'Olá, foi um prazer ter você conosco! Volte sempre.',
    contact_list_id: '2', // Visitantes
    schedule_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    interval_minutes: 2,
    status: 'scheduled',
    created_at: new Date().toISOString() 
  }
]

// Get all broadcasts
router.get('/', requireAuth, async (req: any, res) => {
  const { search } = req.query
  const user_id = req.user.id
  
  let filteredBroadcasts = mockBroadcasts.filter(b => b.user_id === user_id)

  if (search) {
    const searchLower = search.toString().toLowerCase()
    filteredBroadcasts = filteredBroadcasts.filter(b => 
      b.name.toLowerCase().includes(searchLower) || 
      b.message.toLowerCase().includes(searchLower)
    )
  }

  // Sort by created_at desc
  filteredBroadcasts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({
    broadcasts: filteredBroadcasts,
    total: filteredBroadcasts.length
  })
})

// Create broadcast
router.post('/', requireAuth, async (req: any, res) => {
  const { name, message, contact_list_id, schedule_at, interval_minutes } = req.body
  const user_id = req.user.id

  if (!name || !message || !contact_list_id) {
    res.status(400).json({ error: 'Name, message and list are required' })
    return
  }

  const newBroadcast = {
    id: Date.now().toString(),
    user_id,
    name,
    message,
    contact_list_id,
    schedule_at: schedule_at || new Date().toISOString(),
    interval_minutes: interval_minutes || 1,
    status: schedule_at && new Date(schedule_at) > new Date() ? 'scheduled' : 'pending',
    created_at: new Date().toISOString()
  }

  mockBroadcasts.push(newBroadcast)

  res.status(201).json(newBroadcast)
})

// Delete broadcast
router.delete('/:id', requireAuth, async (req: any, res) => {
  const { id } = req.params
  const user_id = req.user.id

  const index = mockBroadcasts.findIndex(b => b.id === id && b.user_id === user_id)

  if (index === -1) {
    res.status(404).json({ error: 'Broadcast not found' })
    return
  }

  mockBroadcasts.splice(index, 1)

  res.json({ message: 'Broadcast deleted successfully' })
})

export default router
