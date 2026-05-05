import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useNotificationStore } from './notificationStore'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────
export type Stage =
  | 'Novo Visitante'
  | 'Em Atendimento'
  | 'Em Acompanhamento'
  | 'Pedido de Oração'
  | 'Agendamento Pastoral'
  | 'Discipulado'
  | 'Batismo'
  | 'Membro Ativo'
  | 'Veio à Igreja'
  | 'Agendamento de Visitas'

export type Channel = 'whatsapp' | 'whatsapp_official' | 'instagram' | 'email' | 'widget' | 'interno'
export type AutomationStatus = 'normal' | 'nova_mensagem' | 'em_atendimento' | 'atencao' | 'atrasado' | 'inativo'

export interface Message {
  id: number
  sender: 'me' | 'them'
  text: string
  time: string
  status?: 'Enviado' | 'Entregue' | 'Lido' | 'Falhou'
}

export interface KanbanConversation {
  id: string
  channel_id?: string
  status?: string
  last_message?: string
  last_message_at?: string
  channel?: {
    id?: string
    name?: string
    type: Channel
  }
}

export interface KanbanCard {
  id: string
  contactId?: string           // links to contact record
  conversationId?: string      // links to chat/conversation record
  contactName: string
  number: string
  stage: Stage
  unread: number
  lastMessage: string
  lastMessageTime: string
  lastInteractionAt: string   // ISO date string
  messages: Message[]
  automationStatus: AutomationStatus
  channel: Channel
  assignedTo?: string
  tags: string[]
  note?: string
  isArchived: boolean
  nextFollowUpAt?: string      // ISO date string
  conversation?: KanbanConversation
}

export type TriggerType = 'keyword' | 'inactivity' | 'new_conversation' | 'status_change'
export type ActionType  = 'move_to' | 'set_badge' | 'add_tag'

export interface AutomationRule {
  id: string
  name: string
  triggerType: TriggerType
  condition: {
    keywords?: string[]
    hoursInactive?: number
    fromStage?: Stage
  }
  action: {
    moveTo?: Stage
    setBadge?: AutomationStatus
    addTag?: string
  }
  isActive: boolean
}

// ─── Default automation rules ─────────────────────────────────
const DEFAULT_RULES: AutomationRule[] = [
  { id: 'r1', name: 'Pedido de Oração',               triggerType: 'keyword',          condition: { keywords: ['oração','orar','ore por','pedido de oração','oremos','intercessão'] },      action: { moveTo: 'Pedido de Oração' },       isActive: true },
  { id: 'r2', name: 'Discipulado',                    triggerType: 'keyword',          condition: { keywords: ['discipulado','estudo bíblico','bíblia','crescer na fé','classe bíblica'] }, action: { moveTo: 'Discipulado' },            isActive: true },
  { id: 'r3', name: 'Batismo',                        triggerType: 'keyword',          condition: { keywords: ['batismo','batizar','ser batizado','quero ser batizado'] },                  action: { moveTo: 'Batismo' },                isActive: true },
  { id: 'r4', name: 'Nova conversa → Novo Visitante', triggerType: 'new_conversation', condition: {},                                                                                        action: { moveTo: 'Novo Visitante' },         isActive: true },
  { id: 'r5', name: 'Atendente respondeu',             triggerType: 'status_change',    condition: {},                                                                                        action: { moveTo: 'Em Atendimento' },         isActive: true },
  { id: 'r6', name: 'Atenção: 24h sem resposta',      triggerType: 'inactivity',       condition: { hoursInactive: 24  },                                                                   action: { setBadge: 'atencao' },              isActive: true },
  { id: 'r7', name: 'Atrasado: 48h sem resposta',     triggerType: 'inactivity',       condition: { hoursInactive: 48  },                                                                   action: { setBadge: 'atrasado' },             isActive: true },
  { id: 'r8', name: 'Sem contato há 7 dias',          triggerType: 'inactivity',       condition: { hoursInactive: 168 },                                                                   action: { setBadge: 'inativo' },              isActive: true },
]

// ─── Helpers ──────────────────────────────────────────────────
const now = () => new Date().toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

function detectStageFromKeywords(text: string, rules: AutomationRule[]): Stage | null {
  const lower = text.toLowerCase()
  for (const rule of rules) {
    if (!rule.isActive || rule.triggerType !== 'keyword') continue
    const kws = rule.condition.keywords ?? []
    if (kws.some(kw => lower.includes(kw.toLowerCase())) && rule.action.moveTo) {
      return rule.action.moveTo
    }
  }
  return null
}

