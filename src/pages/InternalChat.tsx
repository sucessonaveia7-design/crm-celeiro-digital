import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Send, X, Users, MessageSquare, CheckCircle2,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────── */

interface InternalMessage {
  id: string
  sender: string
  text: string
  timestamp: string
}

interface InternalConversation {
  id: string
  title: string
  users: string[]
  messages: InternalMessage[]
  createdAt: string
}

/* ─── Constants ──────────────────────────────────────────── */

const CURRENT_USER     = 'Você'
const AVAILABLE_USERS  = ['Ana Lima', 'Carlos Souza', 'Fernanda Costa', 'Roberto Silva']
const STORAGE_KEY      = 'internal_chat_conversations'

/* ─── localStorage helpers ───────────────────────────────── */

function loadConversations(): InternalConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistConversations(convs: InternalConversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}

/* ─── Component ──────────────────────────────────────────── */

export default function InternalChat() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<InternalConversation[]>(loadConversations)
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [showModal,     setShowModal]     = useState(false)
  const [newTitle,      setNewTitle]      = useState('')
  const [newUsers,      setNewUsers]      = useState<string[]>([])
  const [messageInput,  setMessageInput]  = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null

  /* persist on every change */
  useEffect(() => { persistConversations(conversations) }, [conversations])

  /* scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv?.messages.length])

  /* ── Handlers ─────────────────────────────────────────── */

  const closeModal = () => {
    setShowModal(false)
    setNewTitle('')
    setNewUsers([])
  }

  const toggleUser = (user: string) =>
    setNewUsers(prev => prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user])

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const conv: InternalConversation = {
      id:        Date.now().toString(),
      title:     newTitle.trim(),
      users:     newUsers,
      messages:  [],
      createdAt: new Date().toISOString(),
    }
    setConversations(prev => [conv, ...prev])
    setSelectedId(conv.id)
    closeModal()
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedId) return
    const msg: InternalMessage = {
      id:        Date.now().toString(),
      sender:    CURRENT_USER,
      text:      messageInput.trim(),
      timestamp: new Date().toISOString(),
    }
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, messages: [...c.messages, msg] } : c
    ))
    setMessageInput('')
  }

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="flex-1 w-full bg-transparent p-6 flex flex-col h-[calc(100vh-72px)]">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        <button
          onClick={() => navigate('/mensagens')}
          className="flex items-center gap-2 px-3 py-2 rounded-[12px] text-[13px] font-[600]
                     text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white
                     hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all
                     border border-transparent hover:border-[rgba(15,23,42,0.08)] dark:hover:border-[rgba(255,255,255,0.08)]"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-[22px] font-[800] text-[#0F172A] dark:text-white tracking-tight">
          Chat Interno
        </h1>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 gap-6 max-w-[1400px] mx-auto w-full min-h-0">

        {/* ── Left panel — conversation list ── */}
        <div className="w-1/3 max-w-[380px] min-w-[260px] bg-white dark:bg-[#0F172A] rounded-[20px]
                        shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]
                        border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                        flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-[20px] border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                          flex items-center justify-between flex-shrink-0">
            <p className="text-[15px] font-[700] text-[#0F172A] dark:text-white">Conversas</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-[700]
                         bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors
                         shadow-[0_3px_10px_rgba(212,175,55,0.30)]"
            >
              <Plus className="w-3.5 h-3.5" /> Novo
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-[10px] space-y-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8] text-[13px] leading-relaxed">
                Nenhuma conversa ainda.<br />
                Clique em <strong className="text-[#D4AF37]">+ Novo</strong> para começar.
              </div>
            ) : (
              conversations.map(conv => {
                const lastMsg = conv.messages.at(-1)
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-[12px] rounded-[14px] cursor-pointer transition-all duration-200
                      ${selectedId === conv.id
                        ? 'bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.2)]'
                        : 'border border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(15,23,42,0.04)] dark:hover:border-[rgba(255,255,255,0.04)]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5
                                      flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-[18px] h-[18px] text-[#D4AF37]" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-[600] text-[14px] text-[#0F172A] dark:text-white truncate">
                          {conv.title}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] truncate mt-[1px] flex items-center gap-1">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          {conv.users.length > 0 ? conv.users.join(', ') : 'Sem participantes'}
                        </p>
                      </div>
                    </div>
                    {lastMsg && (
                      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] truncate mt-2 pl-[52px]">
                        <span className="font-[600]">{lastMsg.sender === CURRENT_USER ? 'Você' : lastMsg.sender}: </span>
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right panel — chat area ── */}
        <div className="flex-1 bg-white dark:bg-[#0F172A] rounded-[20px]
                        shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]
                        border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                        flex flex-col overflow-hidden">

          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                              bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md flex-shrink-0">
                <p className="font-[700] text-[16px] text-[#0F172A] dark:text-white leading-tight">
                  {selectedConv.title}
                </p>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-[3px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  {selectedConv.users.length > 0
                    ? selectedConv.users.join(' · ')
                    : 'Sem participantes adicionados'}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar
                              bg-[#F8FAFC]/50 dark:bg-[#020617]/30">
                {selectedConv.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 text-[#94A3B8] text-[13px] text-center gap-3">
                    <MessageSquare className="w-10 h-10 opacity-30" strokeWidth={1.5} />
                    Nenhuma mensagem ainda. Diga olá!
                  </div>
                )}
                {selectedConv.messages.map((msg, i) => {
                  const isMe   = msg.sender === CURRENT_USER
                  const isLast = i === selectedConv.messages.length - 1
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      style={{
                        animation: isLast
                          ? 'msgPop 0.28s cubic-bezier(0.175,0.885,0.32,1.275) forwards'
                          : 'none',
                      }}
                    >
                      {!isMe && (
                        <p className="text-[11px] font-[600] text-[#D4AF37] mb-1 pl-1">{msg.sender}</p>
                      )}
                      <div className={`max-w-[68%] px-[18px] py-[12px] text-[14px] leading-relaxed shadow-sm flex flex-col gap-1
                        ${isMe
                          ? 'bg-gradient-to-br from-[#0284C7] to-[#0369A1] dark:from-[#38BDF8] dark:to-[#0284C7] text-white rounded-[20px] rounded-tr-[4px] shadow-[0_4px_14px_rgba(2,132,199,0.25)]'
                          : 'bg-white dark:bg-[#1E293B] text-[#334155] dark:text-[#E2E8F0] rounded-[20px] rounded-tl-[4px] border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]'}`}
                      >
                        <span>{msg.text}</span>
                        <span className={`text-[10px] self-end opacity-60 ${isMe ? 'text-white' : 'text-[#64748B]'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-5 bg-white dark:bg-[#0F172A]
                           border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                           flex-shrink-0 flex gap-3 items-center"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-[#F8FAFC] dark:bg-[#1E293B]
                             border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                             rounded-[16px] px-5 py-[14px] text-[14px] font-[500]
                             text-[#0F172A] dark:text-white placeholder-[#94A3B8]
                             focus:ring-4 focus:ring-[rgba(250,204,21,0.15)] focus:border-[rgba(250,204,21,0.5)]
                             outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`h-[50px] w-[50px] rounded-[16px] flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${messageInput.trim()
                      ? 'bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] shadow-[0_6px_16px_rgba(250,204,21,0.35)] hover:scale-[1.05] active:scale-[0.95] cursor-pointer'
                      : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#94A3B8] cursor-not-allowed border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]'}`}
                >
                  <Send className={`w-5 h-5 transition-transform ${messageInput.trim() ? 'translate-x-[2px] -translate-y-[2px]' : ''}`} strokeWidth={2.5} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] gap-4">
              <div className="w-[90px] h-[90px] rounded-full bg-[#F8FAFC] dark:bg-[#1E293B]
                              flex items-center justify-center shadow-inner
                              border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                <MessageSquare className="w-[42px] h-[42px] text-[#CBD5E1] dark:text-[#475569] opacity-50" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-[17px] font-[600] text-[#334155] dark:text-[#E2E8F0] mb-1">
                  Selecione uma conversa
                </p>
                <p className="text-[13px] max-w-[260px]">
                  Escolha uma conversa na lista ou crie uma nova com <strong className="text-[#D4AF37]">+ Novo</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal — Nova Conversa ── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[6px]"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-[#0F172A] rounded-[20px] w-full max-w-[420px]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />
            <div className="p-6">

              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">Nova Conversa</h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8]
                             hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title field */}
              <div className="mb-4">
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-2">
                  Título <span className="text-red-400 normal-case tracking-normal font-[500]">(obrigatório)</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Reunião de equipe"
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                             border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                             rounded-[12px] px-4 py-3 text-[14px] text-[#0F172A] dark:text-white
                             placeholder-[#94A3B8] focus:outline-none
                             focus:border-[rgba(212,175,55,0.40)] transition-colors"
                />
              </div>

              {/* Users multi-select */}
              <div className="mb-6">
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-2">
                  Usuários
                </label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {AVAILABLE_USERS.map(u => {
                    const active = newUsers.includes(u)
                    return (
                      <button
                        key={u}
                        onClick={() => toggleUser(u)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border transition-all text-[14px] font-[500]
                          ${active
                            ? 'bg-[rgba(212,175,55,0.08)] border-[rgba(212,175,55,0.35)] text-[#D4AF37]'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] text-[#334155] dark:text-[#E2E8F0] hover:border-[rgba(212,175,55,0.25)]'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5
                                        flex items-center justify-center text-[#D4AF37] font-[700] text-[13px] flex-shrink-0">
                          {u[0]}
                        </div>
                        <span className="flex-1 text-left">{u}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-[12px] bg-[#F8FAFC] dark:bg-[#1E293B]
                             text-[#64748B] dark:text-[#94A3B8] text-[14px] font-[600]
                             hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="flex-1 py-3 rounded-[12px] bg-[#D4AF37] text-[#0F172A]
                             text-[14px] font-[700] hover:bg-[#C9A227] transition-colors shadow-sm
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes msgPop {
          0%   { opacity: 0; transform: scale(0.95) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar       { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track  { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb  { background: #CBD5E1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  )
}
