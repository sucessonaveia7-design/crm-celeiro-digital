"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TransmissionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/transmissao");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Transmissão</h1>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Transmissão</Label>
              <Input id="name" placeholder="Ex: Promoção de Natal" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flow">Selecionar Fluxo</Label>
                <select 
                  id="flow" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="1">Denilson Dias</option>
                  <option value="2">Onboarding</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Selecionar WhatsApp</Label>
                <select 
                  id="whatsapp"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="1">Principal (+55 11 99999-9999)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data e Hora de Envio</Label>
                <Input id="date" type="datetime-local" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Transmissão</Label>
                <select 
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="text">Texto</option>
                  <option value="media">Mídia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list">Lista de Contatos</Label>
              <select 
                id="list"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                multiple
              >
                <option value="all">Todos os contatos</option>
                <option value="customers">Clientes</option>
                <option value="leads">Leads</option>
              </select>
              <p className="text-xs text-muted-foreground">Segure Ctrl para selecionar múltiplos.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Agendando..." : "Agendar Transmissão"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
