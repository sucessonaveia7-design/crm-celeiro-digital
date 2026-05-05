import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureGate from '@/components/FeatureGate';
import { useFlowStore } from '../store/flowStore';
import type { FlowRecord } from '../store/flowStore';
import {
  ALL_FLOW_TEMPLATES, TEMPLATE_CATEGORIES,
  type FlowTemplate,
} from '../lib/flowTemplates';
import {
  Workflow, Plus, Search, MoreVertical, Copy, Trash2, Edit2, Play,
  Pause, ArrowLeft, Save, MessageCircle, Clock, Zap, Target, X, CheckCircle2,
  Handshake, UserPlus, RefreshCw, Calendar, CheckSquare, LayoutTemplate
} from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Category → style mapping for template cards
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  base:       { icon: Workflow,      color: 'text-[#8B5CF6] dark:text-[#A78BFA]', bg: 'bg-[#F5F3FF] dark:bg-[#5B21B6]/30' },
  pastoral:   { icon: Handshake,     color: 'text-[#10B981] dark:text-[#34D399]', bg: 'bg-[#ECFDF5] dark:bg-[#065F46]/30' },
  seguimento: { icon: RefreshCw,     color: 'text-[#3B82F6] dark:text-[#60A5FA]', bg: 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/30' },
  evento:     { icon: Calendar,      color: 'text-[#F59E0B] dark:text-[#FBBF24]', bg: 'bg-[#FFFBEB] dark:bg-[#92400E]/30' },
};

// --- CUSTOM NODE COMPONENTS ---

