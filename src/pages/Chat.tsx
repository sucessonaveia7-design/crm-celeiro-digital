import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, SlidersHorizontal, MessageSquare, Send,
  MoreVertical, Phone, Video, Info, X,
  Tag, Users, Building2, Smartphone, ChevronDown, Check,
  Headphones, UserPlus, Calendar, FileText, Settings,
  Paperclip, Smile, ArrowLeft, Plus, Bell, CircleDot,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const API_URL = "http://localhost:4000";

interface ConversationAPI {
  id: string;
  status: string;
  department: string | null;
  unread_count: number;
  last_message: string | null;
  last_message_at: string | null;
}

/* ─────────────────────────────── TYPES ─────────────────────────────── */
interface Conversa {
  id: string; nome: string; ultimaMensagem: string; horario: string
  naoLidas: number; status: 'atendendo' | 'aguardando' | 'resolvido'
  iniciais: string; cor: string; departamento: string
  etiqueta?: string; online?: boolean; canal?: string
}
interface Mensagem { id: number; texto: string; hora: string; enviada: boolean }
interface MessageAPI {
  id: string;
  conversation_id: string;
  sender_type: "user" | "contact" | "system" | "bot";
  sender_id: string | null;
  message_type: string;
  content: string | null;
  media_url?: string | null;
  metadata?: any;
  created_at: string;
}
type Aba = 'atendendo' | 'aguardando' | 'resolvidos'

/* ─────────────────────────────── DATA ──────────────────────────────── */
const CONVERSAS: Conversa[] = [
  { id:1, nome:'Maria Silva',    ultimaMensagem:'Oi, preciso de ajuda com meu pedido',         horario:'14:32', naoLidas:3, status:'atendendo',  iniciais:'MS', cor:'#D4AF37', departamento:'Suporte',    etiqueta:'Urgente', online:true,  canal:'WhatsApp' },
  { id:2, nome:'João Pereira',   ultimaMensagem:'Obrigado pelo atendimento!',                   horario:'13:18', naoLidas:0, status:'atendendo',  iniciais:'JP', cor:'#3B82F6', departamento:'Vendas',                        online:false, canal:'Chat'     },
  { id:3, nome:'Ana Souza',      ultimaMensagem:'Quando vocês abrem amanhã?',                   horario:'12:05', naoLidas:1, status:'atendendo',  iniciais:'AS', cor:'#8B5CF6', departamento:'Suporte',                        online:true,  canal:'WhatsApp' },
  { id:4, nome:'Carlos Mendes',  ultimaMensagem:'Aguardando retorno sobre meu caso',            horario:'11:47', naoLidas:2, status:'aguardando', iniciais:'CM', cor:'#EF4444', departamento:'Financeiro', etiqueta:'VIP',     online:false, canal:'Chat'     },
  { id:5, nome:'Patrícia Lima',  ultimaMensagem:'Preciso de informações sobre planos',          horario:'10:30', naoLidas:0, status:'aguardando', iniciais:'PL', cor:'#F97316', departamento:'Vendas',                         online:false, canal:'WhatsApp' },
  { id:6, nome:'Roberto Alves',  ultimaMensagem:'Problema resolvido, muito obrigado!',          horario:'Ontem', naoLidas:0, status:'resolvido',  iniciais:'RA', cor:'#10B981', departamento:'Suporte',                        online:false, canal:'Chat'     },
  { id:7, nome:'Fernanda Costa', ultimaMensagem:'Tudo certo, até mais!',                        horario:'Ontem', naoLidas:0, status:'resolvido',  iniciais:'FC', cor:'#6366F1', departamento:'Vendas',                         online:false, canal:'Chat'     },
]

