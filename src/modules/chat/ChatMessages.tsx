import type { RefObject } from 'react'
import { MessageBubble } from './MessageBubble'
import type { Message } from './types'

interface Props {
  messages: Message[]
  loading:  boolean
  scrollRef: RefObject<HTMLDivElement | null>
}

function groupByDate(messages: Message[]): Array<{ date: string; items: Message[] }> {
  const groups: Record<string, Message[]> = {}
  for (const m of messages) {
    const key = new Date(m.created_at).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            10,
      padding:        '12px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <span style={{
        fontSize:    11,
        color:       '#475569',
        fontWeight:  500,
        whiteSpace:  'nowrap',
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

function LoadingDots() {
  return (
    <div style={{
      flex:           1,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width:     7, height: 7,
              borderRadius: '50%',
              background: '#D4AF37',
              opacity:    0.4,
              animation:  `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export function ChatMessages({ messages, loading, scrollRef }: Props) {
  if (loading && messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingDots />
      </div>
    )
  }

  if (!loading && messages.length === 0) {
    return (
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(212,175,55,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>
          Nenhuma mensagem ainda
        </p>
      </div>
    )
  }

  const groups = groupByDate(messages)

  return (
    <div
      ref={scrollRef as RefObject<HTMLDivElement>}
      style={{
        flex:         1,
        overflowY:    'auto',
        padding:      '12px 20px',
        display:      'flex',
        flexDirection: 'column',
        gap:           0,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}
    >
      {groups.map(group => (
        <div key={group.date}>
          <DateSeparator label={group.date} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {group.items.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
