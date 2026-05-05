// ─── Universal Flow Template System ─────────────────────────────
// Central model for all conversation flows in Celeiro Digital CRM

import type { Stage } from '../store/kanbanStore'

// ─── Variable system ─────────────────────────────────────────────
export const FLOW_VARIABLES = [
  { key: '{{nome}}',           label: 'Nome do contato',       example: 'João Silva'        },
  { key: '{{telefone}}',       label: 'Telefone',              example: '+55 11 99999-0000' },
  { key: '{{cidade}}',         label: 'Cidade',                example: 'São Paulo'          },
  { key: '{{pedido}}',         label: 'Pedido / solicitação',  example: 'oração pela família'},
  { key: '{{data_agendada}}',  label: 'Data do agendamento',   example: '15/05/2026 às 10h' },
  { key: '{{responsavel}}',    label: 'Responsável atribuído', example: 'Pr. Maiclei'        },
  { key: '{{canal}}',          label: 'Canal de entrada',      example: 'WhatsApp'           },
  { key: '{{tipo_fluxo}}',     label: 'Tipo do fluxo',         example: 'Novo Visitante'     },
  { key: '{{etapa_kanban}}',   label: 'Etapa atual no Kanban', example: 'Em Atendimento'     },
] as const

export type FlowVariable = typeof FLOW_VARIABLES[number]['key']

// ─── Kanban stage mapping ────────────────────────────────────────
// Maps flow intent → Kanban pastoral stage
export const KANBAN_STAGE_MAP: Record<string, Stage> = {
  novo_visitante:         'Novo Visitante',
  pedido_oracao:          'Pedido de Oração',
  agendamento_pastoral:   'Agendamento Pastoral',
  agendamento_visita:     'Agendamento de Visitas',
  discipulado:            'Discipulado',
  batismo:                'Batismo',
  em_atendimento:         'Em Atendimento',
  acompanhamento:         'Em Acompanhamento',
  membro_ativo:           'Membro Ativo',
  veio_a_igreja:          'Veio à Igreja',
}

// ─── Node data types ─────────────────────────────────────────────
export interface MensagemData  { text: string }
export interface EsperaData    { time: string; unit: 'minutos' | 'horas' | 'dias' }
export interface CondicaoData  { condition: string }
export interface AcaoData      {
  action: 'tag' | 'kanban' | 'atribuir' | 'registrar_data'
  tag?:         string
  kanbanStage?: Stage
  responsavel?: string
}
export interface MenuData {
  question: string
  options: Array<{ id: string; label: string; nextNodeId?: string; kanbanStage?: Stage }>
}
export interface CapturaData {
  question:     string
  variableKey:  FlowVariable
  variableLabel: string
}
export interface FollowUpData {
  delayTime: string
  delayUnit: 'minutos' | 'horas' | 'dias'
  message:   string
}

// ─── Generic template node (extends ReactFlow node shape) ────────
export interface FlowTemplateNode {
  id:       string
  type:     'mensagem' | 'espera' | 'condicao' | 'acao' | 'menu' | 'captura' | 'followup'
  position: { x: number; y: number }
  data:     MensagemData | EsperaData | CondicaoData | AcaoData | MenuData | CapturaData | FollowUpData
}

export interface FlowTemplateEdge {
  id:        string
  source:    string
  target:    string
  sourceHandle?: string
  animated?: boolean
  style?:    Record<string, string | number>
}

// ─── Template structure ──────────────────────────────────────────
export interface FlowTemplate {
  id:          string
  name:        string
  description: string
  category:    'base' | 'pastoral' | 'seguimento' | 'evento'
  tags:        string[]
  kanbanStage?: Stage
  nodes:       FlowTemplateNode[]
  edges:       FlowTemplateEdge[]
}

// ─── Edge factory ────────────────────────────────────────────────
const edge = (
  id: string, source: string, target: string,
  sourceHandle?: string
): FlowTemplateEdge => ({
  id, source, target,
  ...(sourceHandle ? { sourceHandle } : {}),
  animated: true,
  style: { stroke: '#94A3B8', strokeWidth: 2 },
})

// ─── Templates ───────────────────────────────────────────────────

