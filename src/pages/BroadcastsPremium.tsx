import React, { useState, useMemo } from 'react';
import { 
  Megaphone, Plus, Search, Calendar, Clock, Send, FileText, 
  MoreVertical, Edit2, Trash2, Eye, X, Users, CheckCircle2, AlertCircle, Play, BarChart2
} from 'lucide-react';

// --- TYPES & MOCK DATA ---
interface BroadcastStats {
  delivered: number;
  read: number;
  failed: number;
}

interface Broadcast {
  id: string;
  name: string;
  date: string;
  time: string;
  groups: string[];
  status: 'Agendada' | 'Enviando' | 'Finalizada' | 'Cancelada' | 'Rascunho';
  sentCount: number;
  totalContacts: number;
  progress: number;
  stats?: BroadcastStats;
}

const MOCK_BROADCASTS: Broadcast[] = [
  {
    id: '1',
    name: 'Aviso de Culto Especial',
    date: '25/04/2026',
    time: '19:00',
    groups: ['Todos os Membros'],
    status: 'Finalizada',
    sentCount: 150,
    totalContacts: 150,
    progress: 100,
    stats: {
      delivered: 145,
      read: 130,
      failed: 5
    }
  },
  {
    id: '2',
    name: 'Boletim Semanal',
    date: '28/04/2026',
    time: '08:00',
    groups: ['Líderes', 'Voluntários'],
    status: 'Agendada',
    sentCount: 0,
    totalContacts: 45,
    progress: 0,
    stats: {
      delivered: 0,
      read: 0,
      failed: 0
    }
  },
  {
    id: '3',
    name: 'Convite Retiro Jovem',
    date: '22/04/2026',
    time: '14:30',
    groups: ['Jovens'],
    status: 'Enviando',
    sentCount: 80,
    totalContacts: 100,
    progress: 80,
    stats: {
      delivered: 75,
      read: 40,
      failed: 5
    }
  }
];

const AVAILABLE_GROUPS = [
  { id: 'g1', name: 'Todos os Membros', count: 150 },
  { id: 'g2', name: 'Líderes', count: 25 },
  { id: 'g3', name: 'Voluntários', count: 20 },
  { id: 'g4', name: 'Jovens', count: 100 },
  { id: 'g5', name: 'Visitantes Recentes', count: 15 },
];

