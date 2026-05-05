import React, { useState, useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { 
  Plus,
  Filter,
  X,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlignLeft,
  Users as UsersIcon,
  Pencil,
  Bell,
  Mail,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

// Interfaces
interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  tipo: 'Culto' | 'Reunião' | 'Transmissão' | 'Atendimento';
  grupo?: string;
  observacoes?: string;
  lembrete?: '10 minutos antes' | '1 hora antes' | '1 dia antes' | 'Nenhum';
  notificacoes?: string[]; // 'sistema', 'email'
}

const coresPorTipo = {
  'Culto': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  'Reunião': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  'Transmissão': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  'Atendimento': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
};

const dotColors = {
  'Culto': 'bg-blue-500',
  'Reunião': 'bg-yellow-500',
  'Transmissão': 'bg-purple-500',
  'Atendimento': 'bg-green-500'
};

export default function CalendarioEventos() {
  const { isDarkMode } = useThemeStore();

  // Estados do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'Mensal' | 'Semanal' | 'Diário'>('Mensal');
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: '1',
      titulo: 'Culto de Domingo',
      descricao: 'Culto da família',
      data: new Date().toISOString().split('T')[0],
      hora: '19:00',
      tipo: 'Culto',
      lembrete: '1 hora antes',
      notificacoes: ['sistema']
    }
  ]);
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>(['Culto', 'Reunião', 'Transmissão', 'Atendimento']);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<Partial<Evento>>({
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    hora: '19:00',
    tipo: 'Culto',
    grupo: '',
    observacoes: '',
    lembrete: '1 hora antes',
    notificacoes: ['sistema']
  });

  // Helpers de Data
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handlePrev = () => {
    if (viewMode === 'Mensal') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'Semanal') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Mensal') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'Semanal') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const toggleFiltro = (tipo: string) => {
    if (filtrosAtivos.includes(tipo)) {
      setFiltrosAtivos(filtrosAtivos.filter(t => t !== tipo));
    } else {
      setFiltrosAtivos([...filtrosAtivos, tipo]);
    }
  };

  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => filtrosAtivos.includes(e.tipo));
  }, [eventos, filtrosAtivos]);

  const openNewEventModal = () => {
    setEventoEditando(null);
    setFormData({
      titulo: '',
      descricao: '',
      data: currentDate.toISOString().split('T')[0],
      hora: '19:00',
      tipo: 'Culto',
      grupo: '',
      observacoes: '',
      lembrete: '1 hora antes',
      notificacoes: ['sistema']
    });
    setIsModalOpen(true);
  };

  const openEditEventModal = (evento: Evento) => {
    setEventoEditando(evento);
    setFormData({ ...evento });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!formData.titulo || !formData.data || !formData.hora) return;

    if (eventoEditando) {
      setEventos(eventos.map(e => e.id === eventoEditando.id ? { ...formData, id: e.id } as Evento : e));
    } else {
      setEventos([...eventos, { ...formData, id: Math.random().toString(36).substr(2, 9) } as Evento]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (eventoEditando) {
      setEventos(eventos.filter(e => e.id !== eventoEditando.id));
      setIsModalOpen(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, evento: Evento) => {
    e.dataTransfer.setData('text/plain', evento.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string, targetHora?: string) => {
    e.preventDefault();
    const eventoId = e.dataTransfer.getData('text/plain');
    const evento = eventos.find(ev => ev.id === eventoId);
    
    if (evento) {
      const updatedEventos = eventos.map(ev => {
        if (ev.id === eventoId) {
          return { 
            ...ev, 
            data: targetDateStr, 
            hora: targetHora || ev.hora 
          };
        }
        return ev;
      });
      setEventos(updatedEventos);
    }
  };

  // Renderização do Calendário Mensal
  const renderMes = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-[#1e293b]/50 p-2 rounded-lg"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = eventosFiltrados.filter(e => e.data === dateStr);
      
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={day} 
          className={`min-h-[120px] bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-[#1e293b] p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow relative group ${isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateStr)}
        >
          <div className={`text-sm font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
            {day}
          </div>
          <div className="space-y-1.5 flex flex-col max-h-[80px] overflow-y-auto custom-scrollbar">
            {dayEvents.map(evento => (
              <div 
                key={evento.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, evento)}
                onClick={() => openEditEventModal(evento)}
                className={`text-xs px-2 py-1 rounded cursor-pointer truncate font-medium border ${coresPorTipo[evento.tipo]} flex items-center gap-1.5 hover:opacity-80 transition-opacity`}
                title={`${evento.hora} - ${evento.titulo}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[evento.tipo]}`}></span>
                <span className="opacity-70 text-[10px]">{evento.hora}</span>
                <span className="truncate">{evento.titulo}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => {
              setFormData(prev => ({ ...prev, data: dateStr }));
              setIsModalOpen(true);
              setEventoEditando(null);
            }}
            className="absolute top-2 right-2 p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-[#020617] rounded-[18px] p-6 shadow-[0_10px_26px_rgba(15,23,42,0.06)] border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {days}
        </div>
      </div>
    );
  };

  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(curr.setDate(first + i));
      days.push(dayDate);
    }
    return days;
  };

  const renderSemana = () => {
    const days = getWeekDays();
    return (
      <div className="bg-white dark:bg-[#020617] rounded-[18px] p-6 shadow-[0_10px_26px_rgba(15,23,42,0.06)] border border-slate-100 dark:border-slate-800 flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 min-w-[800px]">
          {days.map((dayObj, i) => {
            const dateStr = dayObj.toISOString().split('T')[0];
            const dayEvents = eventosFiltrados.filter(e => e.data === dateStr).sort((a, b) => a.hora.localeCompare(b.hora));
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            return (
              <div key={i} 
                className="flex flex-col h-full min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <div className={`text-center py-3 border-b-2 mb-3 ${isToday ? 'border-blue-500' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{weekDays[i]}</div>
                  <div className={`text-xl font-bold mt-1 ${isToday ? 'text-blue-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {dayObj.getDate()}
                  </div>
                </div>
                <div className="flex-1 space-y-2 relative group">
                  {dayEvents.map(evento => (
                    <div 
                      key={evento.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, evento)}
                      onClick={() => openEditEventModal(evento)}
                      className={`p-3 rounded-xl cursor-pointer border ${coresPorTipo[evento.tipo]} hover:opacity-90 transition-opacity shadow-sm`}
                    >
                      <div className="text-xs font-bold opacity-70 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evento.hora}
                      </div>
                      <div className="font-semibold text-sm leading-tight">{evento.titulo}</div>
                      {evento.descricao && <div className="text-xs mt-2 opacity-80 line-clamp-2">{evento.descricao}</div>}
                    </div>
                  ))}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-50/50 dark:bg-slate-800/20 rounded-lg flex items-center justify-center cursor-pointer transition-opacity border-2 border-dashed border-slate-200 dark:border-slate-700 pointer-events-none"
                    style={{ display: dayEvents.length === 0 ? 'flex' : 'none' }}
                  >
                    <Plus className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDia = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayEvents = eventosFiltrados.filter(e => e.data === dateStr).sort((a, b) => a.hora.localeCompare(b.hora));

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    return (
      <div className="bg-white dark:bg-[#020617] rounded-[18px] p-8 shadow-[0_10px_26px_rgba(15,23,42,0.06)] border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <CalendarIcon className="text-blue-500 w-6 h-6" />
          {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="flex flex-col rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
          {hours.map(hour => {
            const hourPrefix = hour.substring(0, 2);
            const hourEvents = dayEvents.filter(e => e.hora.startsWith(hourPrefix));
            
            return (
              <div 
                key={hour} 
                className="flex border-b border-slate-100 dark:border-slate-800 last:border-0 min-h-[100px] group"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr, hour)}
              >
                <div className="w-24 flex-shrink-0 flex items-center justify-center border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{hour}</span>
                </div>
                <div className="flex-1 p-3 bg-white/50 dark:bg-[#0f172a]/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative flex flex-col gap-2">
                  {hourEvents.map(evento => (
                    <div 
                      key={evento.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, evento)}
                      onClick={() => openEditEventModal(evento)}
                      className={`p-4 rounded-xl cursor-pointer border ${coresPorTipo[evento.tipo]} hover:-translate-y-0.5 transition-transform duration-200 shadow-sm relative`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-md">{evento.hora}</span>
                          <span className="text-xs uppercase tracking-wider font-bold opacity-80">{evento.tipo}</span>
                        </div>
                        <h4 className="text-base font-bold sm:text-right">{evento.titulo}</h4>
                      </div>
                      
                      {evento.descricao && <p className="text-sm opacity-90 mb-3">{evento.descricao}</p>}
                      
                      <div className="flex flex-wrap gap-3 text-xs font-medium opacity-80 mt-auto">
                        {evento.lembrete && evento.lembrete !== 'Nenhum' && (
                          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">
                            <Bell className="w-3.5 h-3.5" /> {evento.lembrete}
                          </span>
                        )}
                        {evento.grupo && (
                          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">
                            <UsersIcon className="w-3.5 h-3.5" /> {evento.grupo}
                          </span>
                        )}
                        {evento.observacoes && (
                          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">
                            <AlignLeft className="w-3.5 h-3.5" /> Observações incluídas
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Plus button for empty hours */}
                  <button 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, data: dateStr, hora: hour }));
                      setIsModalOpen(true);
                      setEventoEditando(null);
                    }}
                    className="absolute inset-0 m-auto w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-blue-200 dark:border-blue-800 z-0"
                    style={{ display: hourEvents.length === 0 ? 'flex' : 'none' }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 transition-opacity duration-[220ms] ease-in-out h-full">
      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
            
            {/* Topo: Título e Ações */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight mb-2 tracking-tight">Calendário de Eventos</h1>
                <p className="text-[16px] text-[#64748B] dark:text-slate-400 font-medium">Gerencie eventos, transmissões e atendimentos.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                {/* Seletor de Visualização */}
                <div className="flex bg-white dark:bg-[#0f172a] p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  {['Mensal', 'Semanal', 'Diário'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === mode 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={openNewEventModal}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Novo Evento
                </button>
              </div>
            </div>

            {/* Controles e Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-[#0f172a] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              
              {/* Navegação de Mês/Semana/Dia */}
              <div className="flex items-center gap-4">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white min-w-[200px] text-center capitalize">
                  {viewMode === 'Mensal' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {viewMode === 'Semanal' && `Semana de ${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]}`}
                  {viewMode === 'Diário' && `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]}`}
                </h2>
                <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Hoje
                </button>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                {['Culto', 'Reunião', 'Transmissão', 'Atendimento'].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => toggleFiltro(tipo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      filtrosAtivos.includes(tipo)
                        ? coresPorTipo[tipo as keyof typeof coresPorTipo]
                        : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendário Area */}
            {viewMode === 'Mensal' && renderMes()}
            {viewMode === 'Semanal' && renderSemana()}
            {viewMode === 'Diário' && renderDia()}

          </div>
        </div>
      {/* Modal Criar/Editar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {eventoEditando ? <Pencil className="w-5 h-5 text-blue-500" /> : <CalendarDays className="w-5 h-5 text-blue-500" />}
                {eventoEditando ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Título do Evento *</label>
                  <input 
                    type="text" 
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: Culto de Celebração"
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Data *</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hora *</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="time" 
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Tipo de Evento */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipo do Evento *</label>
                  <select 
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="Culto">Culto</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Transmissão">Transmissão</option>
                    <option value="Atendimento">Atendimento</option>
                  </select>
                </div>

                {/* Grupo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Selecionar Grupo</label>
                  <select 
                    value={formData.grupo}
                    onChange={(e) => setFormData({...formData, grupo: e.target.value})}
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Nenhum grupo específico</option>
                    <option value="Jovens">Jovens</option>
                    <option value="Mulheres">Mulheres</option>
                    <option value="Liderança">Liderança</option>
                  </select>
                </div>

                {/* Lembrete */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lembrete *</label>
                  <select 
                    value={formData.lembrete}
                    onChange={(e) => setFormData({...formData, lembrete: e.target.value as any})}
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="10 minutos antes">10 minutos antes</option>
                    <option value="1 hora antes">1 hora antes</option>
                    <option value="1 dia antes">1 dia antes</option>
                    <option value="Nenhum">Nenhum</option>
                  </select>
                </div>

                {/* Canais de Notificação */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Enviar notificação por *</label>
                  <div className="flex flex-col gap-3 mt-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.notificacoes?.includes('sistema') ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-[#020617] border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                        {formData.notificacoes?.includes('sistema') && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.notificacoes?.includes('sistema')}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const current = formData.notificacoes || [];
                          setFormData({
                            ...formData, 
                            notificacoes: checked ? [...current, 'sistema'] : current.filter(n => n !== 'sistema')
                          });
                        }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-400" />
                        Notificação no sistema
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.notificacoes?.includes('email') ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-[#020617] border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                        {formData.notificacoes?.includes('email') && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.notificacoes?.includes('email')}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const current = formData.notificacoes || [];
                          setFormData({
                            ...formData, 
                            notificacoes: checked ? [...current, 'email'] : current.filter(n => n !== 'email')
                          });
                        }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        Notificação por email
                      </span>
                    </label>
                  </div>
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
                  <textarea 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    rows={3}
                    placeholder="Detalhes sobre o evento..."
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Observações */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Observações Adicionais</label>
                  <textarea 
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={2}
                    placeholder="Anotações internas..."
                    className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              {eventoEditando ? (
                <button 
                  onClick={handleDeleteEvent}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              ) : (
                <div></div> // Spacer
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEvent}
                  disabled={!formData.titulo || !formData.data || !formData.hora}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
                >
                  Salvar Evento
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
// Substituir a importação faltante de Pencil (se necessário)
// import { Pencil } from 'lucide-react';
