"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfiguracoesTransmissaoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configurações de Envio</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Intervalos e Pausas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Intervalo randômico (segundos)</Label>
            <Input type="number" defaultValue={20} />
            <p className="text-xs text-muted-foreground">Tempo médio entre mensagens.</p>
          </div>
          
          <div className="space-y-2">
            <Label>Pausa maior após (mensagens)</Label>
            <Input type="number" defaultValue={20} />
            <p className="text-xs text-muted-foreground">Quantidade de mensagens antes da pausa.</p>
          </div>
          
          <div className="space-y-2">
            <Label>Intervalo maior (minutos)</Label>
            <Input type="number" defaultValue={1} />
            <p className="text-xs text-muted-foreground">Tempo de duração da pausa maior.</p>
          </div>

          <Button onClick={() => alert("Configurações salvas!")}>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
