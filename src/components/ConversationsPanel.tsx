// src/components/ConversationsPanel.tsx
import { useState } from 'react';
import { Search, Plus, MessageCircle, Smartphone } from 'lucide-react';

const TABS = ['Atendente', 'Aguardando', 'Resolvidos'];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

interface Conversation {
  id: string;
  contact: { name: string; phone?: string };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Props {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
}

const ConversationsPanel = ({ conversations, activeConversationId, onConversationSelect }: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[300px] flex-shrink-0 bg-gray-900 border-r border-gray-800/60 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-[14px] border-b border-gray-800/60">
        <div>
          <h2 className="text-[13px] font-semibold text-gray-100 leading-tight">Bate Papo ao Vivo</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{conversations.length} conversa{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          title="Nova conversa"
          className="w-7 h-7 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 flex items-center justify-center transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800/60 px-3 pt-2 gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 pb-2 text-[11px] font-semibold tracking-wide transition-all border-b-2
              ${activeTab === i
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-500 border-transparent hover:text-gray-400'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-gray-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800/70 border border-gray-700/60 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-700">
            <MessageCircle className="w-7 h-7 mb-2 opacity-40" />
            <p className="text-[12px]">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 transition-all text-left border-l-2
                  ${isActive
                    ? 'bg-amber-400/10 border-amber-400'
                    : 'border-transparent hover:bg-gray-800/50'
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold
                    ${isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-gray-700/80 text-gray-300'}`}>
                    {getInitials(conv.contact.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <Smartphone className="w-[8px] h-[8px] text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[12px] font-semibold truncate leading-tight
                      ${isActive ? 'text-amber-300' : 'text-gray-100'}`}>
                      {conv.contact.name}
                    </span>
                    <span className="text-[10px] text-gray-600 ml-2 flex-shrink-0 tabular-nums">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500 truncate leading-tight">{conv.last_message || '—'}</p>
                    {conv.unread_count > 0 && (
                      <span className="flex-shrink-0 min-w-[16px] h-4 bg-amber-400 text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationsPanel;
