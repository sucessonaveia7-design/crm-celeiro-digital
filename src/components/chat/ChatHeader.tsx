// src/components/chat/ChatHeader.tsx
import { Phone, Video, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  conversation: {
    contact: {
      name: string;
      phone?: string;
      avatar?: string;
      online?: boolean;
    };
  };
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

export const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const { name, phone, avatar, online } = conversation.contact;

  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-800/60 bg-gray-900 flex-shrink-0">
      {/* Avatar */}
      <div className="relative mr-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-9 h-9 rounded-full border border-gray-700 object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-[12px] font-bold text-gray-200">
            {getInitials(name)}
          </div>
        )}
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-100 truncate leading-tight">{name}</p>
        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
          {online ? 'Online' : phone || 'WhatsApp'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
          <Phone className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
          <Video className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
          <MoreVertical className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
