import { useState } from 'react'
import {
  UserPlus, Check, Upload, Filter, X, Mail, Phone, Tag, Trash2, Edit2,
  ChevronDown, FileText, Search, Users, User, Download,
  SlidersHorizontal, Plus, Pencil, List, AlignLeft, Type, Hash,
  Calendar, ToggleLeft, CheckCircle2,
} from 'lucide-react'

/* ─── Contact types ───────────────────────────────────── */

interface Contact {
  id: string; name: string; email: string; phone: string;
  type: 'Membro' | 'Visitante' | 'Líder' | 'Administrador';
  status: 'Ativo' | 'Inativo' | 'Novo';
  tags: string[]; dateAdded: Date;
}

/* ─── Campo types ─────────────────────────────────────── */

type FieldType   = 'Texto curto' | 'Texto longo' | 'Número' | 'Data' | 'Lista' | 'Sim/Não'
type FieldStatus = 'Ativo' | 'Inativo'

interface Campo {
  id: string; nome: string; tipo: FieldType; status: FieldStatus; opcoes?: string[]; criadoEm: string;
}

const CAMPOS_KEY = 'audiencia_campos_personalizados'

const TIPOS: FieldType[] = ['Texto curto', 'Texto longo', 'Número', 'Data', 'Lista', 'Sim/Não']

