import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot,
  Search,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  ArrowLeft,
  ChevronLeft,
  ArrowRight,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import FeatureGate from '@/components/FeatureGate';

interface AutomationHistory {
  id: string;
  event: string;
  date: string;
  status: 'Sucesso' | 'Falha';
}

interface AutomationAction {
  id: string;
  type: string;
  config?: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: AutomationAction[];
  status: 'Ativa' | 'Inativa';
  createdAt: string;
  history: AutomationHistory[];
}

function AutomationsPremiumContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  // Mock data
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Boas-vindas novos leads',
      trigger: 'Novo contato cadastrado',
      actions: [
        { id: 'a1', type: 'Enviar mensagem', config: 'Olá, seja bem-vindo ao nosso sistema!' },
        { id: 'a2', type: 'Adicionar tag', config: 'Lead' }
      ],
      status: 'Ativa',
      createdAt: '15/04/2026',
      history: [
        { id: 'h1', event: 'Mensagem enviada com sucesso', date: '22/04/2026 10:30', status: 'Sucesso' },
        { id: 'h2', event: 'Mensagem enviada com sucesso', date: '21/04/2026 14:15', status: 'Sucesso' }
      ]
    },
    {
      id: '2',
      name: 'Aviso de vencimento',
      trigger: 'Vencimento próximo',
      actions: [
        { id: 'a3', type: 'Criar notificação', config: '' }
      ],
      status: 'Inativa',
      createdAt: '10/04/2026',
      history: [
        { id: 'h3', event: 'Notificação criada', date: '18/04/2026 09:00', status: 'Sucesso' }
      ]
    }
  ]);

  // New Automation Form State
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newActions, setNewActions] = useState<AutomationAction[]>([{ id: Date.now().toString(), type: '', config: '' }]);

  const TRIGGERS = [
    'Novo contato cadastrado',
    'Contato entrou em grupo',
    'Mensagem recebida',
    'Vencimento próximo',
    'Fluxo concluído'
  ];

  const ACTIONS = [
    'Enviar mensagem',
    'Adicionar tag',
    'Mover para grupo',
    'Criar notificação',
    'Iniciar fluxo'
  ];

  const filteredAutomations = useMemo(() => {
    return automations.filter(auto => 
      auto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auto.trigger.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [automations, searchTerm]);

  const handleToggleStatus = (id: string) => {
    setAutomations(prev => prev.map(auto => {
      if (auto.id === id) {
        return { ...auto, status: auto.status === 'Ativa' ? 'Inativa' : 'Ativa' };
      }
      return auto;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta automação?')) {
      setAutomations(prev => prev.filter(auto => auto.id !== id));
    }
  };

  const handleAddAction = () => {
    setNewActions([...newActions, { id: Date.now().toString(), type: '', config: '' }]);
  };

  const handleRemoveAction = (id: string) => {
    if (newActions.length > 1) {
      setNewActions(newActions.filter(a => a.id !== id));
    }
  };

  const handleActionChange = (id: string, field: 'type' | 'config', value: string) => {
    setNewActions(newActions.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleCreateAutomation = () => {
    if (!newName || !newTrigger || newActions.some(a => !a.type)) return;

    const newAuto: Automation = {
      id: Date.now().toString(),
      name: newName,
      trigger: newTrigger,
      actions: newActions,
      status: 'Ativa',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      history: []
    };

    setAutomations([newAuto, ...automations]);
    setIsNewModalOpen(false);
    
    // Reset form
    setNewName('');
    setNewTrigger('');
    setNewActions([{ id: Date.now().toString(), type: '', config: '' }]);
  };

  const openHistory = (auto: Automation) => {
    setSelectedAutomation(auto);
    setIsHistoryModalOpen(true);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 transition-opacity duration-[220ms] ease-in-out h-full">
      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Topo: Título */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F0C840] transition-colors duration-150 mb-4 text-[13px] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight mb-2 tracking-tight">Automação</h1>
            <p className="text-[16px] text-[#64748B] dark:text-slate-400 font-medium">Crie regras automáticas para executar ações inteligentes.</p>
          </div>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#FACC15] hover:from-[#FACC15] hover:to-[#D4AF37] text-slate-900 font-semibold rounded-xl shadow-[0_4px_14px_rgba(212,175,55,0.3)] transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Nova Automação
          </button>
        </div>

        {/* Search */}
          <div className="mb-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar automação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:focus:ring-[#FFD700] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Automations List */}
          {filteredAutomations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhuma automação criada ainda.</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
                Configure regras para automatizar seu atendimento e ganhar tempo no dia a dia.
              </p>
              <button 
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar primeira automação
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAutomations.map((auto) => (
                <div 
                  key={auto.id}
                  className={`
                    bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[18px] p-6 border shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1
                    ${auto.status === 'Ativa' 
                      ? 'border-[#D4AF37]/30 dark:border-[#FFD700]/30 shadow-[#D4AF37]/5' 
                      : 'border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${auto.status === 'Ativa' ? 'bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#FFD700]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{auto.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Criada em {auto.createdAt}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      auto.status === 'Ativa' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {auto.status}
                    </span>
                  </div>

                  {/* Visual Flow in Card */}
                  <div className="flex items-center gap-3 py-4 my-4 border-y border-slate-100 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                    <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 w-[140px]">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Se (Evento)</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={auto.trigger}>{auto.trigger}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-shrink-0 w-[180px]">
                      <p className="text-xs text-[#D4AF37]/80 dark:text-[#FFD700]/80 mb-1 ml-1">Então ({auto.actions.length} {auto.actions.length === 1 ? 'Ação' : 'Ações'})</p>
                      {auto.actions.map((action, idx) => (
                        <div key={action.id} className="bg-[#D4AF37]/5 dark:bg-[#FFD700]/5 p-2.5 rounded-lg border border-[#D4AF37]/20 dark:border-[#FFD700]/20 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 dark:bg-[#FFD700]/10 flex items-center justify-center text-[10px] font-bold text-[#D4AF37] dark:text-[#FFD700] flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={action.type}>{action.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <button 
                      onClick={() => openHistory(auto)}
                      className="text-sm text-[#D4AF37] dark:text-[#FFD700] hover:underline font-medium"
                    >
                      Ver Histórico
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(auto.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          auto.status === 'Ativa' 
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10' 
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
                        }`}
                        title={auto.status === 'Ativa' ? 'Desativar' : 'Ativar'}
                      >
                        {auto.status === 'Ativa' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button 
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(auto.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Automação */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-2xl rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#D4AF37] dark:text-[#FFD700]" />
                Nova Automação
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nome da automação
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Mensagem de boas-vindas"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">1</span>
                    Se (Evento / Gatilho)
                  </h4>
                  <select 
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  >
                    <option value="">Selecione um evento...</option>
                    {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                  <div className="bg-white dark:bg-[#0F172A] p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                    <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                  </div>
                </div>

                {/* Actions Loop */}
                <div className="bg-[#D4AF37]/5 dark:bg-[#FFD700]/5 p-6 rounded-2xl border border-[#D4AF37]/20 dark:border-[#FFD700]/20 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[#D4AF37] dark:text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 dark:bg-[#FFD700]/20 flex items-center justify-center text-xs">2</span>
                      Então (Ações)
                    </h4>
                    <button 
                      onClick={handleAddAction}
                      className="text-xs font-semibold text-[#D4AF37] hover:text-[#FACC15] dark:text-[#FFD700] dark:hover:text-[#FDE047] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Ação
                    </button>
                  </div>

                  {newActions.map((action, idx) => (
                    <div key={action.id} className="relative bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#D4AF37]/20 dark:border-[#FFD700]/20 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                      {newActions.length > 1 && (
                        <button 
                          onClick={() => handleRemoveAction(action.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-[#1E293B] rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                          title="Remover ação"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 dark:bg-[#FFD700]/10 flex items-center justify-center text-[10px] font-bold text-[#D4AF37] dark:text-[#FFD700]">
                          {idx + 1}
                        </span>
                        <select 
                          value={action.type}
                          onChange={(e) => handleActionChange(action.id, 'type', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                        >
                          <option value="">Selecione uma ação...</option>
                          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>

                      {action.type === 'Enviar mensagem' && (
                        <div className="pl-7 animate-in fade-in duration-300">
                          <textarea 
                            rows={2}
                            placeholder="Digite a mensagem..."
                            value={action.config || ''}
                            onChange={(e) => handleActionChange(action.id, 'config', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all resize-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Visual Flow Preview */}
                {newTrigger && newActions[0].type && (
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300 mt-6 overflow-x-auto custom-scrollbar">
                    <span className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">{newTrigger}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex gap-2 flex-shrink-0">
                      {newActions.filter(a => a.type).map((action, idx) => (
                        <div key={action.id} className="flex items-center gap-2">
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-[#D4AF37]/30 dark:border-[#FFD700]/30 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#D4AF37]/10 dark:bg-[#FFD700]/10 flex items-center justify-center text-[10px] text-[#D4AF37] dark:text-[#FFD700]">
                              {idx + 1}
                            </span>
                            {action.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateAutomation}
                disabled={!newName || !newTrigger || newActions.some(a => !a.type)}
                className="px-6 py-2.5 rounded-xl font-medium bg-[#D4AF37] hover:bg-[#FACC15] text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Ativar Automação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {isHistoryModalOpen && selectedAutomation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-lg rounded-[24px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Histórico</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedAutomation.name}</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {selectedAutomation.history.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Nenhum evento registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAutomation.history.map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'Sucesso' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{item.event}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.date}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                        item.status === 'Sucesso' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AutomationsPremium() {
  return (
    <FeatureGate feature="automacao">
      <AutomationsPremiumContent />
    </FeatureGate>
  );
}