function computeInactivityStatus(lastInteractionAt: string, rules: AutomationRule[]): { status?: AutomationStatus; stage?: Stage } {
  const hoursElapsed = (Date.now() - new Date(lastInteractionAt).getTime()) / 3_600_000
  const inactivityRules = rules
    .filter(r => r.isActive && r.triggerType === 'inactivity')
    .sort((a, b) => (b.condition.hoursInactive ?? 0) - (a.condition.hoursInactive ?? 0))

  for (const rule of inactivityRules) {
    if (hoursElapsed >= (rule.condition.hoursInactive ?? 0)) {
      return { status: rule.action.setBadge, stage: rule.action.moveTo }
    }
  }
  return {}
}

function makeCard(fields: Partial<KanbanCard> & { id: string; contactName: string; number: string }): KanbanCard {
  return {
    stage:            'Novo Visitante',
    unread:           0,
    lastMessage:      '',
    lastMessageTime:  '',
    lastInteractionAt: now(),
    messages:         [],
    automationStatus: 'normal',
    channel:          'whatsapp',
    tags:             [],
    isArchived:       false,
    ...fields,
  }
}

// ─── Seed data (shown on very first visit, then localStorage takes over) ──
const SEED_CARDS: KanbanCard[] = [
  makeCard({ id: 's1', contactName: 'João Silva',    number: '+55 11 99999-1111', stage: 'Novo Visitante',    unread: 2,  lastMessage: 'Vi sobre a igreja nas redes sociais, gostaria de saber mais.', lastMessageTime: '10:30', lastInteractionAt: hoursAgo(2),  automationStatus: 'nova_mensagem', channel: 'whatsapp', assignedTo: 'Maiclei Pereira', tags: ['Primeiro Contato'], messages: [{ id: 1, sender: 'them', text: 'Olá, vi sobre a igreja nas redes sociais.', time: '10:20' }, { id: 2, sender: 'me', text: 'Que bom! Seja bem-vindo! Como posso ajudar?', time: '10:25' }, { id: 3, sender: 'them', text: 'Vi sobre a igreja nas redes sociais, gostaria de saber mais.', time: '10:30' }] }),
  makeCard({ id: 's2', contactName: 'Maria Souza',   number: '+55 11 98888-2222', stage: 'Em Atendimento',    unread: 1,  lastMessage: 'Tenho interesse em participar das reuniões de jovens.', lastMessageTime: '09:15', lastInteractionAt: hoursAgo(4),  automationStatus: 'nova_mensagem', channel: 'instagram', tags: ['Jovens'], messages: [{ id: 1, sender: 'them', text: 'Tenho interesse em participar das reuniões de jovens.', time: '09:15' }] }),
  makeCard({ id: 's3', contactName: 'Carlos Santos', number: '+55 11 97777-3333', stage: 'Em Acompanhamento', unread: 0,  lastMessage: 'Obrigado pelo acolhimento, foi abençoado!', lastMessageTime: 'Ontem', lastInteractionAt: hoursAgo(52), automationStatus: 'atrasado',    channel: 'whatsapp', tags: ['Acompanhamento'], messages: [{ id: 1, sender: 'them', text: 'Gostaria de continuar participando dos cultos.', time: '14:00' }, { id: 2, sender: 'me', text: 'Que maravilha, Carlos! Vamos continuar em contato.', time: '14:15' }, { id: 3, sender: 'them', text: 'Obrigado pelo acolhimento, foi abençoado!', time: 'Ontem' }] }),
  makeCard({ id: 's4', contactName: 'Ana Lima',      number: '+55 11 96666-4444', stage: 'Pedido de Oração',  unread: 0,  lastMessage: 'Por favor, ore por minha família', lastMessageTime: '08:00', lastInteractionAt: hoursAgo(5),  automationStatus: 'normal',       channel: 'whatsapp', tags: ['Oração', 'Família'], messages: [{ id: 1, sender: 'them', text: 'Por favor, ore por minha família', time: '08:00' }] }),
  makeCard({ id: 's5', contactName: 'Pedro Alves',   number: '+55 11 95555-5555', stage: 'Discipulado',       unread: 0,  lastMessage: 'Quero participar do estudo bíblico da quarta-feira', lastMessageTime: '07:30', lastInteractionAt: hoursAgo(8),  automationStatus: 'normal',       channel: 'widget',   tags: ['Discipulado'], messages: [{ id: 1, sender: 'them', text: 'Quero participar do estudo bíblico da quarta-feira', time: '07:30' }] }),
  makeCard({ id: 's6', contactName: 'Fernanda Costa',number: '+55 11 94444-6666', stage: 'Membro Ativo',      unread: 0,  lastMessage: 'Fui batizada no domingo, que momento especial!', lastMessageTime: 'Segunda', lastInteractionAt: hoursAgo(36), automationStatus: 'normal',       channel: 'whatsapp', tags: ['Membro', 'Batismo'], messages: [{ id: 1, sender: 'them', text: 'Fui batizada no domingo, que momento especial!', time: 'Segunda' }] }),
  makeCard({ id: 's7', contactName: 'Ricardo Mendes',number: '+55 11 93333-7777', stage: 'Batismo',           unread: 1,  lastMessage: 'Quero ser batizado nas águas, como faço?', lastMessageTime: '06:00', lastInteractionAt: hoursAgo(1),  automationStatus: 'nova_mensagem', channel: 'whatsapp', tags: ['Batismo'], messages: [{ id: 1, sender: 'them', text: 'Quero ser batizado nas águas, como faço?', time: '06:00' }] }),
  makeCard({ id: 's8', contactName: 'Lúcia Ferreira',number: '+55 11 92222-8888', stage: 'Veio à Igreja',     unread: 0,  lastMessage: 'Foi uma benção estar com vocês no domingo!', lastMessageTime: 'Terça', lastInteractionAt: hoursAgo(48), automationStatus: 'atencao',      channel: 'instagram', tags: ['Visitante', 'Culto'], messages: [{ id: 1, sender: 'them', text: 'Foi uma benção estar com vocês no domingo!', time: 'Terça' }] }),
]

