import { Phone, Video, Info, MoreVertical, CheckCircle2, Clock, Wifi } from 'lucide-react'
import type { Conversation } from './types'

interface Props {
  conversation: Conversation
}

const STATUS_LABEL: Record<Conversation['status'], { label: string; color: string }> = {
  atendendo:  { label: 'Atendimento ativo',   color: '#34D399' },
  aguardando: { label: 'Aguardando',           color: '#FBBF24' },
  resolvido:  { label: 'Resolvido',            color: '#94A3B8' },
}

const StatusIcon = ({ status }: { status: Conversation['status'] }) => {
  if (status === 'atendendo')  return <Wifi         size={11} color="#34D399" />
  if (status === 'aguardando') return <Clock        size={11} color="#FBBF24" />
  return                              <CheckCircle2 size={11} color="#94A3B8" />
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

function ActionBtn({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      style={{
        width:          34, height: 34,
        borderRadius:   9,
        border:         '1px solid rgba(255,255,255,0.08)',
        background:     'rgba(255,255,255,0.04)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        transition:     'all 150ms',
        color:          '#94A3B8',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background   = 'rgba(255,255,255,0.08)'
        el.style.borderColor  = 'rgba(255,255,255,0.15)'
        el.style.color        = '#F5F7FA'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background  = 'rgba(255,255,255,0.04)'
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.color       = '#94A3B8'
      }}
    >
      {icon}
    </button>
  )
}

export function ChatHeader({ conversation }: Props) {
  const { contact, status, channel } = conversation
  const ini    = initials(contact.name)
  const stInfo = STATUS_LABEL[status]

  return (
    <div style={{
      height:      64,
      flexShrink:  0,
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'space-between',
      padding:     '0 20px',
      background:  '#0B1220',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Left: avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width:          42, height: 42,
          borderRadius:   '50%',
          background:     'rgba(212,175,55,0.15)',
          border:         '1.5px solid rgba(212,175,55,0.4)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       14,
          fontWeight:     700,
          color:          '#D4AF37',
          letterSpacing:  '0.02em',
          flexShrink:     0,
        }}>
          {ini}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F5F7FA' }}>
              {contact.name}
            </span>
            <span style={{
              display:        'flex',
              alignItems:     'center',
              gap:            3,
              fontSize:       10,
              fontWeight:     500,
              color:          stInfo.color,
            }}>
              <StatusIcon status={status} />
              {stInfo.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {contact.phone || 'Sem número'}
            </span>
            <span style={{ fontSize: 10, color: '#475569' }}>•</span>
            <span style={{
              fontSize:    11,
              color:       '#94A3B8',
              background:  'rgba(148,163,184,0.08)',
              border:      '1px solid rgba(148,163,184,0.15)',
              borderRadius: 4,
              padding:     '1px 6px',
            }}>
              {channel}
            </span>
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ActionBtn icon={<Phone  size={14} />} title="Ligar"       />
        <ActionBtn icon={<Video  size={14} />} title="Videochamada" />
        <ActionBtn icon={<Info   size={14} />} title="Informações" />
        <ActionBtn icon={<MoreVertical size={14} />} title="Mais opções" />
      </div>
    </div>
  )
}