const MSGS: Record<number, Mensagem[]> = {
  1:[
    { id:1, texto:'Olá, Maria! Como posso ajudar?',                                                              hora:'14:28', enviada:true  },
    { id:2, texto:'Oi, preciso de ajuda com meu pedido. Fiz uma compra ontem e não recebi a confirmação.',        hora:'14:30', enviada:false },
    { id:3, texto:'Entendido! Pode me informar o número do pedido ou o e-mail cadastrado?',                       hora:'14:31', enviada:true  },
    { id:4, texto:'Claro! O número é #48291 e meu e-mail é maria@email.com.',                                      hora:'14:32', enviada:false },
  ],
  2:[
    { id:1, texto:'Bom dia, João! Em que posso ajudar hoje?',                                                     hora:'13:00', enviada:true  },
    { id:2, texto:'Gostaria de saber mais sobre os planos disponíveis.',                                           hora:'13:05', enviada:false },
    { id:3, texto:'Claro! Temos 3 planos: Básico, Profissional e Premium. Posso detalhar cada um.',                hora:'13:10', enviada:true  },
    { id:4, texto:'Obrigado pelo atendimento!',                                                                    hora:'13:18', enviada:false },
  ],
  3:[
    { id:1, texto:'Olá, Ana! Como posso ajudar?',   hora:'12:00', enviada:true  },
    { id:2, texto:'Quando vocês abrem amanhã?',      hora:'12:05', enviada:false },
  ],
  4:[
    { id:1, texto:'Bom dia, Carlos! Em que posso ajudar?',                          hora:'11:30', enviada:true  },
    { id:2, texto:'Estou aguardando retorno sobre meu caso desde segunda-feira.',    hora:'11:40', enviada:false },
    { id:3, texto:'Aguardando retorno sobre meu caso',                               hora:'11:47', enviada:false },
  ],
  5:[
    { id:1, texto:'Olá, Patrícia! Tudo bem?',             hora:'10:20', enviada:true  },
    { id:2, texto:'Preciso de informações sobre planos',   hora:'10:30', enviada:false },
  ],
  6:[
    { id:1, texto:'Roberto, conseguimos resolver. Pode testar agora.',   hora:'Ontem 16:10', enviada:true  },
    { id:2, texto:'Problema resolvido, muito obrigado!',                  hora:'Ontem 16:18', enviada:false },
  ],
  7:[
    { id:1, texto:'Fernanda, tudo resolvido de sua parte!',   hora:'Ontem 14:50', enviada:true  },
    { id:2, texto:'Tudo certo, até mais!',                    hora:'Ontem 14:55', enviada:false },
  ],
}

const FILTROS_ROWS = [
  {
    icon: Tag,        key: 'etiqueta',     label: 'Etiqueta',
    options: ['Todos','Curioso','Interessado','Visitante','Novo','Batizado','Follow-up','Líder','Cliente'],
  },
  {
    icon: Users,      key: 'usuario',      label: 'Usuário',
    options: ['Todos','Maiclei','Administrador','Ana Lima','Carlos Souza','Suporte'],
  },
  {
    icon: Building2,  key: 'departamento', label: 'Departamento',
    options: ['Todos','Atendimento','Suporte','Pastoral','Financeiro','Secretaria'],
  },
  {
    icon: Smartphone, key: 'whatsapp',     label: 'WhatsApp',
    options: ['Todos','WhatsApp Principal','WhatsApp Igreja','WhatsApp Eventos'],
  },
  {
    icon: CircleDot,  key: 'status',       label: 'Status',
    options: ['Todos','Atendendo','Aguardando','Resolvido'],
  },
]

const STATUS_MAP: Record<Aba, Conversa['status']> = {
  atendendo: 'atendendo', aguardando: 'aguardando', resolvidos: 'resolvido',
}

