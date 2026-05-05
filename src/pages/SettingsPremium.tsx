import { useState } from 'react';

export default function SettingsPremium() {
  const [activeTab, setActiveTab] = useState('igreja');

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
                className="bg-[#020617] text-white p-6 rounded-xl border border-slate-700 cursor-pointer hover:scale-[1.02] transition"
                onClick={() => alert('Abrir configuração do WhatsApp')}
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

    </div>
  );
}