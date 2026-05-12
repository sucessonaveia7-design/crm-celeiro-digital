import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Conversation, Message, ChatTab, Tag } from './types'
import { TAB_STATUS } from './types'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken()
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

function mapConversation(c: Record<string, unknown>): Conversation {
  const contact = (Array.isArray(c.contacts) ? c.contacts[0] : c.contacts) as Record<string, unknown> | undefined
  const name = (contact?.name as string) || (contact?.phone as string) || 'Contato'
  return {
    id:              c.id as string,
    contact: {
      id:    (contact?.id    as string) ?? '',
      name,
      phone: (contact?.phone as string) ?? '',
    },
    status:          ((c.status ?? 'aguardando') as Conversation['status']),
    channel:         (c.channel as string) ?? 'WhatsApp',
    last_message:    (c.last_message as string) ?? '',
    last_message_at: (c.last_message_at as string) ?? '',
    unread_count:    (c.unread_count as number) ?? 0,
    assigned_to:     c.assigned_to as string | undefined,
    instance_name:   c.instance_name as string | undefined,
    tags:            (c.tags as Tag[]) ?? [],
  }
}

export interface ChatState {
  tab:             ChatTab
  setTab:          (t: ChatTab) => void
  search:          string
  setSearch:       (s: string) => void
  showFilters:     boolean
  setShowFilters:  (v: boolean) => void
  conversations:   Conversation[]
  filteredList:    Conversation[]
  counts:          Record<ChatTab, number>
  activeId:        string | null
  activeConversation: Conversation | null
  messages:        Message[]
  messagesLoading: boolean
  sending:         boolean
  scrollRef:       React.RefObject<HTMLDivElement | null>
  openConversation: (conv: Conversation) => Promise<void>
  sendMessage:      (text: string) => Promise<void>
}

export function useChatState(): ChatState {
  const [tab,          setTab]         = useState<ChatTab>('atendendo')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId,     setActiveId]    = useState<string | null>(null)
  const [messages,     setMessages]    = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending,      setSending]     = useState(false)
  const [search,       setSearch]      = useState('')
  const [showFilters,  setShowFilters] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [])

  const loadConversations = useCallback(async (silent = false) => {
    try {
      const res  = await apiFetch(`${API_URL}/api/whatsapp/conversations`)
      const json = await res.json() as { success: boolean; data?: unknown[] }
      if (!json.success) return
      setConversations((json.data ?? []).map(c => mapConversation(c as Record<string, unknown>)))
    } catch (err) {
      if (!silent) console.error('[useChatState] loadConversations:', err)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string, silent = false) => {
    if (!silent) setMessagesLoading(true)
    try {
      const res  = await apiFetch(`${API_URL}/api/whatsapp/messages/${conversationId}`)
      const json = await res.json() as { success: boolean; data?: Message[] }
      if (!json.success) return
      setMessages(prev => {
        const incoming = json.data ?? []
        if (
          prev.length === incoming.length &&
          prev[prev.length - 1]?.id === incoming[incoming.length - 1]?.id
        ) return prev
        scrollToBottom()
        return incoming
      })
    } catch (err) {
      if (!silent) console.error('[useChatState] loadMessages:', err)
    } finally {
      if (!silent) setMessagesLoading(false)
    }
  }, [scrollToBottom])

  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveId(conv.id)
    setMessages([])
    loadMessages(conv.id)

    setConversations(prev => prev.map(c =>
      c.id !== conv.id ? c : {
        ...c,
        unread_count: 0,
        status: c.status === 'aguardando' ? 'atendendo' : c.status,
      }
    ))

    try {
      await apiFetch(`${API_URL}/api/whatsapp/conversations/${conv.id}/read`, { method: 'POST' })
      if (conv.status === 'aguardando') {
        await apiFetch(`${API_URL}/api/whatsapp/conversations/${conv.id}/status`, {
          method: 'PATCH',
          body:   JSON.stringify({ status: 'atendendo' }),
        })
      }
    } catch (err) {
      console.error('[useChatState] openConversation:', err)
    }
  }, [loadMessages])

  const sendMessage = useCallback(async (text: string) => {
    if (!activeId || !text.trim() || sending) return
    setSending(true)
    try {
      const res  = await apiFetch(`${API_URL}/api/whatsapp/conversations/${activeId}/send`, {
        method: 'POST',
        body:   JSON.stringify({ content: text.trim() }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Erro ao enviar')
      await Promise.all([loadMessages(activeId), loadConversations(true)])
    } finally {
      setSending(false)
    }
  }, [activeId, sending, loadMessages, loadConversations])

  // Initial load + polling conversations
  useEffect(() => {
    loadConversations()
    const iv = setInterval(() => loadConversations(true), 5000)
    return () => clearInterval(iv)
  }, [loadConversations])

  // Poll messages for active conversation
  useEffect(() => {
    if (!activeId) return
    const iv = setInterval(() => loadMessages(activeId, true), 3000)
    return () => clearInterval(iv)
  }, [activeId, loadMessages])

  // Supabase realtime for active conversation
  useEffect(() => {
    if (!activeId) return
    const channel = supabase
      .channel(`chat:${activeId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${activeId}`,
      }, payload => {
        const incoming = payload.new as Message
        setMessages(prev => {
          if (prev.some(m => m.id === incoming.id)) return prev
          const updated = [...prev, incoming].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          scrollToBottom()
          return updated
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeId, scrollToBottom])

  // Auto-select first conversation on load
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      const first = conversations.find(c => c.status === TAB_STATUS[tab])
      if (first) openConversation(first)
    }
  }, [conversations, activeId, tab, openConversation])

  const counts: Record<ChatTab, number> = {
    atendendo:  conversations.filter(c => c.status === 'atendendo').length,
    aguardando: conversations.filter(c => c.status === 'aguardando').length,
    resolvidos: conversations.filter(c => c.status === 'resolvido').length,
  }

  const filteredList = conversations.filter(c => {
    const matchTab    = c.status === TAB_STATUS[tab]
    const q           = search.toLowerCase()
    const matchSearch = !search ||
      c.contact.name.toLowerCase().includes(q) ||
      c.last_message.toLowerCase().includes(q) ||
      c.contact.phone.includes(q)
    return matchTab && matchSearch
  })

  return {
    tab, setTab,
    search, setSearch,
    showFilters, setShowFilters,
    conversations, filteredList, counts,
    activeId,
    activeConversation: conversations.find(c => c.id === activeId) ?? null,
    messages, messagesLoading, sending,
    scrollRef,
    openConversation, sendMessage,
  }
}
