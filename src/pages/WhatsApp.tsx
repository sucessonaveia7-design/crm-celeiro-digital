import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Smartphone, QrCode, RefreshCw, PowerOff, ArrowLeft,
  MessageCircle, Send, CheckCheck, Clock,
  Settings, Search, User, Paperclip, CheckCircle2, AlertCircle, RefreshCcw, Link2, Loader2, Zap, Edit2, Trash2, Plus, X
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useKanbanStore } from '../store/kanbanStore';

export default function WhatsApp() {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'Desconectado' | 'Aguardando QR Code' | 'Conectado'>('Desconectado');
  const [activeTab, setActiveTab] = useState('conexao'); // 'conexao', 'mensagens', 'envio', 'historico'

  // Mensagens State
  const [selectedContact, setSelectedContact] = useState<string | number | null>('1');
  const [messageInput, setMessageInput] = useState('');

  // Automatically select contact and switch to mensagens tab if navigating from Kanban
  useEffect(() => {
    if (location.state && location.state.selectedContactId) {
      setSelectedContact(location.state.selectedContactId);
      setActiveTab('mensagens');
    }
  }, [location.state]);

  // API Settings State
  const [provider, setProvider] = useState('Evolution API');
  const [apiUrl, setApiUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [connectedNumber, setConnectedNumber] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'success' | 'error' | null>(null);

  // Quick Messages State
  const [quickMessages, setQuickMessages] = useState([
    { id: 1, title: 'Saudação', text: 'Olá, como posso ajudar?' },
    { id: 2, title: 'Boas-vindas', text: 'Seja bem-vindo!' },
    { id: 3, title: 'Espera', text: 'Em instantes retornaremos.' }
  ]);
  const [showQuickMessageModal, setShowQuickMessageModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{id: number | null, title: string, text: string}>({ id: null, title: '', text: '' });
  const [showQuickReplyMenu, setShowQuickReplyMenu] = useState(false);

  // Kanban Integration State
  const { cards, addMessageToCard, markAsRead } = useKanbanStore();
  const contacts = cards.map(card => ({
    id: card.id,
    name: card.contactName,
    number: card.number,
    lastMessage: card.lastMessage,
    time: card.lastMessageTime,
    unread: card.unread,
    stage: card.stage
  }));

  const selectedContactData = cards.find(c => c.id === selectedContact?.toString());
  const chatMessages = selectedContactData ? selectedContactData.messages : [];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;
    
    addMessageToCard(selectedContact.toString(), {
      sender: 'me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Enviado'
    });
    
    setMessageInput('');
  };

  const handleSelectContact = (id: string | number) => {
    setSelectedContact(id as number); // Keeping selectedContact as number/string
    markAsRead(id.toString());
  };

  // Mock history messages
  const historyMessages = [
    { id: 1, to: 'João Silva', text: 'Olá João! Claro, temos o plano...', status: 'Lido', time: 'Hoje, 10:25' },
    { id: 2, to: 'Grupo Vendas', text: 'Lembrete de reunião às 14h', status: 'Entregue', time: 'Hoje, 09:00' },
    { id: 3, to: 'Maria Souza', text: 'Seu boleto já está disponível.', status: 'Enviado', time: 'Ontem, 16:30' },
    { id: 4, to: 'Pedro (Lead)', text: 'Oferta especial de black friday!', status: 'Falhou', time: 'Ontem, 10:00' },
  ];

  const handleConnect = () => {
    setConnectionStatus('Aguardando QR Code');
    // Simulate connection after scanning
    setTimeout(() => {
      setConnectionStatus('Conectado');
    }, 3000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('Desconectado');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lido': return 'text-blue-500';
      case 'Entregue': return 'text-slate-500 dark:text-slate-400';
      case 'Enviado': return 'text-slate-400 dark:text-slate-500';
      case 'Falhou': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  const handleTestApi = () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    // Simulate API test
    setTimeout(() => {
      setIsTestingApi(false);
      if (apiUrl && apiToken) {
        setApiTestResult('success');
      } else {
        setApiTestResult('error');
      }
    }, 1500);
  };

  const handleSaveQuickMessage = () => {
    if (!editingMessage.title || !editingMessage.text) return;
    
    if (editingMessage.id) {
      setQuickMessages(prev => prev.map(msg => msg.id === editingMessage.id ? { ...msg, title: editingMessage.title, text: editingMessage.text } : msg));
    } else {
      setQuickMessages(prev => [...prev, { id: Date.now(), title: editingMessage.title, text: editingMessage.text }]);
    }
    setShowQuickMessageModal(false);
    setEditingMessage({ id: null, title: '', text: '' });
  };

  const handleDeleteQuickMessage = (id: number) => {
    setQuickMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleSelectQuickMessage = (text: string) => {
    setMessageInput(prev => prev ? `${prev} ${text}` : text);
    setShowQuickReplyMenu(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F0C840] transition-colors duration-150 mb-5 text-[13px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-[28px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
            <Smartphone className="text-[#D4AF37] h-8 w-8" />
            Integração com WhatsApp
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 mt-2 text-[15px]">
            Conecte seu número e gerencie mensagens, automações e transmissões.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
          {[
            { id: 'conexao', label: 'Conexão', icon: Smartphone },
            { id: 'provedor', label: 'Provedor API', icon: Link2 },
            { id: 'mensagens', label: 'Caixa de mensagens', icon: MessageCircle },
            { id: 'respostas', label: 'Mensagens Rápidas', icon: Zap },
            { id: 'envio', label: 'Envio Rápido', icon: Send },
            { id: 'historico', label: 'Histórico & Automação', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-[14px] font-[600] flex items-center gap-2 transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-[#D4AF37] dark:text-[#FFD700]' 
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37] dark:bg-[#FFD700] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'conexao' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Card */}
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
              <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
                <Smartphone className="text-[#D4AF37]" size={20} />
                Status da Conexão
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-4 h-4 rounded-full ${
                  connectionStatus === 'Conectado' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' :
                  connectionStatus === 'Aguardando QR Code' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-[16px] font-[600] text-[#0F172A] dark:text-white">
                  {connectionStatus}
                </span>
              </div>

              {connectionStatus === 'Conectado' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-slate-400">Nome da Instância</span>
                    <span className="font-[600] text-[#0F172A] dark:text-white">Atendimento Principal</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-slate-400">Número Ativo</span>
                    <span className="font-[600] text-[#0F172A] dark:text-white">+55 11 99999-9999</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-[12px] flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-slate-400">Última sincronização</span>
                    <span className="font-[600] text-[#0F172A] dark:text-white">Agora mesmo</span>
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white rounded-[12px] font-[600] text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                      <RefreshCcw size={16} />
                      Reiniciar
                    </button>
                    <button 
                      onClick={handleDisconnect}
                      className="flex-1 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-[12px] font-[600] text-[14px] hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <PowerOff size={16} />
                      Desconectar
                    </button>
                  </div>
                </div>
              ) : connectionStatus === 'Aguardando QR Code' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-[240px] h-[240px] bg-slate-100 dark:bg-slate-800 rounded-[16px] flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 relative overflow-hidden">
                    <QrCode size={120} className="text-slate-400" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent animate-scan" />
                  </div>
                  <p className="mt-6 text-[#64748B] dark:text-slate-400 text-center max-w-[280px]">
                    Abra o WhatsApp no seu celular e escaneie o código acima para conectar.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-[16px] font-[600] text-[#0F172A] dark:text-white mb-2">Nenhum número conectado ainda</h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-[14px] mb-8">
                    Conecte seu WhatsApp para começar a enviar e receber mensagens pela plataforma.
                  </p>
                  <button 
                    onClick={handleConnect}
                    className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:from-[#C5A030] hover:to-[#E2B60E] text-white rounded-[12px] font-[600] shadow-[0_4px_14px_rgba(212,175,55,0.4)] transition-all transform hover:scale-[1.02]"
                  >
                    Conectar WhatsApp
                  </button>
                </div>
              )}
            </div>

            {/* Informações Extras */}
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 h-fit">
              <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6">Integração com Automação</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Settings className="text-[#D4AF37]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-[600] text-[#0F172A] dark:text-white">Fluxos de Conversa</h3>
                    <p className="text-[13px] text-[#64748B] dark:text-slate-400 mt-1">Use o WhatsApp como canal principal para seus funis de atendimento automático.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Send className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-[600] text-[#0F172A] dark:text-white">Transmissões</h3>
                    <p className="text-[13px] text-[#64748B] dark:text-slate-400 mt-1">Envie mensagens em massa para listas de contatos com alta taxa de entrega.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" defaultChecked />
                  <span className="font-[500] text-[#0F172A] dark:text-white">Usar WhatsApp como canal padrão</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'provedor' && (
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <Link2 className="text-[#D4AF37]" size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white">Configuração do Provedor</h2>
                <p className="text-[13px] text-[#64748B] dark:text-slate-400 mt-1">Conecte sua API externa para envio e recebimento de mensagens</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Provedor de WhatsApp</label>
                  <select 
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  >
                    <option value="Twilio">Twilio</option>
                    <option value="Z-API">Z-API</option>
                    <option value="360dialog">360dialog</option>
                    <option value="Evolution API">Evolution API</option>
                    <option value="Outro">Outro (Webhook Personalizado)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">URL da API</label>
                  <input 
                    type="url" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.exemplo.com/v1"
                    className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Token de Autenticação (API Key / Bearer)</label>
                  <input 
                    type="password" 
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Insira seu token de acesso"
                    className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Instance ID (Opcional)</label>
                  <input 
                    type="text" 
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="Ex: instance_12345"
                    className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Número Conectado</label>
                  <input 
                    type="text" 
                    value={connectedNumber}
                    onChange={(e) => setConnectedNumber(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {apiTestResult === 'success' && (
                    <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-full text-[13px] font-[600] animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={16} />
                      Conexão estabelecida com sucesso!
                    </div>
                  )}
                  {apiTestResult === 'error' && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-full text-[13px] font-[600] animate-in fade-in zoom-in duration-300">
                      <AlertCircle size={16} />
                      Falha ao conectar. Verifique os dados.
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className={`px-6 py-3 rounded-[12px] font-[600] flex items-center gap-2 transition-all ${
                    isTestingApi 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white'
                  }`}
                >
                  {isTestingApi ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  {isTestingApi ? 'Testando...' : 'Testar Conexão'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mensagens' && (
          <div className="bg-white dark:bg-[#0F172A] rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 flex h-[600px] overflow-hidden">
            {/* Lista de Contatos */}
            <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar conversa..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contacts.map(contact => (
                  <button 
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 text-left
                      ${selectedContact === contact.id ? 'bg-slate-50 dark:bg-slate-800/80 border-l-4 border-l-[#D4AF37]' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="text-slate-500 dark:text-slate-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-[600] text-[#0F172A] dark:text-white truncate">{contact.name}</h4>
                        <span className="text-[12px] text-[#64748B] dark:text-slate-500 whitespace-nowrap ml-2">{contact.time}</span>
                      </div>
                      <p className="text-[13px] text-[#64748B] dark:text-slate-400 truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-white text-[11px] font-[700] flex items-center justify-center mt-1">
                        {contact.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#020617]">
              {selectedContact ? (
                <>
                  <div className="p-4 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="text-slate-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-[600] text-[#0F172A] dark:text-white">{contacts.find(c => c.id === selectedContact)?.name}</h3>
                        <p className="text-[12px] text-[#64748B] dark:text-slate-400">{contacts.find(c => c.id === selectedContact)?.number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-[16px] ${
                          msg.sender === 'me' 
                            ? 'bg-[#D4AF37] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="text-[14px] leading-relaxed">{msg.text}</p>
                          <div className={`text-[11px] mt-1 flex items-center justify-end gap-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-slate-400'}`}>
                            {msg.time}
                            {msg.sender === 'me' && <CheckCheck size={14} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 relative">
                    {/* Menu de Respostas Rápidas */}
                    {showQuickReplyMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#1E293B] rounded-[16px] shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden z-10">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] flex justify-between items-center">
                          <span className="text-[13px] font-[600] text-[#0F172A] dark:text-white flex items-center gap-2">
                            <Zap size={14} className="text-[#D4AF37]" />
                            Respostas Rápidas
                          </span>
                          <button onClick={() => setShowQuickReplyMenu(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {quickMessages.length === 0 ? (
                            <div className="text-center p-4 text-[13px] text-slate-500">
                              Nenhuma mensagem rápida salva.
                            </div>
                          ) : (
                            quickMessages.map(msg => (
                              <button 
                                key={msg.id}
                                onClick={() => handleSelectQuickMessage(msg.text)}
                                className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[10px] transition-colors mb-1 last:mb-0"
                              >
                                <div className="text-[13px] font-[600] text-[#0F172A] dark:text-white mb-1">{msg.title}</div>
                                <div className="text-[12px] text-[#64748B] dark:text-slate-400 truncate">{msg.text}</div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowQuickReplyMenu(!showQuickReplyMenu)}
                        className={`p-2 transition-colors rounded-full ${showQuickReplyMenu ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-slate-400 hover:text-[#D4AF37] hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Mensagens Rápidas"
                      >
                        <Zap size={20} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Paperclip size={20} />
                      </button>
                      <input 
                        type="text" 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        placeholder="Digite uma mensagem..." 
                        className="flex-1 py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="p-2.5 bg-[#D4AF37] text-white rounded-[12px] hover:bg-[#C5A030] transition-colors shadow-[0_4px_10px_rgba(212,175,55,0.3)]"
                      >
                        <Send size={18} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#64748B] dark:text-slate-500">
                  Selecione uma conversa para começar
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'respostas' && (
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white">Mensagens Rápidas</h2>
                <p className="text-[13px] text-[#64748B] dark:text-slate-400 mt-1">Crie e gerencie textos prontos para agilizar seus atendimentos</p>
              </div>
              <button 
                onClick={() => {
                  setEditingMessage({ id: null, title: '', text: '' });
                  setShowQuickMessageModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:from-[#C5A030] hover:to-[#E2B60E] text-white rounded-[10px] font-[600] text-[13px] shadow-[0_4px_14px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Mensagem
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickMessages.map(msg => (
                <div key={msg.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-[16px] hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-colors group relative bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-[600] text-[#0F172A] dark:text-white flex items-center gap-2">
                      <Zap size={14} className="text-[#D4AF37]" />
                      {msg.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingMessage(msg);
                          setShowQuickMessageModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuickMessage(msg.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#64748B] dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              
              {quickMessages.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[16px]">
                  <Zap size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-[#0F172A] dark:text-white font-[600] mb-1">Nenhuma mensagem salva</p>
                  <p className="text-[13px] text-[#64748B] dark:text-slate-400">Clique em "Nova Mensagem" para adicionar atalhos de texto.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'envio' && (
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 max-w-2xl">
            <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6">Envio Rápido de Mensagem</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Selecionar Contato</label>
                <select className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37]">
                  <option>Selecione um contato</option>
                  <option>João Silva</option>
                  <option>Maria Souza</option>
                </select>
              </div>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[12px] uppercase font-bold tracking-wider">OU</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <div>
                <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Selecionar Grupo</label>
                <select className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37]">
                  <option>Selecione um grupo</option>
                  <option>Leads Novembro</option>
                  <option>Clientes VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Mensagem</label>
                <textarea 
                  rows={4}
                  placeholder="Digite sua mensagem aqui..."
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] resize-none"
                ></textarea>
              </div>

              <button className="w-full py-3 mt-4 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:from-[#C5A030] hover:to-[#E2B60E] text-white rounded-[12px] font-[600] shadow-[0_4px_14px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                <Send size={18} />
                Enviar Mensagem
              </button>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
            <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6">Histórico de Envios</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 text-[13px] font-[600]">
                    <th className="pb-3 font-[600]">Destinatário</th>
                    <th className="pb-3 font-[600]">Mensagem</th>
                    <th className="pb-3 font-[600]">Data/Hora</th>
                    <th className="pb-3 font-[600]">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {historyMessages.map(msg => (
                    <tr key={msg.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 font-[500] text-[#0F172A] dark:text-white">{msg.to}</td>
                      <td className="py-4 text-[#64748B] dark:text-slate-400 truncate max-w-[200px]">{msg.text}</td>
                      <td className="py-4 text-[#64748B] dark:text-slate-400">{msg.time}</td>
                      <td className="py-4">
                        <span className={`flex items-center gap-1 font-[500] ${getStatusColor(msg.status)}`}>
                          {msg.status === 'Lido' && <CheckCheck size={16} />}
                          {msg.status === 'Entregue' && <CheckCheck size={16} className="opacity-70" />}
                          {msg.status === 'Enviado' && <CheckCircle2 size={16} />}
                          {msg.status === 'Falhou' && <AlertCircle size={16} />}
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Modal Quick Message */}
      {showQuickMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-2">
                <Zap className="text-[#D4AF37]" size={20} />
                {editingMessage.id ? 'Editar Mensagem' : 'Nova Mensagem Rápida'}
              </h2>
              <button 
                onClick={() => setShowQuickMessageModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Título / Atalho</label>
                <input 
                  type="text" 
                  value={editingMessage.title}
                  onChange={e => setEditingMessage({...editingMessage, title: e.target.value})}
                  placeholder="Ex: Saudação"
                  className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50"
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">Mensagem</label>
                <textarea 
                  value={editingMessage.text}
                  onChange={e => setEditingMessage({...editingMessage, text: e.target.value})}
                  placeholder="Digite o texto da mensagem rápida..."
                  rows={5}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowQuickMessageModal(false)}
                className="px-5 py-2.5 text-[14px] font-[600] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[10px] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveQuickMessage}
                disabled={!editingMessage.title || !editingMessage.text}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C5A030] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-[600] rounded-[10px] shadow-[0_4px_10px_rgba(212,175,55,0.3)] transition-all"
              >
                Salvar Mensagem
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}