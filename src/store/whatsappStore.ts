import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Provider = 'Evolution API' | 'Z-API' | 'Twilio' | '360dialog' | 'Outro';
export type ConnectionStatus = 'Conectado' | 'Desconectado' | 'Aguardando QR Code' | 'Erro';

interface WhatsAppConfigState {
  isConfigured: boolean;
  provider: Provider;
  apiUrl: string;
  apiToken: string;
  instanceId: string;
  instanceName: string;
  connectedNumber: string;
  connectionStatus: ConnectionStatus;
  lastSyncAt: string | null;
}

interface WhatsAppStore extends WhatsAppConfigState {
  setConfig: (config: Partial<WhatsAppConfigState>) => void;
  setStatus: (status: ConnectionStatus) => void;
  setLastSync: (time: string) => void;
  disconnect: () => void;
  clearConfig: () => void;
}

export const useWhatsAppStore = create<WhatsAppStore>()(
  persist(
    (set) => ({
      isConfigured: false,
      provider: 'Evolution API',
      apiUrl: '',
      apiToken: '',
      instanceId: '',
      instanceName: '',
      connectedNumber: '',
      connectionStatus: 'Desconectado',
      lastSyncAt: null,

      setConfig: (config) => set((state) => ({ ...state, ...config, isConfigured: true })),
      setStatus: (status) => set({ connectionStatus: status }),
      setLastSync: (time) => set({ lastSyncAt: time }),
      disconnect: () => set({ 
        connectionStatus: 'Desconectado',
        lastSyncAt: null
      }),
      clearConfig: () => set({
        isConfigured: false,
        provider: 'Evolution API',
        apiUrl: '',
        apiToken: '',
        instanceId: '',
        instanceName: '',
        connectedNumber: '',
        connectionStatus: 'Desconectado',
        lastSyncAt: null,
      })
    }),
    {
      name: 'mock_whatsapp_config',
    }
  )
);
