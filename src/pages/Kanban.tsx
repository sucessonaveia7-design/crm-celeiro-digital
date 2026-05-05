import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare, Clock, ChevronRight, MoreVertical,
  Search, Zap, Plus, X, CheckCircle, Archive,
  Calendar, UserCheck, AlertCircle,
  Trash2, ToggleLeft, ToggleRight,
  Bell, FileText,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useKanbanStore, Stage, KanbanCard, Channel,
  AutomationStatus, AutomationRule, TriggerType,
} from '../store/kanbanStore'

// ─── Stage config ─────────────────────────────────────────────
const STAGE_CONFIG: Record<Stage, { title: string; color: string; dot: string; border: string }> = {
  'Novo Visitante':        { title: 'Novo Visitante',        color: '#3B82F6', dot: '#3B82F6', border: 'rgba(59,130,246,0.28)'  },
  'Em Atendimento':        { title: 'Em Atendimento',        color: '#EAB308', dot: '#EAB308', border: 'rgba(234,179,8,0.28)'   },
  'Em Acompanhamento':     { title: 'Em Acompanhamento',     color: '#F59E0B', dot: '#F59E0B', border: 'rgba(245,158,11,0.28)'  },
  'Pedido de Oração':      { title: 'Pedido de Oração',      color: '#8B5CF6', dot: '#8B5CF6', border: 'rgba(139,92,246,0.28)'  },
  'Agendamento Pastoral':  { title: 'Agendamento Pastoral',  color: '#06B6D4', dot: '#06B6D4', border: 'rgba(6,182,212,0.28)'   },
  'Discipulado':           { title: 'Discipulado',           color: '#22C55E', dot: '#22C55E', border: 'rgba(34,197,94,0.28)'   },
  'Batismo':               { title: 'Batismo',               color: '#1D4ED8', dot: '#1D4ED8', border: 'rgba(29,78,216,0.28)'   },
  'Membro Ativo':          { title: 'Membro Ativo',          color: '#16A34A', dot: '#16A34A', border: 'rgba(22,163,74,0.28)'   },
  'Veio à Igreja':         { title: 'Veio à Igreja',         color: '#84CC16', dot: '#84CC16', border: 'rgba(132,204,22,0.28)'  },
  'Agendamento de Visitas':{ title: 'Agendamento de Visitas',color: '#EC4899', dot: '#EC4899', border: 'rgba(236,72,153,0.28)'  },
}

const ALL_STAGES: Stage[] = [
  'Novo Visitante', 'Em Atendimento', 'Em Acompanhamento', 'Pedido de Oração',
  'Agendamento Pastoral', 'Discipulado', 'Batismo', 'Membro Ativo',
  'Veio à Igreja', 'Agendamento de Visitas',
]

// ─── Badge config ─────────────────────────────────────────────
const STATUS_BADGE: Partial<Record<AutomationStatus, { label: string; color: string; bg: string }>> = {
  nova_mensagem:  { label: 'Nova mensagem',  color: '#60A5FA', bg: 'rgba(59,130,246,0.15)'  },
  em_atendimento: { label: 'Atendendo',      color: '#FCD34D', bg: 'rgba(245,158,11,0.12)'  },
  atencao:        { label: 'Atenção',        color: '#FBBF24', bg: 'rgba(245,158,11,0.18)'  },
  atrasado:       { label: 'Atrasado',       color: '#F87171', bg: 'rgba(239,68,68,0.15)'   },
  inativo:        { label: 'Inativo',        color: '#94A3B8', bg: 'rgba(100,116,139,0.12)' },
}

// ─── Channel config ───────────────────────────────────────────
const CHANNEL_META: Record<Channel, { label: string; color: string }> = {
  whatsapp:          { label: 'WhatsApp',          color: '#22C55E' },
  whatsapp_official: { label: 'WhatsApp Oficial',  color: '#1D9B52' },
  instagram:         { label: 'Instagram',         color: '#E1306C' },
  email:             { label: 'Email',             color: '#60A5FA' },
  widget:            { label: 'Widget',            color: '#A78BFA' },
  interno:           { label: 'Interno',           color: '#94A3B8' },
}


const ATENDENTES = ['Maiclei Pereira', 'Ana Silva', 'Carlos Santos', 'Maria Lima', 'Pedro Alves']

