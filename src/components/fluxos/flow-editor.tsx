"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, MessageSquare, Menu, Shuffle, Tag, MessageCircle, 
  Users, Save, Repeat, GitBranch, ArrowRight, Clock, 
  Bell, Settings, Share2, Globe, Plus, X, GripHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BlockType = 
  | 'start' | 'content' | 'menu' | 'randomizer' | 'tag' | 'chat_control' 
  | 'departments' | 'save' | 'remarketing' | 'condition' | 'flow_connection' 
  | 'smart_delay' | 'notification' | 'handler' | 'distributor' | 'global_variable';

interface Block {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  data?: any;
}

const blockTypes: { type: BlockType; label: string; icon: any; color: string }[] = [
  { type: 'start', label: 'Início', icon: Play, color: 'bg-green-600' },
  { type: 'content', label: 'Conteúdo', icon: MessageSquare, color: 'bg-blue-600' },
  { type: 'menu', label: 'Menu', icon: Menu, color: 'bg-purple-600' },
  { type: 'randomizer', label: 'Randomizador', icon: Shuffle, color: 'bg-orange-600' },
  { type: 'tag', label: 'Etiqueta', icon: Tag, color: 'bg-yellow-600' },
  { type: 'chat_control', label: 'Controlador', icon: MessageCircle, color: 'bg-pink-600' },
  { type: 'departments', label: 'Departamentos', icon: Users, color: 'bg-indigo-600' },
  { type: 'save', label: 'Salvar', icon: Save, color: 'bg-teal-600' },
  { type: 'remarketing', label: 'Remarketing', icon: Repeat, color: 'bg-cyan-600' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: 'bg-red-600' },
  { type: 'flow_connection', label: 'Conexão', icon: ArrowRight, color: 'bg-emerald-600' },
  { type: 'smart_delay', label: 'Atraso', icon: Clock, color: 'bg-amber-600' },
  { type: 'notification', label: 'Notificação', icon: Bell, color: 'bg-rose-600' },
  { type: 'handler', label: 'Manipulador', icon: Settings, color: 'bg-slate-600' },
  { type: 'distributor', label: 'Distribuidor', icon: Share2, color: 'bg-violet-600' },
  { type: 'global_variable', label: 'Variável', icon: Globe, color: 'bg-lime-600' },
];

export function FlowEditor({ initialBlocks = [] }: { initialBlocks?: Block[] }) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0 ? initialBlocks : [
      { id: 'start', type: 'start', x: 50, y: 50, data: { text: "Este bloco marca o início do seu fluxo" } },
      { id: 'content-1', type: 'content', x: 300, y: 50, data: { token: "TOKEN_MOCK_123" } },
      { id: 'menu-1', type: 'menu', x: 300, y: 200, data: { question: "TUDO CERTO", sent: 0, clicked: "0%" } }
    ]
  );
  
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const block = blocks.find(b => b.id === id);
    if (!block || !canvasRef.current) return;

    const rect = (e.target as HTMLElement).closest('.flow-block')?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setDraggingBlock(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlock || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, x, y } : b));
  };

  const handleMouseUp = () => {
    setDraggingBlock(null);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      data: {}
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (id === 'start') return; // Prevent removing start block
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Blocos Disponíveis</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {blockTypes.map((bt) => (
            <div
              key={bt.type}
              className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors"
              onClick={() => addBlock(bt.type)}
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", bt.color)}>
                <bt.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{bt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative bg-slate-50 dark:bg-slate-950/50 overflow-hidden"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {blocks.map((block) => {
          const typeInfo = blockTypes.find(t => t.type === block.type) || blockTypes[0];
          
          return (
            <div
              key={block.id}
              className="flow-block absolute w-64 rounded-lg border bg-card shadow-md cursor-move group"
              style={{ left: block.x, top: block.y }}
              onMouseDown={(e) => handleDragStart(e, block.id)}
            >
              <div className={cn("h-2 rounded-t-lg", typeInfo.color)} />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <typeInfo.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{typeInfo.label}</span>
                  </div>
                  {block.type !== 'start' && (
                    <button 
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {block.type === 'start' && <p>Este bloco marca o início do seu fluxo</p>}
                  {block.type === 'content' && <p>Token: {block.data?.token || 'TOKEN_...'}</p>}
                  {block.type === 'menu' && (
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium text-foreground mb-1">{block.data?.question || 'Pergunta?'}</p>
                      <div className="flex justify-between text-[10px]">
                        <span>Enviado: {block.data?.sent || 0}</span>
                        <span>Clicada: {block.data?.clicked || '0%'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connection points simulation */}
              <div className="absolute -right-1 top-1/2 w-2 h-2 rounded-full bg-primary" />
              {block.type !== 'start' && (
                <div className="absolute -left-1 top-1/2 w-2 h-2 rounded-full bg-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
