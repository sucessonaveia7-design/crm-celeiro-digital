// src/components/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MessageCircle, MessageSquare, Smartphone, ShieldCheck,
  Settings, Wheat, LogOut, Users, BarChart2,
  Workflow, Send, KanbanSquare, Zap, UsersRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type NavItem = { path: string; icon: React.ElementType; label: string };
type Section = { label?: string; items: NavItem[] };

const SECTIONS: Section[] = [
  {
    items: [
      { path: '/',             icon: LayoutDashboard, label: 'Painel Geral'     },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { path: '/bate-papo',    icon: MessageCircle,   label: 'Bate-papo'        },
      { path: '/chat-interno', icon: MessageSquare,   label: 'Chat Interno'     },
      { path: '/mensagens',    icon: Smartphone,      label: 'WhatsApp'         },
      { path: '/whatsapp',     icon: ShieldCheck,     label: 'WhatsApp Oficial' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { path: '/audiencia',    icon: Users,           label: 'Audiência'        },
      { path: '/grupos',       icon: UsersRound,      label: 'Grupos'           },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/automacoes',   icon: Zap,             label: 'Automações'       },
      { path: '/transmissoes', icon: Send,            label: 'Transmissões'     },
      { path: '/fluxos',       icon: Workflow,        label: 'Fluxos'           },
      { path: '/kanban',       icon: KanbanSquare,    label: 'Kanban'           },
    ],
  },
  {
    label: 'Análise',
    items: [
      { path: '/relatorios',   icon: BarChart2,       label: 'Relatórios'       },
    ],
  },
];

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const clearAuth = useAuthStore(s => s.clearAuth);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
  };

  const active = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const cls = (path: string) =>
    `w-full flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-[500] transition-all duration-[180ms] ease-in-out group
    ${active(path)
      ? 'bg-[rgba(212,175,55,0.12)] text-[#D4AF37]'
      : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#E2E8F0] hover:translate-x-[2px]'
    }`;

  const NavItem = ({ path, icon: Icon, label }: NavItem) => (
    <button onClick={() => navigate(path)} className={cls(path)}>
      <Icon
        className={`w-4 h-4 flex-shrink-0 transition-colors duration-[180ms] ${active(path) ? 'text-[#D4AF37]' : 'text-[#64748B] group-hover:text-[#94A3B8]'}`}
        strokeWidth={active(path) ? 2.2 : 1.8}
      />
      <span>{label}</span>
      {active(path) && (
        <span className="ml-auto w-1 h-4 rounded-full bg-[#D4AF37] flex-shrink-0" />
      )}
    </button>
  );

  return (
    <div className="w-[240px] bg-[#0B111F] border-r border-[rgba(255,255,255,0.06)] flex flex-col flex-shrink-0 select-none h-full">
      {/* Brand — same height as Header (72px) */}
      <div className="h-[72px] flex items-center gap-[12px] px-[20px] border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
        <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-[#D4AF37] to-[#B8952A] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(212,175,55,0.25)]">
          <Wheat className="w-[17px] h-[17px] text-[#020617]" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[14px] font-[700] text-white leading-none tracking-[0.3px]">Celeiro</p>
          <p className="text-[14px] font-[700] text-[#D4AF37] leading-none tracking-[0.3px] mt-[2px]">Digital</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-[14px] px-[10px] flex flex-col gap-[2px]">
        {SECTIONS.map((section, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="my-[8px] mx-[6px] h-px bg-[rgba(255,255,255,0.06)]" />
            )}
            {section.label && (
              <p className="px-[12px] mb-[4px] text-[10px] font-[600] text-[#475569] uppercase tracking-[0.8px]">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-[10px] py-[10px] border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-[2px] flex-shrink-0">
        <button onClick={() => navigate('/configuracoes')} className={cls('/configuracoes')}>
          <Settings
            className={`w-4 h-4 flex-shrink-0 ${active('/configuracoes') ? 'text-[#D4AF37]' : 'text-[#64748B] group-hover:text-[#94A3B8]'}`}
            strokeWidth={active('/configuracoes') ? 2.2 : 1.8}
          />
          <span>Configurações</span>
          {active('/configuracoes') && (
            <span className="ml-auto w-1 h-4 rounded-full bg-[#D4AF37] flex-shrink-0" />
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-[500] text-[#94A3B8] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] hover:translate-x-[2px] transition-all duration-[180ms] ease-in-out group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-[#64748B] group-hover:text-[#EF4444]" strokeWidth={1.8} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