const TIPO_META: Record<FieldType, { Icon: React.ElementType; color: string }> = {
  'Texto curto': { Icon: Type,       color: 'text-blue-500    bg-blue-500/10    border-blue-500/20'    },
  'Texto longo': { Icon: AlignLeft,  color: 'text-purple-500  bg-purple-500/10  border-purple-500/20'  },
  'Número':      { Icon: Hash,       color: 'text-orange-500  bg-orange-500/10  border-orange-500/20'  },
  'Data':        { Icon: Calendar,   color: 'text-cyan-500    bg-cyan-500/10    border-cyan-500/20'    },
  'Lista':       { Icon: List,       color: 'text-[#D4AF37]   bg-[#D4AF37]/10   border-[#D4AF37]/20'   },
  'Sim/Não':     { Icon: ToggleLeft, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
}

const INITIAL_CAMPOS: Campo[] = [
  { id: '1', nome: 'Ministério',         tipo: 'Lista',       status: 'Ativo', opcoes: ['Jovens', 'Louvor', 'Infantil', 'Intercessão'],          criadoEm: '2024-01-10' },
  { id: '2', nome: 'Data de nascimento', tipo: 'Data',        status: 'Ativo',                                                                   criadoEm: '2024-01-10' },
  { id: '3', nome: 'Estado civil',       tipo: 'Lista',       status: 'Ativo', opcoes: ['Solteiro', 'Casado', 'Viúvo'],                         criadoEm: '2024-01-11' },
  { id: '4', nome: 'Tempo na igreja',    tipo: 'Lista',       status: 'Ativo', opcoes: ['Novo visitante', '1 mês', '6 meses', '1 ano ou mais'], criadoEm: '2024-01-12' },
  { id: '5', nome: 'Interesse',          tipo: 'Lista',       status: 'Ativo', opcoes: ['Batismo', 'Discipulado', 'Célula', 'Aconselhamento'],  criadoEm: '2024-01-13' },
  { id: '6', nome: 'Observações',        tipo: 'Texto longo', status: 'Ativo',                                                                   criadoEm: '2024-01-14' },
]

const EMPTY_FORM = { nome: '', tipo: 'Lista' as FieldType, opcoes: [] as string[], status: 'Ativo' as FieldStatus }

function loadCampos(): Campo[] {
  try {
    const raw = localStorage.getItem(CAMPOS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_CAMPOS
}

function TipoChip({ tipo }: { tipo: FieldType }) {
  const { Icon, color } = TIPO_META[tipo]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[700] border ${color}`}>
      <Icon className="w-3 h-3" />
      {tipo}
    </span>
  )
}

/* ─── Main Component ──────────────────────────────────── */

export default function AudiencePremium() {

  /* ── Tab ── */
  const [activeTab, setActiveTab] = useState<'contatos' | 'campos'>('contatos')

  /* ── Contacts state ── */
  const [isAddModalOpen,    setIsAddModalOpen]    = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Ana Flávia',    email: 'ana.flavia@email.com',  phone: '(11) 98765-4321', type: 'Líder',         status: 'Ativo',   tags: ['Líder', 'Novo'],           dateAdded: new Date(Date.now() - 86400000 * 2)   },
    { id: '2', name: 'Carlos Mendes', email: 'carlos.m@email.com',    phone: '(11) 91234-5678', type: 'Visitante',     status: 'Novo',    tags: ['Interessado', 'Visitante'], dateAdded: new Date(Date.now() - 3600000 * 5)    },
    { id: '3', name: 'Roberto Lima',  email: 'roberto.lima@email.com', phone: '(21) 99876-5432', type: 'Membro',        status: 'Ativo',   tags: ['Batizado'],                dateAdded: new Date(Date.now() - 86400000 * 15)  },
    { id: '4', name: 'Juliana Costa', email: 'ju.costa@email.com',    phone: '(31) 98888-7777', type: 'Administrador', status: 'Ativo',   tags: ['Admin'],                   dateAdded: new Date(Date.now() - 86400000 * 100) },
    { id: '5', name: 'Marcos Paulo',  email: 'marcos.p@email.com',    phone: '(41) 97777-6666', type: 'Membro',        status: 'Inativo', tags: ['Follow-up'],               dateAdded: new Date(Date.now() - 86400000 * 45)  },
  ])
  const [searchQuery,   setSearchQuery]   = useState('')
  const [filterType,    setFilterType]    = useState('Todos')
  const [filterStatus,  setFilterStatus]  = useState('Todos')
  const [filterTag,     setFilterTag]     = useState('Todas')

  const filteredContacts = contacts.filter(c => {
    const matchesSearch  = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType    = filterType   === 'Todos'  || c.type   === filterType
    const matchesStatus  = filterStatus === 'Todos'  || c.status === filterStatus
    const matchesTag     = filterTag    === 'Todas'  || c.tags.includes(filterTag)
    return matchesSearch && matchesType && matchesStatus && matchesTag
  })

  /* ── Campos state ── */
  const [campos,      setCampos]      = useState<Campo[]>(loadCampos)
  const [showModal,   setShowModal]   = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [form,        setForm]        = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [campoSearch, setCampoSearch] = useState('')
  const [optionInput, setOptionInput] = useState('')

  const filteredCampos = campos.filter(c =>
    c.nome.toLowerCase().includes(campoSearch.toLowerCase()) ||
    c.tipo.toLowerCase().includes(campoSearch.toLowerCase())
  )

  function openNew()  { setForm(EMPTY_FORM); setEditingId(null); setOptionInput(''); setShowModal(true) }
  function closeModal() { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); setOptionInput('') }

  function openEdit(campo: Campo) {
    setForm({ nome: campo.nome, tipo: campo.tipo, opcoes: campo.opcoes || [], status: campo.status })
    setEditingId(campo.id); setOptionInput(''); setShowModal(true)
  }

  function addOption() {
    const val = optionInput.trim()
    if (!val || form.opcoes.includes(val)) return
    setForm(f => ({ ...f, opcoes: [...f.opcoes, val] }))
    setOptionInput('')
  }

  function removeOption(opt: string) {
    setForm(f => ({ ...f, opcoes: f.opcoes.filter(o => o !== opt) }))
  }

  function handleSaveCampo() {
    if (!form.nome.trim()) return
    const opcoes = form.tipo === 'Lista' && form.opcoes.length > 0 ? form.opcoes : undefined

    const next = editingId
      ? campos.map(c => c.id === editingId ? { ...c, nome: form.nome.trim(), tipo: form.tipo, opcoes, status: form.status } : c)
      : [...campos, { id: Date.now().toString(), nome: form.nome.trim(), tipo: form.tipo, status: form.status, opcoes, criadoEm: new Date().toISOString().split('T')[0] }]

    setCampos(next)
    localStorage.setItem(CAMPOS_KEY, JSON.stringify(next))
    closeModal()
  }

  function handleDeleteCampo(id: string) {
    const next = campos.filter(c => c.id !== id)
    setCampos(next)
    localStorage.setItem(CAMPOS_KEY, JSON.stringify(next))
    setDeleteId(null)
  }

  function toggleCampoStatus(id: string) {
    const next = campos.map(c => c.id === id ? { ...c, status: c.status === 'Ativo' ? 'Inativo' : 'Ativo' as FieldStatus } : c)
    setCampos(next)
    localStorage.setItem(CAMPOS_KEY, JSON.stringify(next))
  }


  /* ─── Render ─────────────────────────────────────────── */

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 transition-opacity duration-[220ms] ease-in-out">
        <style>{`
          @keyframes dropdownOpen  { 0% { opacity:0; transform:translateY(-6px);  } 100% { opacity:1; transform:translateY(0);  } }
          @keyframes fadeDashboard { 0% { opacity:0; transform:translateY(10px);  } 100% { opacity:1; transform:translateY(0);  } }
          @keyframes modalOpen     { 0% { opacity:0; transform:scale(0.95);       } 100% { opacity:1; transform:scale(1);       } }
          @keyframes fadeIn        { 0% { opacity:0;                              } 100% { opacity:1;                           } }
          .custom-scrollbar::-webkit-scrollbar       { width:6px; height:6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background:transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(148,163,184,0.3); border-radius:10px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(71,85,105,0.4); }
        `}</style>

        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-[28px] font-[700] text-[#0F172A] dark:text-white tracking-tight mb-1">Audiência</h2>
              <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8]">Gerencie contatos, membros e visitantes da plataforma.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'contatos' ? (
                <>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2 px-[18px] py-[10px] rounded-[12px]
                               bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                               text-[#334155] dark:text-[#E2E8F0] font-[600] text-[14px]
                               hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-all hover:-translate-y-[2px] shadow-sm"
                  >
                    <Upload className="w-[16px] h-[16px]" /> Importar contatos
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-[20px] py-[10px] rounded-[12px]
                               bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[600] text-[14px]
                               shadow-[0_4px_14px_rgba(250,204,21,0.35)] hover:scale-[1.02]
                               hover:shadow-[0_6px_20px_rgba(250,204,21,0.45)] transition-all"
                  >
                    <UserPlus className="w-[18px] h-[18px]" /> Adicionar contato
                  </button>
                </>
              ) : (
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 px-5 py-[10px] rounded-[12px]
                             bg-[#D4AF37] text-[#0F172A] font-[700] text-[14px]
                             shadow-[0_4px_14px_rgba(212,175,55,0.35)] hover:bg-[#C9A227]
                             hover:scale-[1.02] transition-all"
                >
                  <Plus className="w-[16px] h-[16px]" /> Novo Campo
                </button>
              )}
            </div>
          </div>

          {/* ── Tab switcher ── */}
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1.5 rounded-[16px] w-fit
                          border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
            {([
              { key: 'contatos', label: 'Contatos',             Icon: Users             },
              { key: 'campos',   label: 'Campos Personalizados', Icon: SlidersHorizontal },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[600] transition-all
                  ${activeTab === key
                    ? 'bg-[#D4AF37] text-[#0F172A] shadow-[0_3px_10px_rgba(212,175,55,0.35)]'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════
              ABA — CONTATOS
          ══════════════════════════════════════════════ */}
          {activeTab === 'contatos' && (
            <div className="space-y-6">

              {/* Filters */}
              <div className="bg-[#FFFFFF] dark:bg-[#0F172A] p-5 rounded-[20px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[280px] relative group">
                  <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#D4AF37] transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[12px] pl-[42px] pr-[16px] py-[10px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(250,204,21,0.15)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-[16px] h-[16px] text-[#64748B]" />
                    <span className="text-[14px] font-[500] text-[#64748B] dark:text-[#94A3B8]">Filtrar:</span>
                  </div>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[10px] px-[14px] py-[10px] text-[14px] font-[500] text-[#334155] dark:text-[#E2E8F0] outline-none focus:ring-2 focus:ring-[rgba(250,204,21,0.15)] focus:border-[#FACC15] cursor-pointer">
                    <option value="Todos">Tipo: Todos</option>
                    <option value="Membro">Membro</option>
                    <option value="Visitante">Visitante</option>
                    <option value="Líder">Líder</option>
                    <option value="Administrador">Admin</option>
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[10px] px-[14px] py-[10px] text-[14px] font-[500] text-[#334155] dark:text-[#E2E8F0] outline-none focus:ring-2 focus:ring-[rgba(250,204,21,0.15)] focus:border-[#FACC15] cursor-pointer">
                    <option value="Todos">Status: Todos</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Novo">Novo</option>
                  </select>
                  <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[10px] px-[14px] py-[10px] text-[14px] font-[500] text-[#334155] dark:text-[#E2E8F0] outline-none focus:ring-2 focus:ring-[rgba(250,204,21,0.15)] focus:border-[#FACC15] cursor-pointer">
                    <option value="Todas">Tags: Todas</option>
                    <option value="Novo">Novo</option>
                    <option value="Interessado">Interessado</option>
                    <option value="Batizado">Batizado</option>
                    <option value="Líder">Líder</option>
                    <option value="Visitante">Visitante</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[24px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  {filteredContacts.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] dark:from-[#1E293B] dark:to-[#0F172A]">
                          <th className="px-8 py-5 text-[12px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.05em]">Contato</th>
                          <th className="px-8 py-5 text-[12px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.05em]">Contato Info</th>
                          <th className="px-8 py-5 text-[12px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.05em]">Tipo / Status</th>
                          <th className="px-8 py-5 text-[12px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.05em]">Tags</th>
                          <th className="px-8 py-5 text-[12px] font-[700] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.05em] text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(15,23,42,0.04)] dark:divide-[rgba(255,255,255,0.04)]">
                        {filteredContacts.map(contact => (
                          <tr key={contact.id} className="hover:bg-gradient-to-r hover:from-[#F8FAFC]/50 hover:to-[#FFFFFF] dark:hover:from-[#1E293B]/40 dark:hover:to-[#0F172A]/40 transition-colors duration-200 group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] dark:from-[#1E293B] dark:to-[#334155] flex items-center justify-center text-[18px] font-[700] text-[#475569] dark:text-[#CBD5E1] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover:scale-[1.05] transition-transform duration-300">
                                  {contact.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[15px] font-[600] text-[#0F172A] dark:text-white group-hover:text-[#D4AF37] dark:group-hover:text-[#FACC15] transition-colors duration-200">{contact.name}</span>
                                  <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-[2px] font-[500]">Adicionado em {contact.dateAdded.toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-[6px]">
                                <span className="flex items-center gap-2.5 text-[13px] font-[500] text-[#334155] dark:text-[#CBD5E1]"><Mail className="w-[14px] h-[14px] text-[#94A3B8]" /> {contact.email}</span>
                                <span className="flex items-center gap-2.5 text-[13px] font-[500] text-[#334155] dark:text-[#CBD5E1]"><Phone className="w-[14px] h-[14px] text-[#94A3B8]" /> {contact.phone}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-2.5 items-start">
                                <span className={`px-[12px] py-[6px] rounded-full text-[12px] font-[700] inline-flex items-center gap-[6px] shadow-sm border ${
                                  contact.type === 'Membro'        ? 'bg-[#EFF6FF] text-[#0284C7] border-[#BFDBFE] dark:bg-[rgba(2,132,199,0.15)] dark:text-[#38BDF8] dark:border-[rgba(2,132,199,0.3)]' :
                                  contact.type === 'Visitante'     ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE] dark:bg-[rgba(109,40,217,0.15)] dark:text-[#A78BFA] dark:border-[rgba(109,40,217,0.3)]' :
                                  contact.type === 'Líder'         ? 'bg-[#FEF9C3] text-[#B45309] border-[#FEF08A] dark:bg-[rgba(250,204,21,0.15)] dark:text-[#FACC15] dark:border-[rgba(250,204,21,0.3)]' :
                                  'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:border-[rgba(255,255,255,0.1)]'
                                }`}>{contact.type}</span>
                                <span className={`px-[10px] py-[4px] rounded-[6px] text-[12px] font-[600] flex items-center gap-1.5 ${
                                  contact.status === 'Ativo'   ? 'text-[#16A34A] bg-[#DCFCE7] dark:text-[#4ADE80] dark:bg-[rgba(34,197,94,0.15)]' :
                                  contact.status === 'Inativo' ? 'text-[#DC2626] bg-[#FEE2E2] dark:text-[#F87171] dark:bg-[rgba(239,68,68,0.15)]' :
                                  'text-[#0284C7] bg-[#E0F2FE] dark:text-[#38BDF8] dark:bg-[rgba(2,132,199,0.15)]'
                                }`}>
                                  <span className="w-[6px] h-[6px] rounded-full bg-current shadow-[0_0_4px_currentColor]" /> {contact.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-wrap gap-[6px] max-w-[220px]">
                                {contact.tags.map(tag => (
                                  <span key={tag} className="px-[10px] py-[4px] rounded-[8px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[11px] font-[600] text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5 shadow-sm">
                                    <Tag className="w-[10px] h-[10px] text-[#94A3B8]" /> {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button className="p-[10px] rounded-[10px] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0284C7] dark:hover:bg-[rgba(2,132,199,0.15)] hover:shadow-sm transition-all hover:-translate-y-[1px]"><Mail className="w-[18px] h-[18px]" /></button>
                                <button className="p-[10px] rounded-[10px] text-[#64748B] hover:bg-[#FEF9C3] hover:text-[#B45309] dark:hover:bg-[rgba(250,204,21,0.15)] dark:hover:text-[#FACC15] hover:shadow-sm transition-all hover:-translate-y-[1px]"><Edit2 className="w-[18px] h-[18px]" /></button>
                                <button className="p-[10px] rounded-[10px] text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#DC2626] dark:hover:bg-[rgba(239,68,68,0.15)] dark:hover:text-[#F87171] hover:shadow-sm transition-all hover:-translate-y-[1px]"><Trash2 className="w-[18px] h-[18px]" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-[60px] flex flex-col items-center justify-center text-center">
                      <div className="w-[80px] h-[80px] rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center mb-[20px] shadow-inner">
                        <Users className="w-[36px] h-[36px] text-[#94A3B8]" />
                      </div>
                      <h3 className="text-[18px] font-[600] text-[#0F172A] dark:text-white mb-2">Nenhum contato encontrado</h3>
                      <p className="text-[14px] text-[#64748B] max-w-[300px] mb-6">Não há contatos cadastrados ainda ou sua busca não retornou resultados.</p>
                      <button onClick={() => setIsAddModalOpen(true)} className="px-[20px] py-[10px] rounded-[12px] bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-[600] text-[14px] hover:scale-[1.02] shadow-[0_4px_14px_rgba(15,23,42,0.2)] transition-all">
                        Adicionar primeiro contato
                      </button>
                    </div>
                  )}
                </div>
                {filteredContacts.length > 0 && (
                  <div className="border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
                    <span className="text-[13px] font-[500] text-[#64748B] dark:text-[#94A3B8]">Mostrando {filteredContacts.length} de {contacts.length} contatos</span>
                    <div className="flex items-center gap-2">
                      <button className="px-[12px] py-[6px] rounded-[8px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[13px] font-[600] text-[#334155] dark:text-[#CBD5E1] hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] transition-colors disabled:opacity-50">Anterior</button>
                      <button className="px-[12px] py-[6px] rounded-[8px] bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-[13px] font-[600] shadow-sm hover:opacity-90 transition-opacity">1</button>
                      <button className="px-[12px] py-[6px] rounded-[8px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[13px] font-[600] text-[#334155] dark:text-[#CBD5E1] hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] transition-colors">Próximo</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              ABA — CAMPOS PERSONALIZADOS
          ══════════════════════════════════════════════ */}
          {activeTab === 'campos' && (
            <div className="space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total de campos', value: campos.length },
                  { label: 'Ativos',          value: campos.filter(c => c.status === 'Ativo').length },
                  { label: 'Tipo Lista',      value: campos.filter(c => c.tipo === 'Lista').length },
                  { label: 'Tipo Data',       value: campos.filter(c => c.tipo === 'Data').length },
                ].map(s => (
                  <div key={s.label}
                       className="bg-white dark:bg-[#0F172A] rounded-[18px] p-5
                                  border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                                  shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
                    <p className="text-[10px] font-[700] text-[#94A3B8] uppercase tracking-wider mb-1.5">{s.label}</p>
                    <p className="text-[30px] font-[800] text-[#0F172A] dark:text-white leading-none">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Table card */}
              <div className="bg-white dark:bg-[#0F172A] rounded-[24px] overflow-hidden
                              border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                              shadow-[0_10px_30px_rgba(15,23,42,0.07)]">

                <div className="flex items-center justify-between px-6 py-4
                                border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                  <h2 className="text-[15px] font-[700] text-[#0F172A] dark:text-white">
                    Lista de campos
                    <span className="text-[#94A3B8] font-[500] text-[13px] ml-1.5">({filteredCampos.length})</span>
                  </h2>
                  <input
                    value={campoSearch}
                    onChange={e => setCampoSearch(e.target.value)}
                    placeholder="Buscar campo..."
                    className="bg-[#F8FAFC] dark:bg-[#1E293B]
                               border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                               rounded-[10px] px-3.5 py-2 text-[13px] text-[#0F172A] dark:text-white
                               placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.40)]
                               w-48 transition-colors"
                  />
                </div>

                {filteredCampos.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
                      <SlidersHorizontal className="w-6 h-6 text-[#94A3B8]" />
                    </div>
                    <p className="text-[16px] font-[700] text-[#0F172A] dark:text-white mb-1">Nenhum campo encontrado.</p>
                    <p className="text-[13px] text-[#94A3B8]">{campoSearch ? 'Tente outro termo.' : 'Crie o primeiro campo personalizado.'}</p>
                    {!campoSearch && (
                      <button onClick={openNew} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]">
                        <Plus className="w-4 h-4" /> Criar primeiro campo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-[700] uppercase tracking-wider text-[#94A3B8]
                                       border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                          <th className="px-6 py-3.5">Nome do Campo</th>
                          <th className="px-6 py-3.5">Tipo</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCampos.map((campo, idx) => (
                          <tr key={campo.id}
                              className={`hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors
                                ${idx < filteredCampos.length - 1 ? 'border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]' : ''}`}>
                            <td className="px-6 py-4">
                              <span className="font-[600] text-[14px] text-[#0F172A] dark:text-white">{campo.nome}</span>
                            </td>
                            <td className="px-6 py-4">
                              <TipoChip tipo={campo.tipo} />
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleCampoStatus(campo.id)}
                                title="Clique para alternar"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[700] border transition-all cursor-pointer
                                  ${campo.status === 'Ativo'
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100'
                                    : 'text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B] border-[rgba(15,23,42,0.08)] hover:bg-[#E2E8F0]'}`}
                              >
                                {campo.status === 'Ativo' && <CheckCircle2 className="w-3 h-3" />}
                                {campo.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(campo)} title="Editar"
                                        className="p-2 rounded-[8px] text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleteId(campo.id)} title="Excluir"
                                        className="p-2 rounded-[8px] text-[#94A3B8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MODALS — CONTATOS
      ════════════════════════════════════════════════════ */}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[640px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A]">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-gradient-to-br from-[#FACC15]/20 to-[#EAB308]/10 flex items-center justify-center border border-[#FACC15]/20">
                  <UserPlus className="w-[20px] h-[20px] text-[#D4AF37] dark:text-[#FACC15]" />
                </div>
                Adicionar Contato
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X className="w-[20px] h-[20px]" /></button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Nome completo <span className="text-[#EF4444]">*</span></label>
                  <div className="relative group">
                    <User className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                    <input type="text" placeholder="Ex: João da Silva" className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                    <input type="email" placeholder="joao@email.com" className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Telefone</label>
                  <div className="relative group">
                    <Phone className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                    <input type="text" placeholder="(00) 00000-0000" className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Tipo de Contato</label>
                  <div className="relative group">
                    <Users className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                    <select className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[36px] py-[12px] text-[14px] text-[#0F172A] dark:text-white focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all appearance-none cursor-pointer">
                      <option>Visitante</option><option>Membro</option><option>Líder</option><option>Administrador</option>
                    </select>
                    <ChevronDown className="w-[16px] h-[16px] text-[#94A3B8] absolute right-[16px] top-[15px] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Tags (separadas por vírgula)</label>
                <div className="relative group">
                  <Tag className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                  <input type="text" placeholder="Ex: Novo, Interessado, Follow-up" className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Observações</label>
                <div className="relative group">
                  <FileText className="w-[18px] h-[18px] text-[#94A3B8] absolute left-[14px] top-[14px] pointer-events-none group-focus-within:text-[#D4AF37]" />
                  <textarea rows={3} placeholder="Anotações adicionais..." className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-[42px] pr-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[rgba(250,204,21,0.5)] outline-none transition-all resize-none custom-scrollbar" />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-end gap-4 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <button onClick={() => setIsAddModalOpen(false)} className="px-[20px] py-[12px] rounded-[12px] text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] transition-all">Cancelar</button>
              <button onClick={() => setIsAddModalOpen(false)} className="px-[28px] py-[12px] rounded-[12px] bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[600] text-[14px] shadow-[0_6px_16px_rgba(250,204,21,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"><Check className="w-[18px] h-[18px]" /> Salvar Contato</button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[480px] rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="px-6 py-5 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-2"><Download className="w-[20px] h-[20px] text-[#D4AF37]" /> Importar Contatos</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#64748B] hover:bg-[rgba(15,23,42,0.06)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X className="w-[18px] h-[18px]" /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-full border-2 border-dashed border-[rgba(15,23,42,0.15)] dark:border-[rgba(255,255,255,0.15)] rounded-[16px] p-8 flex flex-col items-center justify-center bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors cursor-pointer group">
                <div className="w-[60px] h-[60px] rounded-full bg-[#E0F2FE] dark:bg-[rgba(2,132,199,0.15)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-[28px] h-[28px] text-[#0284C7] dark:text-[#38BDF8]" />
                </div>
                <p className="text-[15px] font-[600] text-[#0F172A] dark:text-white mb-1">Clique para selecionar o arquivo</p>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Suporta planilhas CSV e XLSX (máx 10MB)</p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex justify-end gap-3 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <button onClick={() => setIsImportModalOpen(false)} className="px-[18px] py-[10px] rounded-[10px] text-[14px] font-[600] text-[#64748B] hover:bg-[rgba(15,23,42,0.06)] transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODALS — CAMPOS
      ════════════════════════════════════════════════════ */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/65 backdrop-blur-[6px] p-4"
             onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-[480px] rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.40)] flex flex-col max-h-[90vh]">

            {/* Gold top bar */}
            <div className="h-[3px] flex-shrink-0 bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0
                            border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-[#D4AF37]/12 border border-[#D4AF37]/25
                                flex items-center justify-center">
                  <SlidersHorizontal className="w-[14px] h-[14px] text-[#D4AF37]" />
                </div>
                <h2 className="text-[15px] font-[700] text-[#0F172A] dark:text-white">
                  {editingId ? 'Editar campo' : 'Novo campo'}
                </h2>
              </div>
              <button onClick={closeModal}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-[#94A3B8]
                                 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body - scrollable */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-[10px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-1.5">
                  Nome do campo
                </label>
                <input
                  type="text" autoFocus placeholder="Ex: Data de batismo" value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                             border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                             rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#0F172A] dark:text-white
                             placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.45)]
                             transition-colors"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-[10px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-1.5">
                  Tipo do campo
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIPOS.map(tipo => {
                    const { Icon } = TIPO_META[tipo]
                    const active = form.tipo === tipo
                    return (
                      <button
                        key={tipo}
                        onClick={() => setForm(f => ({ ...f, tipo, opcoes: [] }))}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-[9px] border
                                    text-[11px] font-[600] transition-all
                          ${active
                            ? 'bg-[#D4AF37]/12 border-[#D4AF37]/60 text-[#D4AF37] shadow-[0_1px_6px_rgba(212,175,55,0.18)]'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#64748B] dark:text-[#94A3B8] hover:border-[rgba(212,175,55,0.35)] hover:text-[#D4AF37]'}`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{tipo}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-[12px] bg-[#F8FAFC] dark:bg-[#1E293B]/60
                              border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                              px-4 py-3">
                <p className="text-[9px] font-[700] text-[#94A3B8] uppercase tracking-widest mb-2.5">
                  Pré-visualização
                </p>

                <p className={`text-[12px] font-[600] mb-2 ${
                  form.nome.trim()
                    ? 'text-[#334155] dark:text-[#E2E8F0]'
                    : 'text-[#CBD5E1] dark:text-[#475569] italic'
                }`}>
                  {form.nome.trim() || 'Nome do campo'}
                </p>

                {form.tipo === 'Texto curto' && (
                  <div className="w-full bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-1.5">
                    <span className="text-[12px] text-[#CBD5E1]">Digite aqui...</span>
                  </div>
                )}
                {form.tipo === 'Texto longo' && (
                  <div className="w-full bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-2 h-14 flex items-start">
                    <span className="text-[12px] text-[#CBD5E1]">Área de texto...</span>
                  </div>
                )}
                {form.tipo === 'Número' && (
                  <div className="w-full bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-1.5">
                    <span className="text-[12px] text-[#CBD5E1]">0</span>
                  </div>
                )}
                {form.tipo === 'Data' && (
                  <div className="w-full bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-1.5 flex items-center gap-2">
                    <span className="text-[12px] text-[#CBD5E1]">00/00/0000</span>
                    <Calendar className="w-3.5 h-3.5 text-[#CBD5E1] ml-auto" />
                  </div>
                )}
                {form.tipo === 'Lista' && (
                  <select disabled
                          className="w-full bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.10)] dark:border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-1.5 text-[12px] text-[#CBD5E1] cursor-not-allowed">
                    <option>Selecionar...</option>
                    {form.opcoes.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}
                {form.tipo === 'Sim/Não' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 cursor-default">
                      <span className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] dark:border-[#475569] flex items-center justify-center flex-shrink-0" />
                      <span className="text-[12px] text-[#94A3B8]">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-default">
                      <span className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] dark:border-[#475569] flex items-center justify-center flex-shrink-0" />
                      <span className="text-[12px] text-[#94A3B8]">Não</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Opções dinâmicas — só para Lista */}
              <div className={`grid transition-all duration-300 ease-in-out ${
                form.tipo === 'Lista' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}>
                <div className="overflow-hidden">
                  <div className="pt-0 pb-0.5">
                    <label className="block text-[10px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                      uppercase tracking-wider mb-1.5">
                      Opções
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={optionInput}
                        onChange={e => setOptionInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                        placeholder="Digite uma opção..."
                        className="flex-1 bg-[#F8FAFC] dark:bg-[#1E293B]
                                   border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                                   rounded-[10px] px-3.5 py-2 text-[13px] text-[#0F172A] dark:text-white
                                   placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.45)]
                                   transition-colors"
                      />
                      <button
                        onClick={addOption}
                        disabled={!optionInput.trim()}
                        className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[12px] font-[700]
                                   bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37]
                                   hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all
                                   disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {form.opcoes.length > 0 && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {form.opcoes.map((op, idx) => (
                          <div key={idx}
                               className="flex items-center justify-between px-3 py-1.5 rounded-[8px]
                                          bg-[#F8FAFC] dark:bg-[#1E293B]
                                          border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30
                                               text-[9px] font-[800] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-[13px] text-[#0F172A] dark:text-white">{op}</span>
                            </div>
                            <button onClick={() => removeOption(op)}
                                    className="p-1 rounded-[6px] text-[#94A3B8] hover:text-red-500
                                               hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {form.opcoes.length === 0 && (
                      <p className="text-[11px] text-[#CBD5E1] dark:text-[#475569] text-center py-2">
                        Nenhuma opção adicionada
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle status */}
              <div className="flex items-center justify-between py-1
                              border-t border-[rgba(15,23,42,0.05)] dark:border-[rgba(255,255,255,0.05)] pt-3">
                <div>
                  <p className="text-[13px] font-[600] text-[#0F172A] dark:text-white">Campo ativo</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {form.status === 'Ativo' ? 'Visível para preenchimento' : 'Oculto do formulário'}
                  </p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, status: f.status === 'Ativo' ? 'Inativo' : 'Ativo' }))}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
                    ${form.status === 'Ativo' ? 'bg-[#D4AF37]' : 'bg-[#CBD5E1] dark:bg-[#334155]'}`}
                >
                  <span className={`absolute top-[2px] w-5 h-5 rounded-full bg-white
                                   shadow-[0_1px_4px_rgba(0,0,0,0.20)] transition-all duration-300
                    ${form.status === 'Ativo' ? 'left-[22px]' : 'left-[2px]'}`} />
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex-shrink-0 flex flex-col gap-2
                            border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                            bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20">
              <button
                onClick={handleSaveCampo}
                disabled={!form.nome.trim()}
                className="w-full py-2.5 text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                           rounded-[11px] hover:bg-[#C9A227] transition-colors
                           shadow-[0_4px_12px_rgba(212,175,55,0.30)]
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar campo
              </button>
              <button
                onClick={closeModal}
                className="w-full py-2 text-[12px] font-[600] text-[#94A3B8]
                           hover:text-[#64748B] dark:hover:text-[#CBD5E1] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4"
             onClick={e => { if (e.target === e.currentTarget) setDeleteId(null) }}>
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-[20px] overflow-hidden border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-[16px] font-[700] text-[#0F172A] dark:text-white mb-1">Excluir campo</h2>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-6">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors">Cancelar</button>
                <button onClick={() => handleDeleteCampo(deleteId)} className="flex-1 py-2.5 text-[13px] font-[700] bg-red-500 text-white rounded-[12px] hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.35)]">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
