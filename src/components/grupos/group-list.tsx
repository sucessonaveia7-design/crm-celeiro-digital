"use client";

import { useState } from "react";
import { Plus, Settings, Users, CreditCard, Webhook, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockGroups } from "@/lib/mock-data/groups";
import { cn } from "@/lib/utils";

type Tab = 'groups' | 'flows' | 'manage' | 'subscription' | 'webhooks';

export function GroupList() {
  const [activeTab, setActiveTab] = useState<Tab>('groups');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold">Gerente de Grupo</h1>
        {activeTab === 'groups' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Grupo
          </Button>
        )}
        {activeTab === 'subscription' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Assinante
          </Button>
        )}
        {activeTab === 'webhooks' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Criar Webhook
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b bg-background overflow-x-auto">
        {[
          { id: 'groups', label: 'Grupos', icon: Users },
          { id: 'flows', label: 'Fluxos', icon: MessageSquare },
          { id: 'manage', label: 'Gerenciar', icon: Settings },
          { id: 'subscription', label: 'Assinatura', icon: CreditCard },
          { id: 'webhooks', label: 'WebHooks', icon: Webhook },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'groups' && (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum grupo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.size} membros</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          group.status === 'active' 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        )}>
                          {group.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>{group.whatsapp}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Gerenciar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'flows' && (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed min-h-[300px]">
            <div className="bg-muted rounded-full p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum fluxo vinculado</h3>
            <p className="text-muted-foreground">Vincule fluxos aos seus grupos para automação.</p>
          </Card>
        )}

        {activeTab === 'manage' && (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed min-h-[300px]">
             <div className="bg-muted rounded-full p-4 mb-4">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gerenciamento de Grupos</h3>
            <p className="text-muted-foreground">Selecione um grupo para configurar regras e permissões.</p>
          </Card>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="flex flex-col items-center justify-center p-8 border-dashed min-h-[200px]">
              <p className="text-muted-foreground">Nenhuma assinatura ativa no momento.</p>
            </Card>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed min-h-[300px]">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Webhook className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum Webhook configurado</h3>
            <p className="text-muted-foreground mb-4">Crie webhooks para integrar com outros sistemas.</p>
            <Button variant="outline">Criar Webhook</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
