import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { hasAccess } from '@/lib/permissions';
import { useThemeStore } from '../store/themeStore';
import { useWhatsAppStore, Provider, ConnectionStatus } from '../store/whatsappStore';
import {
  Smartphone,
  Settings,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PowerOff,
  Save,
  Clock,
  QrCode,
  ShieldAlert,
  Wifi,
  WifiOff,
  Trash2,
  ArrowLeft
} from 'lucide-react';

interface EventLog {
  id: number;
  message: string;
  time: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

function WhatsAppConfigContent() {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  
  // Store
  const { 
    isConfigured, 
    provider, 
    apiUrl, 
    apiToken, 
    instanceId, 
    instanceName, 
    connectedNumber, 
    connectionStatus, 
    lastSyncAt, 
    setConfig, 
    setStatus, 
    setLastSync, 
    disconnect,
    clearConfig
  } = useWhatsAppStore();
  
  // Local state for forms
  const [localProvider, setLocalProvider] = useState<Provider>(provider);
  const [localApiUrl, setLocalApiUrl] = useState(apiUrl);
  const [localApiToken, setLocalApiToken] = useState(apiToken);
  const [localInstanceId, setLocalInstanceId] = useState(instanceId);
  const [localInstanceName, setLocalInstanceName] = useState(instanceName);
  const [localConnectedNumber, setLocalConnectedNumber] = useState(connectedNumber);

  // Sync local state when store changes
  useEffect(() => {
    setLocalProvider(provider);
    setLocalApiUrl(apiUrl);
    setLocalApiToken(apiToken);
    setLocalInstanceId(instanceId);
    setLocalInstanceName(instanceName);
    setLocalConnectedNumber(connectedNumber);
  }, [provider, apiUrl, apiToken, instanceId, instanceName, connectedNumber]);
  
  const [isTesting, setIsTesting]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveToast, setSaveToast]   = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const [events, setEvents] = useState<EventLog[]>([
    { id: 1, message: isConfigured ? 'Configuração carregada do localStorage.' : 'Nenhuma configuração salva.', time: new Date().toLocaleTimeString(), type: 'info' }
  ]);

  const addEvent = (message: string, type: EventLog['type']) => {
    setEvents(prev => [{
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    }, ...prev]);
  };

  const handleConfigureNow = () => {
    setConfig({ isConfigured: true });
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    addEvent('Testando conexão com a API...', 'info');

    setTimeout(() => {
      setIsTesting(false);

      if (!localApiUrl || !localApiToken) {
        setStatus('Erro');
        setTestResult('error');
        addEvent('Erro: URL ou Token ausentes', 'error');
        setTimeout(() => setTestResult(null), 4000);
        return;
      }

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setStatus('Conectado');
      setLastSync(now);
      setTestResult('success');
      addEvent('Teste de conexão realizado com sucesso.', 'success');
      setTimeout(() => setTestResult(null), 4000);
    }, 1000);
  };

  const handleSaveConfiguration = () => {
    setIsSaving(true);
    addEvent('Salvando configurações...', 'info');

    setTimeout(() => {
      setIsSaving(false);

      setConfig({
        provider:        localProvider,
        apiUrl:          localApiUrl,
        apiToken:        localApiToken,
        instanceId:      localInstanceId,
        instanceName:    localInstanceName,
        connectedNumber: localConnectedNumber,
      });

      addEvent('Configuração salva com sucesso.', 'success');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }, 800);
  };

  const handleDisconnect = () => {
    disconnect();
    addEvent('Instância desconectada manualmente.', 'error');
  };

