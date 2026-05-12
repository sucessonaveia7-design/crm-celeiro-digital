import { useState, useRef, useCallback } from 'react'
import { Send, Smile, Paperclip, Mic, Zap, Bot, FileText } from 'lucide-react'

interface Props {
  onSend:  (text: string) => Promise<void>
  sending: boolean
}

interface ToolbarBtnProps {
  icon:  React.ReactNode
  title: string
  onClick?: () => void
}

function ToolbarBtn({ icon, title, onClick }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width:          32, height: 32,
        borderRadius:   8,
        border:         '1px solid rgba(255,255,255,0.07)',
        background:     'rgba(255,255,255,0.04)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        color:          '#64748B',
        transition:     'all 150ms',
        flexShrink:     0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = 'rgba(212,175,55,0.1)'
        e.currentTarget.style.borderColor  = 'rgba(212,175,55,0.3)'
        e.currentTarget.style.color        = '#D4AF37'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.color       = '#64748B'
      }}
    >
      {icon}
    </button>
  )
}

export function ChatInput({ onSend, sending }: Props) {
  const [text, setText]   = useState('')
  const textareaRef       = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setText('')
    try {
      await onSend(trimmed)
    } catch {
      setText(trimmed)
    }
    textareaRef.current?.focus()
  }, [text, sending, onSend])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const canSend = text.trim().length > 0 && !sending

  return (
    <div style={{
      flexShrink:  0,
      background:  '#0B1220',
      borderTop:   '1px solid rgba(255,255,255,0.06)',
      padding:     '10px 16px 12px',
    }}>
      {/* Toolbar */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         4,
        marginBottom: 8,
      }}>
        <ToolbarBtn icon={<Smile     size={14} />} title="Emoji"       />
        <ToolbarBtn icon={<Paperclip size={14} />} title="Anexo"       />
        <ToolbarBtn icon={<Mic       size={14} />} title="Áudio"       />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        <ToolbarBtn icon={<FileText  size={14} />} title="Template"    />
        <ToolbarBtn icon={<Bot       size={14} />} title="IA"          />
        <ToolbarBtn icon={<Zap       size={14} />} title="Automação"   />
      </div>

      {/* Input row */}
      <div style={{
        display:     'flex',
        alignItems:  'flex-end',
        gap:         8,
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Comece a escrever uma mensagem..."
          rows={1}
          style={{
            flex:        1,
            resize:      'none',
            border:      '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            background:  'rgba(255,255,255,0.04)',
            color:       '#F5F7FA',
            fontSize:    13,
            lineHeight:  1.5,
            padding:     '9px 14px',
            outline:     'none',
            minHeight:   38,
            maxHeight:   120,
            overflowY:   'auto',
            fontFamily:  'inherit',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            transition:  'border-color 150ms',
          }}
          onFocus={e  => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
          onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          title="Enviar (Enter)"
          style={{
            width:          40, height: 40,
            borderRadius:   12,
            border:         'none',
            background:     canSend
              ? 'linear-gradient(135deg, #D4AF37 0%, #B8952E 100%)'
              : 'rgba(255,255,255,0.06)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         canSend ? 'pointer' : 'not-allowed',
            flexShrink:     0,
            transition:     'all 150ms',
            boxShadow:      canSend ? '0 2px 12px rgba(212,175,55,0.35)' : 'none',
          }}
        >
          {sending ? (
            <div style={{
              width: 14, height: 14,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #FFD700',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : (
            <Send size={15} color={canSend ? '#060B14' : '#475569'} />
          )}
        </button>
      </div>

      <p style={{ margin: '6px 0 0', fontSize: 10, color: '#334155', textAlign: 'right' }}>
        Enter para enviar · Shift+Enter nova linha
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
