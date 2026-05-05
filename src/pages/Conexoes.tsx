import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { supabase } from '@/lib/supabase';

export default function ConexoesPage() {
  const { isDarkMode } = useThemeStore();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('channels')
          .select('id, name, type, status, config, created_at')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setChannels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar canais');
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Conexões</h1>
        <p className="text-muted-foreground">Carregando canais...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Conexões</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Conexões</h1>
        <p className="text-muted-foreground">
          Gerencie os canais conectados ao Celeiro Digital
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-full">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3">Nenhum canal encontrado</h2>
          <p className="text-muted-foreground max-w-md mx-ad">
            Ainda não há canais cadastrados. Configure um canal na página de
            configurações para começar a usar o Celeiro Digital.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-[20px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 flex-shrink-0">
                  {channel.type === 'whatsapp' && (
                    <svg className="w-6 h-6 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-3z"></path>
                    </svg>
                  )}
                  {channel.type === 'instagram' && (
                    <svg className="w-6 h-6 text-[#E1306C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8z"></path>
                    </svg>
                  )}
                  {channel.type === 'email' && (
                    <svg className="w-6 h-6 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M4 7v10a2 2 0 002 2h10a2 2 0 002-2V7M4 7l16 12"></path>
                    </svg>
                  )}
                  {channel.type === 'widget' && (
                    <svg className="w-6 h-6 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M4 7v10a2 2 0 002 2h10a2 2 0 002-2V7M4 7l16 12"></path>
                    </svg>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-[#0F172A] dark:text-white">
                      {channel.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full 
                      ${channel.status === 'connected' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : ''}
                      ${channel.status === 'disconnected' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' : ''}
                      ${channel.status === 'connecting' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' : ''}
                    `}>
                      {channel.status === 'connected' ? 'Conectado' : channel.status === 'disconnected' ? 'Desconectado' : 'Conectando...'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tipo: {channel.type}
                  </p>
                  {channel.config && (
                    <div className="text-sm text-muted-foreground">
                      Provider: {typeof channel.config === 'object' && channel.config.provider ? channel.config.provider : 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}