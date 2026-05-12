import type { Conversation } from './types'

interface Props {
  conv:     Conversation
  isActive: boolean
  onClick:  (conv: Conversation) => void
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

function formatTime(iso: string): string {
  if (!iso) return ''
  const d   = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ConversationItem({ conv, isActive, onClick }: Props) {
  const ini  = initials(conv.contact.name)
  const time = formatTime(conv.last_message_at)

  return (
    <button
      onClick={() => onClick(conv)}
      style={{
        width:           '100%',
        display:         'flex',
        alignItems:      'center',
        gap:             12,
        padding:         '12px 16px',
        textAlign:       'left',
        border:          'none',
        cursor:          'pointer',
        transition:      'background 150ms',
        backgroundColor: isActive ? 'rgba(212,175,55,0.10)' : 'transparent',
        borderLeft:      isActive ? '2px solid #D4AF37' : '2px solid transparent',
        position:        'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      {/* Avatar */}
      <div style={{
        width:          40, height: 40,
        borderRadius:   '50%',
        background:     isActive ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.12)',
        border:         `1.5px solid ${isActive ? '#D4AF37' : 'rgba(212,175,55,0.3)'}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        fontSize:       13,
        fontWeight:     700,
        color:          '#D4AF37',
        letterSpacing:  '0.02em',
      }}>
        {ini}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{
            fontSize:     13,
            fontWeight:   600,
            color:        isActive ? '#F5F7FA' : '#CBD5E1',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            maxWidth:     160,
          }}>
            {conv.contact.name}
          </span>
          <span style={{ fontSize: 11, color: '#64748B', flexShrink: 0 }}>
            {time}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{
            fontSize:     12,
            color:        '#64748B',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            flex:         1,
          }}>
            {conv.last_message || 'Sem mensagens ainda'}
          </span>
          {conv.unread_count > 0 && (
            <span style={{
              minWidth:       18,
              height:         18,
              borderRadius:   9,
              background:     '#D4AF37',
              color:          '#060B14',
              fontSize:       10,
              fontWeight:     700,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '0 5px',
              flexShrink:     0,
            }}>
              {conv.unread_count > 99 ? '99+' : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
