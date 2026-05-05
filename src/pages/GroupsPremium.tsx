import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, Search, Plus, UserPlus, Send, 
  Trash2, X, Check, Shield, User, Users as UsersIcon, Mail, Phone, MessagesSquare, MessageCircle, Tag
} from 'lucide-react';

// Interfaces
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  tags?: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'Membros' | 'Visitantes' | 'Liderança' | 'Equipe';
  createdAt: string;
  members: Member[];
}

const AVAILABLE_TAGS = ['Novo visitante', 'Interessado', 'Batizado', 'Líder', 'Follow-up'];

// Dados Globais Mockados
const ALL_CONTACTS_MOCK: Member[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-1111', status: 'Ativo', tags: ['Líder', 'Batizado'] },
  { id: 'c2', name: 'Maria Souza', email: 'maria@email.com', phone: '(11) 98888-2222', status: 'Ativo', tags: ['Novo visitante'] },
  { id: 'c3', name: 'Pedro Alves', email: 'pedro@email.com', phone: '(11) 98888-3333', status: 'Inativo', tags: ['Interessado'] },
  { id: 'c4', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 98888-4444', status: 'Ativo', tags: ['Follow-up'] },
  { id: 'c5', name: 'Lucas Lima', email: 'lucas@email.com', phone: '(11) 98888-5555', status: 'Ativo', tags: ['Batizado'] },
];

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Líderes de Célula',
    description: 'Grupo principal de liderança da igreja.',
    type: 'Liderança',
    createdAt: '10/04/2026',
    members: [ALL_CONTACTS_MOCK[0], ALL_CONTACTS_MOCK[3]]
  },
  {
    id: 'g2',
    name: 'Novos Visitantes (Abril)',
    description: 'Acompanhamento dos visitantes do mês.',
    type: 'Visitantes',
    createdAt: '15/04/2026',
    members: [ALL_CONTACTS_MOCK[1]]
  }
];

