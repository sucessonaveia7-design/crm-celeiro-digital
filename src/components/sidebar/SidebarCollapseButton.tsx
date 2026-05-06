import { ChevronLeft, ChevronRight } from 'lucide-react';

type SidebarCollapseButtonProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export const SidebarCollapseButton = ({ isCollapsed, onToggle }: SidebarCollapseButtonProps) => {
  return (
    <button
      onClick={onToggle}
      className="absolute right-[-6px] top-[50%] -translate-y-[50%] w-[10px] h-[10px] flex items-center justify-center p-[2px] bg-[#0B111F] border border-[rgba(255,255,255,0.08)] rounded-full hover:bg-[#172033] transition-all duration-[200ms] z-[10]"
    >
      {isCollapsed ? (
        <ChevronRight className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
      ) : (
        <ChevronLeft className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
      )}
    </button>
  );
};