export default function BroadcastsPremium() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newBroadcastName, setNewBroadcastName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [broadcasts, searchQuery]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const totalSelectedContacts = useMemo(() => {
    return AVAILABLE_GROUPS.filter(g => selectedGroups.includes(g.id)).reduce((acc, g) => acc + g.count, 0);
  }, [selectedGroups]);

  const handleCreateBroadcast = (status: 'Rascunho' | 'Agendada' | 'Enviando' = 'Enviando') => {
    if (!newBroadcastName || selectedGroups.length === 0 || !message) return;
    
    const newBroadcast: Broadcast = {
      id: Date.now().toString(),
      name: newBroadcastName,
      date: sendType === 'schedule' ? scheduleDate : new Date().toLocaleDateString('pt-BR'),
      time: sendType === 'schedule' ? scheduleTime : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      groups: AVAILABLE_GROUPS.filter(g => selectedGroups.includes(g.id)).map(g => g.name),
      status: sendType === 'schedule' ? 'Agendada' : status,
      sentCount: 0,
      totalContacts: totalSelectedContacts,
      progress: 0,
      stats: { delivered: 0, read: 0, failed: 0 }
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsNewModalOpen(false);
    
    // Reset fields
    setNewBroadcastName('');
    setSelectedGroups([]);
    setMessage('');
    setSendType('now');
    setScheduleDate('');
    setScheduleTime('');
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Agendada': return { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Calendar };
      case 'Enviando': return { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: Play };
      case 'Finalizada': return { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 };
      case 'Cancelada': return { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertCircle };
      case 'Rascunho': return { color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', icon: FileText };
      default: return { color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', icon: Megaphone };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#0F172A] p-8 rounded-[24px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]">
          <div>
            <h1 className="text-[28px] font-[800] text-[#0F172A] dark:text-white tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#FACC15]" /> Transmissões
            </h1>
            <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-[500]">
              Envie mensagens para grupos ou contatos com facilidade.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                type="text"
                placeholder="Buscar transmissões..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] pl-11 pr-4 py-3 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(250,204,21,0.12)] focus:border-[#FACC15] outline-none transition-all duration-200"
              />
            </div>
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="px-6 py-3 rounded-[14px] bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[700] text-[15px] shadow-[0_6px_16px_rgba(250,204,21,0.3)] hover:shadow-[0_8px_24px_rgba(250,204,21,0.4)] hover:-translate-y-[2px] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Nova transmissão
            </button>
          </div>
        </div>

        {/* Lista de Transmissões */}
        {filteredBroadcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBroadcasts.map(broadcast => {
              const StatusIcon = getStatusConfig(broadcast.status).icon;
              return (
                <div key={broadcast.id} className="bg-white dark:bg-[#0F172A] rounded-[20px] p-6 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${getStatusConfig(broadcast.status).bg}`}>
                      <StatusIcon className={`w-4 h-4 ${getStatusConfig(broadcast.status).color}`} />
                      <span className={`text-[12px] font-[700] ${getStatusConfig(broadcast.status).color}`}>{broadcast.status}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedBroadcast(broadcast);
                          setIsStatsModalOpen(true);
                        }}
                        title="Ver Estatísticas"
                        className="p-2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-[10px] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-[10px] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-2 line-clamp-1">{broadcast.name}</h3>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[13px]">{broadcast.date} às {broadcast.time}</span>
                    </div>
                    <div className="flex items-start gap-3 text-[#64748B] dark:text-[#94A3B8]">
                      <Users className="w-4 h-4 mt-0.5" />
                      <span className="text-[13px] line-clamp-2">{broadcast.groups.join(', ')}</span>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between text-[13px] mb-2">
                      <span className="font-[600] text-[#475569] dark:text-[#CBD5E1]">Enviado: {broadcast.progress}%</span>
                      <span className="text-[#94A3B8]">{broadcast.sentCount} de {broadcast.totalContacts}</span>
                    </div>
                    <div className="w-full bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] h-[8px] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[rgba(250,204,21,0.8)] dark:bg-[#FACC15] rounded-full transition-all duration-1000"
                        style={{ width: `${broadcast.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-12 text-center border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none">
            <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-[#94A3B8] dark:text-[#64748B]" />
            </div>
            <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white mb-2">Nenhuma transmissão criada ainda.</h3>
            <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] max-w-[400px] mx-auto mb-8">
              Comece a engajar seus contatos criando sua primeira transmissão em massa.
            </p>
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="px-8 py-3.5 rounded-[14px] bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-[600] text-[15px] shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:scale-[1.02] transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" /> Criar primeira transmissão
            </button>
          </div>
        )}

      </div>

      {/* Modal Nova Transmissão */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsNewModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[1100px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A] shrink-0">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-[#FACC15]/10 flex items-center justify-center">
                  <Megaphone className="w-[20px] h-[20px] text-[#FACC15]" />
                </div>
                Nova Transmissão
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[400px]">
              
              {/* Lado Esquerdo - Formulário */}
              <div className="w-full lg:w-[60%] p-8 overflow-y-auto custom-scrollbar space-y-8 border-b lg:border-b-0 lg:border-r border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Nome da transmissão</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aviso de Reunião..." 
                    value={newBroadcastName}
                    onChange={e => setNewBroadcastName(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-[#0F172A] focus:ring-[3px] focus:ring-[rgba(250,204,21,0.15)] focus:border-[#FACC15] outline-none transition-all" 
                  />
                </div>

                {/* Grupos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Selecionar Grupos</label>
                    <span className="text-[12px] font-[600] text-[#FACC15] bg-[rgba(250,204,21,0.1)] px-2 py-1 rounded-md">
                      {totalSelectedContacts} contatos selecionados
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_GROUPS.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleToggleGroup(group.id)}
                        className={`flex items-center justify-between p-3 rounded-[12px] border text-left transition-all ${
                          selectedGroups.includes(group.id) 
                          ? 'border-[#FACC15] bg-[#FACC15]/5 dark:bg-[#FACC15]/10' 
                          : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F8FAFC] dark:bg-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#475569]'
                        }`}
                      >
                        <span className={`text-[14px] font-[600] ${selectedGroups.includes(group.id) ? 'text-[#0F172A] dark:text-white' : 'text-[#475569] dark:text-[#CBD5E1]'}`}>{group.name}</span>
                        <span className="text-[12px] text-[#94A3B8]">{group.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                  <label className="text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Mensagem</label>
                  <textarea 
                    rows={6}
                    placeholder="Digite a mensagem da transmissão..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-[14px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-[#0F172A] focus:ring-[3px] focus:ring-[rgba(250,204,21,0.15)] focus:border-[#FACC15] outline-none resize-y transition-all custom-scrollbar"
                  />
                </div>

                {/* Agendamento */}
                <div className="space-y-4">
                  <label className="text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Programar envio</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={sendType === 'now'} 
                        onChange={() => setSendType('now')}
                        className="w-4 h-4 text-[#FACC15] focus:ring-[#FACC15]"
                      />
                      <span className="text-[14px] text-[#0F172A] dark:text-white font-[500]">Enviar agora</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={sendType === 'schedule'} 
                        onChange={() => setSendType('schedule')}
                        className="w-4 h-4 text-[#FACC15] focus:ring-[#FACC15]"
                      />
                      <span className="text-[14px] text-[#0F172A] dark:text-white font-[500]">Programar envio</span>
                    </label>
                  </div>

                  {sendType === 'schedule' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <div className="w-full space-y-1">
                        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Data</span>
                        <input 
                          type="date" 
                          value={scheduleDate}
                          onChange={e => setScheduleDate(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] px-3 py-2.5 text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#FACC15]"
                        />
                      </div>
                      <div className="w-full space-y-1">
                        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Hora</span>
                        <input 
                          type="time" 
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] px-3 py-2.5 text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#FACC15]"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Lado Direito - Pré-visualização */}
              <div className="w-full lg:w-[40%] bg-[#F1F5F9] dark:bg-[#020617] flex flex-col items-center justify-start p-8 relative overflow-y-auto custom-scrollbar">
                
                <div className="w-full max-w-[320px] space-y-4">
                  <div className="text-center">
                    <h4 className="text-[14px] font-[700] text-[#0F172A] dark:text-white flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4 text-[#64748B]" /> Pré-visualização
                    </h4>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">Como a mensagem aparecerá no celular</p>
                  </div>

                  <div className="bg-[#E5DDD5] dark:bg-[#0B141A] rounded-[24px] border-[8px] border-white dark:border-[#1E293B] shadow-xl w-full h-[480px] flex flex-col relative overflow-hidden">
                    {/* Header do chat fake */}
                    <div className="bg-[#075E54] dark:bg-[#202C33] p-3 flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-[14px] font-[600] line-clamp-1">
                          {selectedGroups.length > 0 ? AVAILABLE_GROUPS.filter(g => selectedGroups.includes(g.id)).map(g => g.name).join(', ') : 'Contatos selecionados'}
                        </div>
                        <div className="text-white/70 text-[11px]">
                          {totalSelectedContacts > 0 ? `${totalSelectedContacts} contatos` : 'Aguardando seleção...'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Corpo do chat fake */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-10" style={{ backgroundImage: "url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }}>
                      {/* Overlay para escurecer o fundo no dark mode se necessário */}
                      <div className="absolute inset-0 bg-white/50 dark:bg-black/60 pointer-events-none -z-10"></div>
                      
                      <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-tr-none p-3 max-w-[85%] self-end shadow-sm relative text-[#111111] dark:text-[#E9EDEF]">
                        {message ? (
                          <div className="text-[14px] whitespace-pre-wrap break-words leading-relaxed">
                            {message}
                          </div>
                        ) : (
                          <div className="text-[14px] italic text-black/40 dark:text-white/40">
                            Digite sua mensagem ao lado para visualizar aqui...
                          </div>
                        )}
                        <div className="text-[10px] text-right mt-1 text-black/40 dark:text-white/40 flex items-center justify-end gap-1">
                          10:42 <CheckCircle2 className="w-3 h-3 text-[#53BDEB]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-end gap-4 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 shrink-0">
              <button 
                onClick={() => setIsNewModalOpen(false)} 
                className="px-5 py-3 rounded-[12px] text-[14px] font-[600] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleCreateBroadcast('Rascunho')} 
                className="px-5 py-3 rounded-[12px] text-[14px] font-[600] text-[#0F172A] dark:text-white bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] shadow-sm transition-all"
              >
                Salvar rascunho
              </button>
              <button 
                onClick={() => handleCreateBroadcast('Enviando')} 
                disabled={!newBroadcastName.trim() || selectedGroups.length === 0 || !message.trim() || (sendType === 'schedule' && (!scheduleDate || !scheduleTime))}
                className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[700] text-[14px] shadow-[0_6px_16px_rgba(250,204,21,0.3)] hover:shadow-[0_8px_24px_rgba(250,204,21,0.4)] hover:-translate-y-[2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendType === 'schedule' ? 'Programar Envio' : 'Enviar agora'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Estatísticas */}
      {isStatsModalOpen && selectedBroadcast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsStatsModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[600px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A]">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-blue-500/10 flex items-center justify-center">
                  <BarChart2 className="w-[20px] h-[20px] text-blue-500" />
                </div>
                Desempenho da Transmissão
              </h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-8">
              
              <div className="text-center">
                <h4 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-1">{selectedBroadcast.name}</h4>
                <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                  Enviada em {selectedBroadcast.date} às {selectedBroadcast.time}
                </p>
              </div>

              {/* Métricas Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F8FAFC] dark:bg-[#1E293B] rounded-[16px] p-4 border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                  <div className="text-[12px] font-[600] text-[#64748B] dark:text-[#94A3B8] mb-1">Enviadas</div>
                  <div className="text-[24px] font-[700] text-[#0F172A] dark:text-white">{selectedBroadcast.sentCount}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[16px] p-4 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="text-[12px] font-[600] text-emerald-600 dark:text-emerald-400 mb-1">Entregues</div>
                  <div className="text-[24px] font-[700] text-emerald-700 dark:text-emerald-300">{selectedBroadcast.stats?.delivered || 0}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-[16px] p-4 border border-blue-100 dark:border-blue-500/20">
                  <div className="text-[12px] font-[600] text-blue-600 dark:text-blue-400 mb-1">Lidas</div>
                  <div className="text-[24px] font-[700] text-blue-700 dark:text-blue-300">{selectedBroadcast.stats?.read || 0}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 rounded-[16px] p-4 border border-red-100 dark:border-red-500/20">
                  <div className="text-[12px] font-[600] text-red-600 dark:text-red-400 mb-1">Falhas</div>
                  <div className="text-[24px] font-[700] text-red-700 dark:text-red-300">{selectedBroadcast.stats?.failed || 0}</div>
                </div>
              </div>

              {/* Gráfico de Barra Empilhada / Funil */}
              <div className="space-y-4">
                <h4 className="text-[14px] font-[700] text-[#0F172A] dark:text-white">Funil de Conversão</h4>
                
                <div className="space-y-4">
                  {/* Total de Contatos */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[12px] font-[600]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Total Selecionado</span>
                      <span className="text-[#0F172A] dark:text-white">{selectedBroadcast.totalContacts}</span>
                    </div>
                    <div className="w-full bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] h-[8px] rounded-full overflow-hidden">
                      <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  {/* Enviadas */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[12px] font-[600]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Enviadas</span>
                      <span className="text-[#0F172A] dark:text-white">{selectedBroadcast.sentCount} ({selectedBroadcast.totalContacts ? Math.round((selectedBroadcast.sentCount / selectedBroadcast.totalContacts) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] h-[8px] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FACC15] rounded-full" style={{ width: `${selectedBroadcast.totalContacts ? (selectedBroadcast.sentCount / selectedBroadcast.totalContacts) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Entregues */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[12px] font-[600]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Entregues</span>
                      <span className="text-[#0F172A] dark:text-white">{selectedBroadcast.stats?.delivered || 0} ({selectedBroadcast.sentCount ? Math.round(((selectedBroadcast.stats?.delivered || 0) / selectedBroadcast.sentCount) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] h-[8px] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedBroadcast.sentCount ? ((selectedBroadcast.stats?.delivered || 0) / selectedBroadcast.sentCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Lidas */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[12px] font-[600]">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Lidas</span>
                      <span className="text-[#0F172A] dark:text-white">{selectedBroadcast.stats?.read || 0} ({selectedBroadcast.stats?.delivered ? Math.round(((selectedBroadcast.stats?.read || 0) / selectedBroadcast.stats?.delivered) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] h-[8px] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedBroadcast.stats?.delivered ? ((selectedBroadcast.stats?.read || 0) / selectedBroadcast.stats?.delivered) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="px-8 py-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-end bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30">
              <button 
                onClick={() => setIsStatsModalOpen(false)} 
                className="px-6 py-3 rounded-[12px] bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-[600] text-[14px] shadow-sm hover:scale-[1.02] transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}