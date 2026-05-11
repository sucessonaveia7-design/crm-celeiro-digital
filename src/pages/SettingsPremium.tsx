import { useState, useEffect, useRef } from 'react';

// Normaliza qualquer string de estado da Evolution API para os dois estados possíveis do modal.
// Centralizar aqui evita condicionais espalhadas pelo componente.
function normalizeConnectionState(raw: string | undefined): 'connected' | 'idle' {
  if (!raw) return 'idle';
  const s = raw.toLowerCase();
  if (s === 'open' || s === 'connected') return 'connected';
  return 'idle';
}

export default function SettingsPremium() {
  const [activeTab, setActiveTab] = useState('igreja');

  /* ── WhatsApp Connection ── */
  const [isWhatsAppModalOpen,      setIsWhatsAppModalOpen]      = useState(false);
  const [whatsappConnectionStatus, setWhatsappConnectionStatus] = useState<'idle' | 'loading' | 'qr_ready' | 'connected' | 'error'>('idle');
  const [whatsappQrCode,           setWhatsappQrCode]           = useState<string | null>(null);
  const [whatsappError,            setWhatsappError]            = useState<string | null>(null);
  const [whatsappInstance,         setWhatsappInstance]         = useState<string>('celeiro-teste-001');
  // Estado persistente para o card (independente do modal estar aberto ou não).
  const [whatsappCardConnected,    setWhatsappCardConnected]    = useState(false);

  // Ref unificado: segura tanto o intervalId do polling de QR quanto o de status.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const closeWhatsAppModal = () => {
    stopPolling();
    setIsWhatsAppModalOpen(false);
    // Reseta para idle — o effect de modal-open vai restaurar o estado real na próxima abertura.
    // Reseta QR e erro sempre, mas não reseta o card (whatsappCardConnected persiste).
    setWhatsappConnectionStatus('idle');
    setWhatsappQrCode(null);
    setWhatsappError(null);
  };

  // Polling de status (a cada 3s): verifica se o usuário já escaneou o QR.
  const startStatusPolling = (instanceName: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/whatsapp/status?instanceName=${encodeURIComponent(instanceName)}`);
        const data = await res.json() as { success: boolean; state?: string };
        if (data.success && normalizeConnectionState(data.state) === 'connected') {
          stopPolling();
          setWhatsappConnectionStatus('connected');
          setWhatsappCardConnected(true);
          setWhatsappQrCode(null);
          if (import.meta.env.DEV) console.log('[WhatsApp] QR escaneado — instância conectada:', instanceName);
        }
      } catch { /* silencioso */ }
    }, 3000);
  };

  // Polling de QR (a cada 3s): usado quando o backend retorna 202.
  // Para automaticamente ao obter o QR ou após 60s (timeout).
  const startQrPolling = (instanceName: string) => {
    stopPolling();
    const deadline = Date.now() + 60_000;

    pollRef.current = setInterval(async () => {
      if (Date.now() > deadline) {
        stopPolling();
        setWhatsappConnectionStatus('error');
        setWhatsappError('Tempo esgotado ao aguardar QR Code. Tente novamente.');
        return;
      }
      try {
        // cache: 'no-store' + parâmetro ?t= evita 304 do browser e do Vite proxy
        const url = `/api/whatsapp/qrcode?instanceName=${encodeURIComponent(instanceName)}&t=${Date.now()}`;
        const res  = await fetch(url, { cache: 'no-store' });
        const data = await res.json() as { success: boolean; qrCode?: string | null };
        if (data.success && data.qrCode) {
          stopPolling();
          setWhatsappQrCode(data.qrCode);
          setWhatsappConnectionStatus('qr_ready');
          startStatusPolling(instanceName);
        }
      } catch { /* silencioso */ }
    }, 3000);
  };

  // Limpeza de polling ao desmontar o componente.
  useEffect(() => () => stopPolling(), []);

  // Ao montar: verifica estado real para exibir o card corretamente sem abrir o modal.
  useEffect(() => {
    let alive = true;
    fetch(`/api/whatsapp/status?instanceName=${encodeURIComponent(whatsappInstance)}`)
      .then(r => r.json())
      .then((d: { success: boolean; state?: string }) => {
        if (!alive) return;
        const connected = normalizeConnectionState(d.state) === 'connected';
        setWhatsappCardConnected(connected);
        if (import.meta.env.DEV) console.log('[WhatsApp] estado inicial do card:', d.state, '→', connected ? 'conectado' : 'desconectado');
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ao abrir o modal: restaura o estado real da instância antes de mostrar a UI.
  // AbortController cancela o fetch se o modal fechar antes da resposta chegar.
  useEffect(() => {
    if (!isWhatsAppModalOpen) return;

    const ctrl = new AbortController();

    setWhatsappConnectionStatus('loading');

    fetch(`/api/whatsapp/status?instanceName=${encodeURIComponent(whatsappInstance)}`, {
      signal: ctrl.signal,
    })
      .then(r => r.json())
      .then((d: { success: boolean; state?: string }) => {
        const isConnected = normalizeConnectionState(d.state) === 'connected';
        setWhatsappConnectionStatus(isConnected ? 'connected' : 'idle');
        setWhatsappCardConnected(isConnected);
        if (import.meta.env.DEV) console.log('[WhatsApp] estado restaurado ao abrir modal:', d.state, '→', isConnected ? 'connected' : 'idle');
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        setWhatsappConnectionStatus('idle');
      });

    return () => ctrl.abort();
  }, [isWhatsAppModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateWhatsAppQrCode = async () => {
    stopPolling();
    setWhatsappConnectionStatus('loading');
    setWhatsappQrCode(null);
    setWhatsappError(null);

    try {
      const res = await fetch('/api/whatsapp/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ instanceName: whatsappInstance }),
      });

      const data = await res.json() as {
        success:       boolean;
        qrCode?:       string | null;
        instanceName?: string;
        state?:        string;
        error?:        string;
        message?:      string;
      };

      if (!res.ok || !data.success) {
        setWhatsappConnectionStatus('error');
        setWhatsappError(data.error ?? data.message ?? 'Erro ao gerar QR Code.');
        return;
      }

      const instance = data.instanceName ?? whatsappInstance;
      setWhatsappInstance(instance);

      // Caso: já conectado (state = open)
      if (normalizeConnectionState(data.state) === 'connected') {
        setWhatsappConnectionStatus('connected');
        setWhatsappCardConnected(true);
        return;
      }

      // Caso: QR disponível imediatamente (201)
      if (data.qrCode) {
        setWhatsappQrCode(data.qrCode);
        setWhatsappConnectionStatus('qr_ready');
        startStatusPolling(instance);
        return;
      }

      // Caso: 202 — instância pronta mas QR ainda sendo gerado pelo Baileys
      startQrPolling(instance);

    } catch {
      setWhatsappConnectionStatus('error');
      setWhatsappError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <aside className="w-72 border-r border-slate-800 p-4 space-y-2">

  <button
    onClick={() => setActiveTab('igreja')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'igreja'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Igreja
  </button>

  <button
    onClick={() => setActiveTab('respostas')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'respostas'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Respostas Rápidas
  </button>

  <button
    onClick={() => setActiveTab('campos')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'campos'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Campos
  </button>

  <button
    onClick={() => setActiveTab('variavel')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'variavel'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Variável global
  </button>

  <button
    onClick={() => setActiveTab('etiquetas')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'etiquetas'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Etiquetas
  </button>

  <button
    onClick={() => setActiveTab('departamento')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'departamento'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Departamento
  </button>

  <button
    onClick={() => setActiveTab('equipe')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'equipe'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Equipe
  </button>

  <div className="w-full px-4 py-3 rounded-xl text-slate-500 flex justify-between">
    <span>Bibliotecas</span>
    <span className="text-xs text-[#D4AF37]">Em breve</span>
  </div>

  <button
    onClick={() => setActiveTab('horarios')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'horarios'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Horários
  </button>

  <button
    onClick={() => setActiveTab('fluxo')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'fluxo'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Fluxo padrão
  </button>

  <button
    onClick={() => setActiveTab('conexoes')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'conexoes'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    Conexões
  </button>

  <button
    onClick={() => setActiveTab('api')}
    className={`w-full text-left px-4 py-3 rounded-xl ${
      activeTab === 'api'
        ? 'bg-[#D4AF37] text-black font-semibold'
        : 'hover:bg-slate-800 text-slate-300'
    }`}
  >
    API
  </button>

</aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Igreja */}
        {activeTab === 'igreja' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Igreja</h2>
            <p className="text-slate-400">Configuração da igreja.</p>
          </div>
        )}
        
        {/* Respostas Rápidas */}
        {activeTab === 'respostas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Respostas Rápidas</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Campos */}
        {activeTab === 'campos' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Campos</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Variável global */}
        {activeTab === 'variavel' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Variável global</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Etiquetas */}
        {activeTab === 'etiquetas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Etiquetas</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Departamento */}
        {activeTab === 'departamento' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Departamento</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Equipe */}
        {activeTab === 'equipe' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Equipe</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Bibliotecas (disabled) */}
        {activeTab === 'bibliotecas' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Bibliotecas</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Horários */}
        {activeTab === 'horarios' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Horários</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Fluxo padrão */}
        {activeTab === 'fluxo' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">Fluxo padrão</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
        
        {/* Conexões */}
        {activeTab === 'conexoes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4">Conexões</h2>
            </div>
            <div>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-700 bg-[#020617] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <p className="text-slate-400 mb-4">Canais disponíveis para criar conexões</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* WhatsApp */}
              <div
                className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700 cursor-pointer hover:scale-[1.02] hover:border-[#D4AF37]/40 transition-all duration-200"
                onClick={() => setIsWhatsAppModalOpen(true)}
              >
                <h3 className="font-semibold text-[#D4AF37] mb-2">WhatsApp</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Conecte contas de WhatsApp para começar a realizar atendimentos.
                </p>
                <span className={`text-sm mt-4 block ${whatsappCardConnected ? 'text-green-400' : 'text-slate-500'}`}>
                  {whatsappCardConnected ? '1 conta conectada' : '0 contas conectadas'}
                </span>
              </div>
              
              {/* WhatsApp Oficial */}
              <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-[#D4AF37] mb-2">WhatsApp Oficial</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Conecte contas oficiais para começar a realizar atendimentos.
                </p>
                <span className="text-gray-400 text-sm mt-4 block">0 contas conectadas</span>
              </div>
              
              {/* Instagram */}
              <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-[#D4AF37] mb-2">Instagram</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Não perca nenhuma venda utilizando o chat direto no Instagram.
                </p>
                <span className="text-yellow-400 text-sm mt-4 block">novo</span>
                <span className="text-gray-400 text-sm mt-4 block">0 contas conectadas</span>
              </div>
              
              {/* E-mail */}
              <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-[#D4AF37] mb-2">E-mail</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Utilize e-mail para disparar campanhas e notificações.
                </p>
                <span className="text-gray-400 text-sm mt-4 block">0 contas conectadas</span>
              </div>
              
              {/* Messenger */}
              <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700 opacity-50">
                <h3 className="font-semibold text-[#D4AF37] mb-2">Messenger</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Conecte contas de Messenger.
                </p>
                <span className="text-yellow-400 text-sm mt-4 block">Em breve</span>
              </div>
              
              {/* Widget */}
              <div className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-[#D4AF37] mb-2">Widget</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Adicione um chat ao seu site e atenda visitantes em tempo real.
                </p>
                <span className="text-gray-400 text-sm mt-4 block">0 contas conectadas</span>
              </div>
            </div>
          </div>
        )}
        
        {/* API */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-2">API</h2>
            <p className="text-slate-400">Configuração em construção.</p>
          </div>
        )}
      </main>

      {/* ════════════════════════════════
          MODAL — Conectar WhatsApp
      ════════════════════════════════ */}
      {isWhatsAppModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={closeWhatsAppModal}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-8 pt-7 pb-5 border-b border-[rgba(212,175,55,0.12)]"
              style={{ background: 'linear-gradient(150deg, #0F1E38 0%, #0B1627 60%, #070E1C 100%)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45) 40%, rgba(212,175,55,0.45) 60%, transparent)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(140deg, #DDB830 0%, #C49B28 55%, #9E7515 100%)', boxShadow: '0 4px 16px rgba(212,175,55,0.4)' }}
                >
                  <svg className="w-5 h-5 text-[#020617]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-[#F1F5F9] leading-snug">Conectar WhatsApp</h2>
                  <p className="text-[#567093] text-xs mt-0.5">Escaneie o QR Code com seu celular</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-[#0B111F] px-8 py-6 space-y-5">

              {/* Status */}
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-[#475569]">Status:</span>
                {whatsappConnectionStatus === 'idle' && (
                  <span className="flex items-center gap-1.5 text-sm text-[#475569]">
                    <span className="w-2 h-2 rounded-full bg-[#334155]" />
                    Aguardando
                  </span>
                )}
                {whatsappConnectionStatus === 'loading' && (
                  <span className="flex items-center gap-1.5 text-sm text-[#D4AF37]">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    Gerando QR Code...
                  </span>
                )}
                {whatsappConnectionStatus === 'qr_ready' && (
                  <span className="flex items-center gap-1.5 text-sm text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    QR Code pronto — escaneie agora
                  </span>
                )}
                {whatsappConnectionStatus === 'connected' && (
                  <span className="flex items-center gap-1.5 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Conectado
                  </span>
                )}
                {whatsappConnectionStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-sm text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Erro na conexão
                  </span>
                )}
              </div>

              {/* Área QR Code */}
              <div
                className="flex items-center justify-center rounded-xl border-2 border-dashed"
                style={{
                  height: '216px',
                  borderColor: 'rgba(212,175,55,0.15)',
                  background: 'rgba(212,175,55,0.02)',
                }}
              >
                {whatsappConnectionStatus === 'idle' && (
                  <div className="text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-[#1E3050] flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5 text-[#1E3050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" strokeWidth={1.8} />
                        <rect x="14" y="3" width="7" height="7" strokeWidth={1.8} />
                        <rect x="3" y="14" width="7" height="7" strokeWidth={1.8} />
                        <path strokeLinecap="round" strokeWidth={1.8} d="M14 14h2m3 0h2M14 17h2m3 3h2M17 14v2m0 3v2" />
                      </svg>
                    </div>
                    <p className="text-[#334155] text-sm">Clique em "Gerar QR Code" para começar</p>
                  </div>
                )}
                {whatsappConnectionStatus === 'loading' && (
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[#D4AF37] text-sm">Aguarde, gerando QR Code...</p>
                  </div>
                )}
                {whatsappConnectionStatus === 'qr_ready' && whatsappQrCode && (
                  <div className="text-center space-y-2">
                    <img src={whatsappQrCode} alt="QR Code WhatsApp" className="w-48 h-48 rounded-lg mx-auto" />
                    <p className="text-[#567093] text-xs">Escaneie com o WhatsApp do celular</p>
                  </div>
                )}
                {whatsappConnectionStatus === 'connected' && (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                      <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-400 text-sm font-semibold">WhatsApp conectado!</p>
                    <p className="text-[#475569] text-xs">Instância: {whatsappInstance}</p>
                  </div>
                )}
                {whatsappConnectionStatus === 'error' && (
                  <div className="text-center space-y-2 px-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-400 text-sm font-medium">Não foi possível gerar o QR Code</p>
                    <p className="text-[#475569] text-xs">{whatsappError}</p>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={whatsappConnectionStatus === 'connected' ? closeWhatsAppModal : generateWhatsAppQrCode}
                  disabled={whatsappConnectionStatus === 'loading'}
                  className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-[#020617]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C49B28 100%)', boxShadow: '0 4px 16px rgba(212,175,55,0.28)' }}
                >
                  {whatsappConnectionStatus === 'loading'   && 'Gerando...'}
                  {whatsappConnectionStatus === 'connected' && 'Fechar'}
                  {whatsappConnectionStatus === 'qr_ready'  && 'Aguardando leitura...'}
                  {(whatsappConnectionStatus === 'idle' || whatsappConnectionStatus === 'error') && 'Gerar QR Code'}
                </button>
                <button
                  type="button"
                  onClick={closeWhatsAppModal}
                  className="px-5 py-3 rounded-xl text-sm font-medium text-[#64748B]
                    border border-[rgba(255,255,255,0.07)]
                    hover:bg-white/[0.04] hover:text-[#94A3B8]
                    transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}