import { useState, useEffect } from 'react'
import {
  SlidersHorizontal, Plus, Pencil, Trash2, X,
  List, AlignLeft, Type, Hash, Calendar, ToggleLeft,
} from 'lucide-react'

/* ─── Types ───────────────────────────────────────────── */

type FieldType = 'Texto curto' | 'Texto longo' | 'Número' | 'Data' | 'Lista' | 'Sim/Não'

interface Campo {
  id: string
  nome: string
  tipo: FieldType
  opcoes?: string[]
  criadoEm: string
}

/* ─── Constants ───────────────────────────────────────── */

const STORAGE_KEY = 'campos_personalizados'

const TIPOS: FieldType[] = ['Texto curto', 'Texto longo', 'Número', 'Data', 'Lista', 'Sim/Não']

const TIPO_META: Record<FieldType, { Icon: React.ElementType; color: string }> = {
  'Texto curto': { Icon: Type,        color: 'text-blue-500   bg-blue-500/10   border-blue-500/20'   },
  'Texto longo': { Icon: AlignLeft,   color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  'Número':      { Icon: Hash,        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  'Data':        { Icon: Calendar,    color: 'text-cyan-500   bg-cyan-500/10   border-cyan-500/20'   },
  'Lista':       { Icon: List,        color: 'text-[#D4AF37]  bg-[#D4AF37]/10  border-[#D4AF37]/20'  },
  'Sim/Não':     { Icon: ToggleLeft,  color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
}

const INITIAL_CAMPOS: Campo[] = [
  {
    id: '1', nome: 'Ministério', tipo: 'Lista',
    opcoes: ['Jovens', 'Louvor', 'Infantil', 'Intercessão'], criadoEm: '2024-01-10',
  },
  { id: '2', nome: 'Data de nascimento', tipo: 'Data', criadoEm: '2024-01-10' },
  {
    id: '3', nome: 'Estado civil', tipo: 'Lista',
    opcoes: ['Solteiro', 'Casado', 'Viúvo'], criadoEm: '2024-01-11',
  },
  {
    id: '4', nome: 'Tempo na igreja', tipo: 'Lista',
    opcoes: ['Novo visitante', '1 mês', '6 meses', '1 ano ou mais'], criadoEm: '2024-01-12',
  },
  {
    id: '5', nome: 'Interesse', tipo: 'Lista',
    opcoes: ['Batismo', 'Discipulado', 'Célula', 'Aconselhamento'], criadoEm: '2024-01-13',
  },
  { id: '6', nome: 'Observações', tipo: 'Texto longo', criadoEm: '2024-01-14' },
]

const EMPTY_FORM = { nome: '', tipo: 'Texto curto' as FieldType, opcoes: '' }

/* ─── Helpers ─────────────────────────────────────────── */

function loadCampos(): Campo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_CAMPOS
}

/* ─── Sub-components ──────────────────────────────────── */

function TipoChip({ tipo }: { tipo: FieldType }) {
  const { Icon, color } = TIPO_META[tipo]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[700] border ${color}`}>
      <Icon className="w-3 h-3" />
      {tipo}
    </span>
  )
}

/* ─── Main component ──────────────────────────────────── */

export default function CamposPersonalizados() {
  const [campos,    setCampos]    = useState<Campo[]>(loadCampos)
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form,      setForm]      = useState<{ nome: string; tipo: FieldType; opcoes: string }>(EMPTY_FORM)
  const [deleteId,  setDeleteId]  = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campos))
  }, [campos])

  const filtered = campos.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.tipo.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(campo: Campo) {
    setForm({ nome: campo.nome, tipo: campo.tipo, opcoes: campo.opcoes?.join(', ') || '' })
    setEditingId(campo.id)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  function handleSave() {
    if (!form.nome.trim()) return
    const opcoes = form.tipo === 'Lista' && form.opcoes.trim()
      ? form.opcoes.split(',').map(o => o.trim()).filter(Boolean)
      : undefined

    if (editingId) {
      setCampos(prev => prev.map(c =>
        c.id === editingId ? { ...c, nome: form.nome.trim(), tipo: form.tipo, opcoes } : c
      ))
    } else {
      const novo: Campo = {
        id:       Date.now().toString(),
        nome:     form.nome.trim(),
        tipo:     form.tipo,
        opcoes,
        criadoEm: new Date().toISOString().split('T')[0],
      }
      setCampos(prev => [...prev, novo])
    }
    closeModal()
  }

  function handleDelete(id: string) {
    setCampos(prev => prev.filter(c => c.id !== id))
    setDeleteId(null)
  }

  const listOptions = form.tipo === 'Lista' && form.opcoes.trim()
    ? form.opcoes.split(',').map(o => o.trim()).filter(Boolean)
    : []

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 transition-opacity duration-[220ms] ease-in-out">
        <div className="max-w-[960px] mx-auto w-full">

          {/* ── Header ── */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[12px] bg-[#D4AF37]/10 border border-[#D4AF37]/20
                                flex items-center justify-center flex-shrink-0">
                  <SlidersHorizontal className="w-[18px] h-[18px] text-[#D4AF37]" />
                </div>
                <h1 className="text-[26px] font-[800] text-[#0F172A] dark:text-white tracking-tight">
                  Campos Personalizados
                </h1>
              </div>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] ml-[52px]">
                Crie informações extras para organizar membros, visitantes e líderes.
              </p>
            </div>

            <button
              onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-[700]
                         bg-[#D4AF37] text-[#0F172A] hover:bg-[#C9A227] transition-colors
                         shadow-[0_4px_12px_rgba(212,175,55,0.35)] whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Novo Campo
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total de campos', value: campos.length },
              { label: 'Tipo Lista',      value: campos.filter(c => c.tipo === 'Lista').length },
              { label: 'Tipo Data',       value: campos.filter(c => c.tipo === 'Data').length },
              { label: 'Outros tipos',    value: campos.filter(c => c.tipo !== 'Lista' && c.tipo !== 'Data').length },
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

          {/* ── Table card ── */}
          <div className="bg-white dark:bg-[#0F172A] rounded-[24px] overflow-hidden
                          border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                          shadow-[0_10px_30px_rgba(15,23,42,0.07)]">

            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4
                            border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="text-[15px] font-[700] text-[#0F172A] dark:text-white">
                Lista de campos <span className="text-[#94A3B8] font-[500] text-[13px] ml-1">({filtered.length})</span>
              </h2>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar campo..."
                className="bg-[#F8FAFC] dark:bg-[#1E293B]
                           border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                           rounded-[10px] px-3.5 py-2 text-[13px] text-[#0F172A] dark:text-white
                           placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.40)]
                           w-48 transition-colors"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B]
                                flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <p className="text-[16px] font-[700] text-[#0F172A] dark:text-white mb-1">
                  Nenhum campo encontrado.
                </p>
                <p className="text-[13px] text-[#94A3B8]">
                  {search ? 'Tente outro termo de busca.' : 'Crie seu primeiro campo personalizado.'}
                </p>
                {!search && (
                  <button
                    onClick={openNew}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px]
                               text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                               hover:bg-[#C9A227] transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
                  >
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
                      <th className="px-6 py-3.5">Nome</th>
                      <th className="px-6 py-3.5">Tipo</th>
                      <th className="px-6 py-3.5">Opções</th>
                      <th className="px-6 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((campo, idx) => (
                      <tr key={campo.id}
                          className={`hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors
                            ${idx < filtered.length - 1
                              ? 'border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]'
                              : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-[600] text-[14px] text-[#0F172A] dark:text-white">
                            {campo.nome}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <TipoChip tipo={campo.tipo} />
                        </td>
                        <td className="px-6 py-4">
                          {campo.opcoes && campo.opcoes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {campo.opcoes.slice(0, 3).map(op => (
                                <span key={op}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-[600]
                                                 bg-[#F1F5F9] dark:bg-[#1E293B]
                                                 text-[#475569] dark:text-[#94A3B8]">
                                  {op}
                                </span>
                              ))}
                              {campo.opcoes.length > 3 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-[600]
                                                 bg-[#F1F5F9] dark:bg-[#1E293B] text-[#94A3B8]">
                                  +{campo.opcoes.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#CBD5E1] dark:text-[#334155]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(campo)}
                              title="Editar"
                              className="p-2 rounded-[8px] text-[#94A3B8]
                                         hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(campo.id)}
                              title="Excluir"
                              className="p-2 rounded-[8px] text-[#94A3B8]
                                         hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
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
      </div>

      {/* ═══════════════════════════════════════════
          MODAL — Novo / Editar Campo
      ═══════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#F0C840]" />

            <div className="flex items-center justify-between p-6
                            border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
              <h2 className="text-[17px] font-[700] text-[#0F172A] dark:text-white">
                {editingId ? 'Editar campo' : 'Novo campo'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8]
                           hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Nome do campo */}
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-1.5">
                  Nome do campo
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Data de batismo"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                             border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                             rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                             placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.40)]
                             transition-colors"
                />
              </div>

              {/* Tipo do campo */}
              <div>
                <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                  uppercase tracking-wider mb-2">
                  Tipo do campo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS.map(tipo => {
                    const { Icon } = TIPO_META[tipo]
                    const active   = form.tipo === tipo
                    return (
                      <button
                        key={tipo}
                        onClick={() => setForm(f => ({ ...f, tipo }))}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-[12px]
                                    border text-[11px] font-[600] transition-all
                          ${active
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_2px_8px_rgba(212,175,55,0.20)]'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#64748B] dark:text-[#94A3B8] hover:border-[rgba(212,175,55,0.30)] hover:text-[#D4AF37]'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {tipo}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Opções — só quando tipo === Lista */}
              {form.tipo === 'Lista' && (
                <div>
                  <label className="block text-[11px] font-[700] text-[#64748B] dark:text-[#94A3B8]
                                    uppercase tracking-wider mb-1.5">
                    Opções
                    <span className="ml-1 normal-case font-[400] text-[#94A3B8]">(separadas por vírgula)</span>
                  </label>
                  <textarea
                    placeholder="Ex: Jovens, Louvor, Infantil"
                    value={form.opcoes}
                    onChange={e => setForm(f => ({ ...f, opcoes: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B]
                               border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                               rounded-[12px] px-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white
                               placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(212,175,55,0.40)]
                               transition-colors resize-none"
                  />
                  {listOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {listOptions.map(op => (
                        <span key={op}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-[600]
                                         bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37]">
                          {op}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]
                            flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]
                           hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.nome.trim()}
                className="px-5 py-2.5 text-[13px] font-[700] bg-[#D4AF37] text-[#0F172A]
                           rounded-[12px] hover:bg-[#C9A227] transition-colors
                           shadow-[0_4px_12px_rgba(212,175,55,0.35)]
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar campo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL — Confirmar Exclusão
      ═══════════════════════════════════════════ */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[6px] p-4"
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null) }}
        >
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-[20px] overflow-hidden
                          border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]
                          shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="h-[3px] bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10
                              flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-[16px] font-[700] text-[#0F172A] dark:text-white mb-1">Excluir campo</h2>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-6">
                Tem certeza? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]
                             hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[12px] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 text-[13px] font-[700] bg-red-500 text-white
                             rounded-[12px] hover:bg-red-600 transition-colors
                             shadow-[0_4px_12px_rgba(239,68,68,0.35)]"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