// ─── Helpers ──────────────────────────────────────────────────
function isFollowUpToday(card: KanbanCard): boolean {
  if (!card.nextFollowUpAt) return false
  const today = new Date()
  const followUp = new Date(card.nextFollowUpAt)
  return (
    followUp.getDate()     === today.getDate()     &&
    followUp.getMonth()    === today.getMonth()    &&
    followUp.getFullYear() === today.getFullYear()
  )
}

function isFollowUpOverdue(card: KanbanCard): boolean {
  if (!card.nextFollowUpAt) return false
  return new Date(card.nextFollowUpAt) < new Date()
}

// ─── Modals ───────────────────────────────────────────────────
function NoteModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const { addNote } = useKanbanStore()
  const [text, setText] = useState(card.note || '')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 16, padding: 24, width: 360, zIndex: 1,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 15 }}>Observação — {card.contactName}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Escreva uma observação interna..."
          style={{
            width: '100%', background: '#1E293B', border: '1px solid #334155',
            borderRadius: 10, padding: '10px 12px', color: '#F1F5F9', fontSize: 13,
            fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.50)')}
          onBlur={e => (e.currentTarget.style.borderColor = '#334155')}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button onClick={() => { addNote(card.id, text); onClose() }} style={{ flex: 2, padding: '9px', borderRadius: 10, border: 'none', background: '#EAB308', color: '#0F172A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar nota</button>
        </div>
      </div>
    </div>
  )
}

function AssignModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const { assignCard } = useKanbanStore()
  const [selected, setSelected] = useState(card.assignedTo || '')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 16, padding: 24, width: 320, zIndex: 1,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 15 }}>Atribuir responsável</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ATENDENTES.map(a => (
            <button key={a} onClick={() => setSelected(a)}
              style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${selected === a ? 'rgba(234,179,8,0.50)' : '#1E293B'}`,
                background: selected === a ? 'rgba(234,179,8,0.08)' : 'transparent',
                color: selected === a ? '#EAB308' : '#CBD5E1', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#EAB308', flexShrink: 0 }}>
                {a[0]}
              </div>
              {a}
              {selected === a && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#EAB308' }} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button onClick={() => { if (selected) assignCard(card.id, selected); onClose() }} style={{ flex: 2, padding: '9px', borderRadius: 10, border: 'none', background: '#EAB308', color: '#0F172A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

function FollowUpModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const { setFollowUp } = useKanbanStore()
  const [value, setValue] = useState(
    card.nextFollowUpAt ? new Date(card.nextFollowUpAt).toISOString().slice(0, 16) : ''
  )
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 16, padding: 24, width: 320, zIndex: 1,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 15 }}>Agendar follow-up</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
        </div>
        <input
          type="datetime-local"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', background: '#1E293B', border: '1px solid #334155',
            borderRadius: 10, padding: '10px 12px', color: '#F1F5F9', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button onClick={() => { if (value) setFollowUp(card.id, new Date(value).toISOString()); onClose() }} style={{ flex: 2, padding: '9px', borderRadius: 10, border: 'none', background: '#EAB308', color: '#0F172A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Agendar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Automation Panel ─────────────────────────────────────────
const TRIGGER_LABELS: Record<TriggerType, string> = {
  keyword: 'Mensagem contém palavra-chave',
  inactivity: 'Sem resposta por X horas',
  new_conversation: 'Nova conversa criada',
  status_change: 'Status alterado',
}

function AutomationPanel({ onClose }: { onClose: () => void }) {
  const { rules, addRule, updateRule, deleteRule } = useKanbanStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{
    name: string; triggerType: TriggerType; keywords: string;
    hoursInactive: string; moveTo: Stage | ''; setBadge: AutomationStatus | '';
  }>({
    name: '', triggerType: 'keyword', keywords: '',
    hoursInactive: '', moveTo: '', setBadge: '',
  })

  const handleSave = () => {
    if (!form.name.trim()) return
    const rule: Omit<AutomationRule, 'id'> = {
      name: form.name.trim(),
      triggerType: form.triggerType,
      condition: {
        keywords: form.triggerType === 'keyword'
          ? form.keywords.split(',').map(k => k.trim()).filter(Boolean)
          : undefined,
        hoursInactive: form.triggerType === 'inactivity' && form.hoursInactive
          ? Number(form.hoursInactive) : undefined,
      },
      action: {
        moveTo: form.moveTo || undefined,
        setBadge: form.setBadge || undefined,
      },
      isActive: true,
    }
    addRule(rule)
    setShowForm(false)
    setForm({ name: '', triggerType: 'keyword', keywords: '', hoursInactive: '', moveTo: '', setBadge: '' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: '#0A1628', border: '1px solid #1E293B',
    borderRadius: 9, padding: '8px 12px', color: '#F1F5F9', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingTop: 24, paddingRight: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.60)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 20, width: 480, maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto', zIndex: 1,
        boxShadow: '0 24px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(234,179,8,0.10)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, background: '#0F172A', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#F1F5F9', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} style={{ color: '#EAB308' }} /> Automações do Kanban
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{rules.length} regra{rules.length !== 1 ? 's' : ''} configurada{rules.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={14} /></button>
        </div>

        {/* Rules list */}
        <div style={{ padding: '12px 24px' }}>
          {rules.map(rule => (
            <div key={rule.id} style={{
              background: '#0A1628', border: '1px solid #1E293B', borderRadius: 12,
              padding: '12px 14px', marginBottom: 8,
              opacity: rule.isActive ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#E2E8F0', fontSize: 13 }}>{rule.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
                    {TRIGGER_LABELS[rule.triggerType]}
                    {rule.condition.keywords?.length ? ` • "${rule.condition.keywords.slice(0,3).join('", "')}"` : ''}
                    {rule.condition.hoursInactive ? ` • ${rule.condition.hoursInactive}h` : ''}
                  </div>
                  {(rule.action.moveTo || rule.action.setBadge) && (
                    <div style={{ fontSize: 11, color: '#EAB308', marginTop: 4 }}>
                      → {[rule.action.moveTo && `Mover para "${rule.action.moveTo}"`, rule.action.setBadge && `Badge: ${rule.action.setBadge}`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => updateRule(rule.id, { isActive: !rule.isActive })}
                    title={rule.isActive ? 'Desativar' : 'Ativar'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: rule.isActive ? '#22C55E' : '#475569', display: 'flex', alignItems: 'center' }}
                  >
                    {rule.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Deletar regra "${rule.name}"?`)) deleteRule(rule.id) }}
                    style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                  ><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New rule form */}
        {showForm ? (
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ background: '#0A1628', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#EAB308', fontSize: 13, marginBottom: 14 }}>Nova regra</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input style={inputStyle} placeholder="Nome da regra" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <select style={inputStyle} value={form.triggerType} onChange={e => setForm(p => ({ ...p, triggerType: e.target.value as TriggerType }))}>
                  <option value="keyword">Mensagem contém palavra-chave</option>
                  <option value="inactivity">Sem resposta por X horas</option>
                  <option value="new_conversation">Nova conversa criada</option>
                  <option value="status_change">Status alterado</option>
                </select>
                {form.triggerType === 'keyword' && (
                  <input style={inputStyle} placeholder="Palavras-chave (separadas por vírgula)" value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} />
                )}
                {form.triggerType === 'inactivity' && (
                  <input style={inputStyle} type="number" placeholder="Horas de inatividade" value={form.hoursInactive} onChange={e => setForm(p => ({ ...p, hoursInactive: e.target.value }))} />
                )}
                <select style={inputStyle} value={form.moveTo} onChange={e => setForm(p => ({ ...p, moveTo: e.target.value as Stage | '' }))}>
                  <option value="">Não mover (ação de badge)</option>
                  {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select style={inputStyle} value={form.setBadge} onChange={e => setForm(p => ({ ...p, setBadge: e.target.value as AutomationStatus | '' }))}>
                  <option value="">Sem badge</option>
                  <option value="nova_mensagem">Nova mensagem</option>
                  <option value="em_atendimento">Em atendimento</option>
                  <option value="atencao">Atenção</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="inativo">Inativo</option>
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: '1px solid #334155', background: 'transparent', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  <button onClick={handleSave} style={{ flex: 2, padding: '8px', borderRadius: 9, border: 'none', background: '#EAB308', color: '#0F172A', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar regra</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 24px 24px' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%', padding: '11px', borderRadius: 12,
                border: '1px dashed rgba(234,179,8,0.35)', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#EAB308',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
              }}
            >
              <Plus size={14} /> Nova regra de automação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quick Actions Menu ───────────────────────────────────────
function QuickMenu({
  card, onClose, onOpenChat,
  onNote, onAssign, onFollowUp,
}: {
  card: KanbanCard
  onClose: () => void
  onOpenChat: () => void
  onNote: () => void
  onAssign: () => void
  onFollowUp: () => void
}) {
  const { archiveCard, moveCard } = useKanbanStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const actions = [
    { icon: MessageSquare, label: 'Abrir chat',         action: onOpenChat,                                                    color: '#60A5FA' },
    { icon: UserCheck,     label: 'Atribuir responsável', action: onAssign,                                                    color: '#A78BFA' },
    { icon: Calendar,      label: 'Agendar follow-up',   action: onFollowUp,                                                   color: '#EAB308' },
    { icon: FileText,      label: 'Adicionar nota',       action: onNote,                                                       color: '#10B981' },
    { icon: CheckCircle,   label: 'Membro Ativo',           action: () => { moveCard(card.id, 'Membro Ativo'); onClose() },  color: '#16A34A' },
    { icon: Archive,       label: 'Arquivar card',        action: () => { archiveCard(card.id); onClose() },                   color: '#94A3B8' },
  ]

  return (
    <div ref={menuRef} style={{
      position: 'absolute', right: 0, top: 32, zIndex: 50,
      background: '#0F172A', border: '1px solid #1E293B',
      borderRadius: 12, padding: '6px',
      boxShadow: '0 12px 36px rgba(0,0,0,0.55)',
      minWidth: 200,
    }}>
      {actions.map(({ icon: Icon, label, action, color }) => (
        <button
          key={label}
          onClick={action}
          style={{
            width: '100%', textAlign: 'left', padding: '8px 12px',
            borderRadius: 8, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            color: '#CBD5E1', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#F1F5F9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1' }}
        >
          <Icon size={13} style={{ color, flexShrink: 0 }} />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Kanban Card ──────────────────────────────────────────────
function KCard({
  card, onOpenChat,
  onNote, onAssign, onFollowUp,
}: {
  card: KanbanCard
  onOpenChat: () => void
  onNote: () => void
  onAssign: () => void
  onFollowUp: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const badge = STATUS_BADGE[card.automationStatus]
  const ch = CHANNEL_META[card.channel]
  const followUpToday = isFollowUpToday(card)
  const followUpOverdue = isFollowUpOverdue(card)

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('cardId', card.id)}
      style={{
        background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 14, padding: 14, cursor: 'grab',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(212,175,55,0.40)'
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#1E293B'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(234,179,8,0.20), #0A1628)',
            border: '1.5px solid rgba(234,179,8,0.40)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#EAB308',
          }}>
            {(card.contactName || 'C')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.contactName}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{card.number}</div>
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 26, height: 26, borderRadius: 7, border: 'none',
              background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1E293B'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
          ><MoreVertical size={14} /></button>
          {menuOpen && (
            <QuickMenu
              card={card} onClose={() => setMenuOpen(false)}
              onOpenChat={onOpenChat} onNote={onNote}
              onAssign={onAssign} onFollowUp={onFollowUp}
            />
          )}
        </div>
      </div>

      {/* Meta row: channel + assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
          background: `${ch.color}18`, color: ch.color,
          border: `1px solid ${ch.color}35`,
        }}>{ch.label}</span>
        {card.assignedTo && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#94A3B8',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <UserCheck size={10} style={{ color: '#64748B' }} />{card.assignedTo.split(' ')[0]}
          </span>
        )}
        {!card.assignedTo && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 3 }}>
            <AlertCircle size={10} /> Sem responsável
          </span>
        )}
      </div>

      {/* Last message */}
      <div style={{
        background: '#0A1628', borderRadius: 9, padding: '8px 10px',
        marginBottom: 8, border: '1px solid #1E293B',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageSquare size={10} /> Última mensagem
          </span>
          <span style={{ fontSize: 10, color: '#334155', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {card.lastMessageTime}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {card.lastMessage || 'Nenhuma mensagem.'}
        </p>
      </div>

      {/* Note preview */}
      {card.note && (
        <div style={{ fontSize: 11, color: '#64748B', background: '#0A1628', borderRadius: 7, padding: '5px 8px', marginBottom: 8, border: '1px solid #1E293B' }}>
          📝 {card.note.length > 60 ? card.note.slice(0, 60) + '…' : card.note}
        </div>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {card.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
              background: 'rgba(234,179,8,0.10)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.22)',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {card.unread > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Bell size={9} /> {card.unread} nova{card.unread > 1 ? 's' : ''}
          </span>
        )}
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: badge.bg, color: badge.color, border: `1px solid ${badge.color}35` }}>
            {badge.label}
          </span>
        )}
        {(followUpToday || followUpOverdue) && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: followUpOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: followUpOverdue ? '#F87171' : '#EAB308', border: `1px solid ${followUpOverdue ? 'rgba(239,68,68,0.30)' : 'rgba(234,179,8,0.30)'}` }}>
            📅 {followUpOverdue ? 'Follow-up atrasado' : 'Follow-up hoje'}
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #1E293B' }}>
        <button
          onClick={onOpenChat}
          style={{
            fontSize: 12, fontWeight: 700, color: '#D4AF37',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
            padding: '4px 6px', borderRadius: 7, transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.10)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
        >
          Abrir Chat <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function Kanban() {
  const { cards, moveCard, applyInactivityRules, loadKanbanCards } = useKanbanStore()
  const navigate = useNavigate()

  // Filters
  const [search,         setSearch]         = useState('')
  const [filterChannel,  setFilterChannel]  = useState<Channel | 'all'>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterOverdue,  setFilterOverdue]  = useState(false)
  const [showArchived,   setShowArchived]   = useState(false)

  // UI state
  const [dragOver,        setDragOver]        = useState<Stage | null>(null)
  const [showAutomation,  setShowAutomation]  = useState(false)
  const [noteCard,        setNoteCard]        = useState<KanbanCard | null>(null)
  const [assignCard,      setAssignCard_]     = useState<KanbanCard | null>(null)
  const [followUpCard,    setFollowUpCard]    = useState<KanbanCard | null>(null)
  const [isLoading,       setIsLoading]       = useState(true)
  const [kanbanError,     setKanbanError]     = useState<string | null>(null)

  // Load cards on mount, then apply inactivity rules every 60s
  useEffect(() => {
    loadKanbanCards().then(() => {
      applyInactivityRules()
      setIsLoading(false)
    })
    const interval = setInterval(applyInactivityRules, 60_000)
    return () => clearInterval(interval)
  }, [loadKanbanCards, applyInactivityRules])

  // ESC closes automation panel
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAutomation(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  // Filter logic
  const visibleCards = cards.filter(c => {
    if (c.isArchived !== showArchived) return false
    if (search && !c.contactName.toLowerCase().includes(search.toLowerCase()) &&
        !c.number.includes(search)) return false
    if (filterChannel !== 'all' && c.channel !== filterChannel) return false
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned' && c.assignedTo) return false
      if (filterAssignee !== 'unassigned' && c.assignedTo !== filterAssignee) return false
    }
    if (filterOverdue && c.automationStatus !== 'atrasado' && c.automationStatus !== 'atencao') return false
    return true
  })

  const totalVisible = visibleCards.length
  const totalUnread  = visibleCards.reduce((s, c) => s + c.unread, 0)

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('cardId')
    if (id) { moveCard(id, stage) }
    setDragOver(null)
  }
  const openKanbanChat = (card: KanbanCard) => {
    navigate('/mensagens?canal=whatsapp', {
      state: {
        selectedConversationId: card.conversationId ?? card.id,
        selectedContactId:      card.contactId      ?? card.id,
        selectedPhone:          card.number,
        selectedName:           card.contactName,
        source:                 'kanban',
      },
    })
  }

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 8, border: `1px solid ${active ? 'rgba(234,179,8,0.45)' : 'rgba(255,255,255,0.08)'}`,
    background: active ? 'rgba(234,179,8,0.12)' : 'transparent',
    color: active ? '#EAB308' : '#64748B', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
  })

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
    background: '#0F172A', color: '#94A3B8', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#020617', padding: '28px 28px 0', overflow: 'hidden',
    }}>
      {/* ── Error banner ── */}
      {kanbanError && (
        <div style={{
          marginBottom: 12, padding: '10px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)',
          color: '#FCA5A5', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {kanbanError}
          <button onClick={() => setKanbanError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FCA5A5', padding: 0, lineHeight: 1 }}>
            <X size={14} />
          </button>
        </div>
      )}
      {/* ── Header ── */}
      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
              Kanban Pastoral
              {totalUnread > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(59,130,246,0.18)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.30)' }}>
                  {totalUnread} nova{totalUnread > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>
              Acompanhamento ministerial · {totalVisible} pessoa{totalVisible !== 1 ? 's' : ''} · {cards.filter(c => !c.isArchived).length} ativa{cards.filter(c => !c.isArchived).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowArchived(v => !v)}
              style={filterBtnStyle(showArchived)}
            >
              <Archive size={12} style={{ display: 'inline', marginRight: 4 }} />
              {showArchived ? 'Ver ativos' : 'Arquivados'}
            </button>
            <button
              onClick={() => setShowAutomation(true)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(234,179,8,0.35)',
                background: 'rgba(234,179,8,0.08)', color: '#EAB308',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(234,179,8,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(234,179,8,0.08)' }}
            >
              <Zap size={13} /> Automações
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
                background: '#0F172A', color: '#F1F5F9', fontSize: 12, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.40)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Channel filter */}
          <select value={filterChannel} onChange={e => setFilterChannel(e.target.value as Channel | 'all')} style={selectStyle}>
            <option value="all">Todos os canais</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="email">Email</option>
            <option value="widget">Widget</option>
            <option value="interno">Interno</option>
          </select>

          {/* Assignee filter */}
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={selectStyle}>
            <option value="all">Todos os responsáveis</option>
            <option value="unassigned">Sem responsável</option>
            {ATENDENTES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Overdue filter */}
          <button onClick={() => setFilterOverdue(v => !v)} style={filterBtnStyle(filterOverdue)}>
            <AlertCircle size={11} style={{ display: 'inline', marginRight: 4 }} />
            Atrasados
          </button>

          {(search || filterChannel !== 'all' || filterAssignee !== 'all' || filterOverdue) && (
            <button
              onClick={() => { setSearch(''); setFilterChannel('all'); setFilterAssignee('all'); setFilterOverdue(false) }}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#F87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <X size={11} style={{ display: 'inline', marginRight: 3 }} />Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Board ── */}
      <div style={{ flex: 1, display: 'flex', gap: 16, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 28 }}>
        {ALL_STAGES.map(stage => {
          const cfg = STAGE_CONFIG[stage]
          const stageCards = visibleCards.filter(c => c.stage === stage)
          const isDragTarget = dragOver === stage

          return (
            <div
              key={stage}
              onDragOver={e => { handleDragOver(e); setDragOver(stage) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, stage)}
              style={{
                flexShrink: 0, width: 290,
                background: isDragTarget ? 'rgba(234,179,8,0.04)' : '#0A1628',
                border: `1px solid ${isDragTarget ? 'rgba(234,179,8,0.35)' : cfg.border}`,
                borderRadius: 16, display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Column header */}
              <div style={{
                padding: '12px 14px 10px',
                borderBottom: `1px solid ${cfg.border}`,
                borderRadius: '16px 16px 0 0',
                background: isDragTarget ? `${cfg.color}08` : 'transparent',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: '#E2E8F0', fontSize: 13 }}>{cfg.title}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: cfg.color,
                    background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
                    padding: '1px 8px', borderRadius: 999,
                  }}>
                    {stageCards.length}
                  </span>
                </div>
                {isDragTarget && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#EAB308', fontWeight: 600, textAlign: 'center' }}>
                    Solte aqui para mover
                  </div>
                )}
              </div>

              {/* Cards scroll */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isLoading ? (
                  // Skeleton loading
                  [1, 2].map(n => (
                    <div key={n} style={{ background: '#0F172A', borderRadius: 14, padding: 14, border: '1px solid #1E293B' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1E293B' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, background: '#1E293B', borderRadius: 4, marginBottom: 5, width: '70%' }} />
                          <div style={{ height: 10, background: '#1E293B', borderRadius: 4, width: '45%' }} />
                        </div>
                      </div>
                      <div style={{ height: 52, background: '#1E293B', borderRadius: 8 }} />
                    </div>
                  ))
                ) : stageCards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 12px', color: '#334155' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>○</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Nenhum card</div>
                    {isDragTarget && <div style={{ fontSize: 11, color: '#EAB308', marginTop: 4 }}>Solte aqui</div>}
                  </div>
                ) : stageCards.map(card => (
                  <KCard
                    key={card.id}
                    card={card}
                    onOpenChat={() => openKanbanChat(card)}
                    onNote={() => setNoteCard(card)}
                    onAssign={() => setAssignCard_(card)}
                    onFollowUp={() => setFollowUpCard(card)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modals ── */}
      {showAutomation && <AutomationPanel onClose={() => setShowAutomation(false)} />}
      {noteCard      && <NoteModal     card={noteCard}     onClose={() => setNoteCard(null)}     />}
      {assignCard    && <AssignModal   card={assignCard}   onClose={() => setAssignCard_(null)}  />}
      {followUpCard  && <FollowUpModal card={followUpCard} onClose={() => setFollowUpCard(null)} />}
    </div>
  )
}
