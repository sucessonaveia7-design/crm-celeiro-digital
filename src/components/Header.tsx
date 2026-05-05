import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, BellRing, LogOut, User, Key, Sliders, 
  Check, UserPlus, GitMerge, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useNotificationStore } from '@/store/notificationStore';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore(state => state.clearAuth);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount: getUnreadCount } = useNotificationStore();
  
  // User email state
  const [userEmail, setUserEmail] = useState('');

  // Fetch user email from Supabase on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);
  
  // Theme state
  const [isThemeFading, setIsThemeFading] = useState(false);

  // User Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUserMenuAnimatingOut, setIsUserMenuAnimatingOut] = useState(false);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsAnimatingOut, setIsNotificationsAnimatingOut] = useState(false);
  const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const unreadCount = getUnreadCount();
  const isNewNotification = unreadCount > 0;

  // Handlers for User Menu
  const handleUserMenuMouseEnter = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    if (isNotificationsOpen) {
      setIsNotificationsAnimatingOut(true);
      setTimeout(() => {
        setIsNotificationsOpen(false);
        setIsNotificationsAnimatingOut(false);
      }, 150);
    }
    setIsUserMenuAnimatingOut(false);
    setIsUserMenuOpen(true);
  };

  const handleUserMenuMouseLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuAnimatingOut(true);
      setTimeout(() => {
        setIsUserMenuOpen(false);
        setIsUserMenuAnimatingOut(false);
      }, 150);
    }, 300);
  };

  const handleUserMenuClick = () => {
    if (isUserMenuOpen) {
      setIsUserMenuAnimatingOut(true);
      setTimeout(() => {
        setIsUserMenuOpen(false);
        setIsUserMenuAnimatingOut(false);
      }, 150);
    } else {
      if (isNotificationsOpen) {
        setIsNotificationsAnimatingOut(true);
        setTimeout(() => {
          setIsNotificationsOpen(false);
          setIsNotificationsAnimatingOut(false);
        }, 150);
      }
      setIsUserMenuAnimatingOut(false);
      setIsUserMenuOpen(true);
    }
  };

  // Handlers for Notifications
  const handleNotificationsMouseEnter = () => {
    if (notificationsTimeoutRef.current) clearTimeout(notificationsTimeoutRef.current);
    if (isUserMenuOpen) {
      setIsUserMenuAnimatingOut(true);
      setTimeout(() => {
        setIsUserMenuOpen(false);
        setIsUserMenuAnimatingOut(false);
      }, 150);
    }
    setIsNotificationsAnimatingOut(false);
    setIsNotificationsOpen(true);
  };

  const handleNotificationsMouseLeave = () => {
    notificationsTimeoutRef.current = setTimeout(() => {
      setIsNotificationsAnimatingOut(true);
      setTimeout(() => {
        setIsNotificationsOpen(false);
        setIsNotificationsAnimatingOut(false);
      }, 150);
    }, 300);
  };

  const handleNotificationsClick = () => {
    if (isNotificationsOpen) {
      setIsNotificationsAnimatingOut(true);
      setTimeout(() => {
        setIsNotificationsOpen(false);
        setIsNotificationsAnimatingOut(false);
      }, 150);
    } else {
      if (isUserMenuOpen) {
        setIsUserMenuAnimatingOut(true);
        setTimeout(() => {
          setIsUserMenuOpen(false);
          setIsUserMenuAnimatingOut(false);
        }, 150);
      }
      setIsNotificationsAnimatingOut(false);
      setIsNotificationsOpen(true);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const getRelativeTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    return `Há ${Math.floor(diffInSeconds / 86400)} d`;
  };

  const handleThemeToggle = () => {
    setIsThemeFading(true);
    setTimeout(() => {
      toggleDarkMode();
      setTimeout(() => {
        setIsThemeFading(false);
      }, 50);
    }, 150);
  };

  return (
    <>
      <style>
        {`
          @keyframes dropdownOpen {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes dropdownClose {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(-8px) scale(0.96);
            }
          }
          @keyframes bellShake {
            0%, 100% { transform: rotate(0); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(10deg); }
            20%, 40%, 60%, 80% { transform: rotate(-10deg); }
          }
        `}
      </style>
      <header className="h-[72px] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] dark:from-[#020617] dark:to-[#020617] flex items-center justify-end px-[24px] border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_2px_6px_rgba(15,23,42,0.04)] dark:shadow-none sticky top-0 z-[9999] transition-colors duration-300 flex-shrink-0 text-[#0F172A] dark:text-[#E2E8F0] overflow-visible">
        <div className="flex items-center gap-[16px]">
          {/* Caixa do Usuário com Dropdown */}
          <div 
            className="relative"
            onMouseEnter={handleUserMenuMouseEnter}
            onMouseLeave={handleUserMenuMouseLeave}
          >
             <div 
               onClick={handleUserMenuClick}
               className={`
                 flex items-center gap-[10px] px-[16px] py-[8px] rounded-full cursor-pointer 
                 transition-all duration-[0.2s] ease-in-out border
                 ${isUserMenuOpen 
                   ? 'bg-[#FFFFFF] dark:bg-[#1E293B] border-[rgba(15,23,42,0.12)] dark:border-[rgba(255,255,255,0.12)] shadow-[0_2px_10px_rgba(15,23,42,0.04)]' 
                   : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] hover:border-[rgba(15,23,42,0.08)] dark:hover:border-[rgba(255,255,255,0.08)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
                 }
               `}
             >
               <span className="text-[14px] font-[500] text-[#334155] dark:text-[#E2E8F0]">{userEmail}</span>
               <svg 
                 className={`w-[16px] h-[16px] text-[#64748B] dark:text-[#94A3B8] transition-transform duration-[0.2s] ease-in-out ${isUserMenuOpen ? 'rotate-180 text-[#0F172A] dark:text-white' : ''}`} 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
               </svg>
             </div>

            {/* Menu Dropdown */}
            {isUserMenuOpen && (
              <>
                <div className="absolute top-full right-0 w-full h-[8px] z-[9998]"></div>
                <div 
                  className="absolute right-0 top-full mt-[8px] min-w-[240px] bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[16px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_14px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.4)] p-[10px] flex flex-col z-[9999]"
                  style={{
                    animation: isUserMenuAnimatingOut 
                      ? 'dropdownClose 160ms ease-in forwards' 
                      : 'dropdownOpen 160ms ease-out forwards'
                  }}
                >
                  <div className="flex items-center gap-[12px] px-[10px] pt-[10px] pb-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[700] flex items-center justify-center text-[16px] flex-shrink-0 shadow-[0_4px_10px_rgba(250,204,21,0.3)]">
                      S
                    </div>
                     <div className="flex flex-col">
                       <span className="font-[600] text-[14px] text-[#0F172A] dark:text-white leading-tight">Sucesso na Veia</span>
                       <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-tight">{userEmail}</span>
                     </div>
                  </div>

                  <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] my-[6px]"></div>

                  <div className="flex flex-col gap-1">
                    <div 
                      onClick={() => navigate('/perfil')}
                      className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-[#334155] dark:text-[#E2E8F0] font-medium cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(250,204,21,0.10)] dark:hover:bg-[rgba(250,204,21,0.10)] hover:text-[#0F172A] dark:hover:text-white hover:translate-x-[2px]"
                    >
                      <User className="w-[16px] h-[16px]" />
                      Meu perfil
                    </div>
                    
                    <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-[#334155] dark:text-[#E2E8F0] font-medium cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(250,204,21,0.10)] dark:hover:bg-[rgba(250,204,21,0.10)] hover:text-[#0F172A] dark:hover:text-white hover:translate-x-[2px]">
                      <Key className="w-[16px] h-[16px]" />
                      Alterar senha
                    </div>

                    <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-[#334155] dark:text-[#E2E8F0] font-medium cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(250,204,21,0.10)] dark:hover:bg-[rgba(250,204,21,0.10)] hover:text-[#0F172A] dark:hover:text-white hover:translate-x-[2px]">
                      <Sliders className="w-[16px] h-[16px]" />
                      Preferências
                    </div>

                    <div 
                      onClick={() => {
                        handleThemeToggle();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-[#334155] dark:text-[#E2E8F0] font-medium cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(250,204,21,0.10)] dark:hover:bg-[rgba(250,204,21,0.10)] hover:text-[#0F172A] dark:hover:text-white hover:translate-x-[2px]"
                    >
                      {isDarkMode ? <Sun className="w-[16px] h-[16px]" /> : <Moon className="w-[16px] h-[16px]" />}
                      Alternar tema
                    </div>
                    
                    <div className="h-[1px] w-full bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] my-[2px]"></div>
                    
                    <div 
                      onClick={() => {
                        clearAuth();
                        navigate('/login');
                      }}
                      className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-[#DC2626] dark:text-[#EF4444] font-medium cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(239,68,68,0.08)] dark:hover:bg-[rgba(239,68,68,0.15)] hover:translate-x-[2px]"
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                      Sair
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-[14px]">
            <button 
              onClick={handleThemeToggle}
              title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              className="w-[38px] h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] transition-all duration-[0.2s] ease-in-out hover:bg-[rgba(255,215,0,0.08)] dark:hover:bg-[rgba(255,215,0,0.08)] hover:-translate-y-[2px] hover:text-[#D4AF37] dark:hover:text-[#FFD700]"
            >
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            
            <div 
              className="relative"
              onMouseEnter={handleNotificationsMouseEnter}
              onMouseLeave={handleNotificationsMouseLeave}
            >
              <button 
                onClick={handleNotificationsClick}
                style={isNewNotification ? { 
                  animation: 'bellShake 0.4s ease', 
                  boxShadow: '0 0 12px rgba(250,204,21,0.25)' 
                } : {}}
                className={`
                  w-[38px] h-[38px] rounded-[10px] flex items-center justify-center relative 
                  transition-all duration-[0.18s] ease-in-out border
                  ${isNotificationsOpen 
                    ? 'bg-[#FFFFFF] dark:bg-[#1E293B] border-[rgba(15,23,42,0.12)] dark:border-[rgba(255,255,255,0.12)] shadow-[0_2px_10px_rgba(15,23,42,0.04)] text-[#0F172A] dark:text-white scale-[1.05]' 
                    : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] hover:border-[rgba(15,23,42,0.08)] dark:hover:border-[rgba(255,255,255,0.08)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:text-[#0F172A] dark:hover:text-white'
                  }
                  ${isNewNotification ? 'border-[rgba(250,204,21,0.5)] dark:border-[rgba(250,204,21,0.5)] text-[#D4AF37] dark:text-[#FFD700]' : ''}
                `}
              >
                <svg 
                  className={`w-[18px] h-[18px] transition-transform duration-[0.18s] ease-in-out ${isNotificationsOpen ? 'rotate-[15deg]' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className={`absolute top-[6px] right-[6px] w-[8px] h-[8px] bg-[#EF4444] rounded-full transition-transform duration-[0.18s] ease-in-out border-2 border-white dark:border-[#1E293B] ${isNotificationsOpen ? 'scale-110' : ''}`}></span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="absolute top-full right-0 w-full h-[10px] z-[9998]"></div>
                  <div 
                    className="absolute right-0 top-full mt-[10px] min-w-[300px] bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[16px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_14px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.4)] p-[10px] flex flex-col z-[9999]"
                    style={{
                      animation: isNotificationsAnimatingOut 
                        ? 'dropdownClose 160ms ease-in forwards' 
                        : 'dropdownOpen 160ms ease-out forwards'
                    }}
                  >
                  <div className="flex items-center justify-between px-[10px] pt-[8px] pb-[12px]">
                    <h3 className="text-[15px] font-[700] text-[#0F172A] dark:text-white leading-none">Notificações</h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <span className="text-[12px] font-[600] text-[#B45309] dark:text-[#FACC15] bg-[rgba(250,204,21,0.12)] dark:bg-[rgba(250,204,21,0.15)] px-[8px] py-[4px] rounded-full leading-none">
                            {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[12px] font-[500] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors flex items-center gap-1"
                          title="Marcar todas como lidas"
                        >
                          <Check className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] my-[6px]"></div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-[32px] px-[20px] text-center">
                      <div className="w-[48px] h-[48px] rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-[12px]">
                        <BellRing className="w-[20px] h-[20px] text-[#94A3B8] dark:text-[#64748B]" />
                      </div>
                      <span className="text-[14px] font-[600] text-[#0F172A] dark:text-white mb-[4px]">Nenhuma notificação no momento</span>
                      <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Tudo está em dia.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                      {notifications.map((notification) => {
                        let Icon = BellRing;
                        let iconColor = 'text-[#B45309] dark:text-[#FACC15]';
                        let iconBg = 'bg-[rgba(250,204,21,0.12)] dark:bg-[rgba(250,204,21,0.15)]';
                        
                        if (notification.tipo === 'sucesso') {
                          Icon = Check;
                          iconColor = 'text-[#16A34A] dark:text-[#22C55E]';
                          iconBg = 'bg-[rgba(34,197,94,0.12)] dark:bg-[rgba(34,197,94,0.15)]';
                        } else if (notification.tipo === 'info') {
                          Icon = UserPlus; // Or any info icon, using UserPlus for new users
                          iconColor = 'text-[#0284C7] dark:text-[#38BDF8]';
                          iconBg = 'bg-[rgba(56,189,248,0.12)] dark:bg-[rgba(56,189,248,0.15)]';
                        } else if (notification.tipo === 'alerta') {
                          Icon = AlertTriangle;
                          iconColor = 'text-[#B45309] dark:text-[#FACC15]';
                          iconBg = 'bg-[rgba(250,204,21,0.12)] dark:bg-[rgba(250,204,21,0.15)]';
                        } else if (notification.tipo === 'erro') {
                          Icon = AlertTriangle;
                          iconColor = 'text-[#DC2626] dark:text-[#EF4444]';
                          iconBg = 'bg-[rgba(239,68,68,0.12)] dark:bg-[rgba(239,68,68,0.15)]';
                        }

                        return (
                          <div 
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`
                              flex items-start gap-[10px] px-[12px] py-[10px] rounded-[12px] cursor-pointer transition-all duration-[0.18s] ease-in-out group hover:translate-x-[2px]
                              ${!notification.lida 
                                ? 'bg-[rgba(250,204,21,0.05)] dark:bg-[rgba(250,204,21,0.05)] border-l-[3px] border-[#FACC15] hover:bg-[rgba(250,204,21,0.08)] dark:hover:bg-[rgba(250,204,21,0.08)]' 
                                : 'bg-transparent border border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.02)] hover:border-[rgba(15,23,42,0.04)] dark:hover:border-[rgba(255,255,255,0.04)] pl-[15px]'
                              }
                            `}
                          >
                            <div className={`w-[34px] h-[34px] rounded-[10px] ${iconBg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-[16px] h-[16px] ${iconColor}`} />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[13px] font-[600] ${!notification.lida ? 'text-[#0F172A] dark:text-white' : 'text-[#334155] dark:text-[#CBD5E1]'} leading-tight group-hover:text-[#D4AF37] dark:group-hover:text-[#FFD700] transition-colors`}>
                                {notification.titulo}
                              </span>
                              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-[2px] leading-tight">
                                {notification.mensagem}
                              </span>
                              <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] mt-[4px] leading-none">
                                {getRelativeTime(notification.data)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {notifications.length > 0 && (
                    <>
                      <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] mt-[4px] mb-[6px]"></div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); clearAll(); }}
                          className="flex-1 text-center px-[12px] py-[10px] rounded-[10px] text-[13px] font-[600] text-[#64748B] dark:text-[#94A3B8] cursor-pointer transition-all duration-[0.18s] ease-in-out hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#0F172A] dark:hover:text-white"
                        >
                          Limpar tudo
                        </button>
                      </div>
                    </>
                  )}
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
