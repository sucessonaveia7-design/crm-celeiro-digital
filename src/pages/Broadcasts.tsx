import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Loader2, Trash2, Send, CalendarClock, CheckCircle2, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BroadcastModal } from '@/components/broadcasts/BroadcastModal'

export default function Broadcasts() {
  const token = useAuthStore((state) => state.token)
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchBroadcasts = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ search })
      const response = await fetch(`/api/broadcasts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setBroadcasts(data.broadcasts || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBroadcasts()
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transmissão?')) return

    try {
      const response = await fetch(`/api/broadcasts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        fetchBroadcasts()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <CalendarClock className="w-3 h-3 mr-1" /> Agendado
          </span>
        )
      case 'sending':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            <Send className="w-3 h-3 mr-1 animate-pulse" /> Enviando
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </span>
        )
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transmissões (WhatsApp)</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Transmissão
        </Button>
      </div>

      <BroadcastModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBroadcasts}
      />

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Campanha</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mensagem</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data/Hora</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {broadcasts.length > 0 ? (
                  broadcasts.map((broadcast: any) => (
                    <tr key={broadcast.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{broadcast.name}</td>
                      <td className="p-4 align-middle">
                        <p className="truncate max-w-[300px] text-muted-foreground" title={broadcast.message}>
                          {broadcast.message}
                        </p>
                      </td>
                      <td className="p-4 align-middle">
                        {getStatusBadge(broadcast.status)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(broadcast.schedule_at || broadcast.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 align-middle flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(broadcast.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhuma transmissão encontrada.</td>
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
