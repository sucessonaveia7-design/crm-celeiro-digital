import { useState, useEffect } from 'react';
import { 
  BarChart2, PieChart, TrendingUp, Users, MessageSquare,
  HeadphonesIcon, Calendar, Download, Filter, ChevronDown,
  ArrowUpRight, ArrowDownRight, Clock, FileText, CheckCircle2
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

type Period = 'today' | '7days' | '30days' | 'custom';

export default function ReportsPremium() {
  const { isDarkMode } = useThemeStore();
  const [period, setPeriod] = useState<Period>('30days');
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [viewMode, setViewMode] = useState<'detailed' | 'executive'>('detailed');
  const [weeklyGrowth, setWeeklyGrowth] = useState(12.5);

  // Data states for real-time updates
  const [summaryCards, setSummaryCards] = useState([
    { title: 'Total de Contatos', value: '2.450', change: '+12%', icon: Users, positive: true },
    { title: 'Total de Grupos', value: '45', change: '+3%', icon: PieChart, positive: true },
    { title: 'Total de Transmissões', value: '128', change: '-5%', icon: BarChart2, positive: false },
    { title: 'Mensagens Enviadas', value: '45.2K', change: '+24%', icon: MessageSquare, positive: true },
    { title: 'Total de Atendimentos', value: '850', change: '+8%', icon: HeadphonesIcon, positive: true },
  ]);

  const [mainChartData, setMainChartData] = useState([
    { day: 'Seg', contacts: 12, messages: 450, support: 15 },
    { day: 'Ter', contacts: 18, messages: 620, support: 22 },
    { day: 'Qua', contacts: 15, messages: 380, support: 18 },
    { day: 'Qui', contacts: 25, messages: 850, support: 30 },
    { day: 'Sex', contacts: 22, messages: 720, support: 28 },
    { day: 'Sáb', contacts: 10, messages: 210, support: 8 },
    { day: 'Dom', contacts: 5, messages: 150, support: 5 },
  ]);

  const [categoryData, setCategoryData] = useState([
    { label: 'Membros', value: 65, color: '#D4AF37' },
    { label: 'Visitantes', value: 20, color: '#3B82F6' },
    { label: 'Líderes', value: 10, color: '#10B981' },
    { label: 'Equipe', value: 5, color: '#6366F1' },
  ]);

  const [broadcastReports, setBroadcastReports] = useState([
    { id: 1, name: 'Aviso de Culto', date: '22/04/2026', sent: 1200, delivered: 1180, read: 950 },
    { id: 2, name: 'Mensagem Semanal', date: '20/04/2026', sent: 850, delivered: 845, read: 720 },
    { id: 3, name: 'Reunião de Líderes', date: '18/04/2026', sent: 45, delivered: 45, read: 42 },
  ]);

  const [supportReports, setSupportReports] = useState([
    { name: 'João Silva', total: 145, avgTime: '2m 30s', resolved: 140 },
    { name: 'Maria Souza', total: 120, avgTime: '3m 15s', resolved: 115 },
    { name: 'Pedro Santos', total: 85, avgTime: '1m 45s', resolved: 82 },
  ]);

  // Auto-update effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Update Summary Cards
      setSummaryCards(prev => prev.map(card => {
        // Random fluctuation for values
        const isK = card.value.includes('K');
        let numValue = parseFloat(card.value.replace(/\./g, '').replace(',', '.'));
        
        if (isK) {
          numValue += (Math.random() * 0.1);
          return { ...card, value: numValue.toFixed(1) + 'K' };
        } else {
          // Add 0-5 random increments
          numValue += Math.floor(Math.random() * 5);
          // format back to dot notation if > 999
          const formattedValue = numValue > 999 ? numValue.toLocaleString('pt-BR').replace(',', '.') : numValue.toString();
          return { ...card, value: formattedValue };
        }
      }));

      // Update Main Chart Data (fluctuate slightly)
      setMainChartData(prev => prev.map(data => ({
        ...data,
        contacts: data.contacts + Math.floor(Math.random() * 3),
        messages: data.messages + Math.floor(Math.random() * 20),
        support: data.support + Math.floor(Math.random() * 2),
      })));

      // Update Support Reports
      setSupportReports(prev => prev.map(rep => ({
        ...rep,
        total: rep.total + Math.floor(Math.random() * 2),
        resolved: rep.resolved + Math.floor(Math.random() * 2)
      })));

      // Update Weekly Growth
      setWeeklyGrowth(prev => {
        const variation = (Math.random() * 0.4) - 0.1; // -0.1 to +0.3 variation
        return parseFloat((prev + variation).toFixed(1));
      });

    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleData = () => setHasData(!hasData);

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] shrink-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[#D4AF37]" />
                Relatórios
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Acompanhe o desempenho e os resultados da plataforma.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mr-2">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'detailed' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Detalhado
                </button>
                <button
                  onClick={() => setViewMode('executive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'executive' 
                      ? 'bg-[#D4AF37] text-slate-900 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Executivo
                </button>
              </div>

              {/* Period Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                {[
                  { id: 'today', label: 'Hoje' },
                  { id: '7days', label: '7 dias' },
                  { id: '30days', label: '30 dias' },
                  { id: 'custom', label: 'Personalizado' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id as Period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      period === p.id 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>01/04/2026 - 22/04/2026</span>
                  </div>
                </div>
              )}

              {/* Advanced Filters Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  showFilters 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              {/* Export Button Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowExport(!showExport)}
                  className="px-4 py-2.5 rounded-xl font-medium bg-[#D4AF37] hover:bg-[#FACC15] text-slate-900 transition-colors shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar relatório
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </button>
                
                {showExport && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <FileText className="w-4 h-4 text-red-500" />
                      Exportar como PDF
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <FileText className="w-4 h-4 text-green-500" />
                      Exportar como Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <select className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-[#D4AF37]">
                  <option value="">Todos os Grupos</option>
                  <option value="jovens">Jovens</option>
                  <option value="mulheres">Mulheres</option>
                </select>
                <select className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-[#D4AF37]">
                  <option value="">Tipo de Contato</option>
                  <option value="membro">Membro</option>
                  <option value="visitante">Visitante</option>
                </select>
                <select className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-[#D4AF37]">
                  <option value="">Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
                <button className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity">
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* For testing empty state */}
            {/* <button onClick={toggleData} className="px-4 py-2 bg-slate-200 text-sm rounded">Toggle Data (Test)</button> */}

            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <BarChart2 className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum dado disponível ainda.</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                  Os gráficos e relatórios aparecerão aqui assim que houver atividade suficiente na plataforma para gerar estatísticas.
                </p>
              </div>
            ) : viewMode === 'executive' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {/* 1. Crescimento Semanal */}
                <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[240px] group hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Crescimento Semanal</p>
                      <h2 className="text-5xl font-bold text-slate-900 dark:text-white mt-3">+{weeklyGrowth.toFixed(1)}%</h2>
                    </div>
                    <div className="p-4 bg-green-100 dark:bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="flex items-end gap-1.5 mt-8 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-t-md relative overflow-hidden" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-0 w-full bg-green-500 dark:bg-green-400 rounded-t-md transition-all duration-1000" style={{ height: `${h * (weeklyGrowth/15)}%`, maxHeight: '100%' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Total de Usuários */}
                <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[240px] group hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Total de Usuários</p>
                      <h2 className="text-5xl font-bold text-slate-900 dark:text-white mt-3">{summaryCards[0].value}</h2>
                    </div>
                    <div className="p-4 bg-blue-100 dark:bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  {/* Sparkline Bars */}
                  <div className="flex items-end gap-2 mt-8 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                    {[30, 40, 60, 50, 80, 70, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t-md transition-all duration-1000 hover:bg-blue-600" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* 3. Total de Mensagens */}
                <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[240px] group hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Total de Mensagens</p>
                      <h2 className="text-5xl font-bold text-slate-900 dark:text-white mt-3">{summaryCards[3].value}</h2>
                    </div>
                    <div className="p-4 bg-purple-100 dark:bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  {/* Sparkline Area mock */}
                  <div className="relative mt-8 h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity flex items-end">
                     <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                        <path d="M0,40 L0,25 Q10,10 20,20 T40,15 T60,25 T80,10 L100,5 L100,40 Z" className="fill-purple-100 dark:fill-purple-900/30" />
                        <path d="M0,25 Q10,10 20,20 T40,15 T60,25 T80,10 L100,5" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 dark:text-purple-400" />
                     </svg>
                  </div>
                </div>

                {/* 4. Total de Atendimentos */}
                <div className="bg-white dark:bg-[#0F172A] rounded-[24px] p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[240px] group hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Total de Atendimentos</p>
                      <h2 className="text-5xl font-bold text-slate-900 dark:text-white mt-3">{summaryCards[4].value}</h2>
                    </div>
                    <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <HeadphonesIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  {/* Sparkline Dots/Bars */}
                  <div className="flex items-center gap-2 mt-8 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                    {[15, 25, 20, 45, 30, 50, 65, 55, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-orange-200 dark:bg-orange-900/50 rounded-full relative overflow-hidden h-full">
                        <div className="absolute bottom-0 w-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all duration-1000" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 space-y-8">
                {/* 1. Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {summaryCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white dark:bg-[#0F172A] rounded-[16px] p-[18px] shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 group hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
                          <card.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                          card.positive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {card.change}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 2. Main Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-[16px] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Crescimento ao longo do tempo</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Evolução diária de atividades</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                          <span className="text-slate-600 dark:text-slate-400">Contatos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-600" />
                          <span className="text-slate-600 dark:text-slate-400">Mensagens</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom CSS Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-2">
                      {mainChartData.map((data, idx) => {
                        const maxMessages = 1000;
                        const h1 = (data.messages / maxMessages) * 100;
                        const h2 = (data.contacts / 50) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full flex justify-center items-end gap-1 h-full relative">
                              {/* Tooltip */}
                              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                                {data.messages} msgs | {data.contacts} contatos
                              </div>
                              <div 
                                className="w-1/3 bg-slate-800 dark:bg-slate-600 rounded-t-sm transition-all duration-1000 group-hover:bg-slate-700"
                                style={{ height: `${h1}%` }}
                              />
                              <div 
                                className="w-1/3 bg-[#D4AF37] rounded-t-sm transition-all duration-1000 group-hover:bg-[#FACC15]"
                                style={{ height: `${h2}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{data.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Category Chart (Donut) */}
                  <div className="bg-white dark:bg-[#0F172A] rounded-[16px] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in duration-700 delay-100">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Distribuição de Contatos</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8">Por tipo de categoria</p>
                    
                    <div className="flex flex-col items-center justify-center">
                      {/* CSS Donut Chart */}
                      <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-8" style={{
                        background: `conic-gradient(
                          ${categoryData[0].color} 0% ${categoryData[0].value}%, 
                          ${categoryData[1].color} ${categoryData[0].value}% ${categoryData[0].value + categoryData[1].value}%, 
                          ${categoryData[2].color} ${categoryData[0].value + categoryData[1].value}% ${categoryData[0].value + categoryData[1].value + categoryData[2].value}%, 
                          ${categoryData[3].color} ${categoryData[0].value + categoryData[1].value + categoryData[2].value}% 100%
                        )`
                      }}>
                        <div className="w-32 h-32 bg-white dark:bg-[#0F172A] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">100%</span>
                          <span className="text-xs text-slate-500">Total</span>
                        </div>
                      </div>

                      <div className="w-full space-y-3">
                        {categoryData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 4. Relatório de Transmissões */}
                  <div className="bg-white dark:bg-[#0F172A] rounded-[16px] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in duration-700 delay-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Relatório de Transmissões</h2>
                      <button className="text-sm font-medium text-[#D4AF37] hover:text-[#FACC15] transition-colors">Ver todas</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Nome da Transmissão</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Data</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Enviada</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Entregue</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Lida</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {broadcastReports.map((report) => (
                            <tr key={report.id} className="group">
                              <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">{report.name}</td>
                              <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{report.date}</td>
                              <td className="py-4 text-sm text-slate-700 dark:text-slate-300 text-right">{report.sent}</td>
                              <td className="py-4 text-sm text-green-600 dark:text-green-400 font-medium text-right">{report.delivered}</td>
                              <td className="py-4 text-sm text-blue-600 dark:text-blue-400 font-medium text-right">{report.read}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. Relatório de Atendimentos */}
                  <div className="bg-white dark:bg-[#0F172A] rounded-[16px] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in duration-700 delay-300">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Relatório de Atendimentos</h2>
                      <button className="text-sm font-medium text-[#D4AF37] hover:text-[#FACC15] transition-colors">Detalhes</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Atendente</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">Atendimentos</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">T. Médio</th>
                            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Finalizadas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {supportReports.map((report, idx) => (
                            <tr key={idx} className="group">
                              <td className="py-4 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                                  {report.name.charAt(0)}
                                </div>
                                {report.name}
                              </td>
                              <td className="py-4 text-sm text-slate-700 dark:text-slate-300 text-center">{report.total}</td>
                              <td className="py-4 text-sm text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" /> {report.avgTime}
                              </td>
                              <td className="py-4 text-sm text-green-600 dark:text-green-400 font-medium text-right flex items-center justify-end gap-1">
                                {report.resolved} <CheckCircle2 className="w-3 h-3" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}