export default function GroupsPremium() {
  // Estados
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [searchGroupQuery, setSearchGroupQuery] = useState('');
  
  // Modais
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);

  // Estados de Formulários (Mockados simplificados)
  const [newGroupForm, setNewGroupForm] = useState({ name: '', description: '', type: 'Membros' as Group['type'] });
  const [selectedContactsToAdd, setSelectedContactsToAdd] = useState<string[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [tagPopoverOpenId, setTagPopoverOpenId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setTagPopoverOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived State
  const filteredGroups = useMemo(() => {
    return groups.filter(g => g.name.toLowerCase().includes(searchGroupQuery.toLowerCase()));
  }, [groups, searchGroupQuery]);

  const selectedGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const availableContactsToAdd = useMemo(() => {
    if (!selectedGroup) return [];
    const groupMemberIds = selectedGroup.members.map(m => m.id);
    return ALL_CONTACTS_MOCK.filter(c => 
      !groupMemberIds.includes(c.id) && 
      c.name.toLowerCase().includes(contactSearchQuery.toLowerCase())
    );
  }, [selectedGroup, contactSearchQuery]);

  // Ações
  const handleCreateGroup = () => {
    if (!newGroupForm.name.trim()) return;
    const newGroup: Group = {
      id: 'g' + Date.now(),
      name: newGroupForm.name,
      description: newGroupForm.description,
      type: newGroupForm.type,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      members: []
    };
    setGroups([newGroup, ...groups]);
    setSelectedGroupId(newGroup.id);
    setIsNewGroupModalOpen(false);
    setNewGroupForm({ name: '', description: '', type: 'Membros' });
  };

  const handleAddMembersToGroup = () => {
    if (!selectedGroup || selectedContactsToAdd.length === 0) return;
    
    const contactsToAdd = ALL_CONTACTS_MOCK.filter(c => selectedContactsToAdd.includes(c.id));
    
    setGroups(groups.map(g => {
      if (g.id === selectedGroup.id) {
        return { ...g, members: [...g.members, ...contactsToAdd] };
      }
      return g;
    }));
    
    setIsAddMemberModalOpen(false);
    setSelectedContactsToAdd([]);
    setContactSearchQuery('');
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, members: g.members.filter(m => m.id !== memberId) };
      }
      return g;
    }));
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // Mock de envio
    setIsSendMessageModalOpen(false);
    setMessageText('');
    // Idealmente exibir um toast de sucesso aqui
    alert('Mensagem enviada com sucesso para o grupo!');
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactsToAdd(prev => 
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  const toggleTag = (groupId: string, memberId: string, tag: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.map(m => {
            if (m.id === memberId) {
              const tags = m.tags || [];
              const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
              return { ...m, tags: newTags };
            }
            return m;
          })
        };
      }
      return g;
    }));
  };

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Novo visitante': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30';
      case 'Interessado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30';
      case 'Batizado': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30';
      case 'Líder': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30';
      case 'Follow-up': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getTypeIcon = (type: Group['type']) => {
    switch (type) {
      case 'Liderança': return <Shield className="w-4 h-4 text-[#FACC15]" />;
      case 'Membros': return <User className="w-4 h-4 text-[#3B82F6]" />;
      case 'Equipe': return <UsersIcon className="w-4 h-4 text-[#10B981]" />;
      case 'Visitantes': return <UserPlus className="w-4 h-4 text-[#8B5CF6]" />;
      default: return <Users className="w-4 h-4 text-[#64748B]" />;
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-[fadeIn_0.3s_ease-out]">
      {/* Header Premium da Página */}
      <div className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] px-8 py-6 flex-shrink-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#FACC15]/20 to-[#EAB308]/10 flex items-center justify-center border border-[#FACC15]/20 shadow-inner">
              <Users className="w-6 h-6 text-[#D4AF37] dark:text-[#FACC15]" />
            </div>
            <div>
              <h1 className="text-[24px] font-[700] text-[#0F172A] dark:text-white leading-tight tracking-tight">Gerente de Grupos</h1>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">Permite criar e gerenciar grupos de contatos dentro da plataforma.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Container Principal Dividido (Split Layout) */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-6 flex gap-6 h-[calc(100vh-140px)]">
        
        {/* COLUNA ESQUERDA: Lista de Grupos */}
        <div className="w-[380px] flex-shrink-0 bg-[#FFFFFF] dark:bg-[#020617] rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.04)] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
          {/* Header da Coluna */}
          <div className="p-5 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] space-y-4">
            <button 
              onClick={() => setIsNewGroupModalOpen(true)}
              className="w-full py-3 rounded-[12px] bg-[#0F172A] dark:bg-[#FFFFFF] text-white dark:text-[#0F172A] font-[600] text-[14px] hover:bg-[#1E293B] dark:hover:bg-[#F8FAFC] shadow-[0_4px_14px_rgba(15,23,42,0.2)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Novo Grupo
            </button>
            <div className="relative group">
              <Search className="w-[18px] h-[18px] text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar grupo..." 
                value={searchGroupQuery}
                onChange={(e) => setSearchGroupQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(250,204,21,0.2)] focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* Lista de Grupos */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <Users className="w-10 h-10 text-[#CBD5E1] dark:text-[#334155] mb-3" />
                <p className="text-[14px] font-medium text-[#64748B] dark:text-[#94A3B8]">Nenhum grupo encontrado.</p>
              </div>
            ) : (
              filteredGroups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`
                    w-full p-4 rounded-[14px] cursor-pointer border transition-all duration-200 group
                    ${selectedGroupId === group.id 
                      ? 'bg-[rgba(250,204,21,0.05)] dark:bg-[rgba(250,204,21,0.08)] border-[#FACC15] shadow-[0_4px_12px_rgba(250,204,21,0.1)]' 
                      : 'bg-transparent border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] hover:border-[rgba(15,23,42,0.06)] dark:hover:border-[rgba(255,255,255,0.06)]'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-[15px] font-[700] ${selectedGroupId === group.id ? 'text-[#0F172A] dark:text-[#FACC15]' : 'text-[#334155] dark:text-[#E2E8F0] group-hover:text-[#0F172A] dark:group-hover:text-white'} transition-colors line-clamp-1`}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-[#F1F5F9] dark:bg-[#1E293B] px-2 py-0.5 rounded-full border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                      {getTypeIcon(group.type)}
                      <span className="text-[11px] font-[600] text-[#64748B] dark:text-[#CBD5E1]">{group.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {group.members.length} membros</span>
                    <span>{group.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Detalhes do Grupo */}
        <div className="flex-1 bg-[#FFFFFF] dark:bg-[#020617] rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.04)] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
          
          {!selectedGroup ? (
            // Estado Vazio Elegante
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-transparent to-[#F8FAFC]/50 dark:to-[#0F172A]/50">
              <div className="w-20 h-20 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center justify-center mb-6 shadow-inner">
                <MessagesSquare className="w-10 h-10 text-[#CBD5E1] dark:text-[#475569]" />
              </div>
              <h2 className="text-[20px] font-[700] text-[#0F172A] dark:text-white mb-2">Nenhum grupo selecionado</h2>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] max-w-md mb-8">
                Selecione um grupo na lista lateral para ver seus detalhes, gerenciar membros e enviar mensagens em lote.
              </p>
              {groups.length === 0 && (
                <button 
                  onClick={() => setIsNewGroupModalOpen(true)}
                  className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[600] text-[14px] shadow-[0_4px_14px_rgba(250,204,21,0.3)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar primeiro grupo
                </button>
              )}
            </div>
          ) : (
            // Conteúdo do Grupo
            <>
              {/* Header do Grupo Selecionado */}
              <div className="p-8 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] dark:from-[#0F172A] dark:to-[#020617]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-[24px] font-[700] text-[#0F172A] dark:text-white tracking-tight">{selectedGroup.name}</h2>
                      <span className="px-3 py-1 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] text-[12px] font-[600] text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
                        {getTypeIcon(selectedGroup.type)} {selectedGroup.type}
                      </span>
                    </div>
                    <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] max-w-2xl">{selectedGroup.description || 'Sem descrição fornecida.'}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="px-4 py-2 rounded-[10px] bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-white font-[600] text-[13px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Adicionar membro
                    </button>
                    <button 
                      onClick={() => setIsSendMessageModalOpen(true)}
                      className="px-4 py-2 rounded-[10px] bg-[#0F172A] dark:bg-[#FACC15] text-white dark:text-[#0F172A] font-[600] text-[13px] hover:bg-[#1E293B] dark:hover:bg-[#EAB308] shadow-[0_4px_12px_rgba(15,23,42,0.2)] dark:shadow-[0_4px_12px_rgba(250,204,21,0.2)] transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Enviar mensagem
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-[600] text-[#94A3B8] uppercase tracking-wider mb-1">Membros Totais</span>
                    <span className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#D4AF37]" /> {selectedGroup.members.length}</span>
                  </div>
                  <div className="w-[1px] h-10 bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)]"></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-[600] text-[#94A3B8] uppercase tracking-wider mb-1">Criado em</span>
                    <span className="text-[16px] font-[600] text-[#334155] dark:text-[#CBD5E1] mt-0.5">{selectedGroup.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Tabela de Membros */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FFFFFF] dark:bg-[#020617]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#F8FAFC]/95 dark:bg-[#0F172A]/95 backdrop-blur-sm z-10 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <tr>
                      <th className="py-4 px-6 text-[12px] font-[700] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Nome do Contato</th>
                      <th className="py-4 px-6 text-[12px] font-[700] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Email / Telefone</th>
                      <th className="py-4 px-6 text-[12px] font-[700] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Tags</th>
                      <th className="py-4 px-6 text-[12px] font-[700] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Status</th>
                      <th className="py-4 px-6 text-[12px] font-[700] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(15,23,42,0.04)] dark:divide-[rgba(255,255,255,0.04)]">
                    {selectedGroup.members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8] text-[14px]">
                          Este grupo ainda não possui membros. Clique em "Adicionar membro" no topo.
                        </td>
                      </tr>
                    ) : (
                      selectedGroup.members.map(member => (
                        <tr key={member.id} className="group hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#F1F5F9] dark:from-[#1E293B] dark:to-[#334155] border border-white dark:border-[#0F172A] shadow-sm flex items-center justify-center text-[13px] font-[700] text-[#475569] dark:text-[#CBD5E1]">
                                {member.name.charAt(0)}
                              </div>
                              <span className="font-[600] text-[14px] text-[#0F172A] dark:text-white">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-[13px] text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#94A3B8]" /> {member.email}</span>
                              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#94A3B8]" /> {member.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 relative">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {member.tags?.map(tag => (
                                <span key={tag} className={`px-2 py-0.5 rounded-[6px] text-[11px] font-[600] border ${getTagStyle(tag)}`}>
                                  {tag}
                                </span>
                              ))}
                              <button 
                                onClick={() => setTagPopoverOpenId(tagPopoverOpenId === member.id ? null : member.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center border border-dashed border-[#CBD5E1] dark:border-[#475569] text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                                title="Adicionar/Remover tags"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Popover de Tags */}
                            {tagPopoverOpenId === member.id && (
                              <div ref={popoverRef} className="absolute left-6 top-full mt-2 w-[220px] bg-white dark:bg-[#0F172A] rounded-[12px] shadow-[0_10px_30px_rgba(15,23,42,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] z-50 animate-[fadeIn_0.15s_ease-out]">
                                <div className="p-3 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                                  <span className="text-[12px] font-[600] text-[#0F172A] dark:text-white flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-[#94A3B8]" /> Gerenciar Tags</span>
                                  <button onClick={() => setTagPopoverOpenId(null)} className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"><X className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="p-2 flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                  {AVAILABLE_TAGS.map(tag => {
                                    const hasTag = member.tags?.includes(tag);
                                    return (
                                      <button 
                                        key={tag}
                                        onClick={() => toggleTag(selectedGroup.id, member.id, tag)}
                                        className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center justify-between transition-colors group/btn"
                                      >
                                        <span className={`text-[12px] font-[600] ${hasTag ? 'text-[#0F172A] dark:text-white' : 'text-[#64748B] dark:text-[#94A3B8] group-hover/btn:text-[#0F172A] dark:group-hover/btn:text-white'}`}>
                                          {tag}
                                        </span>
                                        {hasTag && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-[600] ${member.status === 'Ativo' ? 'bg-[#DCFCE7] text-[#16A34A] dark:bg-[rgba(22,163,74,0.15)] dark:text-[#4ADE80]' : 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[rgba(239,68,68,0.15)] dark:text-[#F87171]'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Ativo' ? 'bg-[#16A34A] dark:bg-[#4ADE80]' : 'bg-[#DC2626] dark:bg-[#F87171]'}`}></span>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleRemoveMember(selectedGroup.id, member.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-[8px] text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[rgba(239,68,68,0.15)] inline-flex items-center gap-2 text-[12px] font-[600]"
                              title="Remover do grupo"
                            >
                              <Trash2 className="w-4 h-4" /> Remover
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: NOVO GRUPO */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsNewGroupModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[500px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A]">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-gradient-to-br from-[#FACC15]/20 to-[#EAB308]/10 flex items-center justify-center border border-[#FACC15]/20 shadow-inner">
                  <Users className="w-[20px] h-[20px] text-[#D4AF37] dark:text-[#FACC15]" />
                </div>
                Criar Novo Grupo
              </h3>
              <button onClick={() => setIsNewGroupModalOpen(false)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X className="w-[20px] h-[20px]" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Nome do grupo <span className="text-[#EF4444]">*</span></label>
                <input 
                  type="text" 
                  placeholder="Ex: Jovens, Liderança..." 
                  value={newGroupForm.name}
                  onChange={e => setNewGroupForm({...newGroupForm, name: e.target.value})}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] px-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[#FACC15] outline-none transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Descrição</label>
                <textarea 
                  rows={3} 
                  placeholder="Qual o propósito deste grupo?" 
                  value={newGroupForm.description}
                  onChange={e => setNewGroupForm({...newGroupForm, description: e.target.value})}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] px-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[#FACC15] outline-none transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] resize-none"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Tipo de grupo</label>
                <select 
                  value={newGroupForm.type}
                  onChange={e => setNewGroupForm({...newGroupForm, type: e.target.value as Group['type']})}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] px-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[#FACC15] outline-none transition-all duration-200"
                >
                  <option value="Membros">Membros</option>
                  <option value="Visitantes">Visitantes</option>
                  <option value="Liderança">Liderança</option>
                  <option value="Equipe">Equipe</option>
                </select>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-end gap-4 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <button onClick={() => setIsNewGroupModalOpen(false)} className="px-[20px] py-[12px] rounded-[12px] text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1] bg-[#FFFFFF] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] transition-all">Cancelar</button>
              <button onClick={handleCreateGroup} disabled={!newGroupForm.name.trim()} className="px-[28px] py-[12px] rounded-[12px] bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[600] text-[14px] shadow-[0_6px_16px_rgba(250,204,21,0.3)] hover:shadow-[0_8px_24px_rgba(250,204,21,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all">Criar Grupo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR MEMBROS */}
      {isAddMemberModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsAddMemberModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[600px] h-[80vh] max-h-[700px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                  <UserPlus className="w-[20px] h-[20px] text-[#3B82F6]" /> Adicionar Membros
                </h3>
                <button onClick={() => setIsAddMemberModalOpen(false)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X className="w-[20px] h-[20px]" /></button>
              </div>
              <div className="relative group">
                <Search className="w-[18px] h-[18px] text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3B82F6] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar contato por nome..." 
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] pl-11 pr-4 py-3 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] focus:border-[#3B82F6] outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {availableContactsToAdd.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Users className="w-12 h-12 text-[#CBD5E1] dark:text-[#334155] mb-4" />
                  <p className="text-[15px] font-medium text-[#64748B] dark:text-[#94A3B8]">Nenhum contato disponível para adicionar.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-2">
                  {availableContactsToAdd.map(contact => {
                    const isSelected = selectedContactsToAdd.includes(contact.id);
                    return (
                      <div 
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`flex items-center justify-between p-3 rounded-[12px] cursor-pointer transition-all border ${isSelected ? 'bg-[#EFF6FF] dark:bg-[rgba(59,130,246,0.1)] border-[#3B82F6]' : 'bg-transparent border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-[700] ${isSelected ? 'bg-[#3B82F6] text-white' : 'bg-[#F1F5F9] dark:bg-[#334155] text-[#475569] dark:text-[#CBD5E1]'}`}>
                            {contact.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-[600] text-[14px] text-[#0F172A] dark:text-white">{contact.name}</span>
                            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{contact.email}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-[#CBD5E1] dark:border-[#475569]'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <span className="text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8]">
                {selectedContactsToAdd.length} selecionado(s)
              </span>
              <div className="flex gap-3">
                <button onClick={() => setIsAddMemberModalOpen(false)} className="px-[20px] py-[12px] rounded-[12px] text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1] bg-[#FFFFFF] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] transition-all">Cancelar</button>
                <button onClick={handleAddMembersToGroup} disabled={selectedContactsToAdd.length === 0} className="px-[24px] py-[12px] rounded-[12px] bg-[#3B82F6] text-white font-[600] text-[14px] shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all">Adicionar ao Grupo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR MENSAGEM */}
      {isSendMessageModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsSendMessageModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[600px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A]">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-[#0F172A] dark:bg-[#FACC15] flex items-center justify-center shadow-inner">
                  <Send className="w-[20px] h-[20px] text-white dark:text-[#0F172A]" />
                </div>
                Mensagem para Grupo
              </h3>
              <button onClick={() => setIsSendMessageModalOpen(false)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"><X className="w-[20px] h-[20px]" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] rounded-[14px] p-4 border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                <span className="text-[12px] font-[600] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block mb-1">Destinatários</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0F172A] dark:text-white" />
                  <span className="text-[15px] font-[700] text-[#0F172A] dark:text-white">{selectedGroup.name}</span>
                  <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">({selectedGroup.members.length} contatos)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] ml-1">Sua mensagem</label>
                <div className="relative">
                  <MessageCircle className="w-[18px] h-[18px] text-[#94A3B8] absolute left-4 top-4" />
                  <textarea 
                    rows={6} 
                    placeholder="Escreva a mensagem que será enviada para todos do grupo..." 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(15,23,42,0.08)] dark:focus:ring-[rgba(255,255,255,0.08)] focus:border-[#0F172A] dark:focus:border-[#FACC15] outline-none transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] resize-none custom-scrollbar"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-end gap-4 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <button onClick={() => setIsSendMessageModalOpen(false)} className="px-[20px] py-[12px] rounded-[12px] text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1] bg-[#FFFFFF] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] transition-all">Cancelar</button>
              <button onClick={handleSendMessage} disabled={!messageText.trim()} className="px-[28px] py-[12px] rounded-[12px] bg-[#0F172A] dark:bg-[#FACC15] text-white dark:text-[#0F172A] font-[600] text-[14px] shadow-[0_6px_16px_rgba(15,23,42,0.2)] dark:shadow-[0_6px_16px_rgba(250,204,21,0.2)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.3)] dark:hover:shadow-[0_8px_24px_rgba(250,204,21,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar para Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