// 1. BASE — Fluxo Base Igreja (full capture + menu + followup)
export const TEMPLATE_BASE_IGREJA: FlowTemplate = {
  id:          'base-igreja',
  name:        'Fluxo Base Igreja',
  description: 'Modelo central com captura de dados, menu e follow-up. Duplique para criar fluxos específicos.',
  category:    'base',
  tags:        ['base', 'universal', 'captura', 'menu'],
  nodes: [
    // 1. Welcome
    {
      id: 'b1', type: 'mensagem', position: { x: 300, y: 50 },
      data: { text: '🙌 Seja bem-vindo(a)!\n\nEstamos felizes em falar com você.\n\nVamos começar?' } as MensagemData,
    },
    // 2. Capture name
    {
      id: 'b2', type: 'captura', position: { x: 300, y: 230 },
      data: { question: 'Qual é o seu nome?', variableKey: '{{nome}}', variableLabel: 'Nome' } as CapturaData,
    },
    // 3. Capture phone
    {
      id: 'b3', type: 'captura', position: { x: 300, y: 410 },
      data: { question: 'Confirme seu telefone:', variableKey: '{{telefone}}', variableLabel: 'Telefone' } as CapturaData,
    },
    // 4. Capture city
    {
      id: 'b4', type: 'captura', position: { x: 300, y: 590 },
      data: { question: 'Qual cidade você mora?', variableKey: '{{cidade}}', variableLabel: 'Cidade' } as CapturaData,
    },
    // 5. Main menu
    {
      id: 'b5', type: 'menu', position: { x: 225, y: 770 },
      data: {
        question: 'Como podemos te ajudar?',
        options: [
          { id: 'o1', label: '1 — Novo Visitante',       kanbanStage: 'Novo Visitante'          },
          { id: 'o2', label: '2 — Pedido de Oração',     kanbanStage: 'Pedido de Oração'        },
          { id: 'o3', label: '3 — Agendar Visita',       kanbanStage: 'Agendamento de Visitas'  },
          { id: 'o4', label: '4 — Falar com alguém',     kanbanStage: 'Em Atendimento'          },
          { id: 'o5', label: '5 — Horários da Igreja' },
        ],
      } as MenuData,
    },
    // 6. Action block (tag + kanban)
    {
      id: 'b6', type: 'acao', position: { x: 300, y: 1010 },
      data: { action: 'kanban', kanbanStage: 'Novo Visitante' } as AcaoData,
    },
    // 7. Finalization message
    {
      id: 'b7', type: 'mensagem', position: { x: 300, y: 1190 },
      data: { text: 'Perfeito {{nome}} 🙌\n\nRecebemos sua solicitação.\n\nEm breve alguém da nossa equipe falará com você.' } as MensagemData,
    },
    // 8. Follow-up smart delay
    {
      id: 'b8', type: 'followup', position: { x: 300, y: 1370 },
      data: { delayTime: '30', delayUnit: 'minutos', message: 'Estamos aguardando sua resposta 😊' } as FollowUpData,
    },
  ],
  edges: [
    edge('b1-b2', 'b1', 'b2'),
    edge('b2-b3', 'b2', 'b3'),
    edge('b3-b4', 'b3', 'b4'),
    edge('b4-b5', 'b4', 'b5'),
    edge('b5-b6', 'b5', 'b6'),
    edge('b6-b7', 'b6', 'b7'),
    edge('b7-b8', 'b7', 'b8'),
  ],
}

// 2. Novo Visitante
export const TEMPLATE_NOVO_VISITANTE: FlowTemplate = {
  id:          'novo-visitante',
  name:        'Novo Visitante',
  description: 'Recepciona e classifica novos visitantes no Kanban.',
  category:    'pastoral',
  tags:        ['visitante', 'recepção'],
  kanbanStage: 'Novo Visitante',
  nodes: [
    { id: 'nv1', type: 'mensagem', position: { x: 300, y: 50 },  data: { text: '🙌 Olá {{nome}}! Que bom te conhecer!\n\nEm breve nossa equipe entrará em contato.' } as MensagemData },
    { id: 'nv2', type: 'acao',     position: { x: 300, y: 230 }, data: { action: 'kanban', kanbanStage: 'Novo Visitante', tag: 'novo-visitante' } as AcaoData },
    { id: 'nv3', type: 'acao',     position: { x: 300, y: 380 }, data: { action: 'tag', tag: 'Primeiro Contato' } as AcaoData },
    { id: 'nv4', type: 'followup', position: { x: 300, y: 530 }, data: { delayTime: '30', delayUnit: 'minutos', message: 'Olá {{nome}} 😊 Estamos aqui para te ajudar!' } as FollowUpData },
  ],
  edges: [ edge('nv1-nv2', 'nv1', 'nv2'), edge('nv2-nv3', 'nv2', 'nv3'), edge('nv3-nv4', 'nv3', 'nv4') ],
}

