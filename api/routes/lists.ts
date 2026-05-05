import { Router } from 'express'
import { requireAuth } from '../middleware/auth.ts'

const router = Router()

// MOCK LISTS DATABASE
let mockLists = [
  { id: '1', user_id: 'mock-user-id', name: 'Membros Ativos', description: 'Todos os membros frequentes', contact_count: 2, created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock-user-id', name: 'Visitantes', description: 'Pessoas que visitaram recentemente', contact_count: 1, created_at: new Date().toISOString() }
]

// MOCK LIST MEMBERS (Relationship between lists and contacts)
// Format: { list_id, contact_id }
let mockListMembers = [
  { list_id: '1', contact_id: '1' },
  { list_id: '1', contact_id: '2' },
  { list_id: '2', contact_id: '3' }
]

// ==========================================
// LISTS CRUD
// ==========================================

// Get all lists
router.get('/', requireAuth, async (req: any, res) => {
  const { search } = req.query
  const user_id = req.user.id
  
  let filteredLists = mockLists.filter(l => l.user_id === user_id)

  if (search) {
    const searchLower = search.toString().toLowerCase()
    filteredLists = filteredLists.filter(l => 
      l.name.toLowerCase().includes(searchLower) || 
      (l.description && l.description.toLowerCase().includes(searchLower))
    )
  }

  // Sort by created_at desc
  filteredLists.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({
    lists: filteredLists,
    total: filteredLists.length
  })
})

// Create list
router.post('/', requireAuth, async (req: any, res) => {
  const { name, description } = req.body
  const user_id = req.user.id

  if (!name) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const newList = {
    id: Date.now().toString(),
    user_id,
    name,
    description: description || '',
    contact_count: 0,
    created_at: new Date().toISOString()
  }

  mockLists.push(newList)

  res.status(201).json(newList)
})

// Update list
router.put('/:id', requireAuth, async (req: any, res) => {
  const { id } = req.params
  const { name, description } = req.body
  const user_id = req.user.id

  const index = mockLists.findIndex(l => l.id === id && l.user_id === user_id)

  if (index === -1) {
    res.status(404).json({ error: 'List not found' })
    return
  }

  mockLists[index] = {
    ...mockLists[index],
    name: name || mockLists[index].name,
    description: description !== undefined ? description : mockLists[index].description
  }

  res.json(mockLists[index])
})

// Delete list
router.delete('/:id', requireAuth, async (req: any, res) => {
  const { id } = req.params
  const user_id = req.user.id

  const index = mockLists.findIndex(l => l.id === id && l.user_id === user_id)

  if (index === -1) {
    res.status(404).json({ error: 'List not found' })
    return
  }

  mockLists.splice(index, 1)
  // Also remove all members associated with this list
  mockListMembers = mockListMembers.filter(m => m.list_id !== id)

  res.json({ message: 'List deleted successfully' })
})

// ==========================================
// LIST MEMBERS (ASSOCIATING CONTACTS)
// ==========================================

// Get contacts in a specific list
router.get('/:id/contacts', requireAuth, async (req: any, res) => {
  const { id } = req.params // list_id

  // We need to import mockContacts here, but since it's in another file, 
  // for this mock we'll just simulate the response structure or you can fetch it if we refactor.
  // We will handle the full contact details later in the actual app.
  // For now, return the IDs of contacts in this list
  const memberRelations = mockListMembers.filter(m => m.list_id === id)
  const contactIds = memberRelations.map(m => m.contact_id)

  res.json({
    contact_ids: contactIds,
    total: contactIds.length
  })
})

// Add contact to list
router.post('/:id/contacts', requireAuth, async (req: any, res) => {
  const { id } = req.params // list_id
  const { contact_ids } = req.body // array of contact IDs to add

  if (!Array.isArray(contact_ids)) {
    res.status(400).json({ error: 'contact_ids must be an array' })
    return
  }

  // Filter out contacts that are already in the list
  const existingMemberIds = mockListMembers.filter(m => m.list_id === id).map(m => m.contact_id)
  const newContactIds = contact_ids.filter(cid => !existingMemberIds.includes(cid))

  // Add new members
  newContactIds.forEach(cid => {
    mockListMembers.push({ list_id: id, contact_id: cid })
  })

  // Update list count
  const listIndex = mockLists.findIndex(l => l.id === id)
  if (listIndex !== -1) {
    mockLists[listIndex].contact_count += newContactIds.length
  }

  res.status(201).json({ message: `Added ${newContactIds.length} contacts to list` })
})

// Remove contact from list
router.delete('/:id/contacts/:contact_id', requireAuth, async (req: any, res) => {
  const { id, contact_id } = req.params

  const index = mockListMembers.findIndex(m => m.list_id === id && m.contact_id === contact_id)

  if (index === -1) {
    res.status(404).json({ error: 'Contact not found in this list' })
    return
  }

  mockListMembers.splice(index, 1)

  // Update list count
  const listIndex = mockLists.findIndex(l => l.id === id)
  if (listIndex !== -1) {
    mockLists[listIndex].contact_count = Math.max(0, mockLists[listIndex].contact_count - 1)
  }

  res.json({ message: 'Contact removed from list successfully' })
})

export default router
