"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, Users, Layers, LogIn, Wheat, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/fluxos", label: "Fluxos de Conversa", icon: MessageSquare },
  { href: "/transmissao", label: "Transmissão", icon: Send },
  { href: "/audiencia", label: "Audiência", icon: Users },
  { href: "/grupos", label: "Gerente de Grupo", icon: Layers },
  { href: "/conexoes", label: "Conexões", icon: Smartphone },
  { href: "/login", label: "Login / CRM", icon: LogIn },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex",
      sidebarCollapsed ? "w-[76px]" : "w-[248px]",
      "border-r border-border bg-card transition-all duration-300 ease-in-out"
    )}>
      {/* Botão flutuante na borda direita */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-card border border-border rounded-full hover:bg-accent/50 transition-all duration-300 ease-in-out z-20"
        title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3 text-[#D4AF37]" strokeWidth={1.5} />
        ) : (
          <ChevronLeft className="h-3 w-3 text-[#D4AF37]" strokeWidth={1.5} />
        )}
      </button>

      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <Wheat className="h-5 w-5 text-[#8AA3C6] flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-dancing text-lg text-[#8AA3C6] leading-none">Celeiro</span>
              <span className="font-dancing text-lg text-[#8AA3C6] font-bold leading-none ml-4 -mt-0.5">Digital</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                "transition-[opacity,transform,background-color,color,box-shadow] duration-150",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "opacity-100 translate-x-0 bg-primary text-primary-foreground shadow-sm"
                  : "opacity-95 -translate-x-0.5 text-muted-foreground",
                !isActive && "hover:opacity-100 hover:translate-x-0 hover:bg-[rgba(255,215,0,0.1)] hover:text-accent-foreground",
                isActive && "hover:shadow-md"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0">
            <span className="font-bold text-xs">UD</span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Usuário Demo</p>
              <p className="text-xs text-muted-foreground truncate">admin@celeiro.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
