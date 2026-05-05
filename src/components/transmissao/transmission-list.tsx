"use client";

import Link from "next/link";
import { Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TransmissionList() {
  // Mock empty state
  const transmissions = []; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transmissão</h1>
        <div className="flex gap-2">
          <Link href="/transmissao/configuracoes">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Configurações
            </Button>
          </Link>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" /> Listas de Contatos
          </Button>
          <Link href="/transmissao/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Transmissão
            </Button>
          </Link>
        </div>
      </div>

      {transmissions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-dashed">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma transmissão encontrada</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Crie sua primeira transmissão para enviar mensagens em massa para seus contatos.
          </p>
          <Link href="/transmissao/nova">
            <Button>Criar Transmissão</Button>
          </Link>
        </Card>
      ) : (
        <div>Listagem de transmissões aqui...</div>
      )}
    </div>
  );
}
