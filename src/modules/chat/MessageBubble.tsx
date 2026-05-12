import { Check, CheckCheck } from 'lucide-react'
import type { Message } from './types'

interface Props {
  message: Message
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function StatusIcon({ status }: { status?: Message['status'] }) {
  if (status === 'read')      return <CheckCheck size={12} color="#D4AF37"   />
  if (status === 'delivered') return <CheckCheck size={12} color="#94A3B8"   />
  return                             <Check      size={12} color="#64748B"   />
}

export function MessageBubble({ message }: Props) {
  const isAgent   = message.sender_type === 'agent' || message.sender_type === 'user'
  const hasContent = message.content && message.content.trim()
  if (!hasContent) return null

  return (
    <div style={{
      display:       'flex',
      justifyContent: isAgent ? 'flex-end' : 'flex-start',
      paddingLeft:    isAgent ? 64 : 0,
      paddingRight:   isAgent ? 0 : 64,
      marginBottom:   2,
    }}>
      <div style={{
        maxWidth:     '100%',
        padding:      '9px 13px',
        borderRadius:  isAgent ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background:    isAgent
          ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.10) 100%)'
          : 'rgba(255,255,255,0.05)',
        border:        isAgent
          ? '1px solid rgba(212,175,55,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow:     isAgent
          ? '0 1px 8px rgba(212,175,55,0.08)'
          : '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        <p style={{
          margin:     0,
          fontSize:   13,
          lineHeight: 1.55,
          color:      isAgent ? '#F0E6C8' : '#CBD5E1',
          whiteSpace: 'pre-wrap',
          wordBreak:  'break-word',
        }}>
          {message.content}
        </p>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'flex-end',
          gap:            3,
          marginTop:      4,
        }}>
          <span style={{ fontSize: 10, color: '#475569' }}>
            {formatTime(message.created_at)}
          </span>
          {isAgent && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}
