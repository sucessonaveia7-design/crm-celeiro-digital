// src/components/ChatWindow.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useAuthStore } from '@/store/authStore';

const ChatWindow = ({ 
  conversation, 
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Use the hook to fetch messages and handle realtime
  const { messages, loading, hasMore, error, loadMore } = useMessages(
    conversation?.id || null
  );

  // Scroll to bottom only if user is already near the bottom
  useEffect(() => {
    if (!loading && messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      // If user is within 100px of the bottom, scroll to bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, loading]);

  // Load more when scrolling near the top
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // If scrolled to the very top (or within 100px) and we have more to load
    if (target.scrollTop < 100 && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

    // Get current user from auth store
    const { user } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoadingSend || !user) return;

        setIsLoadingSend(true);
        try {
            await onSendMessage({
                conversation_id: conversation.id,
                sender_type: 'user',
                sender_id: user.id, // Use actual user ID from auth
                content: inputValue,
                message_type: 'text'
            });
            setInputValue('');
            // The hook's realtime will handle updating the messages list
        } catch (error) {
            console.error('Failed to send message:', error);
            // In a real app, you might show an error toast
        } finally {
            setIsLoadingSend(false);
        }
    };

  // Handle file upload (placeholder)
  const handleFileChange = (e) => {
    // In real app: handle file upload to Supabase Storage
    // Then send message with message_type: 'image', 'audio', etc.
    console.log('File selected:', e.target.files);
    e.target.value = ''; // Reset input
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-5 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <img 
              src={conversation.contact.avatar} 
              alt={conversation.contact.name} 
              className="w-10 h-10 rounded-full border-2 border-gray-800"
            />
            <div>
              <h2 className="font-semibold text-gray-100">{conversation.contact.name}</h2>
              <p className="text-xs text-gray-400">
                {conversation.contact.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-3 text-gray-400 hover:text-gray-300">
            <button className="p-2 rounded hover:bg-gray-800 transition-colors">
              {/* Video call icon */}
            </button>
            <button className="p-2 rounded hover:bg-gray-800 transition-colors">
              {/* Phone call icon */}
            </button>
            <button className="p-2 rounded hover:bg-gray-800 transition-colors">
              {/* Info icon */}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        <div className="flex-1 overflow-y-auto p-4 text-center">
          <p className="text-red-400">Erro ao carregar mensagens: {error}</p>
          <button
            onClick={() => {}}
            className="mt-2 bg-amber-400 text-gray-900 px-4 py-2 rounded hover:bg-amber-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
        
        {/* Input Area */}
        <div className="flex items-center px-4 py-3 border-t border-gray-800 bg-gray-950">
          <button 
            onClick={() => document.getElementById('file-input').click()}
            className="p-2 rounded hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-300"
          >
            {/* Attach icon (paperclip) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V6a2 2 0 012-2h2a2 2 0 012 2v5m-4 0l3 3m-3-3L5 8" />
            </svg>
          </button>
          <input 
            type="file" 
            id="file-input"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <form onSubmit={handleSubmit} className="flex-1 space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-xl px-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              disabled={isLoadingSend}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoadingSend}
              className={`px-4 py-2 rounded-xl ${
                !inputValue.trim() || isLoadingSend 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors'
              }`}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-5 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <img 
            src={conversation.contact.avatar} 
            alt={conversation.contact.name} 
            className="w-10 h-10 rounded-full border-2 border-gray-800"
          />
          <div>
            <h2 className="font-semibold text-gray-100">{conversation.contact.name}</h2>
            <p className="text-xs text-gray-400">
              {conversation.contact.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-3 text-gray-400 hover:text-gray-300">
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            {/* Video call icon */}
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            {/* Phone call icon */}
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            {/* Info icon */}
          </button>
        </div>
      </div>
      
      {/* Messages List */}
      <div 
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'} message-${message.sender_type}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender_type === 'user' 
                ? 'bg-amber-400 text-gray-900' 
                : 'bg-gray-800 text-gray-100'
            }`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 mr-2">
                  {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {message.sender_type === 'user' && (
                  <span className="text-xs text-amber-200">
                    {/* Read receipts - simplified */}
                    ✓✓
                  </span>
                )}
              </div>
            </div>
            {message.sender_type === 'contact' && (
              <div className="flex-shrink-0">
                <img 
                  src={conversation.contact.avatar} 
                  alt={conversation.contact.name} 
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {/* Loading indicator for loading more messages at the top */}
        {loading && messages.length > 0 && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-900/50 py-2">
            <span className="text-gray-400">Carregando mensagens anteriores...</span>
          </div>
        )}
        {/* Loading indicator for initial load */}
        {loading && messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="ml-2 text-gray-400">Carregando mensagens...</span>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="flex items-center px-4 py-3 border-t border-gray-800 bg-gray-950">
        <button 
          onClick={() => document.getElementById('file-input').click()}
          className="p-2 rounded hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-300"
        >
          {/* Attach icon (paperclip) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V6a2 2 0 012-2h2a2 2 0 012 2v5m-4 0l3 3m-3-3L5 8" />
          </svg>
        </button>
        <input 
          type="file" 
          id="file-input"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-xl px-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            disabled={isLoadingSend}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoadingSend}
            className={`px-4 py-2 rounded-xl ${
              !inputValue.trim() || isLoadingSend 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors'
            }`}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;