import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BroadcastModal({ isOpen, onClose, onSuccess }: BroadcastModalProps) {
  const token = useAuthStore((state) => state.token)
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    contact_list_id: '',
    schedule_at: '',
    interval_minutes: 1
  })

  useEffect(() => {
    if (isOpen) {
      fetchLists()
      setFormData({
        name: '',
        message: '',
        contact_list_id: '',
        schedule_at: '',
        interval_minutes: 1
      })
    }
  }, [isOpen])

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setLists(data.lists || [])
        if (data.lists && data.lists.length > 0) {
          setFormData(prev => ({ ...prev, contact_list_id: data.lists[0].id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Transmissão"
      description="Crie uma nova campanha de mensagens via WhatsApp."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Campanha</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Aviso Culto Domingo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="list">Lista de Destinatários</Label>
          <select
            id="list"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.contact_list_id}
            onChange={(e) => setFormData({ ...formData, contact_list_id: e.target.value })}
            required
          >
            <option value="" disabled>Selecione uma lista</option>
            {lists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.contact_count} contatos)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <textarea
            id="message"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            placeholder="Digite a mensagem que será enviada no WhatsApp..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schedule_at">Agendar para (Opcional)</Label>
            <Input
              id="schedule_at"
              type="datetime-local"
              value={formData.schedule_at}
              onChange={(e) => setFormData({ ...formData, schedule_at: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interval">Intervalo (Minutos)</Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={formData.interval_minutes}
              onChange={(e) => setFormData({ ...formData, interval_minutes: parseInt(e.target.value) })}
              required
            />
            <p className="text-[10px] text-muted-foreground">Tempo entre cada envio para evitar bloqueios</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Transmissão'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