// 3. Pedido de Oração
export const TEMPLATE_PEDIDO_ORACAO: FlowTemplate = {
  id:          'pedido-oracao',
  name:        'Pedido de Oração',
  description: 'Registra pedidos de oração e move para coluna correta no Kanban.',
  category:    'pastoral',
  tags:        ['oração', 'intercessão'],
  kanbanStage: 'Pedido de Oração',
  nodes: [
    { id: 'po1', type: 'captura',  position: { x: 300, y: 50  }, data: { question: 'Qual é o seu pedido de oração?', variableKey: '{{pedido}}', variableLabel: 'Pedido' } as CapturaData },
    { id: 'po2', type: 'mensagem', position: { x: 300, y: 230 }, data: { text: '🙏 Recebemos seu pedido, {{nome}}!\n\nVamos orar por você e pela sua família.' } as MensagemData },
    { id: 'po3', type: 'acao',     position: { x: 300, y: 410 }, data: { action: 'kanban', kanbanStage: 'Pedido de Oração', tag: 'oracao' } as AcaoData },
  ],
  edges: [ edge('po1-po2', 'po1', 'po2'), edge('po2-po3', 'po2', 'po3') ],
}

// 4. Agendamento Pastoral
export const TEMPLATE_AGENDAMENTO_PASTORAL: FlowTemplate = {
  id:          'agendamento-pastoral',
  name:        'Agendamento Pastoral',
  description: 'Coleta data/horário e agenda atendimento pastoral.',
  category:    'pastoral',
  tags:        ['agendamento', 'pastor'],
  kanbanStage: 'Agendamento Pastoral',
  nodes: [
    { id: 'ap1', type: 'captura',  position: { x: 300, y: 50  }, data: { question: 'Qual data e horário prefere para o atendimento?', variableKey: '{{data_agendada}}', variableLabel: 'Data agendada' } as CapturaData },
    { id: 'ap2', type: 'mensagem', position: { x: 300, y: 230 }, data: { text: '📅 Perfeito {{nome}}!\n\nSeu atendimento está agendado para {{data_agendada}}.\n\n{{responsavel}} confirmará em breve.' } as MensagemData },
    { id: 'ap3', type: 'acao',     position: { x: 300, y: 410 }, data: { action: 'kanban', kanbanStage: 'Agendamento Pastoral', tag: 'agendado' } as AcaoData },
  ],
  edges: [ edge('ap1-ap2', 'ap1', 'ap2'), edge('ap2-ap3', 'ap2', 'ap3') ],
}

// 5. Discipulado
export const TEMPLATE_DISCIPULADO: FlowTemplate = {
  id:          'discipulado',
  name:        'Discipulado',
  description: 'Inscreve e acompanha membros no programa de discipulado.',
  category:    'pastoral',
  tags:        ['discipulado', 'estudo', 'bíblia'],
  kanbanStage: 'Discipulado',
  nodes: [
    { id: 'd1', type: 'mensagem', position: { x: 300, y: 50  }, data: { text: '📖 Que alegria, {{nome}}!\n\nVocê deu um passo importante para crescer na fé.\n\nNosso programa de discipulado começa na quarta-feira.' } as MensagemData },
    { id: 'd2', type: 'acao',    position: { x: 300, y: 230 }, data: { action: 'kanban', kanbanStage: 'Discipulado', tag: 'discipulado' } as AcaoData },
    { id: 'd3', type: 'espera',  position: { x: 300, y: 380 }, data: { time: '1', unit: 'dias' } as EsperaData },
    { id: 'd4', type: 'mensagem',position: { x: 300, y: 530 }, data: { text: '📅 Lembrete: amanhã temos estudo bíblico! Te esperamos.' } as MensagemData },
  ],
  edges: [ edge('d1-d2', 'd1', 'd2'), edge('d2-d3', 'd2', 'd3'), edge('d3-d4', 'd3', 'd4') ],
}