// ─── Store interface ───────────────────────────────────────────
interface KanbanState {
  cards:    KanbanCard[]
  rules:    AutomationRule[]
  isLoaded: boolean

  // Data loading
  loadKanbanCards: () => Promise<void>
  createKanbanCardFromContact: (contact: { id: string; name: string; phone: string; channel?: Channel; tags?: string[]; conversationId?: string; contactId?: string }) => void

  // Card CRUD
  addOrUpdateCard:  (card: Partial<KanbanCard> & { id: string }) => void
  moveCard:         (id: string, newStage: Stage) => void
  addMessageToCard: (id: string, message: Omit<Message, 'id'>, contactInfo?: { name: string; number: string; channel?: Channel }) => void
  markAsRead:       (id: string) => void
  archiveCard:      (id: string) => void
  unarchiveCard:    (id: string) => void
  addNote:          (id: string, note: string) => void
  assignCard:       (id: string, assignedTo: string) => void
  addTag:           (id: string, tag: string) => void
  removeTag:        (id: string, tag: string) => void
  setFollowUp:      (id: string, date: string) => void
  applyInactivityRules: () => void

  // Rules CRUD
  addRule:    (rule: Omit<AutomationRule, 'id'>) => void
  updateRule: (id: string, updates: Partial<AutomationRule>) => void
  deleteRule: (id: string) => void
}

