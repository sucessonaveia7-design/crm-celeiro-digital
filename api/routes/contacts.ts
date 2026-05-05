import { Router } from 'express'
import { requireAuth } from '../middleware/auth.ts'

const router = Router()

// MOCK CONTACTS DATABASE
let mockContacts = [
  { id: '1', user_id: 'mock-user-id', name: 'João Silva', phone: '+55 11 99999-1111', email: 'joao@email.com', birth_date: '1990-01-01', created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock-user-id', name: 'Maria Santos', phone: '+55 11 98888-2222', email: 'maria@email.com', birth_date: '1985-05-15', created_at: new Date().toISOString() },
  { id: '3', user_id: 'mock-user-id', name: 'Pedro Alves', phone: '+55 11 97777-3333', email: 'pedro@email.com', birth_date: '1992-08-20', created_at: new Date().toISOString() }
]

// Get all contacts
router.get('/', requireAuth, async (req: any, res) => {
  const { page = 1, limit = 10, search } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let filteredContacts = [...mockContacts]

  if (search) {
    const searchLower = search.toString().toLowerCase()
    filteredContacts = filteredContacts.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchLower)
    )
  }

  // Sort by created_at desc
  filteredContacts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const paginatedContacts = filteredContacts.slice(offset, offset + Number(limit))

  res.json({
    contacts: paginatedContacts,
    total: filteredContacts.length,
    pages: Math.ceil(filteredContacts.length / Number(limit))
  })
})

// Create contact
router.post('/', requireAuth, async (req: any, res) => {
  const { name, phone, email, birth_date } = req.body
  const user_id = req.user.id

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required' })
    return
  }

  const newContact = {
    id: Date.now().toString(),
    user_id,
    name,
    phone,
    email: email || '',
    birth_date: birth_date || null,
    created_at: new Date().toISOString()
  }

  mockContacts.push(newContact)

  res.status(201).json(newContact)
})

// Update contact
router.put('/:id', requireAuth, async (req: any, res) => {
  const { id } = req.params
  const { name, phone, email, birth_date } = req.body

  const index = mockContacts.findIndex(c => c.id === id)

  if (index === -1) {
    res.status(404).json({ error: 'Contact not found' })
    return
  }

  mockContacts[index] = {
    ...mockContacts[index],
    name: name || mockContacts[index].name,
    phone: phone || mockContacts[index].phone,
    email: email !== undefined ? email : mockContacts[index].email,
    birth_date: birth_date !== undefined ? birth_date : mockContacts[index].birth_date
  }

  res.json(mockContacts[index])
})

// Delete contact
router.delete('/:id', requireAuth, async (req: any, res) => {
  const { id } = req.params

  const index = mockContacts.findIndex(c => c.id === id)

  if (index === -1) {
    res.status(404).json({ error: 'Contact not found' })
    return
  }

  mockContacts.splice(index, 1)

  res.json({ message: 'Contact deleted successfully' })
})

export default router
