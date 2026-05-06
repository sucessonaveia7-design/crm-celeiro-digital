// src/components/Sidebar.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Smartphone, ShieldCheck,
  Settings, Wheat, LogOut, Users, BarChart2,
  Workflow, Send, KanbanSquare, Zap, UsersRound,
  ChevronDown, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/* ─────────────────────────────────────────────────────
   Sub-componentes externos (não recriados a cada render)
─────────────────────────────��─────────────────────── */

type SectionHeaderProps = { label: string; open: boolean; onToggle: () => void };

function SectionHeader({ label, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-[12px] py-[8px] mb-[3px] rounded-xl
        border border-[rgba(212,175,55,0.08)] bg-[rgba(212,175,55,0.03)]
        hover:bg-[rgba(212,175,55,0.07)] hover:border-[rgba(212,175,55,0.2)]
        transition-all duration-200 ease-in-out group"
    >
      <span
        className="text-[10px] font-[700] text-[#567093] uppercase tracking-[1.1px]
          group-hover:text-[#7A9BC0] transition-colors duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
      >
        {label}
      </span>
      <span className="flex items-center justify-center w-[18px] h-[18px] rounded-md
        bg-[rgba(255,255,255,0.04)] group-hover:bg-[rgba(212,175,55,0.14)]
        transition-all duration-200">
        {open
          ? <ChevronDown  className="w-[11px] h-[11px] text-[#567093] group-hover:text-[#D4AF37] transition-colors duration-200" strokeWidth={2.5} />
          : <ChevronRight className="w-[11px] h-[11px] text-[#567093] group-hover:text-[#D4AF37] transition-colors duration-200" strokeWidth={2.5} />
        }
      </span>
    </button>
  );
}

type IconBtnProps = { icon: React.ElementType; label: string; isActive: boolean; onClick: () => void };

function IconBtn({ icon: Icon, label, isActive, onClick }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={
        'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-[180ms] ease-in-out ' +
        (isActive
          ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.15)]'
          : 'text-[#64748B] hover:bg-white/[0.06] hover:text-[#94A3B8]')
      }
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
    </button>
  );
}

