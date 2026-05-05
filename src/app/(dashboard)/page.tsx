import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🙏</span>
        <h1 className="text-xl font-semibold">Bem-vindo ao Celeiro Digital</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fluxos Totais</CardTitle>
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-0.5">+2 novos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transmissões Ativas</CardTitle>
            <Send className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-0.5">Enviando agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Audiência Total</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-0.5">+180 novos contatos</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-dashed border-border p-5 text-center">
        <h3 className="text-sm font-semibold">Comece criando seu primeiro fluxo</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Automatize suas conversas no WhatsApp de forma simples.
        </p>
      </div>
    </div>
  );
}