  const handleClearConfig = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
      clearConfig();
      setLocalProvider('Evolution API');
      setLocalApiUrl('');
      setLocalApiToken('');
      setLocalInstanceId('');
      setLocalInstanceName('');
      setLocalConnectedNumber('');
      addEvent('Configuração apagada.', 'warning');
    }
  };

  const getStatusDot = () => {
    if (isTesting) return 'bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    if (connectionStatus === 'Conectado') return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
    if (connectionStatus === 'Aguardando QR Code') return 'bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.4)]';
    if (connectionStatus === 'Erro') return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
    return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
  };

  const getStatusBadgeClasses = () => {
    if (isTesting)
      return 'bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    if (connectionStatus === 'Conectado')
      return 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400';
    if (connectionStatus === 'Erro')
      return 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400';
    return 'bg-slate-100 dark:bg-slate-800/50 border border-transparent text-slate-700 dark:text-slate-300';
  };

  const getStatusLabel = () => isTesting ? 'Testando...' : connectionStatus;

  const getEventIcon = (type: EventLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'error': return <ShieldAlert size={16} className="text-red-500" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
      default: return <Clock size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
           <button
             onClick={() => navigate('/')}
             className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F0C840] transition-colors duration-150 mb-5 text-[13px] font-medium"
           >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-[28px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
            <Settings className="text-[#D4AF37] h-8 w-8" />
            Configuração do WhatsApp
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 mt-2 text-[15px]">
            Conecte sua instância para enviar e receber mensagens reais.
          </p>
        </div>

        {/* Toast de sucesso ao salvar */}
        {saveToast && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-[12px]
                          bg-green-50 dark:bg-green-500/10
                          border border-green-200 dark:border-green-500/20
                          text-green-700 dark:text-green-400 text-[14px] font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Configuração salva com sucesso.
          </div>
        )}

        {!isConfigured ? (
          /* Estado vazio */
          <div className="bg-white dark:bg-[#0F172A] rounded-[20px] p-12 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <WifiOff className="text-slate-400 w-10 h-10" />
            </div>
            <h2 className="text-[20px] font-[700] text-[#0F172A] dark:text-white mb-3">
              Nenhuma API configurada ainda.
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 mb-8 max-w-md">
              Configure um provedor de WhatsApp API para integrar mensagens, transmissões, automações e seu Kanban de Atendimento.
            </p>
            <button 
              onClick={handleConfigureNow}
              className="bg-[#D4AF37] hover:bg-[#C5A030] text-white px-8 py-3 rounded-full font-[600] transition-colors shadow-[0_4px_15px_rgba(212,175,55,0.3)] flex items-center gap-2"
            >
              <Settings size={20} />
              Configurar agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Coluna Principal: Formulário de Configuração */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Card de Configuração */}
              <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
                <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
                  <Link2 className="text-[#D4AF37]" size={20} />
                  Dados da API
                </h2>

                <div className="space-y-6">
                  {/* Seleção de Provedor */}
                  <div>
                    <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                      Provedor de WhatsApp
                    </label>
                    <select 
                      value={localProvider}
                      onChange={(e) => setLocalProvider(e.target.value as Provider)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] dark:focus:border-[#D4AF37] transition-colors appearance-none"
                    >
                      <option value="Evolution API">Evolution API</option>
                      <option value="Z-API">Z-API</option>
                      <option value="Twilio">Twilio</option>
                      <option value="360dialog">360dialog</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* URL da API */}
                    <div className="md:col-span-2">
                      <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                        URL da API
                      </label>
                      <input 
                        type="url" 
                        value={localApiUrl}
                        onChange={(e) => setLocalApiUrl(e.target.value)}
                        placeholder="https://api.seudominio.com"
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>

                    {/* Token / API Key */}
                    <div className="md:col-span-2">
                      <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                        Token / API Key
                      </label>
                      <input 
                        type="password" 
                        value={localApiToken}
                        onChange={(e) => setLocalApiToken(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>

                    {/* Instance ID */}
                    {localProvider !== 'Twilio' && (
                      <div>
                        <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                          Instance ID
                        </label>
                        <input 
                          type="text" 
                          value={localInstanceId}
                          onChange={(e) => setLocalInstanceId(e.target.value)}
                          placeholder="ex: inst_123456"
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>
                    )}

                    {/* Nome da instância */}
                    <div>
                      <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                        Nome da instância
                      </label>
                      <input 
                        type="text" 
                        value={localInstanceName}
                        onChange={(e) => setLocalInstanceName(e.target.value)}
                        placeholder="ex: Atendimento Principal"
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>

                    {/* Número conectado */}
                    <div className="md:col-span-2">
                      <label className="block text-[14px] font-[600] text-[#0F172A] dark:text-white mb-2">
                        Número conectado (opcional)
                      </label>
                      <input 
                        type="tel" 
                        value={localConnectedNumber}
                        onChange={(e) => setLocalConnectedNumber(e.target.value)}
                        placeholder="+55 11 99999-9999"
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-[15px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">

                    {/* Botão Testar + feedback inline */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className={`
                          px-6 py-3 rounded-[12px] font-[600] text-[15px]
                          flex items-center justify-center gap-2
                          transition-all duration-200 disabled:cursor-not-allowed
                          ${isTesting
                            ? 'bg-yellow-400/20 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        {isTesting
                          ? <RefreshCw className="w-5 h-5 animate-spin" />
                          : <Link2 className="w-5 h-5" />
                        }
                        {isTesting ? 'Testando...' : 'Testar conexão'}
                      </button>

                      {/* Feedback após teste */}
                      {testResult === 'success' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]
                                        bg-green-50 dark:bg-green-500/10
                                        border border-green-200 dark:border-green-500/20
                                        text-green-700 dark:text-green-400 text-[13px] font-medium">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          Conexão simulada com sucesso.
                        </div>
                      )}
                      {testResult === 'error' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]
                                        bg-red-50 dark:bg-red-500/10
                                        border border-red-200 dark:border-red-500/20
                                        text-red-700 dark:text-red-400 text-[13px] font-medium">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          URL ou Token ausentes.
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleSaveConfiguration}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-3 rounded-[12px] font-[600] text-[15px] bg-[#D4AF37] text-white hover:bg-[#c09d2a] transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Salvar configuração
                    </button>

                    {(connectionStatus === 'Conectado' || connectionStatus === 'Aguardando QR Code') && (
                      <button 
                        onClick={handleDisconnect}
                        className="w-full sm:w-auto px-6 py-3 rounded-[12px] font-[600] text-[15px] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 ml-auto"
                      >
                        <PowerOff className="w-5 h-5" />
                        Desconectar instância
                      </button>
                    )}
                    
                    {isConfigured && (
                      <button 
                        onClick={handleClearConfig}
                        className="w-full sm:w-auto px-6 py-3 rounded-[12px] font-[600] text-[15px] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 ml-auto"
                      >
                        <Trash2 className="w-5 h-5" />
                        Apagar Configuração
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Lateral: Status e QR Code */}
            <div className="space-y-8">
              
              {/* Status Card */}
              <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-[20px] p-6 lg:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-[600] text-[#0F172A] dark:text-white flex items-center gap-2">
                    <Smartphone className="text-[#D4AF37]" size={20} />
                    Status da Conexão
                  </h3>
                  <div className={`px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[13px] font-semibold transition-all duration-300 ${getStatusBadgeClasses()}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot()}`} />
                    {getStatusLabel()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Última sincronização</span>
                    <span className="font-medium text-[#0F172A] dark:text-white">
                      {lastSyncAt || 'Nunca sincronizado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Instância</span>
                    <span className="font-medium text-[#0F172A] dark:text-white">
                      {localInstanceName || 'Não definida'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-500 dark:text-slate-400">Número</span>
                    <span className="font-medium text-[#0F172A] dark:text-white">
                      {localConnectedNumber || 'Não conectado'}
                    </span>
                  </div>
                </div>

                {connectionStatus === 'Aguardando QR Code' && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="w-64 h-64 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group">
                      <QrCode size={180} className="text-slate-400 dark:text-slate-600 opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent h-1/2 animate-[scan_2s_ease-in-out_infinite]" />
                      <div className="absolute inset-0 border-4 border-dashed border-[#D4AF37]/30 rounded-2xl" />
                    </div>
                    <h4 className="text-[18px] font-[600] text-[#0F172A] dark:text-white mb-2">
                      Escaneie o QR Code
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                      Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e aponte a câmera para esta tela.
                    </p>
                  </div>
                )}
                
                {connectionStatus === 'Conectado' && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="text-green-500 w-10 h-10" />
                    </div>
                    <h4 className="text-[18px] font-[600] text-[#0F172A] dark:text-white mb-2">
                      Instância conectada com sucesso
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Sua API está pronta para enviar e receber mensagens reais.
                    </p>
                  </div>
                )}
              </div>

              {/* Histórico de Eventos */}
              <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
                <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
                  <Clock className="text-[#D4AF37]" size={20} />
                  Histórico de eventos
                </h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {events.map((event) => (
                    <div key={event.id} className="flex gap-3 items-start">
                      <div className="mt-0.5">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-[#0F172A] dark:text-white leading-snug">
                          {event.message}
                        </p>
                        <span className="text-[11px] text-[#64748B] dark:text-slate-500">
                          {event.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

function WhatsAppConfigLocked() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-[70px] h-[70px] rounded-[20px] mb-6
                      bg-[rgba(212,175,55,0.10)] ring-1 ring-[rgba(212,175,55,0.25)]
                      flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
      </div>

      <h2 className="text-[22px] font-bold text-[#0F172A] dark:text-white mb-3 tracking-tight">
        Recurso do plano superior
      </h2>

      <p className="text-[14px] text-[#64748B] dark:text-slate-400 leading-relaxed max-w-[380px] mb-8">
        A configuração da API WhatsApp faz parte dos planos{' '}
        <span className="text-[#D4AF37] font-semibold">Profissional</span> e{' '}
        <span className="text-[#D4AF37] font-semibold">Premium</span>.
        Você pode testar gratuitamente por <strong className="text-white">7 dias</strong> ou
        fazer upgrade agora.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/planos-assinaturas')}
          className="flex items-center justify-center gap-2 px-6 py-[13px] rounded-[12px]
                     bg-[#D4AF37] text-[#0F172A] font-bold text-[14px]
                     hover:bg-[#C9A227] active:scale-[0.98]
                     transition-all duration-150
                     shadow-[0_4px_20px_rgba(212,175,55,0.40)]"
        >
          Ver planos e preços
        </button>

         <button
           onClick={() => navigate('/')}
           className="flex items-center justify-center gap-2 px-6 py-[13px] rounded-[12px]
                      bg-white/[0.06] dark:bg-white/[0.06] text-[#0F172A] dark:text-white
                      font-semibold text-[13px]
                      border border-slate-200 dark:border-white/[0.10]
                      hover:bg-slate-50 dark:hover:bg-white/[0.10] active:scale-[0.98]
                      transition-all duration-150"
         >
          Voltar ao painel
        </button>
      </div>
    </div>
  )
}

export default function WhatsAppConfig() {
  const effectivePlan = useAuthStore(s => s.getEffectivePlan())
  const trialIsActive = useAuthStore(s => s.isTrialActive())
  const allowed       = hasAccess('api_whatsapp', effectivePlan, trialIsActive)

  if (!allowed) return <WhatsAppConfigLocked />

  return <WhatsAppConfigContent />
}