// 6. Batismo
export const TEMPLATE_BATISMO: FlowTemplate = {
  id:          'batismo',
  name:        'Batismo',
  description: 'Orienta candidatos ao batismo e agenda cerimônia.',
  category:    'pastoral',
  tags:        ['batismo', 'celebração'],
  kanbanStage: 'Batismo',
  nodes: [
    { id: 'bt1', type: 'mensagem', position: { x: 300, y: 50  }, data: { text: '🕊️ Que decisão maravilhosa, {{nome}}!\n\nO batismo é um passo de fé muito importante.\n\nNosso pastor entrará em contato para orientá-lo(a).' } as MensagemData },
    { id: 'bt2', type: 'acao',    position: { x: 300, y: 230 }, data: { action: 'kanban', kanbanStage: 'Batismo', tag: 'candidato-batismo' } as AcaoData },
    { id: 'bt3', type: 'acao',    position: { x: 300, y: 380 }, data: { action: 'atribuir', responsavel: '{{responsavel}}' } as AcaoData },
  ],
  edges: [ edge('bt1-bt2', 'bt1', 'bt2'), edge('bt2-bt3', 'bt2', 'bt3') ],
}

// 7. Follow-up de Acompanhamento
export const TEMPLATE_FOLLOWUP: FlowTemplate = {
  id:          'followup-acompanhamento',
  name:        'Follow-up de Acompanhamento',
  description: 'Sequência automática para manter contato e mover no Kanban.',
  category:    'seguimento',
  tags:        ['follow-up', 'acompanhamento', 'automático'],
  nodes: [
    { id: 'fu1', type: 'followup', position: { x: 300, y: 50  }, data: { delayTime: '30', delayUnit: 'minutos', message: '{{nome}}, ainda estamos aqui 😊 Pode nos perguntar qualquer coisa.' } as FollowUpData },
    { id: 'fu2', type: 'condicao', position: { x: 300, y: 250 }, data: { condition: 'Se respondeu?' } as CondicaoData },
    { id: 'fu3', type: 'acao',     position: { x: 120, y: 430 }, data: { action: 'kanban', kanbanStage: 'Em Atendimento' } as AcaoData },
    { id: 'fu4', type: 'espera',   position: { x: 480, y: 430 }, data: { time: '1', unit: 'dias' } as EsperaData },
    { id: 'fu5', type: 'mensagem', position: { x: 480, y: 580 }, data: { text: '💛 {{nome}}, quando quiser, estamos aqui para te ouvir.' } as MensagemData },
  ],
  edges: [
    edge('fu1-fu2', 'fu1', 'fu2'),
    edge('fu2-fu3', 'fu2', 'fu3', 'yes'),
    edge('fu2-fu4', 'fu2', 'fu4', 'no'),
    edge('fu4-fu5', 'fu4', 'fu5'),
  ],
}

// ─── All templates registry ───────────────────────────────────────
export const ALL_FLOW_TEMPLATES: FlowTemplate[] = [
  TEMPLATE_BASE_IGREJA,
  TEMPLATE_NOVO_VISITANTE,
  TEMPLATE_PEDIDO_ORACAO,
  TEMPLATE_AGENDAMENTO_PASTORAL,
  TEMPLATE_DISCIPULADO,
  TEMPLATE_BATISMO,
  TEMPLATE_FOLLOWUP,
]

// ─── Template categories ─────────────────────────────────────────
export const TEMPLATE_CATEGORIES = {
  base:       { label: 'Base Universal',     color: '#D4AF37' },
  pastoral:   { label: 'Pastoral',           color: '#8B5CF6' },
  seguimento: { label: 'Follow-up',          color: '#10B981' },
  evento:     { label: 'Eventos',            color: '#3B82F6' },
} as const

// ─── Helper: count template steps ────────────────────────────────
export function countSteps(template: FlowTemplate): number {
  return template.nodes.length
}

// ─── Helper: interpolate variables ───────────────────────────────
export function interpolateVars(
  text: string,
  values: Partial<Record<FlowVariable, string>>
): string {
  return Object.entries(values).reduce(
    (acc, [key, val]) => acc.split(key).join(val ?? key),
    text
  )
}
