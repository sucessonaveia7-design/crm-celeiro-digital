import { MessageSquare } from 'lucide-react'
import { useChatState } from './useChatState'
import { ChatSidebar } from './ChatSidebar'
import { ChatHeader } from './ChatHeader'
import { TagList } from './TagList'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

function EmptyState() {
  return (
    <div style={{
      flex:           1,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            16,
      background:     '#060B14',
    }}>
      <div style={{
        width:          64, height: 64,
        borderRadius:   18,
        background:     'rgba(212,175,55,0.08)',
        border:         '1px solid rgba(212,175,55,0.15)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <MessageSquare size={26} color="#D4AF37" strokeWidth={1.5} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#F5F7FA', fontWeight: 600, fontSize: 15, margin: '0 0 6px' }}>
          Selecione uma conversa
        </p>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          Escolha uma conversa na lista para começar a atender
        </p>
      </div>
    </div>
  )
}

export default function ChatLayout() {
  const state = useChatState()

  return (
    <div style={{
      display:    'flex',
      height:     '100%',
      background: '#060B14',
      overflow:   'hidden',
      fontFamily: 'inherit',
    }}>
      {/* Sidebar */}
      <ChatSidebar state={state} />

      {/* Conversation area */}
      <div style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        background:    '#060B14',
      }}>
        {state.activeConversation ? (
          <>
            <ChatHeader conversation={state.activeConversation} />
            <TagList tags={state.activeConversation.tags} />
            <ChatMessages
              messages={state.messages}
              loading={state.messagesLoading}
              scrollRef={state.scrollRef}
            />
            <ChatInput
              onSend={state.sendMessage}
              sending={state.sending}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
