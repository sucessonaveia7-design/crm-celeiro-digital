import { ChevronDown, ChevronRight } from 'lucide-react';

type NavItem = { 
  path: string; 
  icon: React.ElementType; 
  label: string; 
  subitems?: { path: string; icon: React.ElementType; label: string }[] 
};

type SidebarItemProps = {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  chatMenuOpen: boolean;
  setChatMenuOpen: (open: boolean) => void;
};

export const SidebarItem = ({ 
  item: { path, icon: Icon, label, subitems }, 
  isCollapsed, 
  isActive, 
  chatMenuOpen, 
  setChatMenuOpen 
}: SidebarItemProps) => {
  const isChatMenuItem = !!subitems; // true if this item has submenu (Bate-papo)

  const itemClasses = `w-flex flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] text-[13px] font-[500] transition-all duration-[180ms] ease-in-out group
  ${isActive
    ? 'bg-[rgba(212,175,55,0.12)] text-[#D4AF37]'
    : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#E2E8F0] hover:translate-x-[2px]'
  }`;

  const iconClasses = `w-4 h-4 flex-shrink-0 transition-colors duration-[180ms]
  ${isActive ? 'text-[#D4AF37]' : 'text-[#64748B] group-hover:text-[#94A3B8]'}`;

  const handleClick = () => {
    if (isChatMenuItem) {
      setChatMenuOpen(!chatMenuOpen);
    } else {
      // Navigate to the path (handled by parent via onClick prop? We'll adjust)
      // For now, we assume the parent handles navigation for non-submenu items.
      // We'll change the approach: the parent will pass an onClick for navigation.
      // But let's keep it simple: we'll assume the parent handles navigation for non-submenu items.
      // We'll change the SidebarItem to receive an onClick prop for navigation.
      // However, to minimize changes, we'll let the parent handle navigation by passing an onClick.
      // We'll adjust the parent to pass an onClick that navigates.
      // For now, we'll leave it as is and adjust the parent later.
    }
  };

  return (
    <>
      {/* Main item button */}
      <button 
        onClick={handleClick}
        className={itemClasses}
      >
        <Icon 
          className={`${iconClasses} ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} 
        />
        {!isCollapsed && <span>{label}</span>}
        {isActive && !isCollapsed && (
          <span className="ml-auto w-1 h-4 rounded-full bg-[#D4AF37] flex-shrink-0" />
        )}
        {/* Chevron for submenu (only if has subitems) */}
        {isChatMenuItem && !isCollapsed && (
          <span className="ml-auto text-[94A3B8] group-hover:text-[#E2E8F0] transition-colors duration-[180ms]">
            {chatMenuOpen ? (
              <ChevronUp className="w-3 h-3" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
            )}
          </span>
        )}
      </button>

      {/* Submenu (only if has subitems and not collapsed and chatMenuOpen) */}
      {!isCollapsed && chatMenuOpen && subitems && (
        <div className="mt-[2px] ml-[4px]">
          {subitems.map((subitem) => (
            <button 
              key={subitem.path}
              onClick={() => {
                // Navigate to subitem path (handled by parent? We'll adjust)
                // For now, we'll assume the parent handles navigation.
                // We'll change the parent to handle navigation for subitems as well.
              }}
              className="w-full flex items-center gap-[8px] px-[8px] py-[7px] rounded-[8px] text-[12px] font-[400] transition-all duration-[150ms] ease-in-out group
              hover:bg-white/[0.03] hover:text-[#E2E8F0] hover:translate-x-[1px]"
            >
              <subitem.icon 
                className="w-3 h-3 flex-shrink-0 text-[#64748B] group-hover:text-[#94A3B8]" 
                strokeWidth={1.6} 
              />
              <span>{subitem.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};