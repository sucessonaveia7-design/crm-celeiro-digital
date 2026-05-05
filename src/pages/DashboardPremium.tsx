import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { useAssinaturaStore } from '../store/assinaturaStore'
import { 
  LayoutDashboard, 
  MessageSquareMore, 
  KanbanSquare, 
  HeadphonesIcon, 
  Workflow, 
  Settings,
  ChevronDown,
  MoreVertical,
  Calendar,
  LogOut,
  UserPlus,
  Zap,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Menu,
  Wheat,
  Clock,
  BookOpen,
  User,
  Smartphone,
  Key,
  Sliders,
  GitMerge,
  CalendarClock,
  RefreshCw,
  Check,
  BellRing,
  AlertTriangle,
  Send,
  Users,
  Bot,
  HelpCircle,
  BarChart2
} from 'lucide-react'

// Interface para as Notificações
interface Notification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  type: 'user' | 'flow' | 'transmission' | 'system' | 'alert';
}

  // Funções puras que não dependem do estado do componente
  const calcularDiasRestantes = (vencimento: Date) => {
    if (!vencimento) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = new Date(vencimento);
    dataVenc.setHours(0, 0, 0, 0);

    const diferencaMs = dataVenc.getTime() - hoje.getTime();
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
  };

export default function DashboardPremium() {
  const { assinaturas } = useAssinaturaStore();
  const user = useAuthStore((state) => state.user);

  // Busca a assinatura do usuário logado (ou a primeira como fallback)
  const userAssinatura = assinaturas.find(a => a.usuarioNome === user?.name) || assinaturas[0];
  const dataVencimento = userAssinatura ? new Date(userAssinatura.dataVencimento) : new Date();
  
  // Declaração de diasRestantes antes de qualquer uso em hooks ou estados
  const diasRestantes = calcularDiasRestantes(dataVencimento);
  const notificacao = diasRestantes <= 3 ? 'vence em breve' : null;

  const [isUpdatingGraph, setIsUpdatingGraph] = useState(false);
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleUpdateGraph = () => {
    setIsUpdatingGraph(true);
    setTimeout(() => {
      setIsUpdatingGraph(false);
    }, 400); // Duração da animação de fade-out antes de redesenhar
  };

  const formatarDiasRestantes = (dias: number) => {
    if (dias > 0) return `${dias} dias`;
    if (dias === 0) return 'Vence hoje';
    return 'Expirado';
  };

  const getDiasRestantesColor = (dias: number) => {
    if (dias > 3) return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400',
      cardBg: 'bg-gradient-to-br from-white to-green-50 dark:from-[#111a2f] dark:to-green-950/20 border-green-200 dark:border-green-900/30',
      subtitleText: 'text-green-600 dark:text-green-500/80'
    };
    if (dias >= 1 && dias <= 3) return {
      bg: 'bg-orange-100 dark:bg-orange-500/20',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-600 dark:text-orange-400',
      cardBg: 'bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5] dark:from-[#431407] dark:to-[#7C2D12] border-[rgba(249,115,22,0.25)] dark:border-[rgba(249,115,22,0.3)]',
      subtitleText: 'text-orange-600 dark:text-orange-400 font-[700]'
    };
    // Vencido (0 ou menor)
    return {
      bg: 'bg-red-100 dark:bg-red-600/40',
      icon: 'text-red-600 dark:text-red-300',
      text: 'text-red-600 dark:text-red-500',
      cardBg: 'bg-white dark:bg-[#0b1120] border-red-300 dark:border-red-800/60 shadow-[0px_0px_15px_rgba(239,68,68,0.1)]',
      subtitleText: 'text-red-600 dark:text-red-500/90'
    };
  };

  const getDiasRestantesSubtitle = (dias: number) => {
    if (dias > 3) return `Atualizado automaticamente`;
    if (dias >= 1 && dias <= 3) return 'Renove para não perder o acesso';
    if (dias === 0) return 'Seu plano vence hoje';
    return 'Renove para continuar usando a plataforma';
  };

  const statusAssinatura = formatarDiasRestantes(diasRestantes);
  const corDiasRestantes = getDiasRestantesColor(diasRestantes);
  const subtituloDiasRestantes = getDiasRestantesSubtitle(diasRestantes);

  // Saudação Dinâmica e Data Atual
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const dataAtualFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const statsCards = [
    { title: 'Atendimentos realizados', value: 125, isNumber: true, icon: MessageCircle, dynamicColors: null },
    { title: 'Membros cadastrados', value: 840, isNumber: true, icon: UserPlus, dynamicColors: null },
    { title: 'Interações', value: 3420, isNumber: true, icon: Zap, dynamicColors: null },
    { title: 'Conversas resolvidas', value: 110, isNumber: true, icon: CheckCircle2, dynamicColors: null },
    { title: 'Dias restantes', value: diasRestantes, isNumber: true, textValue: null, subtitle: subtituloDiasRestantes, icon: Clock, dynamicColors: corDiasRestantes, link: '/assinatura' },
  ]

  // Componente interno para animar números
  const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValueRef = useRef(value);
    const isFirstRender = useRef(true);

    useEffect(() => {
      // 1. Bloquear qualquer animação no carregamento inicial da página
      if (isFirstRender.current) {
        isFirstRender.current = false;
        setDisplayValue(value);
        prevValueRef.current = value;
        return;
      }

      // 2. Comparar valor anterior com o novo valor
      const previousValue = prevValueRef.current;
      const currentValue = value;

      // 3. Se não houver mudança real no dado, manter estático
      if (previousValue === currentValue) {
        setDisplayValue(currentValue);
        return;
      }

      // 4. Iniciar animação apenas após detectar alteração real
      let startTimestamp: number | null = null;
      const duration = 600; // 600ms
      let animationFrame: number;
      const distance = currentValue - previousValue;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing ease-out
        const easeOutProgress = progress * (2 - progress);
        
        const currentAnimatedValue = Math.round(previousValue + (easeOutProgress * distance));
        setDisplayValue(currentAnimatedValue);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step);
        } else {
          // 5. Finalizar com número fixo após a animação
          setDisplayValue(currentValue);
          prevValueRef.current = currentValue;
        }
      };

      animationFrame = window.requestAnimationFrame(step);

      return () => {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
      };
    }, [value]);

    // 6. Estado normal: animation none, transition none, transform none, box-shadow none (via classe static-number-override)
    return (
      <span className="inline-block static-number-override">
        {displayValue}
      </span>
    );
  };

  return (
    <div 
      className="flex w-full h-full bg-transparent overflow-hidden font-sans transition-colors duration-300"
      style={{ animation: 'fadeDashboard 0.4s ease-out forwards' }}
    >
      <style>
        {`
          .static-number-override,
          .group:hover .static-number-override,
          .static-number-override:hover {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            box-shadow: none !important;
          }

          @keyframes dropdownOpen {
            0% { opacity: 0; transform: translateY(-6px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes dropdownClose {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-4px); }
          }
          
          @keyframes bellShake {
            0% { transform: rotate(0); }
            25% { transform: rotate(15deg); }
            50% { transform: rotate(-15deg); }
            75% { transform: rotate(15deg); }
            100% { transform: rotate(0); }
          }
          
          @keyframes fadeDashboard {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeUpCard {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeUpTitle {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes countUp {
            from {
              opacity: 0.8;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      {/* Conteúdo Principal (sem Header) */}
       <div 
         className="flex flex-col h-full overflow-y-auto overflow-x-hidden transition-[width] duration-[0.3s] ease-[ease] bg-transparent w-full"
       >
         {/* Scroll principal do conteúdo */}
         <div className={`flex-1 w-full bg-transparent transition-opacity duration-[220ms] ease-in-out opacity-100`}>
           <div className="pt-[24px] pb-4 w-full flex flex-col gap-[24px]">
               {/* Bloco de Boas-vindas Elegante */}
             <div 
               className="flex-shrink-0 w-full max-w-[1200px] mx-auto px-[20px]"
               style={{ animation: 'fadeUpTitle 350ms ease-out forwards', opacity: 0 }}
             >
               <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] dark:from-[#0F172A] dark:to-[#020617] rounded-[16px] px-[20px] py-[16px] shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:shadow-none border border-[rgba(15,23,42,0.05)] dark:border-[rgba(255,255,255,0.05)] flex items-center justify-between relative overflow-hidden group card-transition hover:-translate-y-[1px] transition-all duration-[0.2s] ease-out">
                {/* Efeito sutil de brilho no fundo */}
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#D4AF37]/5 dark:from-[#FFD700]/5 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center gap-[16px] relative z-10">
                  {/* Ícone ou Selo Dourado */}
                  <div className="w-[48px] h-[48px] rounded-[14px] bg-[rgba(255,215,0,0.12)] dark:bg-[rgba(255,215,0,0.1)] flex items-center justify-center shadow-[0_6px_14px_rgba(255,215,0,0.2)] dark:shadow-[0_6px_14px_rgba(255,215,0,0.1)] transition-all duration-300">
                    <Sun className="w-[24px] h-[24px] text-[#D4AF37] dark:text-[#FFD700]" strokeWidth={2} />
                  </div>
                  
                  {/* Textos de Boas-vindas */}
                  <div className="flex flex-col">
                    <h1 className="text-[18px] font-[600] text-[#0F172A] dark:text-white tracking-tight transition-colors duration-300 leading-tight">
                      {getSaudacao()} e bem-vindo de volta, <span className="text-[#D4AF37] dark:text-[#FFD700] font-[700]">Maiclei</span>
                    </h1>
                    <p className="text-[#64748B] dark:text-slate-400 text-[14px] mt-[4px] transition-colors duration-300">
                      Aqui está o resumo das suas operações e atividades recentes.
                    </p>
                  </div>
                </div>

                {/* Informação Contextual - Data Atual (Alinhado à direita) */}
                <div className="hidden md:flex flex-col items-end relative z-10 text-right">
                  <div className="flex items-center gap-[8px] text-[#334155] dark:text-[#E2E8F0] bg-[#F8FAFC] dark:bg-[#0F172A] px-[14px] py-[8px] rounded-full border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                    <span className="text-[13px] font-[500] capitalize">{dataAtualFormatada}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Container Centralizado para as Linhas do Dashboard */}
            <div className="w-full max-w-[1200px] mx-auto flex flex-col px-[24px] gap-[32px]">
              
               {/* Linha 1: Cards de Estatísticas */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[12px]">
                {statsCards.map((stat, index) => (
                     <div 
                       key={index} 
                       onClick={() => stat.link && navigate(stat.link)}
                       style={{ 
                         animation: 'fadeUpCard 400ms ease-out forwards',
                         animationDelay: `${index * 70}ms`,
                         opacity: 0
                       }}
                       className={`
                         ${stat.dynamicColors ? stat.dynamicColors.cardBg : 'bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] dark:from-[#0F172A] dark:to-[#020617] border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]'} 
                         p-[14px] rounded-[16px] shadow-[0_6px_16px_rgba(15,23,42,0.05)] dark:shadow-[0_6px_24px_rgb(0,0,0,0.1)] border flex flex-col items-center justify-center text-center min-h-[90px] gap-[6px]
                         card-transition group
                         ${stat.link ? 'cursor-pointer active:scale-[0.99] active:-translate-y-[1px]' : 'cursor-default'}
                         hover:-translate-y-[4px] hover:shadow-[0_12px_24px_rgba(15,23,42,0.08),0_0_12px_rgba(212,175,55,0.06)] dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.20),0_0_12px_rgba(255,215,0,0.10)] hover:border-[rgba(212,175,55,0.18)] dark:hover:border-[rgba(255,215,0,0.18)]
                         transition-[border-color,box-shadow,transform] duration-[0.2s] ease-out
                       `}
                     >
                    <div className={`w-[42px] h-[42px] flex items-center justify-center ${stat.dynamicColors ? stat.dynamicColors.bg : 'bg-[rgba(255,215,0,0.12)] dark:bg-[rgba(255,215,0,0.1)]'} rounded-[12px] flex-shrink-0 mb-[6px] shadow-[0_4px_10px_rgba(255,215,0,0.15)] dark:shadow-[0_4px_10px_rgba(255,215,0,0.1)] transition-all duration-[0.22s] ease-out group-hover:scale-[1.08] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.22)]`}>
                      <stat.icon className={`h-[20px] w-[20px] ${stat.dynamicColors ? stat.dynamicColors.icon : 'text-[#D4AF37] dark:text-[#FFD700]'}`} strokeWidth={2} />
                    </div>
                    <h3 className="text-[#64748B] dark:text-slate-400 text-[11px] font-[600] uppercase tracking-[0.5px] w-full leading-tight transition-colors duration-300">{stat.title}</h3>
                    <div className="static-number-override">
                      <div 
                        className={`text-[24px] font-[700] ${stat.dynamicColors ? stat.dynamicColors.text : 'text-[#0F172A] dark:text-white'} mt-[2px] tracking-tight static-number-override flex items-baseline justify-center gap-1`}
                      >
                        {stat.isNumber ? <AnimatedNumber value={stat.value as number} /> : stat.textValue || stat.value}
                        {stat.isNumber && stat.title === 'Dias restantes' && <span className="text-[14px] font-[600] opacity-80 mb-[2px]">dias</span>}
                      </div>
                    </div>
                    
                    {/* Condicional para o botão de Renovação ou Subtítulo */}
                    {stat.title === 'Dias restantes' && typeof stat.value === 'number' && stat.value <= 3 ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/assinatura');
                        }}
                        className="mt-1 bg-gradient-to-br from-[#FFD700] to-[#E6B800] text-[#020617] text-[10px] font-[700] px-3 py-1 rounded-full shadow-[0px_4px_10px_rgba(255,215,0,0.3)] hover:scale-105 hover:shadow-[0px_6px_14px_rgba(255,215,0,0.4)] transition-all duration-200 uppercase tracking-wide"
                      >
                        Renovar agora
                      </button>
                    ) : stat.subtitle && (
                      <p className={`text-[10px] mt-0.5 font-medium w-full ${stat.dynamicColors && stat.dynamicColors.subtitleText ? stat.dynamicColors.subtitleText : 'text-slate-500'} transition-colors duration-300`}>
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Linha 2: Área Principal - Layout Centralizado e Equilibrado (2 Colunas) */}
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-[24px] items-start">
                
                 {/* COLUNA ESQUERDA (Estatísticas e Atalhos) */}
                 <div className="flex flex-col gap-[20px] w-full">
                   {/* Linha 1 Esq: Gráfico Principal */}
                   <div className="bg-[#FFFFFF] dark:bg-[#0F172A] p-[20px] rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.05),0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-none border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.05)] flex flex-col h-[240px] max-h-[240px] overflow-hidden card-transition w-full">
                    <div className="flex justify-between items-center mb-4">
                <style>
                  {`
                    @keyframes buttonFadeIn {
                      0% { opacity: 0; transform: translateY(6px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes drawGraphLine {
                      0% { stroke-dasharray: 0, 1000; opacity: 0; }
                      100% { stroke-dasharray: 1000, 1000; opacity: 1; }
                    }
                    @keyframes showGraphPoints {
                      0% { transform: scale(0); opacity: 0; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes fillGraphArea {
                      0% { opacity: 0; }
                      100% { opacity: 0.15; }
                    }
                  `}
                </style>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Estatísticas por período</h2>
                <button 
                  onClick={handleUpdateGraph}
                  className="text-xs font-[600] text-[#020617] bg-gradient-to-br from-[#FACC15] to-[#EAB308] px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(234,179,8,0.35)] hover:bg-gradient-to-br hover:from-[#FFE44D] hover:to-[#FFD700] hover:shadow-[0px_10px_25px_rgba(255,215,0,0.35),0px_0px_14px_rgba(255,215,0,0.25)] hover:-translate-y-[2px] active:translate-y-[1px] active:shadow-[0px_4px_10px_rgba(255,215,0,0.2)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_3px_rgba(255,215,0,0.35)] transition-all duration-[250ms] ease-in-out cursor-pointer flex items-center gap-1"
                  style={{ animation: 'buttonFadeIn 0.3s ease-out forwards' }}
                >
                  Últimos 7 dias
                </button>
              </div>
              
              {/* Gráfico de Área Preenchida */}
              <div className="flex-1 w-full relative flex items-end mt-auto min-h-[220px] p-[24px]">
                {/* Linhas de grade de fundo horizontais */}
                <div className="absolute inset-0 flex flex-col justify-between p-[24px] border-[rgba(0,0,0,0.06)] dark:border-[#1e293b] transition-colors duration-300 z-0">
                  <div className="w-full border-t border-dashed border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] transition-colors duration-300"></div>
                  <div className="w-full border-t border-dashed border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] transition-colors duration-300"></div>
                  <div className="w-full border-t border-dashed border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] transition-colors duration-300"></div>
                  <div className="w-full border-t border-dashed border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.05)] transition-colors duration-300"></div>
                </div>

                {/* SVG do Gráfico de Área */}
                <div className={`absolute inset-0 p-[24px] z-10 w-full h-full flex items-center justify-center transition-opacity duration-400 ease-in-out ${isUpdatingGraph ? 'opacity-0' : 'opacity-100'}`}>
                  <style>
                    {`
                      @keyframes drawLine {
                        from { stroke-dasharray: 3000; stroke-dashoffset: 3000; }
                        to { stroke-dasharray: 3000; stroke-dashoffset: 0; }
                      }
                      @keyframes fillArea {
                        from { opacity: 0; }
                        to { opacity: 1; }
                      }
                      @keyframes showPoint {
                        from { transform: scale(0); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                      }
                      @keyframes showValue {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                      .animate-line {
                        animation: drawLine 1.2s ease-out forwards;
                      }
                      .animate-area {
                        animation: fillArea 800ms ease-out forwards;
                      }
                      .animate-point {
                        animation: showPoint 400ms ease-out forwards;
                      }
                    `}
                  </style>
                  {!isUpdatingGraph && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,215,0,0.35)" />
                          <stop offset="100%" stopColor="rgba(255,215,0,0.05)" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(255,215,0,0.4)" />
                        </filter>
                      </defs>
                      
                      {/* Área Preenchida */}
                      <path 
                        d="M 0,300 L 0,248.8 C 33.3,248.8 133.3,191.6 166.6,191.6 C 200,191.6 300,207.2 333.3,207.2 C 366.6,207.2 466.6,111 500,111 C 533.3,111 633.3,170.8 666.6,170.8 C 700,170.8 800,59 833.3,59 C 866.6,59 966.6,241 1000,241 L 1000,300 Z" 
                        fill="url(#areaGradient)" 
                        className="animate-area opacity-0"
                      />
                      
                      {/* Linha Dourada */}
                      <path 
                        d="M 0,248.8 C 33.3,248.8 133.3,191.6 166.6,191.6 C 200,191.6 300,207.2 333.3,207.2 C 366.6,207.2 466.6,111 500,111 C 533.3,111 633.3,170.8 666.6,170.8 C 700,170.8 800,59 833.3,59 C 866.6,59 966.6,241 1000,241" 
                        fill="none" 
                        strokeWidth="3" 
                        filter="url(#glow)"
                        className="stroke-[#D4AF37] dark:stroke-[#FFD700] animate-line"
                      />

                      {/* Pontos */}
                      {[
                        { cx: 0, cy: 248.8, delay: 0 },
                        { cx: 166.6, cy: 191.6, delay: 100 },
                        { cx: 333.3, cy: 207.2, delay: 200 },
                        { cx: 500, cy: 111, delay: 300 },
                        { cx: 666.6, cy: 170.8, delay: 400 },
                        { cx: 833.3, cy: 59, delay: 500 },
                        { cx: 1000, cy: 241, delay: 600 }
                      ].map((point, i) => (
                        <circle 
                          key={i}
                          cx={point.cx} 
                          cy={point.cy} 
                          r="6" 
                          className="fill-[#F8FAFC] dark:fill-[#0F172A] stroke-[#D4AF37] dark:stroke-[#FFD700] animate-point opacity-0"
                          strokeWidth="3"
                          style={{ animationDelay: `${point.delay}ms`, transformOrigin: `${point.cx}px ${point.cy}px` }}
                        />
                      ))}
                    </svg>
                  )}
                </div>

                {/* Tooltips HTML sobrepostos */}
                <div className="absolute inset-0 p-[24px] z-30 pointer-events-none">
                  <div className="relative w-full h-full">
                    {!isUpdatingGraph && [
                      { day: 'Segunda-feira', value: 12, left: '0%', top: `${(248.8 / 300) * 100}%` },
                      { day: 'Terça-feira', value: 34, left: '16.66%', top: `${(191.6 / 300) * 100}%` },
                      { day: 'Quarta-feira', value: 28, left: '33.33%', top: `${(207.2 / 300) * 100}%` },
                      { day: 'Quinta-feira', value: 65, left: '50%', top: `${(111 / 300) * 100}%` },
                      { day: 'Sexta-feira', value: 42, left: '66.66%', top: `${(170.8 / 300) * 100}%` },
                      { day: 'Sábado', value: 85, left: '83.33%', top: `${(59 / 300) * 100}%` },
                      { day: 'Domingo', value: 15, left: '100%', top: `${(241 / 300) * 100}%` },
                    ].map((point, idx) => (
                      <div 
                        key={idx} 
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 group pointer-events-auto cursor-pointer"
                        style={{ left: point.left, top: point.top }}
                      >
                        {/* Valor Numérico Fixo Acima do Ponto */}
                        <div 
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[10px] text-[#D4AF37] dark:text-[#FFD700] text-[12px] font-[600] pointer-events-none group-hover:-translate-y-1 transition-transform duration-200 z-10 text-center w-full flex justify-center"
                        >
                          {point.value}
                        </div>

                        {/* Ponto Visual Interativo (Círculo Dourado) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-[#FFFFFF] dark:bg-[#020617] border-[2px] border-[#D4AF37] dark:border-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 group-hover:w-[7px] group-hover:h-[7px] group-hover:scale-[1.08] transition-all duration-[180ms] ease-out shadow-[0_0_8px_rgba(212,175,55,0.5)] dark:shadow-[0_0_8px_rgba(255,215,0,0.5)] group-hover:shadow-[0_0_10px_rgba(255,215,0,0.35)] z-10"></div>

                        {/* Tooltip Dinâmica */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95 transition-all duration-[180ms] ease-out pointer-events-none flex flex-col items-center z-20">
                          <div className="bg-[#020617] border border-[rgba(255,215,0,0.22)] rounded-[10px] px-[12px] py-[10px] shadow-[0_8px_20px_rgba(2,6,23,0.28)] flex flex-col items-start min-w-[110px]">
                            <span className="text-[12px] text-[#FFFFFF] font-bold leading-[1.5] flex items-center gap-1.5 mb-1">
                              {point.day}
                            </span>
                            <span className="text-[12px] text-[#FFFFFF]/80 font-medium leading-[1.5] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_4px_rgba(255,215,0,0.6)]"></span>
                              {point.value} interações
                            </span>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#020617] border-b border-r border-[rgba(255,215,0,0.22)] transform rotate-45 -mt-1.5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eixo X (Dias) */}
                <div className="absolute bottom-0 left-[24px] right-[24px] h-6 text-[10px] font-semibold text-[#6b7280] dark:text-[#94A3B8] z-20">
                  <span className="absolute left-[0%] -translate-x-1/2">Seg</span>
                  <span className="absolute left-[16.66%] -translate-x-1/2">Ter</span>
                  <span className="absolute left-[33.33%] -translate-x-1/2">Qua</span>
                  <span className="absolute left-[50%] -translate-x-1/2">Qui</span>
                  <span className="absolute left-[66.66%] -translate-x-1/2">Sex</span>
                  <span className="absolute left-[83.33%] -translate-x-1/2">Sáb</span>
                  <span className="absolute left-[100%] -translate-x-1/2">Dom</span>
                </div>
              </div>
            </div>

              {/* Linha 2 Esq: Atalhos Rápidos */}
              <div 
                className="bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[20px] shadow-[0_10px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none border border-[rgba(15,23,42,0.05)] dark:border-[rgba(255,255,255,0.06)] flex flex-col card-transition relative overflow-hidden p-[24px] w-full min-h-[260px]"
              style={{ animation: 'fadeUpCard 400ms ease-out forwards', animationDelay: '420ms', opacity: 0 }}
            >
              <div className="mb-6 pb-5 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] transition-colors duration-300 w-full text-left">
                <h2 className="text-[18px] font-[700] text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Atalhos rápidos</h2>
                <p className="text-[#64748B] dark:text-slate-400 text-[13px] mt-[4px] font-medium transition-colors duration-300">Acesse ações importantes com mais agilidade.</p>
              </div>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] w-full">
                  <button onClick={() => navigate('/fluxos')} className="relative flex flex-col items-center justify-center p-[20px] min-h-[120px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[16px] bg-[#F8FAFC] dark:bg-[#1e293b]/50 transition-all duration-[220ms] ease-in-out group hover:-translate-y-[4px] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-[#D4AF37]/30 dark:hover:border-[#FFD700]/30 active:scale-[0.98] w-full">
                  <div className="bg-[#D4AF37]/10 dark:bg-[#C9A227]/10 p-3 rounded-xl mb-[8px] group-hover:bg-[#D4AF37]/20 dark:group-hover:bg-[#FFD700]/20 transition-colors duration-[220ms] ease-in-out shadow-sm">
                    <Workflow className="h-[28px] w-[28px] text-[#D4AF37] dark:text-[#FFD700] group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)] dark:group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.4)] transition-transform duration-[300ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:rotate-[4deg]" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 text-center transition-colors duration-[220ms]">Novo fluxo</span>
                  
                  {/* Tooltip Elegante */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-[220ms] ease-out pointer-events-none z-50">
                    <div className="bg-[#020617] text-[#FFFFFF] border border-[rgba(255,215,0,0.22)] rounded-[8px] shadow-[0_8px_20px_rgba(2,6,23,0.28)] px-[10px] py-[6px] text-[11px] font-medium whitespace-nowrap flex items-center">
                      Criar novo fluxo de conversa
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-2 h-2 bg-[#020617] border-b border-r border-[rgba(255,215,0,0.22)] transform rotate-45"></div>
                    </div>
                  </div>
                </button>
                
                <button onClick={() => navigate('/transmissoes')} className="relative flex flex-col items-center justify-center p-[20px] min-h-[120px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[16px] bg-[#F8FAFC] dark:bg-[#1e293b]/50 transition-all duration-[220ms] ease-in-out group hover:-translate-y-[4px] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-[#D4AF37]/30 dark:hover:border-[#FFD700]/30 active:scale-[0.98] w-full">
                  <div className="bg-[#D4AF37]/10 dark:bg-[#C9A227]/10 p-3 rounded-xl mb-[8px] group-hover:bg-[#D4AF37]/20 dark:group-hover:bg-[#FFD700]/20 transition-colors duration-[220ms] ease-in-out shadow-sm">
                    <Send className="h-[28px] w-[28px] text-[#D4AF37] dark:text-[#FFD700] group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)] dark:group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.4)] transition-transform duration-[300ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight transition-colors duration-[220ms]">Nova<br/>transmissão</span>
                  
                  {/* Tooltip Elegante */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-[220ms] ease-out pointer-events-none z-50">
                    <div className="bg-[#020617] text-[#FFFFFF] border border-[rgba(255,215,0,0.22)] rounded-[8px] shadow-[0_8px_20px_rgba(2,6,23,0.28)] px-[10px] py-[6px] text-[11px] font-medium whitespace-nowrap flex items-center">
                      Agendar nova transmissão
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-2 h-2 bg-[#020617] border-b border-r border-[rgba(255,215,0,0.22)] transform rotate-45"></div>
                    </div>
                  </div>
                </button>
                
                <button onClick={() => navigate('/configuracoes')} className="relative flex flex-col items-center justify-center p-[20px] min-h-[120px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[16px] bg-[#F8FAFC] dark:bg-[#1e293b]/50 transition-all duration-[220ms] ease-in-out group hover:-translate-y-[4px] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-[#D4AF37]/30 dark:hover:border-[#FFD700]/30 active:scale-[0.98] w-full">
                  <div className="bg-[#D4AF37]/10 dark:bg-[#C9A227]/10 p-3 rounded-xl mb-[8px] group-hover:bg-[#D4AF37]/20 dark:group-hover:bg-[#FFD700]/20 transition-colors duration-[220ms] ease-in-out shadow-sm">
                    <UserPlus className="h-[28px] w-[28px] text-[#D4AF37] dark:text-[#FFD700] group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)] dark:group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.4)] transition-transform duration-[300ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.1] group-hover:-translate-y-[1px]" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight transition-colors duration-[220ms]">Adicionar<br/>usuário</span>
                  
                  {/* Tooltip Elegante */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-[220ms] ease-out pointer-events-none z-50">
                    <div className="bg-[#020617] text-[#FFFFFF] border border-[rgba(255,215,0,0.22)] rounded-[8px] shadow-[0_8px_20px_rgba(2,6,23,0.28)] px-[10px] py-[6px] text-[11px] font-medium whitespace-nowrap flex items-center">
                      Cadastrar novo usuário
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-2 h-2 bg-[#020617] border-b border-r border-[rgba(255,215,0,0.22)] transform rotate-45"></div>
                    </div>
                  </div>
                </button>
                
                <button onClick={() => navigate('/relatorios')} className="relative flex flex-col items-center justify-center p-[20px] min-h-[120px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[16px] bg-[#F8FAFC] dark:bg-[#1e293b]/50 transition-all duration-[220ms] ease-in-out group hover:-translate-y-[4px] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-[#D4AF37]/30 dark:hover:border-[#FFD700]/30 active:scale-[0.98] w-full">
                  <div className="bg-[#D4AF37]/10 dark:bg-[#C9A227]/10 p-3 rounded-xl mb-[8px] group-hover:bg-[#D4AF37]/20 dark:group-hover:bg-[#FFD700]/20 transition-colors duration-[220ms] ease-in-out shadow-sm">
                    <BarChart2 className="h-[28px] w-[28px] text-[#D4AF37] dark:text-[#FFD700] group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)] dark:group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.4)] transition-transform duration-[300ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-[2px] group-hover:scale-[1.05]" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 text-center transition-colors duration-[220ms]">Relatórios</span>
                  
                  {/* Tooltip Elegante */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-[220ms] ease-out pointer-events-none z-50">
                    <div className="bg-[#020617] text-[#FFFFFF] border border-[rgba(255,215,0,0.22)] rounded-[8px] shadow-[0_8px_20px_rgba(2,6,23,0.28)] px-[10px] py-[6px] text-[11px] font-medium whitespace-nowrap flex items-center">
                      Ver relatórios do sistema
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-2 h-2 bg-[#020617] border-b border-r border-[rgba(255,215,0,0.22)] transform rotate-45"></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            </div>

            {/* COLUNA DIREITA (Vencimento e Donut Chart) */}
            <div className="flex flex-col gap-[24px] w-full">
              {/* Linha 1 Dir: Data de Vencimento Compacto */}
              <div 
                className={`bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] dark:from-[#0F172A] dark:to-[#020617] px-[24px] py-[24px] rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.12)] border flex flex-col items-center justify-center text-center relative overflow-hidden h-[280px] card-transition flex-shrink-0 group hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition-all duration-[220ms] ease-out ${
                  diasRestantes <= 0 
                    ? 'border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)]' 
                    : diasRestantes <= 3 
                      ? 'border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.08)]'
                      : 'border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]'
                }`}
                style={{ animation: 'fadeUpCard 400ms ease-out forwards', animationDelay: '350ms', opacity: 0 }}
              >
                {/* Efeito visual de fundo */}
                <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl ${diasRestantes <= 0 ? 'bg-red-500/10' : diasRestantes <= 3 ? 'bg-orange-500/10' : 'bg-white/5'}`}></div>
                <div className={`absolute -left-10 -bottom-10 w-24 h-24 rounded-full blur-2xl ${diasRestantes <= 0 ? 'bg-red-500/10' : diasRestantes <= 3 ? 'bg-orange-500/10' : 'bg-[#eab308]/10'}`}></div>

                <div className="flex flex-col items-center justify-center relative z-10 w-full h-full">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className={`p-[12px] rounded-[14px] shadow-[0_4px_10px_rgba(255,215,0,0.18)] dark:shadow-none ${
                      diasRestantes <= 0
                        ? 'bg-[rgba(239,68,68,0.12)] dark:bg-[rgba(239,68,68,0.15)] shadow-[0_4px_10px_rgba(239,68,68,0.18)]'
                        : diasRestantes <= 3
                          ? 'bg-[rgba(249,115,22,0.12)] dark:bg-[rgba(249,115,22,0.15)] shadow-[0_4px_10px_rgba(249,115,22,0.18)]'
                          : 'bg-[rgba(255,215,0,0.12)] dark:bg-[rgba(255,215,0,0.1)]'
                    }`}>
                      <Calendar className={`h-6 w-6 ${diasRestantes <= 0 ? 'text-red-500' : diasRestantes <= 3 ? 'text-orange-500' : 'text-[#eab308]'}`} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <p className={`text-[22px] font-[700] tracking-[0.4px] transition-colors duration-300 leading-none mt-[10px] ${
                      diasRestantes <= 0 ? 'text-red-600 dark:text-red-400' : diasRestantes <= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-[#0F172A] dark:text-white'
                    }`}>
                      {dataVencimento.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    
                    <p className={`text-[13px] mt-[6px] ${
                      diasRestantes <= 0 ? 'text-red-500/80 dark:text-red-400/80' : diasRestantes <= 3 ? 'text-orange-500/80 dark:text-orange-400/80' : 'text-[#64748B] dark:text-slate-400'
                    }`}>
                      {diasRestantes < 0 
                        ? 'Sua assinatura expirou' 
                        : diasRestantes === 0 
                          ? 'Sua assinatura vence hoje' 
                          : `Sua assinatura vence em ${diasRestantes} dias`}
                    </p>

                    <div className={`mt-[10px] px-[10px] py-[6px] rounded-full text-[12px] font-[500] transition-colors duration-300 flex items-center gap-1.5 ${
                      diasRestantes <= 0 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50' 
                        : diasRestantes <= 3
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'
                          : 'bg-[rgba(34,197,94,0.12)] text-[#16A34A] dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {diasRestantes > 3 && <span>✔</span>}
                      {diasRestantes <= 3 && diasRestantes > 0 && <span>⚠️</span>}
                      {diasRestantes <= 0 && <span>✖</span>}
                      
                      {diasRestantes < 0 
                        ? 'Assinatura expirada' 
                        : diasRestantes === 0
                          ? 'Atenção: Vence hoje'
                          : diasRestantes <= 3
                            ? 'Atenção: Vence em breve'
                            : 'Assinatura ativa'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 2 Dir: Status das Conversas (Donut Chart) */}
              <div 
                className="bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] dark:from-[#0F172A] dark:to-[#020617] p-[24px] rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.12)] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-start relative overflow-hidden group card-transition flex-1 min-h-[260px] hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition-all duration-[220ms] ease-out"
                style={{ animation: 'fadeUpCard 400ms ease-out forwards', animationDelay: '490ms', opacity: 0 }}
              >
                <div className="w-full flex justify-between items-center mb-[18px]">
                  <h2 className="text-[20px] font-[700] text-[#0F172A] dark:text-white transition-colors duration-300">Status das Conversas</h2>
                </div>
                
                <div className="flex w-full flex-1 items-center justify-center gap-10 mt-[-10px]">
                  {/* Gráfico Donut (SVG) */}
                  <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center drop-shadow-[0_4px_10px_rgba(15,23,42,0.06)]">
                    <style>
                      {`
                        @keyframes spinDonut {
                          0% { stroke-dasharray: 0, 100; opacity: 0; }
                          100% { opacity: 1; }
                        }
                        @keyframes rotateDonutIn {
                          0% { transform: rotate(-120deg) scale(0.9); opacity: 0; }
                          100% { transform: rotate(-90deg) scale(1); opacity: 1; }
                        }
                        .donut-container {
                          animation: rotateDonutIn 500ms ease-out forwards;
                        }
                        .donut-segment {
                          animation: spinDonut 800ms ease-out forwards;
                          transform-origin: center;
                          transition: all 0.3s ease;
                          cursor: pointer;
                        }
                        .donut-segment:hover {
                          transform: scale(1.05);
                          filter: drop-shadow(0 0 8px rgba(255,255,255,0.2));
                        }
                      `}
                    </style>
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 overflow-visible donut-container">
                      {/* Fundo do Donut */}
                      <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#1e293b" strokeWidth="4"></circle>
                      
                      {/* Resolvidas (Azul) - 60% */}
                      <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3B82F6" strokeWidth="4" 
                        strokeDasharray="60 40" strokeDashoffset="0" className="donut-segment" style={{ animationDelay: '0ms' }}></circle>
                      
                      {/* Abertas (Verde) - 25% */}
                      <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#22C55E" strokeWidth="4" 
                        strokeDasharray="25 75" strokeDashoffset="-60" className="donut-segment" style={{ animationDelay: '150ms' }}></circle>
                      
                      {/* Pendentes (Dourado) - 15% */}
                      <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#FFD700" strokeWidth="4" 
                        strokeDasharray="15 85" strokeDashoffset="-85" className="donut-segment" style={{ animationDelay: '300ms' }}></circle>
                    </svg>

                    {/* Centro do Donut (Total) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-0 mt-1">
                      <span className="text-[12px] text-[#64748B] dark:text-[#9CA3AF] font-[500] leading-none mb-1">Total</span>
                      <span className="text-[22px] font-[700] text-[#0F172A] dark:text-white leading-none">125</span>
                    </div>

                    {/* Tooltip Dinâmica Centralizada (Hover do Segmento) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none bg-[#FFFFFF] dark:bg-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Visualizando</span>
                      <span className="text-[12px] text-slate-900 dark:text-white font-[600] leading-tight text-center">Interação<br/>ativa</span>
                    </div>
                  </div>

                  {/* Legenda Lateral */}
                  <div className="flex flex-col justify-center gap-[10px]">
                    <div className="flex items-center gap-[10px] group/leg cursor-pointer">
                      <span className="w-[10px] h-[10px] rounded-full bg-[#22C55E] group-hover/leg:scale-125 transition-transform shadow-[0_0_6px_rgba(34,197,94,0.4)]"></span>
                      <span className="text-[14px] text-[#475569] dark:text-slate-300 font-[500] transition-colors group-hover/leg:text-[#0F172A] dark:group-hover/leg:text-white">Abertas</span>
                    </div>
                    <div className="flex items-center gap-[10px] group/leg cursor-pointer">
                      <span className="w-[10px] h-[10px] rounded-full bg-[#FACC15] group-hover/leg:scale-125 transition-transform shadow-[0_0_6px_rgba(250,204,21,0.4)]"></span>
                      <span className="text-[14px] text-[#475569] dark:text-slate-300 font-[500] transition-colors group-hover/leg:text-[#0F172A] dark:group-hover/leg:text-white">Pendentes</span>
                    </div>
                    <div className="flex items-center gap-[10px] group/leg cursor-pointer">
                      <span className="w-[10px] h-[10px] rounded-full bg-[#3B82F6] group-hover/leg:scale-125 transition-transform shadow-[0_0_6px_rgba(59,130,246,0.4)]"></span>
                      <span className="text-[14px] text-[#475569] dark:text-slate-300 font-[500] transition-colors group-hover/leg:text-[#0F172A] dark:group-hover/leg:text-white">Resolvidas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

              {/* Linha 4: Tabela Inferior - Estatísticas da Equipe */}
              <div 
                className="bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[20px] shadow-[0_10px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-none border border-[rgba(15,23,42,0.05)] dark:border-[rgba(255,255,255,0.06)] overflow-hidden flex flex-col p-[24px] w-full card-transition"
                style={{ animation: 'fadeUpCard 400ms ease-out forwards', animationDelay: '560ms', opacity: 0 }}
              >
                <div className="pb-4 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex justify-between items-center transition-colors duration-300 flex-shrink-0">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white transition-colors duration-300">Estatísticas da equipe</h2>
                  <button className="text-xs font-semibold text-[#D4AF37] dark:text-[#F4E7C5] hover:text-slate-900 dark:hover:text-white transition-colors">Ver todos</button>
                </div>
                
                <div className="overflow-x-auto flex-1 mt-[16px]">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#020617] border-b border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)] transition-colors duration-300">
                        <th className="px-[20px] py-[16px] text-xs font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-[0.3px]">Atendente</th>
                        <th className="px-[20px] py-[16px] text-xs font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-[0.3px] text-center">Conversas abertas</th>
                        <th className="px-[20px] py-[16px] text-xs font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-[0.3px] text-center">Conversas pendentes</th>
                        <th className="px-[20px] py-[16px] text-xs font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-[0.3px] text-center">Conversas resolvidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(15,23,42,0.06)] dark:divide-[#1e293b] transition-colors duration-300">
                      <tr className="hover:bg-slate-50 dark:hover:bg-[#1e293b]/30 transition-colors group cursor-pointer">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-[10px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-[#1e293b] dark:to-[#020617] text-slate-900 dark:text-white flex items-center justify-center font-[600] text-sm border border-slate-300 dark:border-slate-700/50">
                              S
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">Sucessonaveia7@gmail.com</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Administrador</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-center">
                          <span className="bg-slate-100 dark:bg-[rgba(255,255,255,0.06)] px-[10px] py-[6px] rounded-[8px] text-[13px] text-slate-900 dark:text-white font-medium inline-block">
                            0 conversas
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-center">
                          <span className="bg-slate-100 dark:bg-[rgba(255,255,255,0.06)] px-[10px] py-[6px] rounded-[8px] text-[13px] text-slate-900 dark:text-white font-medium inline-block">
                            0 pendentes
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-center">
                          <span className="bg-green-100 dark:bg-[rgba(34,197,94,0.2)] px-[10px] py-[6px] rounded-[8px] text-[13px] text-green-600 dark:text-[#22C55E] font-medium inline-block">
                            0 resolvidas
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
