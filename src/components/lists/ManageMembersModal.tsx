import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Trash2, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface ManageMembersModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  list: any
}

export function ManageMembersModal({ isOpen, onClose, onSuccess, list }: ManageMembersModalProps) {
  const token = useAuthStore((state) => state.token)
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    if (!list) return
    setLoading(true)
    try {
      // Fetch all contacts
      const contactsRes = await fetch('/api/contacts?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const contactsData = await contactsRes.json()
      
      // Fetch members of this list
      const membersRes = await fetch(`/api/lists/${list.id}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const membersData = await membersRes.json()

      if (contactsRes.ok && membersRes.ok) {
        setContacts(contactsData.contacts || [])
        setMemberIds(membersData.contact_ids || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchData()
      setSearch('')
    }
  }, [isOpen, list])

  const handleAddMember = async (contactId: string) => {
    try {
      const res = await fetch(`/api/lists/${list.id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contact_ids: [contactId] })
      })

      if (res.ok) {
        setMemberIds([...memberIds, contactId])
        onSuccess() // Update parent list count
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveMember = async (contactId: string) => {
    try {
      const res = await fetch(`/api/lists/${list.id}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        setMemberIds(memberIds.filter(id => id !== contactId))
        onSuccess() // Update parent list count
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gerenciar Contatos: ${list?.name}`}
      description="Adicione ou remova contatos desta lista."
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border rounded-md max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => {
                  const isMember = memberIds.includes(contact.id)
                  return (
                    <div key={contact.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.email || contact.phone}</p>
                      </div>
                      {isMember ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveMember(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remover
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleAddMember(contact.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Adicionar
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum contato encontrado.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Concluir</Button>
        </div>
      </div>
    </Modal>
  )
}
