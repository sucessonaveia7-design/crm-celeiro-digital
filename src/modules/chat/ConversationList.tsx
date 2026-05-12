import { ConversationItem } from './ConversationItem'
import type { Conversation } from './types'

interface Props {
  conversations: Conversation[]
  activeId:      string | null
  onSelect:      (conv: Conversation) => void
}

export function ConversationList({ conversations, activeId, onSelect }: Props) {
  if (conversations.length === 0) {
    return (
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
        padding:        32,
      }}>
        <div style={{
          width:          40, height: 40,
          borderRadius:   12,
          background:     'rgba(212,175,55,0.08)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', margin: 0 }}>
          Nenhuma conversa encontrada
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
      {conversations.map(conv => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          isActive={conv.id === activeId}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}
