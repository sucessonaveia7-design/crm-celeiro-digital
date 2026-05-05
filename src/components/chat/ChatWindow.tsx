// src/components/chat/ChatWindow.tsx
import { useState, useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/useMessages';
// import { useTypingController } from '../../hooks/useTypingController'; // desativado temporariamente
import { MessageService } from '../../services/messageService';
import { ConversationService } from '../../services/conversationService';
import { supabase } from '../../lib/supabase';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuthStore } from '@/store/authStore';

interface ChatWindowProps {
  conversation: {
    id: string;
    contact: {
      name: string;
      phone?: string;
      avatar?: string;
      online?: boolean;
    };
  };
}

const ChatWindow = ({ conversation }: ChatWindowProps) => {
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const messageServiceRef = useRef<MessageService | null>(null);
  const conversationServiceRef = useRef<ConversationService | null>(null);

  // Initialize services once
  useEffect(() => {
    messageServiceRef.current = new MessageService(supabase);
    conversationServiceRef.current = new ConversationService(supabase);
  }, []);

  // Mark conversation as read when the window mounts
  useEffect(() => {
    conversationServiceRef.current?.markAsRead(conversation.id)
      .catch(error => console.error('Failed to mark conversation as read:', error));
  }, [conversation.id]);

  // Use the hook to fetch messages and handle realtime
  const { messages, loading: messagesLoading, hasMore, loadMore, refetch, error } = useMessages(
    conversation.id || null
  );

    // Get current user from auth store
    const { user } = useAuthStore();
    
    const typingUsers: string[] = [];
    const handleTypingChange = (_: boolean) => {};
    const stopTyping = () => {};

   // Function to send a message
   const handleSend = async (content: string) => {
     // Validate content and loading state
     const trimmedContent = content.trim();
     if (!trimmedContent || isLoadingSend || !messageServiceRef.current || !user) return;

     setIsLoadingSend(true);
     try {
       await messageServiceRef.current.sendMessage({
         conversation_id: conversation.id,
         sender_type: 'user',
         sender_id: user.id, // Use actual user ID from auth
         content: trimmedContent,
         message_type: 'text'
       });
       // The hook's realtime will handle updating the messages list
       // We don't need to refetch because the realtime subscription in useMessages will update the state.
     } catch (error) {
       console.error('Failed to send message:', error);
       // In a real app, you might show an error toast
     } finally {
       setIsLoadingSend(false);
       // Stop typing after sending a message
       stopTyping();
     }
   };

  // If there's an error loading messages, show an error state with a retry button
  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 text-center">
          <p className="text-red-400">Erro ao carregar mensagens: {error}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 bg-amber-400 text-gray-900 px-4 py-2 rounded hover:bg-amber-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <ChatHeader conversation={conversation} />
      
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {typingUsers.length === 1 ? 'Está digitando...' : 'Vários estão digitando...'}
        </div>
      )}
      
      <MessageList 
        messages={messages} 
        hasMore={hasMore} 
        loading={messagesLoading} 
        loadMore={loadMore} 
      />
      
      <MessageInput 
        onSend={handleSend}
        onInputChange={handleTypingChange}
        onBlur={stopTyping}
        loading={isLoadingSend}
      />
    </div>
  );
};

export default ChatWindow;