const MessageNode = ({ data, selected }: any) => (
  <div className={`w-[250px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#3B82F6]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#3B82F6] border-2 border-white" />
    <div className="bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] dark:from-[#1E3A8A]/30 dark:to-[#1E3A8A]/10 p-3 border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center gap-2">
      <div className="w-8 h-8 rounded-[10px] bg-[#3B82F6] text-white flex items-center justify-center shadow-inner">
        <MessageCircle className="w-4 h-4" />
      </div>
      <span className="font-[700] text-[13px] text-[#1E3A8A] dark:text-[#60A5FA]">Mensagem</span>
    </div>
    <div className="p-4">
      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] line-clamp-3">{data.text || 'Digite sua mensagem...'}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#3B82F6] border-2 border-white" />
  </div>
);

const WaitNode = ({ data, selected }: any) => (
  <div className={`w-[200px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#F59E0B]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#F59E0B] border-2 border-white" />
    <div className="p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-[10px] bg-[#FEF3C7] dark:bg-[#78350F]/30 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-[700] text-[13px] text-[#0F172A] dark:text-white">Aguardar</span>
        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{data.time || '1 hora'}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#F59E0B] border-2 border-white" />
  </div>
);

const ConditionNode = ({ data, selected }: any) => (
  <div className={`w-[220px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#8B5CF6]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#8B5CF6] border-2 border-white" />
    <div className="p-3 flex items-center justify-center border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] gap-2">
      <Zap className="w-4 h-4 text-[#8B5CF6]" />
      <span className="font-[700] text-[13px] text-[#0F172A] dark:text-white">{data.condition || 'Se respondeu'}</span>
    </div>
    <div className="flex bg-[#F8FAFC] dark:bg-[#1E293B]">
      <div className="flex-1 p-2 text-center border-r border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] relative">
        <span className="text-[11px] font-[600] text-[#10B981]">SIM</span>
        <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-[#10B981] border-2 border-white left-1/2 -translate-x-1/2" />
      </div>
      <div className="flex-1 p-2 text-center relative">
        <span className="text-[11px] font-[600] text-[#EF4444]">NÃO</span>
        <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-[#EF4444] border-2 border-white left-1/2 -translate-x-1/2" />
      </div>
    </div>
  </div>
);

const ActionNode = ({ data, selected }: any) => (
  <div className={`w-[220px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#10B981]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#10B981] border-2 border-white" />
    <div className="p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-[10px] bg-[#D1FAE5] dark:bg-[#064E3B]/50 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
        <Target className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-[700] text-[13px] text-[#0F172A] dark:text-white">Ação</span>
        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{data.action || 'Adicionar Tag'}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#10B981] border-2 border-white" />
  </div>
);

const MenuNode = ({ data, selected }: any) => {
  const opts: string[] = data.options ?? ['Opção 1', 'Opção 2', 'Opção 3'];
  return (
    <div className={`w-[260px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#06B6D4]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#06B6D4] border-2 border-white" />
      <div className="bg-gradient-to-r from-[#ECFEFF] to-[#CFFAFE] dark:from-[#164E63]/30 dark:to-[#164E63]/10 p-3 border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center gap-2">
        <div className="w-8 h-8 rounded-[10px] bg-[#06B6D4] text-white flex items-center justify-center shadow-inner">
          <LayoutTemplate className="w-4 h-4" />
        </div>
        <span className="font-[700] text-[13px] text-[#164E63] dark:text-[#2DD4BF]">Menu</span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {opts.slice(0, 4).map((opt, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] text-[#475569] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] rounded-[6px] px-2 py-1">
            <span className="w-4 h-4 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center font-[700] text-[10px] shrink-0">{i + 1}</span>
            {opt}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#06B6D4] border-2 border-white" />
    </div>
  );
};

const CapturaNode = ({ data, selected }: any) => (
  <div className={`w-[220px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#EC4899]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#EC4899] border-2 border-white" />
    <div className="p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-[10px] bg-[#FCE7F3] dark:bg-[#831843]/30 text-[#DB2777] dark:text-[#F472B6] flex items-center justify-center">
        <UserPlus className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-[700] text-[13px] text-[#0F172A] dark:text-white">Captura</span>
        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{'{{' + (data.variable ?? 'nome') + '}}'}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#EC4899] border-2 border-white" />
  </div>
);

const FollowUpNode = ({ data, selected }: any) => (
  <div className={`w-[250px] bg-white dark:bg-[#0F172A] rounded-[16px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] border-2 ${selected ? 'border-[#F97316]' : 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]'} overflow-hidden transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#F97316] border-2 border-white" />
    <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] dark:from-[#7C2D12]/30 dark:to-[#7C2D12]/10 p-3 border-b border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center gap-2">
      <div className="w-8 h-8 rounded-[10px] bg-[#F97316] text-white flex items-center justify-center shadow-inner">
        <RefreshCw className="w-4 h-4" />
      </div>
      <div>
        <span className="font-[700] text-[13px] text-[#7C2D12] dark:text-[#FB923C]">Follow-up</span>
        <span className="block text-[11px] text-[#9A3412] dark:text-[#FCA5A5]">{data.delay ?? '1 dia'}</span>
      </div>
    </div>
    <div className="p-3">
      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2">{data.text || 'Mensagem de acompanhamento...'}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#F97316] border-2 border-white" />
  </div>
);

const nodeTypes = {
  mensagem:  MessageNode,
  espera:    WaitNode,
  condicao:  ConditionNode,
  acao:      ActionNode,
  menu:      MenuNode,
  captura:   CapturaNode,
  followup:  FollowUpNode,
};

// --- COMPONENTE PRINCIPAL ---
function FlowsPremiumContent() {
  const navigate = useNavigate();
  const {
    flows,
    createFlow,
    deleteFlow,
    duplicateFlow,
    createFromTemplate,
    setFlowStatus,
    updateFlowNodes,
  } = useFlowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [editingFlow, setEditingFlow] = useState<FlowRecord | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const filteredFlows = flows.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayToast = (message: string, type: 'success' | 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // --- CRUD ---
  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    const record = createFlow(newFlowName);
    setIsNewFlowModalOpen(false);
    setNewFlowName('');
    openEditor(record);
  };

  const handleDuplicate = (flow: FlowRecord) => {
    duplicateFlow(flow.id);
    displayToast('Fluxo duplicado com sucesso', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      deleteFlow(id);
      displayToast('Fluxo excluído', 'info');
    }
  };

  const toggleFlowStatus = (flow: FlowRecord) => {
    const newStatus = flow.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFlowStatus(flow.id, newStatus);
    displayToast(`Fluxo ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso`, 'success');
  };

  // --- EDITOR ---
  const openEditor = (flow: FlowRecord) => {
    setEditingFlow(flow);
    setNodes(
      flow.nodes.length > 0
        ? (flow.nodes as unknown as Node[])
        : [{ id: '1', type: 'mensagem', position: { x: 250, y: 50 }, data: { text: 'Olá! Como podemos ajudar?' } }]
    );
    setEdges(flow.edges as unknown as Edge[]);
    setSelectedNode(null);
  };

  const handleUseTemplate = (template: FlowTemplate) => {
    const record = createFromTemplate(template);
    setIsNewFlowModalOpen(false);
    openEditor(record);
  };

  const closeEditor = () => {
    setEditingFlow(null);
    setNodes([]);
    setEdges([]);
  };

  const handleSaveFlow = () => {
    if (!editingFlow) return;
    updateFlowNodes(editingFlow.id, nodes as any, edges as any);
    displayToast('Fluxo salvo com sucesso', 'success');
  };

  const handleEditorToggleStatus = () => {
    if (!editingFlow) return;
    const newStatus = editingFlow.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFlowStatus(editingFlow.id, newStatus);
    setEditingFlow({ ...editingFlow, status: newStatus });
    displayToast(`Fluxo ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso`, 'success');
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94A3B8', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowWrapper.current) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const newNode: Node = {
        id: `dndnode_${Date.now()}`,
        type,
        position,
        data: {
          text:      ['mensagem', 'followup'].includes(type) ? 'Nova mensagem' : undefined,
          time:      type === 'espera'   ? '1 dia'         : undefined,
          delay:     type === 'followup' ? '1 dia'         : undefined,
          condition: type === 'condicao' ? 'Se respondeu'  : undefined,
          action:    type === 'acao'     ? 'Adicionar tag' : undefined,
          options:   type === 'menu'     ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined,
          variable:  type === 'captura'  ? 'nome'          : undefined,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => setSelectedNode(node);
  const onPaneClick = () => setSelectedNode(null);

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: value } } : n)
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, [key]: value } });
  };

  // --- RENDER ---
  return (
    <div className="flex-1 w-full flex flex-col animate-[fadeIn_0.3s_ease-out] relative">

      {/* TOAST */}
      {showToast && (
        <div className="fixed top-6 right-1/2 translate-x-1/2 z-[200] animate-[fadeInDown_0.3s_ease-out]">
          <div className={`px-6 py-3 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-3 font-[600] text-[14px] ${
            showToast.type === 'success' ? 'bg-[#10B981] text-white' : 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
            {showToast.message}
          </div>
        </div>
      )}

      {/* --- LISTA DE FLUXOS --- */}
      {!editingFlow && (
        <>
          {/* Header */}
          <div className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] px-8 py-6 flex-shrink-0 z-10">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F0C840] transition-colors duration-150 text-[13px] font-medium mr-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#8B5CF6]/20 to-[#6D28D9]/10 flex items-center justify-center border border-[#8B5CF6]/20 shadow-inner">
                  <Workflow className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div>
                  <h1 className="text-[24px] font-[700] text-[#0F172A] dark:text-white leading-tight tracking-tight">Fluxos de Conversa</h1>
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">Crie automações e sequências inteligentes de mensagens.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group w-[280px]">
                  <Search className="w-[18px] h-[18px] text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#8B5CF6] transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar fluxo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(139,92,246,0.2)] focus:border-[#8B5CF6] outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => setIsNewFlowModalOpen(true)}
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-[600] text-[14px] shadow-[0_4px_14px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Fluxo
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-8 overflow-y-auto custom-scrollbar">
            {filteredFlows.length === 0 ? (
              <div className="w-full max-w-2xl mx-auto mt-20 bg-white dark:bg-[#020617] rounded-[24px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.04)] shadow-[0_10px_40px_rgba(15,23,42,0.06)] p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center justify-center mb-6">
                  <Workflow className="w-12 h-12 text-[#CBD5E1] dark:text-[#475569]" />
                </div>
                <h2 className="text-[22px] font-[700] text-[#0F172A] dark:text-white mb-3">Nenhum fluxo criado ainda.</h2>
                <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] max-w-md mb-8 leading-relaxed">
                  Comece a automatizar sua comunicação construindo sequências de mensagens interativas e baseadas em regras.
                </p>
                <button
                  onClick={() => setIsNewFlowModalOpen(true)}
                  className="px-8 py-3.5 rounded-[14px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-[600] text-[15px] shadow-[0_6px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar primeiro fluxo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFlows.map(flow => (
                  <div key={flow.id} className="bg-[#FFFFFF] dark:bg-[#020617] rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.04)] shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-300 group flex flex-col overflow-hidden">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shadow-inner ${flow.status === 'Ativo' ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#94A3B8] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]'}`}>
                          <Workflow className="w-5 h-5" />
                        </div>
                        <div className="relative group/menu">
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#0F172A] rounded-[12px] shadow-[0_10px_30px_rgba(15,23,42,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 py-1">
                            <button onClick={() => openEditor(flow)} className="w-full px-4 py-2 text-left text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Editar</button>
                            <button onClick={() => toggleFlowStatus(flow)} className="w-full px-4 py-2 text-left text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2">
                              {flow.status === 'Ativo' ? <><Pause className="w-3.5 h-3.5" /> Pausar</> : <><Play className="w-3.5 h-3.5" /> Ativar</>}
                            </button>
                            <button onClick={() => handleDuplicate(flow)} className="w-full px-4 py-2 text-left text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Duplicar</button>
                            <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] my-1"></div>
                            <button onClick={() => handleDelete(flow.id)} className="w-full px-4 py-2 text-left text-[13px] font-[600] text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[rgba(239,68,68,0.1)] flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#8B5CF6] transition-colors">{flow.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[700] uppercase tracking-wide ${flow.status === 'Ativo' ? 'bg-[#D1FAE5] text-[#059669] dark:bg-[rgba(16,185,129,0.15)] dark:text-[#34D399]' : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${flow.status === 'Ativo' ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}></span>
                          {flow.status}
                        </span>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[12px] font-[600] text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1.5"><Workflow className="w-3.5 h-3.5" /> {flow.stepsCount} etapas</span>
                      <span>Criado em {flow.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- EDITOR VISUAL --- */}
      {editingFlow && (
        <div className="absolute inset-0 z-20 flex flex-col bg-[#F8FAFC] dark:bg-[#020617] animate-[fadeIn_0.2s_ease-out]">
          {/* Editor Header */}
          <div className="h-[70px] bg-white dark:bg-[#0F172A] border-b border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] px-6 flex items-center justify-between shadow-sm z-30">
            <div className="flex items-center gap-4">
              <button onClick={closeEditor} className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors" title="Voltar">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-[1px] h-8 bg-[rgba(15,23,42,0.08)] dark:bg-[rgba(255,255,255,0.08)]"></div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-[700] text-[#0F172A] dark:text-white">{editingFlow.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-[700] uppercase tracking-wide ${editingFlow.status === 'Ativo' ? 'bg-[#D1FAE5] text-[#059669] dark:bg-[rgba(16,185,129,0.15)] dark:text-[#34D399]' : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]'}`}>
                    {editingFlow.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#94A3B8] font-medium">Editor Visual de Fluxo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEditorToggleStatus}
                className={`px-4 py-2 rounded-[10px] text-[13px] font-[600] transition-all flex items-center gap-2 border ${
                  editingFlow.status === 'Inativo'
                    ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[#F8FAFC] dark:hover:bg-[#334155]'
                    : 'bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-transparent hover:bg-[#FEE2E2]'
                }`}
              >
                {editingFlow.status === 'Inativo' ? <><Play className="w-4 h-4" /> Ativar Fluxo</> : <><Pause className="w-4 h-4" /> Pausar Fluxo</>}
              </button>
              <button onClick={handleSaveFlow} className="px-6 py-2 rounded-[10px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-[600] text-[13px] shadow-[0_4px_14px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Fluxo
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Blocks */}
            <div className="w-[280px] bg-white dark:bg-[#0F172A] border-r border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] p-6 flex flex-col gap-6 z-10 shadow-[4px_0_24px_rgba(15,23,42,0.02)] overflow-y-auto custom-scrollbar">
              <div>
                <h3 className="text-[13px] font-[700] text-[#94A3B8] uppercase tracking-wider mb-4">Adicionar Blocos</h3>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-4">Arraste os blocos para a área de edição.</p>
                <div className="flex flex-col gap-3">

                  {[
                    { type: 'mensagem',  label: 'Mensagem',    sub: 'Enviar texto ou mídia',        icon: MessageCircle, border: 'hover:border-[#3B82F6]', shadow: 'hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)]',   ibg: 'bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white' },
                    { type: 'espera',    label: 'Espera',       sub: 'Aguardar um tempo',            icon: Clock,         border: 'hover:border-[#F59E0B]', shadow: 'hover:shadow-[0_4px_12px_rgba(245,158,11,0.1)]',  ibg: 'bg-[#F59E0B]/10 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white' },
                    { type: 'condicao', label: 'Condição',      sub: 'Bifurcar fluxo (Sim/Não)',     icon: Zap,           border: 'hover:border-[#8B5CF6]', shadow: 'hover:shadow-[0_4px_12px_rgba(139,92,246,0.1)]',  ibg: 'bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white' },
                    { type: 'acao',     label: 'Ação Interna',  sub: 'Tag, Grupo, Kanban…',          icon: Target,        border: 'hover:border-[#10B981]', shadow: 'hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)]',  ibg: 'bg-[#10B981]/10 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white' },
                    { type: 'menu',     label: 'Menu',          sub: 'Múltiplas opções numeradas',   icon: LayoutTemplate,border: 'hover:border-[#06B6D4]', shadow: 'hover:shadow-[0_4px_12px_rgba(6,182,212,0.1)]',   ibg: 'bg-[#06B6D4]/10 text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white' },
                    { type: 'captura',  label: 'Captura',       sub: 'Coletar nome, telefone…',      icon: UserPlus,      border: 'hover:border-[#EC4899]', shadow: 'hover:shadow-[0_4px_12px_rgba(236,72,153,0.1)]',  ibg: 'bg-[#EC4899]/10 text-[#EC4899] group-hover:bg-[#EC4899] group-hover:text-white' },
                    { type: 'followup', label: 'Follow-up',     sub: 'Reagendar com delay',          icon: RefreshCw,     border: 'hover:border-[#F97316]', shadow: 'hover:shadow-[0_4px_12px_rgba(249,115,22,0.1)]',  ibg: 'bg-[#F97316]/10 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white' },
                  ].map(({ type, label, sub, icon: Icon, border, shadow, ibg }) => (
                    <div
                      key={type}
                      onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', type); e.dataTransfer.effectAllowed = 'move'; }}
                      draggable
                      className={`p-3 rounded-[12px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F8FAFC] dark:bg-[#1E293B] cursor-grab ${border} ${shadow} transition-all flex items-center gap-3 group`}
                    >
                      <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${ibg}`}><Icon className="w-4 h-4" /></div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-[700] text-[#0F172A] dark:text-white">{label}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{sub}</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative h-full" ref={reactFlowWrapper}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-[#F8FAFC] dark:bg-[#020617]"
                >
                  <Background color="#CBD5E1" gap={20} size={1} />
                  <Controls className="bg-white dark:bg-[#1E293B] border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] shadow-md overflow-hidden" />
                  <MiniMap
                    className="bg-white dark:bg-[#0F172A] border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] shadow-lg"
                    nodeColor={(node) => {
                      const colors: Record<string, string> = {
                        mensagem: '#3B82F6', espera: '#F59E0B', condicao: '#8B5CF6',
                        acao: '#10B981', menu: '#06B6D4', captura: '#EC4899', followup: '#F97316',
                      };
                      return colors[node.type ?? ''] ?? '#CBD5E1';
                    }}
                  />
                </ReactFlow>
              </ReactFlowProvider>
            </div>

            {/* Right Sidebar: Node Properties */}
            {selectedNode && (
              <div className="w-[320px] bg-white dark:bg-[#0F172A] border-l border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] p-6 flex flex-col gap-6 z-10 shadow-[-4px_0_24px_rgba(15,23,42,0.02)] animate-[fadeInRight_0.2s_ease-out] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[16px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-2">
                    {selectedNode.type === 'mensagem'  && <><MessageCircle className="w-5 h-5 text-[#3B82F6]" /> Mensagem</>}
                    {selectedNode.type === 'espera'    && <><Clock         className="w-5 h-5 text-[#F59E0B]" /> Espera</>}
                    {selectedNode.type === 'condicao'  && <><Zap           className="w-5 h-5 text-[#8B5CF6]" /> Condição</>}
                    {selectedNode.type === 'acao'      && <><Target        className="w-5 h-5 text-[#10B981]" /> Ação</>}
                    {selectedNode.type === 'menu'      && <><LayoutTemplate className="w-5 h-5 text-[#06B6D4]" /> Menu</>}
                    {selectedNode.type === 'captura'   && <><UserPlus      className="w-5 h-5 text-[#EC4899]" /> Captura</>}
                    {selectedNode.type === 'followup'  && <><RefreshCw     className="w-5 h-5 text-[#F97316]" /> Follow-up</>}
                  </h3>
                  <button onClick={() => setSelectedNode(null)} className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {selectedNode.type === 'mensagem' && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Texto da Mensagem</label>
                    <textarea rows={6} value={selectedNode.data.text as string} onChange={(e) => updateNodeData('text', e.target.value)} placeholder="Digite sua mensagem..." className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] focus:border-[#3B82F6] outline-none resize-none custom-scrollbar" />
                  </div>
                )}

                {selectedNode.type === 'espera' && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Tempo de Espera</label>
                    <select value={selectedNode.data.time as string} onChange={(e) => updateNodeData('time', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(245,158,11,0.2)] focus:border-[#F59E0B] outline-none">
                      <option value="1 minuto">1 minuto</option>
                      <option value="15 minutos">15 minutos</option>
                      <option value="1 hora">1 hora</option>
                      <option value="1 dia">1 dia</option>
                      <option value="3 dias">3 dias</option>
                      <option value="1 semana">1 semana</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'condicao' && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Regra da Condição</label>
                    <select value={selectedNode.data.condition as string} onChange={(e) => updateNodeData('condition', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(139,92,246,0.2)] focus:border-[#8B5CF6] outline-none">
                      <option value="Se respondeu">Se respondeu</option>
                      <option value="Se não respondeu">Se não respondeu</option>
                      <option value="Se clicou no link">Se clicou no link</option>
                      <option value="Se escolheu opção">Se escolheu opção</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'acao' && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Ação a Executar</label>
                    <select value={selectedNode.data.action as string} onChange={(e) => updateNodeData('action', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(16,185,129,0.2)] focus:border-[#10B981] outline-none">
                      <option value="Adicionar tag">Adicionar Tag</option>
                      <option value="Mover para grupo">Mover para Grupo</option>
                      <option value="Marcar como lido">Marcar como Lido</option>
                      <option value="Mover Kanban">Mover Kanban</option>
                      <option value="Atribuir atendente">Atribuir Atendente</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'menu' && (
                  <div className="space-y-3">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Opções do Menu</label>
                    {((selectedNode.data.options as string[]) ?? ['Opção 1', 'Opção 2', 'Opção 3']).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center font-[700] text-[11px] shrink-0">{i + 1}</span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const opts = [...((selectedNode.data.options as string[]) ?? [])];
                            opts[i] = e.target.value;
                            updateNodeData('options', opts);
                          }}
                          className="flex-1 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] px-3 py-2 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(6,182,212,0.2)] focus:border-[#06B6D4] outline-none"
                        />
                      </div>
                    ))}
                    {((selectedNode.data.options as string[]) ?? []).length < 6 && (
                      <button
                        onClick={() => updateNodeData('options', [...((selectedNode.data.options as string[]) ?? []), `Opção ${((selectedNode.data.options as string[]) ?? []).length + 1}`])}
                        className="w-full py-2 rounded-[10px] border border-dashed border-[#06B6D4]/40 text-[#06B6D4] text-[13px] font-[600] hover:bg-[#ECFEFF] dark:hover:bg-[#164E63]/20 transition-colors"
                      >
                        + Adicionar opção
                      </button>
                    )}
                  </div>
                )}

                {selectedNode.type === 'captura' && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Variável a Capturar</label>
                    <select value={selectedNode.data.variable as string} onChange={(e) => updateNodeData('variable', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(236,72,153,0.2)] focus:border-[#EC4899] outline-none">
                      <option value="nome">{'{{nome}}'} — Nome</option>
                      <option value="telefone">{'{{telefone}}'} — Telefone</option>
                      <option value="cidade">{'{{cidade}}'} — Cidade</option>
                      <option value="email">{'{{email}}'} — E-mail</option>
                      <option value="interesse">{'{{interesse}}'} — Interesse</option>
                      <option value="bairro">{'{{bairro}}'} — Bairro</option>
                      <option value="como_conheceu">{'{{como_conheceu}}'} — Como conheceu</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'followup' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Delay do Follow-up</label>
                      <select value={selectedNode.data.delay as string} onChange={(e) => updateNodeData('delay', e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[rgba(249,115,22,0.2)] focus:border-[#F97316] outline-none">
                        <option value="1 hora">1 hora</option>
                        <option value="1 dia">1 dia</option>
                        <option value="3 dias">3 dias</option>
                        <option value="1 semana">1 semana</option>
                        <option value="2 semanas">2 semanas</option>
                        <option value="1 mês">1 mês</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-[600] text-[#475569] dark:text-[#CBD5E1]">Mensagem</label>
                      <textarea rows={4} value={selectedNode.data.text as string} onChange={(e) => updateNodeData('text', e.target.value)} placeholder="Mensagem de acompanhamento..." className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[13px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:ring-2 focus:ring-[rgba(249,115,22,0.2)] focus:border-[#F97316] outline-none resize-none custom-scrollbar" />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                  <button
                    onClick={() => { setNodes(nds => nds.filter(n => n.id !== selectedNode.id)); setSelectedNode(null); }}
                    className="w-full px-4 py-2.5 rounded-[10px] text-[13px] font-[600] text-[#EF4444] bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.1)] hover:bg-[#FEE2E2] dark:hover:bg-[rgba(239,68,68,0.15)] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remover Bloco
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVO FLUXO */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 dark:bg-[#020617]/60 backdrop-blur-[4px] animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsNewFlowModalOpen(false)}></div>
          <div className="relative bg-[#FFFFFF] dark:bg-[#0F172A] w-full max-w-[860px] rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden animate-[modalOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] max-h-[90vh]">
            <div className="px-8 py-6 border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-[#FFFFFF] dark:from-[#1E293B] dark:to-[#0F172A]">
              <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-[#8B5CF6]/10 flex items-center justify-center">
                  <LayoutTemplate className="w-[20px] h-[20px] text-[#8B5CF6]" />
                </div>
                Criar Novo Fluxo
              </h3>
              <button onClick={() => setIsNewFlowModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Blank flow */}
              <div className="mb-8">
                <h4 className="text-[15px] font-[700] text-[#0F172A] dark:text-white mb-2">Começar do Zero</h4>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-4">Crie um fluxo em branco e adicione os blocos como desejar.</p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ex: Novo Fluxo Personalizado"
                    value={newFlowName}
                    onChange={e => setNewFlowName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateFlow()}
                    className="w-full sm:flex-1 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[14px] px-[16px] py-[12px] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] focus:border-[#8B5CF6] outline-none transition-all duration-200"
                  />
                  <button onClick={handleCreateFlow} disabled={!newFlowName.trim()} className="w-full sm:w-auto px-[24px] py-[12px] rounded-[14px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-[600] text-[14px] shadow-[0_6px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Criar em Branco
                  </button>
                </div>
              </div>

              {/* Templates from library */}
              <div>
                <h4 className="text-[15px] font-[700] text-[#0F172A] dark:text-white mb-1">Modelos Prontos</h4>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-4">Fluxos pré-configurados para contextos pastorais e de atendimento.</p>

                {Object.entries(TEMPLATE_CATEGORIES).map(([catKey, catMeta]) => {
                  const catTemplates = ALL_FLOW_TEMPLATES.filter(t => t.category === catKey);
                  if (catTemplates.length === 0) return null;
                  const meta = CATEGORY_META[catKey] ?? CATEGORY_META.base;
                  return (
                    <div key={catKey} className="mb-6">
                      <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider mb-3">{catMeta.label}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {catTemplates.map(template => {
                          const Icon = meta.icon;
                          return (
                            <div key={template.id} className="p-5 rounded-[16px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/50 hover:bg-white dark:hover:bg-[#0F172A] hover:border-[#8B5CF6] hover:shadow-[0_8px_24px_rgba(139,92,246,0.08)] transition-all group flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-[15px] font-[700] text-[#0F172A] dark:text-white">{template.name}</h5>
                                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">{template.description}</p>
                                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    {template.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-[600] bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUseTemplate(template)}
                                className="mt-auto w-full py-[10px] rounded-[10px] bg-white dark:bg-[#0F172A] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#475569] dark:text-[#CBD5E1] font-[600] text-[13px] group-hover:bg-[#8B5CF6] group-hover:border-[#8B5CF6] group-hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <Workflow className="w-4 h-4" /> Usar modelo
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlowsPremium() {
  return (
    <FeatureGate feature="fluxos">
      <FlowsPremiumContent />
    </FeatureGate>
  );
}
