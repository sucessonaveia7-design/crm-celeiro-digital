// src/components/ChatApp.tsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ConversationsPanel from './ConversationsPanel';
import ChatWindow from './chat/ChatWindow';
import ContactPanel from './ContactPanel';
import { useConversations } from '../hooks/useConversations';
import { MessageCircle } from 'lucide-react';

const ChatApp = () => {
  const { conversations, loading, error } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<any>(null);

  useEffect(() => {
    if (activeConversationId) {
      const conv = conversations.find(c => c.id === activeConversationId);
      setActiveConversation(conv || null);
    } else {
      setActiveConversation(null);
    }
  }, [activeConversationId, conversations]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-[13px] text-gray-500">Carregando conversas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-400 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Icon nav */}
      <Sidebar />

      {/* Conversations list */}
      <ConversationsPanel
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={setActiveConversationId}
      />

      {/* Chat area */}
      {activeConversation ? (
        <ChatWindow conversation={activeConversation} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-gray-400 font-medium text-sm">Nenhuma conversa aberta</p>
            <p className="text-gray-600 text-xs mt-1">Selecione uma conversa na lista ao lado</p>
          </div>
        </div>
      )}

      {/* Contact panel */}
      <ContactPanel contact={activeConversation?.contact ?? null} />
    </div>
  );
};

export default ChatApp;
