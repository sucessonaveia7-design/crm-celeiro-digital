import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'sucesso' | 'alerta' | 'erro' | 'info';

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  data: string; // ISO string
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'lida' | 'data'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      
      addNotification: (notification) => {
        set((state) => {
          // Evita duplicação de alertas do mesmo tipo em um curto período (ex: alerta de vencimento que repete ao carregar)
          const isDuplicate = state.notifications.some(
            n => n.titulo === notification.titulo && 
                 n.mensagem === notification.mensagem && 
                 new Date(n.data).getTime() > Date.now() - 1000 * 60 * 60 // 1 hora
          );
          
          if (isDuplicate) return state;

          return {
            notifications: [
              {
                ...notification,
                id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
                lida: false,
                data: new Date().toISOString(),
              },
              ...state.notifications,
            ],
          };
        });
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, lida: true })),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      unreadCount: () => {
        return get().notifications.filter((n) => !n.lida).length;
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);
