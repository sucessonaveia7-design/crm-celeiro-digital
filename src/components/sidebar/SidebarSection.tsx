import { clsx } from 'clsx';
import { SidebarItem } from './SidebarItem';

type SidebarSectionProps = {
  label?: string;
  items: {
    path: string;
    icon: React.ElementType;
    label: string;
    subitems?: {
      path: string;
      icon: React.ElementType;
      label: string;
    }[];
  }[];
  isCollapsed: boolean;
  chatMenuOpen: boolean;
  setChatMenuOpen: (open: boolean) => void;
  navigate: (path: string) => void;
};

export const SidebarSection = ({ 
  label, 
  items, 
  isCollapsed, 
  chatMenuOpen, 
  setChatMenuOpen, 
  navigate 
}: SidebarSectionProps) => {
  return (
    <>
      {label && (
        <p className="px-[12px] mb-[4px] text-[10px] font-[600] text-[#475569] uppercase tracking-[0.8px]">
          {label}
        </p>
      )}
      {items.map((item, index) => (
        <div key={`${label}-${index}`}>
          {/* We'll use SidebarItem for each item */}
          <SidebarItem
            item={item}
            isCollapsed={isCollapsed}
            isActive={false} // We'll set active state in parent based on path
            chatMenuOpen={chatMenuOpen}
            setChatMenuOpen={setChatMenuOpen}
            navigate={navigate}
          />
          {/* Submenu will be rendered inside SidebarItem for the chat item */}
        </div>
      ))}
    </>
  );
};