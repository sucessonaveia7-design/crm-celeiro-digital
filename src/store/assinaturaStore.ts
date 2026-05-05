import { create } from 'zustand';

export interface Plano {
  id: string;
  nome: string;
  valor: number;
  duracaoDias: number;
  limiteContatos: number;
  limiteTransmissoes: number;
  limiteUsuarios: number;
  status: 'Ativo' | 'Inativo';
}

export interface Assinatura {
  id: string;
  usuarioNome: string;
  planoId: string;
  dataInicio: string;
  dataVencimento: string;
  status: 'Ativa' | 'Expirada' | 'Pendente';
}

export interface Pagamento {
  id: string;
  usuarioNome: string;
  planoId: string;
  valor: number;
  data: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
}

interface AssinaturaState {
  planos: Plano[];
  assinaturas: Assinatura[];
  pagamentos: Pagamento[];
  setPlanos: (planos: Plano[]) => void;
  setAssinaturas: (assinaturas: Assinatura[]) => void;
  setPagamentos: (pagamentos: Pagamento[]) => void;
  addPlano: (plano: Plano) => void;
  addAssinatura: (assinatura: Assinatura) => void;
  addPagamento: (pagamento: Pagamento) => void;
}

export const useAssinaturaStore = create<AssinaturaState>((set) => ({
  planos: [
    {
      id: '1',
      nome: 'Plano Básico',
      valor: 49.90,
      duracaoDias: 30,
      limiteContatos: 500,
      limiteTransmissoes: 1000,
      limiteUsuarios: 1,
      status: 'Ativo'
    },
    {
      id: '2',
      nome: 'Plano Pro',
      valor: 99.90,
      duracaoDias: 30,
      limiteContatos: 2000,
      limiteTransmissoes: 5000,
      limiteUsuarios: 3,
      status: 'Ativo'
    }
  ],
  assinaturas: [
    {
      id: '1',
      usuarioNome: 'Admin',
      planoId: '1',
      dataInicio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Ativa'
    },
    {
      id: '2',
      usuarioNome: 'João Silva',
      planoId: '1',
      dataInicio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataVencimento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Ativa'
    },
    {
      id: '3',
      usuarioNome: 'Maria Oliveira',
      planoId: '2',
      dataInicio: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataVencimento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Expirada'
    }
  ],
  pagamentos: [
    {
      id: '1',
      usuarioNome: 'João Silva',
      planoId: '1',
      valor: 49.90,
      data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pago'
    }
  ],
  setPlanos: (planos) => set({ planos }),
  setAssinaturas: (assinaturas) => set({ assinaturas }),
  setPagamentos: (pagamentos) => set({ pagamentos }),
  addPlano: (plano) => set((state) => ({ planos: [...state.planos, plano] })),
  addAssinatura: (assinatura) => set((state) => ({ assinaturas: [...state.assinaturas, assinatura] })),
  addPagamento: (pagamento) => set((state) => ({ pagamentos: [...state.pagamentos, pagamento] }))
}));