/* ───────────��────────────────────────────��────────────
   Sidebar
───────────────────────────────────────────────────── */
const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const clearAuth = useAuthStore(s => s.clearAuth);

  const [sidebarCollapsed,   setSidebarCollapsed]   = useState(false);
  const [comunicacaoOpen,    setComunicacaoOpen]    = useState(true);
  const [gestaoOpen,         setGestaoOpen]         = useState(true);
  const [ferramentasOpen,    setFerramentasOpen]    = useState(true);
  const [analiseOpen,        setAnaliseOpen]        = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  /* ── classes reutilizáveis ── */
  const itemCls = (path: string) =>
    'w-full flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-[500] ' +
    'transition-all duration-[180ms] ease-in-out group ' +
    (isActive(path)
      ? 'bg-[rgba(212,175,55,0.12)] text-[#D4AF37]'
      : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#E2E8F0] hover:translate-x-[2px]');

  const iconCls = (path: string) =>
    'w-4 h-4 flex-shrink-0 transition-colors duration-[180ms] ' +
    (isActive(path) ? 'text-[#D4AF37]' : 'text-[#64748B] group-hover:text-[#94A3B8]');

  const dot = (path: string) =>
    isActive(path) ? <span className="ml-auto w-1 h-4 rounded-full bg-[#D4AF37] flex-shrink-0" /> : null;

  const collapse = (open: boolean) =>
    'overflow-hidden transition-all duration-200 ease-in-out ' +
    (open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0');

  const sep = (
    <div className="my-[10px] mx-[4px] h-px" style={{
      background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18) 30%, rgba(212,175,55,0.18) 70%, transparent)',
    }} />
  );

  return (
    <div
      style={{ width: sidebarCollapsed ? '76px' : '248px', transition: 'width 300ms ease-in-out', flexShrink: 0 }}
      className="bg-[#0B111F] border-r border-[rgba(255,255,255,0.06)] flex flex-col select-none h-full relative"
    >

      {/* ── Botão recolher/expandir sidebar ── */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(v => !v)}
        title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute top-1/2 z-50 flex items-center justify-center w-6 h-6 rounded-full
          border-2 border-[#D4AF37] bg-[#0B111F] hover:bg-[#172033]
          transition-colors duration-200 cursor-pointer"
        style={{ right: '-12px', transform: 'translateY(-50%)' }}
      >
        {sidebarCollapsed
          ? <ChevronRight className="w-3 h-3 text-[#D4AF37]" strokeWidth={2.5} />
          : <ChevronLeft  className="w-3 h-3 text-[#D4AF37]" strokeWidth={2.5} />
        }
      </button>

      {/* ── Brand ── */}
      <div
        className={
          'flex items-center flex-shrink-0 relative overflow-hidden ' +
          (sidebarCollapsed ? 'h-[76px] justify-center' : 'h-[76px] gap-[14px] px-[20px]')
        }
        style={{ background: 'linear-gradient(150deg, #0F1E38 0%, #0B1627 55%, #070E1C 100%)' }}
      >
        {/* Radial glow behind icon */}
        <div className="absolute pointer-events-none" style={{
          width: '100px', height: '100px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.13) 0%, transparent 68%)',
          left: sidebarCollapsed ? '50%' : '10px',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
        {/* Bottom gold gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 40%, rgba(212,175,55,0.35) 60%, transparent 100%)' }}
        />

        {/* Icon */}
        <div
          className="relative flex-shrink-0 w-[38px] h-[38px]"
          style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.45))' }}
        >
          <div className="w-full h-full rounded-[11px] flex items-center justify-center" style={{
            background: 'linear-gradient(140deg, #DDB830 0%, #C49B28 55%, #9E7515 100%)',
            boxShadow: '0 4px 20px rgba(212,175,55,0.5), 0 0 0 1.5px rgba(255,210,60,0.3), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}>
            <Wheat className="w-[18px] h-[18px] text-[#020617]" strokeWidth={2.3} />
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="flex flex-col" style={{ gap: '0px', marginTop: '-1px' }}>
            <p style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: '24px', fontWeight: 400, color: '#F5F0E8',
              lineHeight: 1.2, letterSpacing: '0.5px',
              textShadow: '0 0 18px rgba(212,175,55,0.3), 0 0 6px rgba(212,175,55,0.12)',
            }}>
              Celeiro
            </p>
            <p style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: '24px', fontWeight: 400, color: '#EDD070',
              lineHeight: 1.2, letterSpacing: '0.5px',
              textShadow: '0 0 20px rgba(212,175,55,0.55), 0 0 8px rgba(212,175,55,0.25)',
            }}>
              Digital
            </p>
          </div>
        )}
      </div>

      {/* ═════════════════��══════════════
          MODO EXPANDIDO
      ════════════════════════════════ */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto py-[14px] px-[10px] flex flex-col gap-[2px]">

          {/* Painel Geral */}
          <button type="button" onClick={() => navigate('/')} className={itemCls('/')}>
            <LayoutDashboard className={iconCls('/')} strokeWidth={isActive('/') ? 2.2 : 1.8} />
            <span>Painel Geral</span>
            {dot('/')}
          </button>

          {/* COMUNICAÇÃO */}
          {sep}
          <SectionHeader label="Comunicação" open={comunicacaoOpen} onToggle={() => setComunicacaoOpen(o => !o)} />
          <div className={collapse(comunicacaoOpen)}>
            <div className="flex flex-col gap-[2px]">
              {([
                { path: '/mensagens',    icon: Smartphone,     label: 'WhatsApp'         },
                { path: '/chat-interno', icon: MessageSquare,  label: 'Chat Interno'     },
                { path: '/whatsapp',     icon: ShieldCheck,    label: 'WhatsApp Oficial' },
              ] as const).map(({ path, icon: Icon, label }) => (
                <button key={path} type="button" onClick={() => navigate(path)} className={itemCls(path)}>
                  <Icon className={iconCls(path)} strokeWidth={isActive(path) ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {dot(path)}
                </button>
              ))}
            </div>
          </div>

          {/* GESTÃO */}
          {sep}
          <SectionHeader label="Gestão" open={gestaoOpen} onToggle={() => setGestaoOpen(o => !o)} />
          <div className={collapse(gestaoOpen)}>
            <div className="flex flex-col gap-[2px]">
              <button type="button" onClick={() => navigate('/audiencia')} className={itemCls('/audiencia')}>
                <Users className={iconCls('/audiencia')} strokeWidth={isActive('/audiencia') ? 2.2 : 1.8} />
                <span>Audiência</span>
                {dot('/audiencia')}
              </button>
              <button type="button" onClick={() => navigate('/grupos')} className={itemCls('/grupos')}>
                <UsersRound className={iconCls('/grupos')} strokeWidth={isActive('/grupos') ? 2.2 : 1.8} />
                <span>Grupos</span>
                {dot('/grupos')}
              </button>
            </div>
          </div>

          {/* FERRAMENTAS */}
          {sep}
          <SectionHeader label="Ferramentas" open={ferramentasOpen} onToggle={() => setFerramentasOpen(o => !o)} />
          <div className={collapse(ferramentasOpen)}>
            <div className="flex flex-col gap-[2px]">
              {([
                { path: '/automacoes',   icon: Zap,          label: 'Automações'   },
                { path: '/transmissoes', icon: Send,         label: 'Transmissões' },
                { path: '/fluxos',       icon: Workflow,     label: 'Fluxos'       },
                { path: '/kanban',       icon: KanbanSquare, label: 'Kanban'       },
              ] as const).map(({ path, icon: Icon, label }) => (
                <button key={path} type="button" onClick={() => navigate(path)} className={itemCls(path)}>
                  <Icon className={iconCls(path)} strokeWidth={isActive(path) ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {dot(path)}
                </button>
              ))}
            </div>
          </div>

          {/* ANÁLISE */}
          {sep}
          <SectionHeader label="Análise" open={analiseOpen} onToggle={() => setAnaliseOpen(o => !o)} />
          <div className={collapse(analiseOpen)}>
            <div className="flex flex-col gap-[2px]">
              <button type="button" onClick={() => navigate('/relatorios')} className={itemCls('/relatorios')}>
                <BarChart2 className={iconCls('/relatorios')} strokeWidth={isActive('/relatorios') ? 2.2 : 1.8} />
                <span>Relatórios</span>
                {dot('/relatorios')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          MODO RECOLHIDO — só ícones
      ═══════════════��════════════════ */}
      {sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto py-[10px] flex flex-col items-center gap-[3px]">
          <IconBtn icon={LayoutDashboard} label="Painel Geral"     isActive={isActive('/')}             onClick={() => navigate('/')} />

          <div className="w-8 h-px bg-[rgba(255,255,255,0.06)] my-[5px]" />
          <IconBtn icon={Smartphone}     label="WhatsApp"          isActive={isActive('/mensagens')}    onClick={() => navigate('/mensagens')} />
          <IconBtn icon={MessageSquare}  label="Chat Interno"      isActive={isActive('/chat-interno')} onClick={() => navigate('/chat-interno')} />
          <IconBtn icon={ShieldCheck}    label="WhatsApp Oficial"  isActive={isActive('/whatsapp')}     onClick={() => navigate('/whatsapp')} />

          <div className="w-8 h-px bg-[rgba(255,255,255,0.06)] my-[5px]" />
          <IconBtn icon={Users}          label="Audiência"         isActive={isActive('/audiencia')}    onClick={() => navigate('/audiencia')} />
          <IconBtn icon={UsersRound}     label="Grupos"            isActive={isActive('/grupos')}       onClick={() => navigate('/grupos')} />

          <div className="w-8 h-px bg-[rgba(255,255,255,0.06)] my-[5px]" />
          <IconBtn icon={Zap}            label="Automações"        isActive={isActive('/automacoes')}   onClick={() => navigate('/automacoes')} />
          <IconBtn icon={Send}           label="Transmissões"      isActive={isActive('/transmissoes')} onClick={() => navigate('/transmissoes')} />
          <IconBtn icon={Workflow}       label="Fluxos"            isActive={isActive('/fluxos')}       onClick={() => navigate('/fluxos')} />
          <IconBtn icon={KanbanSquare}   label="Kanban"            isActive={isActive('/kanban')}       onClick={() => navigate('/kanban')} />

          <div className="w-8 h-px bg-[rgba(255,255,255,0.06)] my-[5px]" />
          <IconBtn icon={BarChart2}      label="Relatórios"        isActive={isActive('/relatorios')}   onClick={() => navigate('/relatorios')} />
        </div>
      )}

      {/* ── Bottom: Configurações + Sair ── */}
      <div className="px-[10px] py-[10px] border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-[2px] flex-shrink-0">
        {sidebarCollapsed ? (
          <>
            <IconBtn icon={Settings} label="Configurações" isActive={isActive('/configuracoes')} onClick={() => navigate('/configuracoes')} />
            <button
              type="button"
              onClick={handleLogout}
              title="Sair"
              className="w-11 h-11 mx-auto flex items-center justify-center rounded-xl text-[#64748B] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#EF4444] transition-all duration-[180ms] ease-in-out"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => navigate('/configuracoes')} className={itemCls('/configuracoes')}>
              <Settings className={iconCls('/configuracoes')} strokeWidth={isActive('/configuracoes') ? 2.2 : 1.8} />
              <span>Configurações</span>
              {dot('/configuracoes')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-[500]
                text-[#94A3B8] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] hover:translate-x-[2px]
                transition-all duration-[180ms] ease-in-out group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-[#64748B] group-hover:text-[#EF4444]" strokeWidth={1.8} />
              <span>Sair</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
