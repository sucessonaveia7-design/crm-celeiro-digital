export interface Contact {
  id: string
  name: string
  phone: string
}

export interface Conversation {
  id: string
  contact: Contact
  status: 'atendendo' | 'aguardando' | 'resolvido'
  channel: string
  last_message: string
  last_message_at: string
  unread_count: number
  assigned_to?: string
  instance_name?: string
  tags?: Tag[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: 'agent' | 'contact' | 'user' | 'system' | 'bot'
  content: string | null
  message_type: string
  created_at: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type ChatTab = 'atendendo' | 'aguardando' | 'resolvidos'

export const TAB_STATUS: Record<ChatTab, Conversation['status']> = {
  atendendo: 'atendendo',
  aguardando: 'aguardando',
  resolvidos: 'resolvido',
}

export const SAMPLE_TAGS: Tag[] = [
  { id: '1', name: 'Membro',    color: '#D4AF37' },
  { id: '2', name: 'Pastoral',  color: '#60A5FA' },
  { id: '3', name: 'Visitante', color: '#34D399' },
  { id: '4', name: 'Jovens',    color: '#F472B6' },
  { id: '5', name: 'Campanha',  color: '#A78BFA' },
]
