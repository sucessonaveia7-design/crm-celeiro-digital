import { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Contatos"
      description="Faça upload de um arquivo XLS ou XLSX para importar contatos."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onImport}>Importar</Button>
        </>
      }
    >
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            Arraste e solte seu arquivo aqui ou{" "}
            <span className="text-primary cursor-pointer hover:underline">selecione um arquivo</span>
          </p>
          <p className="text-xs text-muted-foreground">Formatos suportados: XLS, XLSX</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
        <FileSpreadsheet className="h-4 w-4" />
        <span>Baixe o modelo de importação <a href="#" className="text-primary hover:underline">aqui</a>.</span>
      </div>
    </Modal>
  );
}
