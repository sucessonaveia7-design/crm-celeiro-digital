import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stage } from './kanbanStore'
import {
  ALL_FLOW_TEMPLATES,
  TEMPLATE_BASE_IGREJA,
  countSteps,
  type FlowTemplate,
  type FlowTemplateNode,
  type FlowTemplateEdge,
  type FlowVariable,
} from '../lib/flowTemplates'

// ─── Extended flow record (persisted) ────────────────────────────
export interface FlowRecord {
  id:           string
  name:         string
  description:  string
  status:       'Ativo' | 'Inativo'
  stepsCount:   number
  createdAt:    string
  updatedAt:    string
  templateId?:  string             // which template it was created from
  nodes:        FlowTemplateNode[]
  edges:        FlowTemplateEdge[]
  variables:    Partial<Record<FlowVariable, string>>
  kanbanStage?: Stage
  tags:         string[]
  category:     FlowTemplate['category']
}

// ─── Store interface ──────────────────────────────────────────────
interface FlowState {
  flows:       FlowRecord[]
  templates:   FlowTemplate[]

  // CRUD
  createFlow:            (name: string, templateId?: string) => FlowRecord
  updateFlow:            (id: string, updates: Partial<FlowRecord>) => void
  deleteFlow:            (id: string) => void
  duplicateFlow:         (id: string, newName?: string) => FlowRecord
  createFromTemplate:    (template: FlowTemplate, name?: string) => FlowRecord
  setFlowStatus:         (id: string, status: 'Ativo' | 'Inativo') => void
  updateFlowNodes:       (id: string, nodes: FlowTemplateNode[], edges: FlowTemplateEdge[]) => void
}

// ─── Helpers ─────────────────────────────────────────────────────
const nowStr = () => new Date().toLocaleDateString('pt-BR')

function buildFlowRecord(
  template: FlowTemplate,
  name: string,
  overrides: Partial<FlowRecord> = {}
): FlowRecord {
  return {
    id:          `flow-${Date.now()}`,
    name,
    description: template.description,
    status:      'Inativo',
    stepsCount:  countSteps(template),
    createdAt:   nowStr(),
    updatedAt:   nowStr(),
    templateId:  template.id,
    nodes:       template.nodes,
    edges:       template.edges,
    variables:   {},
    kanbanStage: template.kanbanStage,
    tags:        template.tags,
    category:    template.category,
    ...overrides,
  }
}

// ─── Seed flows (shown on first visit) ───────────────────────────
const SEED_FLOWS: FlowRecord[] = [
  buildFlowRecord(TEMPLATE_BASE_IGREJA, 'Fluxo Base Igreja', { id: 'seed-base', status: 'Ativo', createdAt: '10/04/2026', updatedAt: '10/04/2026' }),
]

// ─── Store ───────────────────────────────────────────────────────
export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      flows:     [],
      templates: ALL_FLOW_TEMPLATES,

      createFlow: (name, templateId) => {
        const tpl = templateId
          ? ALL_FLOW_TEMPLATES.find(t => t.id === templateId) ?? TEMPLATE_BASE_IGREJA
          : TEMPLATE_BASE_IGREJA
        const record = buildFlowRecord(tpl, name)
        set(s => ({ flows: [record, ...s.flows] }))
        return record
      },

      updateFlow: (id, updates) => set(s => ({
        flows: s.flows.map(f =>
          f.id === id ? { ...f, ...updates, updatedAt: nowStr() } : f
        ),
      })),

      deleteFlow: (id) => set(s => ({
        flows: s.flows.filter(f => f.id !== id),
      })),

      duplicateFlow: (id, newName) => {
        const src = get().flows.find(f => f.id === id)
        if (!src) throw new Error(`Flow ${id} not found`)
        const copy: FlowRecord = {
          ...src,
          id:        `flow-${Date.now()}`,
          name:      newName ?? `${src.name} (cópia)`,
          status:    'Inativo',
          createdAt: nowStr(),
          updatedAt: nowStr(),
        }
        set(s => ({ flows: [copy, ...s.flows] }))
        return copy
      },

      createFromTemplate: (template, name) => {
        const record = buildFlowRecord(template, name ?? template.name)
        set(s => ({ flows: [record, ...s.flows] }))
        return record
      },

      setFlowStatus: (id, status) => set(s => ({
        flows: s.flows.map(f =>
          f.id === id ? { ...f, status, updatedAt: nowStr() } : f
        ),
      })),

      updateFlowNodes: (id, nodes, edges) => set(s => ({
        flows: s.flows.map(f =>
          f.id === id
            ? { ...f, nodes, edges, stepsCount: nodes.length, updatedAt: nowStr() }
            : f
        ),
      })),
    }),

    {
      name: 'celeiro-flows-v1',
      partialize: (s) => ({ flows: s.flows }),
      // Seed on first load (empty localStorage)
      onRehydrateStorage: () => (state) => {
        if (state && state.flows.length === 0) {
          state.flows = SEED_FLOWS
        }
      },
    }
  )
)
