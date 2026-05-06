import { useState } from 'react';

export default function SettingsPremium() {
  const [activeTab, setActiveTab] = useState('igreja');

  /* ── WhatsApp Connection ── */
  const [isWhatsAppModalOpen,      setIsWhatsAppModalOpen]      = useState(false);
  const [whatsappConnectionStatus, setWhatsappConnectionStatus] = useState<'idle' | 'loading' | 'qr_ready' | 'connected' | 'error'>('idle');
  const [whatsappQrCode,           setWhatsappQrCode]           = useState<string | null>(null);
  const [whatsappError,            setWhatsappError]            = useState<string | null>(null);

  const closeWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false);
    setWhatsappConnectionStatus('idle');
    setWhatsappQrCode(null);
    setWhatsappError(null);
  };

  const generateWhatsAppQrCode = async () => {
    setWhatsappConnectionStatus('loading');
    setWhatsappQrCode(null);
    setWhatsappError(null);
    try {
      // TODO: substituir pela chamada real ao endpoint de conexão WhatsApp
      // const response = await fetch('/api/whatsapp/qrcode', { method: 'POST' });
      // const data = await response.json();
      // setWhatsappQrCode(data.qrCode); // base64 data-uri da imagem QR
      // setWhatsappConnectionStatus('qr_ready');

      await new Promise(resolve => setTimeout(resolve, 1400));
      setWhatsappConnectionStatus('error');
      setWhatsappError('Endpoint de conexão ainda não configurado. Integração em breve.');
    } catch {
      setWhatsappConnectionStatus('error');
      setWhatsappError('Erro ao gerar QR Code. Tente novamente.');
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
                <span className="text-green-400 text-sm mt-4 block">1 conta conectada</span>
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
                  <img src={whatsappQrCode} alt="QR Code WhatsApp" className="w-48 h-48 rounded-lg" />
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
                  onClick={generateWhatsAppQrCode}
                  disabled={whatsappConnectionStatus === 'loading'}
                  className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-[#020617]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C49B28 100%)', boxShadow: '0 4px 16px rgba(212,175,55,0.28)' }}
                >
                  {whatsappConnectionStatus === 'loading' ? 'Gerando...' : 'Gerar QR Code'}
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