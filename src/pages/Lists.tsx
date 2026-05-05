import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Loader2, Pencil, Trash2, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ListModal } from '@/components/lists/ListModal'
import { ManageMembersModal } from '@/components/lists/ManageMembersModal'

export default function Lists() {
  const token = useAuthStore((state) => state.token)
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false)
  
  // Selected list state
  const [editingList, setEditingList] = useState<any>(null)
  const [managingList, setManagingList] = useState<any>(null)

  const fetchLists = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ search })
      const response = await fetch(`/api/lists?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setLists(data.lists || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists()
  }, [search])

  const handleEdit = (list: any) => {
    setEditingList(list)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingList(null)
    setIsModalOpen(true)
  }

  const handleManageMembers = (list: any) => {
    setManagingList(list)
    setIsManageMembersOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lista? Isso não excluirá os contatos, apenas a associação.')) return

    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        fetchLists()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listas de Contatos</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Lista
        </Button>
      </div>

      <ListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchLists}
        list={editingList}
      />

      <ManageMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => setIsManageMembersOpen(false)}
        onSuccess={fetchLists}
        list={managingList}
      />

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar listas..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md border">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contatos</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {lists.length > 0 ? (
                  lists.map((list: any) => (
                    <tr key={list.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{list.name}</td>
                      <td className="p-4 align-middle text-muted-foreground">{list.description}</td>
                      <td className="p-4 align-middle">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {list.contact_count} contatos
                        </span>
                      </td>
                      <td className="p-4 align-middle flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Gerenciar Contatos"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          onClick={() => handleManageMembers(list)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(list)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(list.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhuma lista encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
