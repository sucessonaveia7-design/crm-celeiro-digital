// src/components/chat/MessageBubble.tsx
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageBubble = ({ message, showAvatar = false }: MessageBubbleProps) => {
  const isUser = message.sender_type === 'user';
  
  return (
    <div className={`${isUser ? 'flex justify-end' : 'flex justify-start'} message-${message.sender_type}`}>
      {!isUser && showAvatar && (
        <div className="flex-shrink-0">
          <img 
            src="https://i.pravatar.cc/150?img=1" 
            alt="Contact" 
            className="w-8 h-8 rounded-full border-2 border-gray-800"
          />
        </div>
      )}
      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
        isUser ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-100'
      }`}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500 mr-2">
            {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {isUser && (
            <>
              {message.status === 'sent' && (
                <span className="text-xs text-gray-400">
                  ✓
                </span>
              )}
              {message.status === 'delivered' && (
                <span className="text-xs text-gray-400">
                  ✓✓
                </span>
              )}
              {message.status === 'read' && (
                <span className="text-xs text-amber-200">
                  ✓✓
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {isUser && showAvatar && (
        <div className="flex-shrink-0">
          <img 
            src="https://i.pravatar.cc/150?img=1" 
            alt="User" 
            className="w-8 h-8 rounded-full border-2 border-gray-800"
          />
        </div>
      )}
    </div>
  );
};