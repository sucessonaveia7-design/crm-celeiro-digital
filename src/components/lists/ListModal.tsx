import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'

interface ListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  list?: any // If provided, edit mode
}

export function ListModal({ isOpen, onClose, onSuccess, list }: ListModalProps) {
  const token = useAuthStore((state) => state.token)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name || '',
        description: list.description || ''
      })
    } else {
      setFormData({ name: '', description: '' })
    }
  }, [list, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = list ? `/api/lists/${list.id}` : '/api/lists'
      const method = list ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
        if (!list) setFormData({ name: '', description: '' })
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
      title={list ? "Editar Lista" : "Nova Lista"}
      description={list ? "Atualize os dados da lista." : "Preencha os dados da nova lista de contatos."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Lista</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Membros Ativos"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Todos os membros que frequentam aos domingos"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
