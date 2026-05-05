// src/components/chat/MessageList.tsx
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
}

export const MessageList = ({ 
  messages, 
  hasMore, 
  loading, 
  loadMore 
}: MessageListProps) => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom only if user is already near the bottom
  useEffect(() => {
    if (!loading && messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      // If user is within 100px of the bottom, scroll to bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, loading]);

  // Load more when scrolling near the top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // If scrolled to the very top (or within 100px) and we have more to load
    if (target.scrollTop < 100 && hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <div 
      ref={messageListRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          showAvatar={true} 
        />
      ))}
      <div ref={endRef} />
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
  );
};