/* ── CustomFilterDropdown ────────────────────────────────────────────── */
function CustomFilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen]   = useState(false)
  const [rect, setRect]   = useState<DOMRect | null>(null)
  const btnRef            = useRef<HTMLButtonElement>(null)
  const listRef           = useRef<HTMLDivElement>(null)

  function handleToggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    function fn(e: MouseEvent) {
      const inBtn  = btnRef.current?.contains(e.target as Node)
      const inList = listRef.current?.contains(e.target as Node)
      if (!inBtn && !inList) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open])

  return (
    <div style={{ flex: 1 }}>
      {/* Trigger */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px', borderRadius: '12px',
          backgroundColor: '#1E293B',
          border: `1px solid ${open ? '#D4AF37' : '#334155'}`,
          color: '#FFFFFF', fontSize: '12px', cursor: 'pointer',
        }}
      >
        <span style={{ color: '#FFFFFF' }}>{value}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Portal dropdown list */}
      {open && rect && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top:   rect.bottom + 4,
            left:  rect.left,
            width: rect.width,
            zIndex: 9999,
            backgroundColor: '#111827',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {options.map(opt => {
              const isSel = opt === value
              return (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '12px',
                    display: 'block', border: 'none', cursor: 'pointer',
                    backgroundColor: isSel ? '#EAB308' : 'transparent',
                    color:           isSel ? '#0F172A' : '#FFFFFF',
                    fontWeight:      isSel ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (!isSel) {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.backgroundColor = '#EAB308'
                      el.style.color           = '#0F172A'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSel) {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.backgroundColor = 'transparent'
                      el.style.color           = '#FFFFFF'
                    }
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

/* ──────────────────────────── COMPONENT ────────────────────────────── */
export default function Chat() {
const [aba,    setAba]    = useState<Aba>('atendendo')
const [sel,    setSel]    = useState<string | null>(null)
const [busca,  setBusca]  = useState('')
const [filtro, setFiltro] = useState(false)
const [messageText, setMessageText] = useState('')
const [conversations, setConversations] = useState<Conversa[]>([])

const [messages, setMessages] = useState<MessageAPI[]>([])
const [messagesLoading, setMessagesLoading] = useState(false)
const [messagesError, setMessagesError] = useState<string | null>(null)

  const filtroRef  = useRef<HTMLDivElement>(null)
  const endRef     = useRef<HTMLDivElement>(null)

  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node))
        setFiltro(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

   useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: 'smooth' })
   }, [sel])

  // Load conversations from Supabase
  useEffect(() => {
    console.log("🔄 useEffect loadConversations called");
    loadConversations()
  }, [])

  // Auto-selecionar primeira conversa da aba ativa
  useEffect(() => {
    if (conversations.length > 0 && !sel) {
      const primeira = conversations.find(c => c.status === STATUS_MAP[aba])
      if (primeira) {
        setSel(primeira.id)
        loadMessages(primeira.id)
      }
    }
  }, [conversations])

  // Verificação inicial de sessão
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log("Sessão inválida → redirecionando para login")
        window.location.href = "/login"
      }
    }
    checkSession()
  }, [])

  // Monitorar expiração de sessão em tempo real
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log("Sessão expirada → redirecionando para login")
        window.location.href = "/login"
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

    async function loadConversations() {
      console.log("🔥 loadConversations executou");
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          status,
          unread_count,
          last_message,
          last_message_at,
          department,
          contacts(name, phone),
          channels(name, type)
        `)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar conversas:", error);
        return;
      }

      console.log("Conversations:", data);

      // Map Supabase data to UI Conversa format
      const mapped = data.map((c) => {
        const nome = c.contacts?.name ?? "Contato";
        const iniciais = nome
          .split(" ")
          .map(p => p[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        const horario = c.last_message_at
          ? new Date(c.last_message_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        return {
          id: c.id,
          nome,
          ultimaMensagem: c.last_message ?? "",
          horario,
          naoLidas: c.unread_count ?? 0,
          status: c.status,
          iniciais,
          cor: "#D4AF37", // Default gold color, can be made dynamic later
          departamento: c.department ?? "",
          canal: c.channels?.type ?? "Chat",
          online: false,
          // etiqueta and other optional fields are left undefined
        };
      });

       setConversations(mapped);
     }

     async function loadMessages(conversationId: string) {
       try {
         setMessagesLoading(true);
         setMessagesError(null);

         const { data: { session } } = await supabase.auth.getSession()
         if (!session) {
           console.log("Sessão inválida ao buscar mensagens")
           return
         }

         console.log("Buscando mensagens da conversa:", conversationId)

         const { data, error } = await supabase
           .from('messages')
           .select('*')
           .eq('conversation_id', conversationId)
           .order('created_at', { ascending: true })

         if (error) {
           console.error("Erro ao carregar mensagens:", error)
           throw error
         }

         console.log("Mensagens retornadas:", data?.length ?? 0)

         if (data && data.length > 0) {
           setMessages(data)
         } else {
           // Fallback temporário para visualização enquanto não há mensagens reais
           setMessages([
             {
               id: 'test-1',
               conversation_id: conversationId,
               sender_type: 'contact',
               sender_id: null,
               message_type: 'text',
               content: 'Olá, preciso de ajuda.',
               created_at: new Date(Date.now() - 60000).toISOString()
             },
             {
               id: 'test-2',
               conversation_id: conversationId,
               sender_type: 'user',
               sender_id: null,
               message_type: 'text',
               content: 'Olá! Como posso ajudar?',
               created_at: new Date().toISOString()
             }
           ])
         }

         setTimeout(() => {
           const el = document.getElementById("chat-scroll");
           if (el) el.scrollTop = el.scrollHeight;
         }, 100);
       } catch (err: any) {
         console.error("Erro ao buscar mensagens:", err)
         setMessagesError(err.message || "Erro ao buscar mensagens");
       } finally {
         setMessagesLoading(false);
       }
     }

     async function sendMessage() {
       if (!sel || !messageText.trim()) return;

       const { data: { session } } = await supabase.auth.getSession()
       if (!session) {
         console.log("Sessão inválida ao enviar mensagem")
         return
       }

       try {
         const res = await fetch(
           `${API_URL}/api/conversations/${sel}/messages`,
           {
             method: "POST",
             headers: {
               "Content-Type": "application/json"
             },
             body: JSON.stringify({
               content: messageText,
               message_type: "text"
             })
           }
         );

         if (!res.ok) {
           throw new Error("Erro ao enviar mensagem");
         }

         setMessageText("");

         // recarregar mensagens
         await loadMessages(sel);
         
         // Atualizar lista de conversas para mostrar a última mensagem na lateral
         await loadConversations();
       } catch (err) {
         console.error("Erro ao enviar:", err);
       }
     }

    const cont = {
      atendendo:  conversations.filter(c => c.status === 'atendendo').length,
      aguardando: conversations.filter(c => c.status === 'aguardando').length,
      resolvidos: conversations.filter(c => c.status === 'resolvido').length,
    }

    const lista = conversations.filter(c => {
      const matchAba   = c.status === STATUS_MAP[aba]
      const matchBusca = !busca ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.ultimaMensagem.toLowerCase().includes(busca.toLowerCase())
      return matchAba && matchBusca
    })

    const ativa = conversations.find(c => c.id === sel) ?? null

  /* ═══════════════════════════════════════════════════════════════════
   *  BLOCO 1 — RAIZ: layout flex-col, fundo escuro total
   * ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0A1628]">

      {/* ═══════════════════════════════════════════════════════════════
       *  BLOCO 2 — TOPO INTERNO: barra full-width com identidade e ações
       *  Ocupa toda a largura da página; ficava antes dentro do painel esq.
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-[#0F172A] border-b border-white/[0.07]">

        {/* Linha 1: ícone + título + botões de ação */}
        <div className="flex items-center justify-between px-6 h-[60px]">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(212,175,55,0.15)]
                            flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-[17px] h-[17px] text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-white font-bold text-[14.5px] leading-none tracking-tight">
                Bate Papo ao vivo
              </p>
              <p className="text-slate-500 text-[11px] mt-[3px]">
                Atendimento em tempo real
              </p>
            </div>
          </div>

          {/* Ações do topo */}
          <div className="flex items-center gap-1">
            {([
              { I: Bell,      title: 'Notificações'    },
              { I: Headphones,title: 'Áudio'            },
              { I: UserPlus,  title: 'Novo contato'    },
              { I: Calendar,  title: 'Calendário'       },
              { I: FileText,  title: 'Relatórios'       },
              { I: Settings,  title: 'Configurações'    },
            ] as const).map(({ I, title }) => (
              <button key={title} title={title}
                      className="w-9 h-9 flex items-center justify-center rounded-xl
                                 text-slate-500 hover:text-white hover:bg-white/[0.08]
                                 transition-all duration-150">
                <I className="w-[16px] h-[16px]" />
              </button>
            ))}

            <button className="ml-3 flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-[#D4AF37] text-[#0F172A] text-[12.5px] font-bold
                               hover:bg-[#C9A227] transition-colors
                               shadow-[0_3px_12px_rgba(212,175,55,0.35)]">
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
              Novo atendimento
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
         *  BLOCO 3 — ABAS DE STATUS: Atendendo / Aguardando / Resolvidos
         *  Agora ficam no topo full-width, não dentro do painel esquerdo
         * ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 px-4 overflow-x-auto">
          {([
            { key: 'atendendo'  as Aba, label: 'Atendendo'  },
            { key: 'aguardando' as Aba, label: 'Aguardando' },
            { key: 'resolvidos' as Aba, label: 'Resolvidos' },
          ]).map(({ key, label }) => {
            const isActive = aba === key
            const count    = cont[key]
            return (
              <button
                key={key}
                onClick={() => { setAba(key); setSel(null) }}
                className={`relative flex items-center gap-2 px-5 py-3.5
                            text-[13px] font-semibold whitespace-nowrap
                            border-b-2 transition-all duration-200
                            ${isActive
                              ? 'text-[#D4AF37] border-[#D4AF37]'
                              : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/20'}`}
              >
                {label}
                {count > 0 && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full
                                   text-[10px] font-bold flex items-center justify-center
                                   ${isActive
                                     ? 'bg-[#D4AF37] text-[#0F172A]'
                                     : 'bg-white/[0.10] text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       *  BLOCO 4 — CORPO: painel esquerdo + painel direito
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ───────────────────────────────────────────────────────────
         *  BLOCO 5 — PAINEL ESQUERDO: busca + filtro + lista
         *  Estruturalmente separado do topo; só contém lista de contatos
         * ─────────────────────────────────────────────────────────── */}
        <div className="w-[360px] flex-shrink-0 flex flex-col
                        bg-[#0C1424] border-r border-white/[0.06]">

          {/* ── Abas pill: Atendendo / Aguardando / Resolvidos ── */}
          <div className="flex-shrink-0 flex gap-1.5 px-4 pt-4 pb-1">
            {([
              { key: 'atendendo'  as Aba, label: 'Atendendo'  },
              { key: 'aguardando' as Aba, label: 'Aguardando' },
              { key: 'resolvidos' as Aba, label: 'Resolvidos' },
            ]).map(({ key, label }) => {
              const isActive = aba === key
              const count    = cont[key]
              return (
                <button
                  key={key}
                  onClick={() => { setAba(key); setSel(null) }}
                  className={`flex-1 flex items-center justify-center gap-1.5
                              py-[9px] rounded-full text-[11.5px] font-semibold
                              transition-all duration-200
                              ${isActive
                                ? 'bg-[#D4AF37] text-[#0F172A] shadow-[0_3px_10px_rgba(212,175,55,0.35)]'
                                : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.10] hover:text-white'}`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`min-w-[17px] h-[17px] px-1 rounded-full
                                     text-[9.5px] font-bold flex items-center justify-center
                                     ${isActive
                                       ? 'bg-[rgba(0,0,0,0.15)] text-[#0F172A]'
                                       : 'bg-white/[0.10] text-slate-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* TESTE */}
          <p className="text-red-500 font-bold text-center py-2">TESTE FUNCIONANDO</p>

          {/* BLOCO 5a — Busca + botão de filtro */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-white/[0.05]"
               ref={filtroRef}>
            <div className="relative flex items-center gap-2.5">

              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   w-[14px] h-[14px] text-slate-600 pointer-events-none" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar atendimento ou mensagem…"
                  className="w-full pl-10 pr-4 py-[10px]
                             bg-white/[0.05] border border-white/[0.08]
                             rounded-2xl text-[12.5px] text-white
                             placeholder:text-slate-600
                             focus:outline-none focus:border-[#D4AF37]/30 focus:bg-white/[0.07]
                             transition-all duration-200"
                />
              </div>

              <button
                onClick={() => setFiltro(v => !v)}
                title="Filtros"
                className={`flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center
                            rounded-2xl border transition-all duration-200
                            ${filtro
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A] shadow-[0_4px_14px_rgba(212,175,55,0.4)]'
                              : 'bg-white/[0.05] border-white/[0.08] text-slate-500 hover:text-white hover:bg-white/[0.10] hover:border-white/[0.15]'}`}
              >
                <SlidersHorizontal className="w-[14px] h-[14px]" />
              </button>
            </div>

            {/* ─────────────────────────────────────────────────
             *  BLOCO 5b — PAINEL DE FILTROS FLUTUANTE
             *  Card branco sobre o fundo escuro — alto contraste
             * ───────────────────────────────────────────────── */}
            {filtro && (
              <div className="absolute top-[calc(100%+2px)] left-4 right-4 z-[60]
                              bg-white rounded-[20px]
                              shadow-[0_32px_64px_rgba(0,0,0,0.60)]
                              border border-black/[0.06]">

                {/* cabeçalho */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4
                                border-b border-slate-100">
                  <div>
                    <p className="text-[13.5px] font-bold text-[#0F172A]">Filtros avançados</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Refinar atendimentos</p>
                  </div>
                  <button onClick={() => setFiltro(false)}
                          className="w-7 h-7 flex items-center justify-center rounded-full
                                     text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* linhas de filtro */}
                <div className="px-5 py-4 space-y-3">
                  {FILTROS_ROWS.map(({ icon: Icon, key, label, options }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-[96px] flex-shrink-0 flex items-center gap-2
                                      text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                      <CustomFilterDropdown
                        value={filterValues[key] ?? 'Todos'}
                        options={options}
                        onChange={v => setFilterValues(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                {/* rodapé */}
                <div className="flex gap-2.5 px-5 pb-5">
                  <button className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-600
                                     text-[12.5px] font-semibold hover:bg-slate-200 transition-colors">
                    Limpar
                  </button>
                  <button onClick={() => setFiltro(false)}
                          className="flex-1 py-2.5 rounded-full bg-[#D4AF37] text-[#0F172A]
                                     text-[12.5px] font-semibold hover:bg-[#C9A227] transition-colors
                                     shadow-[0_3px_10px_rgba(212,175,55,0.35)]">
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BLOCO 5c — Lista de atendimentos */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {lista.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-[12px] text-slate-600 font-medium">
                  Nenhuma conversa encontrada
                </p>
              </div>
            ) : (
               lista.map(conv => {
                 const isSelected = sel === conv.id
                 return (
                   <button
                     key={conv.id}
                     onClick={() => {
                       setSel(conv.id);
                       loadMessages(conv.id);
                     }}
                     className={`relative w-full flex items-start gap-3.5 px-4 py-4
                                 text-left border-b border-white/[0.04]
                                 transition-all duration-150 group
                                 ${isSelected
                                   ? 'bg-[rgba(212,175,55,0.07)]'
                                   : 'hover:bg-white/[0.04]'}`}
                   >
                    {/* Barra lateral dourada na seleção */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4AF37]
                                      rounded-r-full" />
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center
                                      text-white text-[13px] font-bold
                                      shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                           style={{ backgroundColor: conv.cor }}>
                        {conv.iniciais}
                      </div>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3
                                         bg-emerald-500 rounded-full
                                         border-[2px] border-[#0C1424]" />
                      )}
                    </div>

                    {/* Conteúdo da conversa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[13px] font-semibold truncate
                                         ${isSelected ? 'text-[#D4AF37]' : 'text-slate-200 group-hover:text-white'}`}>
                          {conv.nome}
                        </span>
                        <span className="flex-shrink-0 text-[10.5px] font-medium text-slate-600">
                          {conv.horario}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-slate-500 truncate mb-2.5 leading-snug">
                        {conv.ultimaMensagem}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {conv.etiqueta && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                                           bg-[rgba(212,175,55,0.12)] text-[#D4AF37]
                                           border border-[rgba(212,175,55,0.22)]">
                            {conv.etiqueta}
                          </span>
                        )}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full
                                         bg-white/[0.06] text-slate-500">
                          {conv.departamento}
                        </span>
                        {conv.canal && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full
                                           bg-white/[0.04] text-slate-600">
                            {conv.canal}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge não lidas */}
                    {conv.naoLidas > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 self-start mt-0.5
                                       rounded-full bg-[#D4AF37] text-[#0F172A]
                                       text-[9.5px] font-bold flex items-center justify-center">
                        {conv.naoLidas}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
         *  BLOCO 6 — PAINEL DIREITO: conversa ou estado vazio
         * ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]">

          {ativa ? (
            <>
              {/* BLOCO 6a — Cabeçalho da conversa ativa */}
              <div className="flex-shrink-0 h-[65px] flex items-center justify-between
                              px-8 bg-white
                              border-b border-slate-200/80
                              shadow-[0_1px_6px_rgba(15,23,42,0.06)]">

                <div className="flex items-center gap-4">
                  <button className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                                     text-slate-400 hover:bg-slate-100 transition-colors"
                          onClick={() => setSel(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative flex-shrink-0">
                    <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center
                                    text-white text-[12.5px] font-bold
                                    shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                         style={{ backgroundColor: ativa.cor }}>
                      {ativa.iniciais}
                    </div>
                    {ativa.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full
                                       border-[2.5px] border-white" />
                    )}
                  </div>

                  <div>
                    <p className="text-[14.5px] font-bold text-[#0F172A] leading-tight">
                      {ativa.nome}
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${ativa.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {ativa.online
                        ? <span className="text-emerald-500 font-medium">Online agora</span>
                        : <span>Offline</span>
                      }
                      <span className="text-slate-300">·</span>
                      <span>{ativa.departamento}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {([
                    { I: Phone,        t: 'Ligar'        },
                    { I: Video,        t: 'Videochamada' },
                    { I: Info,         t: 'Detalhes'     },
                    { I: MoreVertical, t: 'Mais opções'  },
                  ] as const).map(({ I, t }) => (
                    <button key={t} title={t}
                            className="w-9 h-9 flex items-center justify-center rounded-xl
                                       text-slate-400 hover:bg-slate-100 hover:text-slate-700
                                       transition-all duration-150">
                      <I className="w-[16px] h-[16px]" />
                    </button>
                  ))}

                   <button className="ml-3 flex items-center gap-2 px-4 py-2 rounded-xl
                                      bg-[#D4AF37] text-[#0F172A] text-[12.5px] font-bold
                                      hover:bg-[#C9A227] transition-colors
                                      shadow-[0_3px_10px_rgba(212,175,55,0.3)]"
                     onClick={async () => {
                       if (!ativa) return;
                       try {
                         await supabase
                           .from("conversations")
                           .update({
                             status: "resolvido",
                             unread_count: 0
                           })
                           .eq("id", ativa.id);
                         
                         await loadConversations();
                         setSel(null);
                       } catch (error) {
                         console.error("Erro ao concluir conversa:", error);
                         alert("Erro ao concluir conversa. Tente novamente.");
                       }
                     }}>
                     <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                     Resolver
                   </button>
                </div>
              </div>

               {/* BLOCO 6b — Área de mensagens */}
               <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
                 <div className="max-w-[640px] mx-auto space-y-4">
                 
                   {/* Mensagens loading state */}
                   {messagesLoading && (
                     <div className="flex items-center justify-center py-8">
                       <span className="text-slate-500">Carregando mensagens...</span>
                     </div>
                   )}
                   
                   {/* Mensagens error state */}
                   {messagesError && !messagesLoading && (
                     <div className="flex items-center justify-center py-8">
                       <span className="text-red-500">{messagesError}</span>
                     </div>
                   )}
                   
                   {/* Mensagens empty state */}
                   {!messagesLoading && !messagesError && messages.length === 0 && (
                     <div className="flex items-center justify-center py-8">
                       <span className="text-slate-500">Nenhuma mensagem encontrada</span>
                     </div>
                   )}
                   
                    {/* Mensagens content */}
                    {!messagesLoading && !messagesError && messages.length > 0 && (
                    <>
                    <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10.5px] font-semibold text-slate-400 px-2">
                    Hoje
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div id="chat-scroll" className="space-y-4">
                      {messages.map((msg) => {
                        const isUser = msg.sender_type === "user";

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[62%] px-5 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                                isUser
                                  ? "bg-[#D4AF37] text-[#0F172A] rounded-br-md"
                                  : "bg-[#0F172A] text-white rounded-bl-md"
                              }`}
                            >
                              <p>{msg.content}</p>

                              <div
                                className={`mt-1 text-[10px] ${
                                  isUser ? "text-[#0F172A]/60" : "text-white/50"
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </>
                    )}
                 </div>
               </div>

               {/* BLOCO 6c — Input de mensagem */}
               <div className="flex-shrink-0 px-6 pb-5 pt-2">
                 <div className="bg-white rounded-[22px]
                                 border border-slate-200/80
                                 shadow-[0_4px_20px_rgba(15,23,42,0.08)]
                                 overflow-hidden
                                 focus-within:border-[#D4AF37]/40
                                 focus-within:shadow-[0_4px_24px_rgba(212,175,55,0.10)]
                                 transition-all duration-200">

                   <div className="flex items-end gap-3 px-5 pt-4 pb-3">
                     <textarea
                       value={messageText}
                       onChange={e => setMessageText(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                       placeholder="Digite uma mensagem…"
                       rows={2}
                       className="flex-1 bg-transparent text-[13.5px] text-[#1E293B]
                                  placeholder:text-slate-300
                                  focus:outline-none resize-none leading-relaxed"
                     />
                     <button
                       onClick={sendMessage}
                       disabled={!messageText.trim()}
                       className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                                   transition-all duration-200
                                   ${messageText.trim()
                                     ? 'bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] shadow-[0_4px_14px_rgba(212,175,55,0.4)] hover:-translate-y-px'
                                     : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                     >
                       <Send className="w-[15px] h-[15px]" />
                     </button>
                   </div>

                   <div className="flex items-center gap-1 px-4 pb-3.5
                                   border-t border-slate-100 pt-2.5">
                     {([
                       { I: Paperclip, t: 'Anexar arquivo' },
                       { I: Smile,     t: 'Emoji'          },
                     ] as const).map(({ I, t }) => (
                       <button key={t} title={t}
                               className="w-8 h-8 flex items-center justify-center rounded-lg
                                          text-slate-300 hover:text-slate-500 hover:bg-slate-100
                                          transition-all">
                         <I className="w-4 h-4" />
                       </button>
                     ))}
                     <p className="ml-auto text-[10.5px] text-slate-300">
                       Enter para enviar · Shift+Enter para nova linha
                     </p>
                   </div>
                 </div>
               </div>
            </>

          ) : (
            /* BLOCO 6d — Estado vazio (nenhuma conversa selecionada) */
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-10 text-center">

              <div className="relative">
                <div className="w-[88px] h-[88px] rounded-[26px]
                                bg-white border border-slate-200/80
                                shadow-[0_8px_32px_rgba(15,23,42,0.10)]
                                flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-[#D4AF37] opacity-80" />
                </div>
                <div className="absolute inset-[-12px] rounded-[36px]
                                ring-1 ring-[rgba(212,175,55,0.15)] pointer-events-none" />
                <div className="absolute inset-[-24px] rounded-[46px]
                                ring-1 ring-[rgba(212,175,55,0.06)] pointer-events-none" />
              </div>

              <div>
                <p className="text-[20px] font-bold text-[#0F172A] tracking-tight mb-2">
                  Selecione um atendimento
                </p>
                <p className="text-[13.5px] text-slate-400 leading-relaxed max-w-[240px]">
                  Clique em qualquer conversa na lista ao lado para abri-la aqui.
                </p>
              </div>

              {/* Cartões de contagem por aba */}
              <div className="flex items-stretch gap-3">
                {([
                  { key: 'atendendo'  as Aba, label: 'Atendendo',  cor: '#D4AF37' },
                  { key: 'aguardando' as Aba, label: 'Aguardando', cor: '#F97316' },
                  { key: 'resolvidos' as Aba, label: 'Resolvidos', cor: '#10B981' },
                ]).map(({ key, label, cor }) => (
                  <button
                    key={key}
                    onClick={() => setAba(key)}
                    className={`flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl
                                border transition-all duration-150
                                ${aba === key
                                  ? 'border-[rgba(212,175,55,0.30)] bg-[rgba(212,175,55,0.05)] shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-[rgba(212,175,55,0.25)] hover:shadow-sm'}`}
                  >
                    <span className="text-[26px] font-bold leading-none"
                          style={{ color: cor }}>
                      {cont[key]}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