// ─── Store ────────────────────────────────────────────────────
export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      rules:    DEFAULT_RULES,
      cards:    [],          // starts empty; loadKanbanCards populates it
      isLoaded: false,

      // ── Load ─────────────────────────────────────────────────
      loadKanbanCards: async () => {
        const { cards: current } = get()
        const existingIds = new Set(current.map(c => c.id))

        try {
          // Try to load real contacts from Supabase
          const { data: contacts, error } = await supabase
            .from('contacts')
            .select('id, name, phone, email')
            .order('created_at', { ascending: false })
            .limit(500)

          if (!error && contacts && contacts.length > 0) {
            const newCards = contacts
              .filter(c => !existingIds.has(c.id))
              .map(c => makeCard({ id: c.id, contactName: c.name, number: c.phone || '' }))

            if (newCards.length > 0) {
              set(state => ({ cards: [...state.cards, ...newCards] }))
            }
            set({ isLoaded: true })
            return
          }
        } catch {
          // Supabase unavailable — fall through
        }

        // Supabase unavailable or empty: seed with mock data on very first visit
        if (current.length === 0) {
          set({ cards: SEED_CARDS })
        }
        set({ isLoaded: true })
      },

      createKanbanCardFromContact: (contact) => {
        const { cards } = get()
        // Deduplicate by id, conversationId, or phone number
        const alreadyExists = cards.some(c =>
          c.id === contact.id ||
          (contact.conversationId && c.conversationId === contact.conversationId) ||
          (contact.phone && c.number === contact.phone)
        )
        if (alreadyExists) return
        set(state => ({
          cards: [
            makeCard({
              id:             contact.id,
              contactId:      contact.contactId ?? contact.id,
              conversationId: contact.conversationId,
              contactName:    contact.name,
              number:         contact.phone,
              channel:        contact.channel ?? 'whatsapp',
              tags:           contact.tags ?? [],
            }),
            ...state.cards,
          ],
        }))
      },

      // ── Card CRUD ─────────────────────────────────────────────
      addOrUpdateCard: (updatedCard) => set((state) => {
        const idx = state.cards.findIndex(c => c.id === updatedCard.id)
        if (idx >= 0) {
          const next = [...state.cards]
          next[idx] = { ...next[idx], ...updatedCard }
          return { cards: next }
        }
        return {
          cards: [
            ...state.cards,
            makeCard({
              id:               updatedCard.id,
              contactName:      updatedCard.contactName     || 'Desconhecido',
              number:           updatedCard.number          || updatedCard.id,
              stage:            updatedCard.stage,
              unread:           updatedCard.unread,
              lastMessage:      updatedCard.lastMessage,
              lastMessageTime:  updatedCard.lastMessageTime,
              lastInteractionAt: updatedCard.lastInteractionAt,
              messages:         updatedCard.messages,
              automationStatus: updatedCard.automationStatus,
              channel:          updatedCard.channel,
              assignedTo:       updatedCard.assignedTo,
              tags:             updatedCard.tags,
              isArchived:       updatedCard.isArchived,
            }),
          ],
        }
      }),

      moveCard: (id, newStage) => {
        set(state => ({
          cards: state.cards.map(c => c.id === id ? { ...c, stage: newStage } : c),
        }))
        // Best-effort Supabase sync
        supabase
          .from('kanban_cards')
          .update({ automation_status: newStage, updated_at: now() })
          .eq('id', id)
          .then()
      },

      addMessageToCard: (id, message, contactInfo) => set((state) => {
        const { rules } = state
        const newMsg  = { ...message, id: Date.now() }
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const ts      = now()

        if (message.sender === 'them') {
          useNotificationStore.getState().addNotification({
            titulo:   'Nova mensagem recebida.',
            mensagem: `Mensagem de ${contactInfo?.name || 'Contato'}`,
            tipo:     'info',
          })
        }

        const idx = state.cards.findIndex(c => c.id === id)
        if (idx >= 0) {
          const next = [...state.cards]
          const card = { ...next[idx] }
          card.messages          = [...card.messages, newMsg]
          card.lastMessage       = message.text
          card.lastMessageTime   = timeStr
          card.lastInteractionAt = ts

          if (message.sender === 'them') {
            card.unread += 1
            card.automationStatus = 'nova_mensagem'
            if (card.stage === 'Membro Ativo') card.stage = 'Em Atendimento'
            const kStage = detectStageFromKeywords(message.text, rules)
            if (kStage) card.stage = kStage
          } else {
            card.automationStatus = 'em_atendimento'
          }

          next[idx] = card
          return { cards: next }
        }

        const kStage = message.sender === 'them' ? detectStageFromKeywords(message.text, rules) : null
        return {
          cards: [
            ...state.cards,
            makeCard({
              id,
              contactName:       contactInfo?.name   || 'Desconhecido',
              number:            contactInfo?.number || id,
              stage:             kStage || 'Novo Visitante',
              unread:            message.sender === 'them' ? 1 : 0,
              lastMessage:       message.text,
              lastMessageTime:   timeStr,
              lastInteractionAt: ts,
              messages:          [newMsg],
              automationStatus:  message.sender === 'them' ? 'nova_mensagem' : 'em_atendimento',
              channel:           contactInfo?.channel || 'whatsapp',
            }),
          ],
        }
      }),

      markAsRead:   (id) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, unread: 0 } : c) })),
      archiveCard:  (id) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, isArchived: true  } : c) })),
      unarchiveCard:(id) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, isArchived: false } : c) })),
      addNote:      (id, note) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, note } : c) })),
      assignCard:   (id, assignedTo) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, assignedTo } : c) })),
      addTag:       (id, tag)  => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, tags: c.tags.includes(tag) ? c.tags : [...c.tags, tag] } : c) })),
      removeTag:    (id, tag)  => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, tags: c.tags.filter(t => t !== tag) } : c) })),
      setFollowUp:  (id, date) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, nextFollowUpAt: date } : c) })),

      applyInactivityRules: () => set((state) => {
        const { rules } = state
        return {
          cards: state.cards.map(card => {
            if (card.isArchived || card.stage === 'Membro Ativo') return card
            const { status, stage } = computeInactivityStatus(card.lastInteractionAt, rules)
            return { ...card, ...(status ? { automationStatus: status } : {}), ...(stage ? { stage } : {}) }
          }),
        }
      }),

      // ── Rules CRUD ────────────────────────────────────────────
      addRule:    (rule)          => set(s => ({ rules: [...s.rules, { ...rule, id: `rule-${Date.now()}` }] })),
      updateRule: (id, updates)   => set(s => ({ rules: s.rules.map(r => r.id === id ? { ...r, ...updates } : r) })),
      deleteRule: (id)            => set(s => ({ rules: s.rules.filter(r => r.id !== id) })),
    }),

    {
      name: 'kanban-pastoral-v1',
      // Only persist cards and rules — not derived/transient state
      partialize: (state) => ({ cards: state.cards, rules: state.rules }),
    }
  )
)
