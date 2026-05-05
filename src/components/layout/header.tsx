"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const titles: Record<string, string> = {
  "/fluxos": "Fluxos de Conversa",
  "/transmissao": "Transmissão",
  "/audiencia": "Audiência",
  "/grupos": "Gerente de Grupo",
  "/dashboard": "Dashboard",
};

export function Header() {
  const pathname = usePathname();
  
  // Find the title that matches the start of the pathname
  // Sort keys by length desc to match most specific first
  const matchedKey = Object.keys(titles)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
    
  const title = matchedKey ? titles[matchedKey] : "Dashboard";

  return (
    <header className="h-12 border-b border-border bg-card flex items-center px-5 sticky top-0 z-10 transition-all">
      <button className="md:hidden mr-3 text-muted-foreground">
        <Menu className="w-5 h-5" />
      </button>
      <h2 className="text-sm font-semibold text-foreground tracking-wide">{title}</h2>
    </header>
  );
}
