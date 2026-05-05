"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, Users, Layers, LogIn, Wheat, Smartphone } from "lucide-react";
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

  return (
    <aside className="w-64 border-r border-border bg-card h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex">
      <div className="h-14 flex items-center px-4 border-b border-border gap-2">
        <Wheat className="h-5 w-5 text-[#8AA3C6]" />
        <div className="flex flex-col">
           <span className="font-dancing text-lg text-[#8AA3C6] leading-none">Celeiro</span>
           <span className="font-dancing text-lg text-[#8AA3C6] font-bold leading-none ml-4 -mt-0.5">Digital</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                <span className="font-bold text-xs">UD</span>
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Usuário Demo</p>
                <p className="text-xs text-muted-foreground truncate">admin@celeiro.com</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
