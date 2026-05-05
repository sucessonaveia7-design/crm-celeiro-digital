"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FolderPlus, Download, Upload, MoreVertical, Edit, Copy, FileCode, Trash, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockFlows, type Flow } from "@/lib/mock-data/flows";
import { ImportFlowModal, ImportRawFlowModal, AddFlowModal } from "./flow-modals";

export function FlowList() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>(mockFlows);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRawImportModalOpen, setIsRawImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleAddFlow = (name: string, shortcut?: string) => {
    const newFlow: Flow = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      platform: "WhatsApp",
      folder: "Raiz",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFlows([...flows, newFlow]);
    // Optionally redirect to editor
    // router.push(`/fluxos/${newFlow.id}/editar`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este fluxo?")) {
      setFlows(flows.filter(f => f.id !== id));
    }
    setOpenDropdownId(null);
  };

  const handleDuplicate = (flow: Flow) => {
    const newFlow = {
      ...flow,
      id: Math.random().toString(36).substr(2, 9),
      name: `${flow.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFlows([...flows, newFlow]);
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsRawImportModalOpen(true)}>
            <FileCode className="mr-2 h-4 w-4" />
            Raw Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
          <Button variant="secondary" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" />
            Nova pasta
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-muted-foreground">Pasta:</span> Raiz
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum fluxo encontrado. Crie um novo para começar.
                </TableCell>
              </TableRow>
            ) : (
              flows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">
                    <Link href={`/fluxos/${flow.id}/editar`} className="hover:underline flex items-center gap-2">
                       {flow.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      {flow.platform}
                    </span>
                  </TableCell>
                  <TableCell className="text-right relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenDropdownId(openDropdownId === flow.id ? null : flow.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    {openDropdownId === flow.id && (
                      <div className="absolute right-8 top-0 z-50 w-48 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                        <div className="p-1">
                          <Link href={`/fluxos/${flow.id}/editar`} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => handleDuplicate(flow)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                          </div>
                          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                            <FileCode className="mr-2 h-4 w-4" /> Copiar código
                          </div>
                          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                            <FileCode className="mr-2 h-4 w-4" /> Copiar RawFlow
                          </div>
                          <div 
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground text-destructive"
                            onClick={() => handleDelete(flow.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </div>
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ImportFlowModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={(code) => console.log("Importing code:", code)} 
      />
      <ImportRawFlowModal 
        isOpen={isRawImportModalOpen} 
        onClose={() => setIsRawImportModalOpen(false)} 
        onImport={(json) => console.log("Importing raw json:", json)} 
      />
      <AddFlowModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddFlow} 
      />
      
      {openDropdownId && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setOpenDropdownId(null)}
        />
      )}
    </div>
  );
}
