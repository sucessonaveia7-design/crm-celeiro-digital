import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImportFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (code: string) => void;
}

export function ImportFlowModal({ isOpen, onClose, onImport }: ImportFlowModalProps) {
  const [code, setCode] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Fluxo"
      description="Cole o código do fluxo abaixo para importar."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onImport(code); onClose(); }}>Importar</Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="code">Código do fluxo</Label>
        <Input 
          id="code" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          placeholder="Cole o código aqui..." 
        />
      </div>
    </Modal>
  );
}

interface ImportRawFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => void;
}

export function ImportRawFlowModal({ isOpen, onClose, onImport }: ImportRawFlowModalProps) {
  const [json, setJson] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import RawFlow"
      description="Cole o JSON do RawFlow abaixo."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onImport(json); onClose(); }}>Importar</Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="json">JSON</Label>
        <textarea 
          id="json" 
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={json} 
          onChange={(e) => setJson(e.target.value)} 
          placeholder="{ ... }" 
        />
      </div>
    </Modal>
  );
}

interface AddFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, shortcut?: string) => void;
}

export function AddFlowModal({ isOpen, onClose, onAdd }: AddFlowModalProps) {
  const [name, setName] = useState("");
  const [shortcut, setShortcut] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Fluxo"
      description="Crie um novo fluxo de conversa."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onAdd(name, shortcut); onClose(); }}>Adicionar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do fluxo</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Atendimento Inicial" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shortcut">Atalhos (opcional)</Label>
          <div className="flex gap-2">
            <Input 
              id="shortcut" 
              value={shortcut} 
              onChange={(e) => setShortcut(e.target.value)} 
              placeholder="Ex: enviar" 
            />
            <Button variant="secondary" onClick={() => {}}>Adicionar atalho</Button>
          </div>
        </div>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Este fluxo será criado na pasta <strong>Raiz</strong>.
        </div>
      </div>
    </Modal>
  );
}
