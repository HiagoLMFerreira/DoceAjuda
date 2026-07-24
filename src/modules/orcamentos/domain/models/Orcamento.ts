export type StatusOrcamento =
  | 'PENDENTE'
  | 'CONVERTIDO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type DirecaoOrdenacao = 'ASC' | 'DESC';

export type CampoOrdenacaoOrcamento =
  | 'cliente_nome'
  | 'created_at'
  | 'valor_total'
  | 'status';

export type Orcamento = {
  id: number;
  tipo: 'ORCAMENTO' | 'VENDA';
  cliente_id: number;
  cliente_nome: string;
  status: StatusOrcamento;
  valor_total: number;
  observacoes: string;
  forma_pagamento: string;
  data_validade: string;
  orcamento_origem_id: number | null;
  estoque_baixado: number;
  estoque_estornado: number;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrcamentoItem = {
  id: number;
  documento_id: number;
  produto_venda_id: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
};

export type OrcamentoDetalhado = Orcamento & {
  cliente_telefone?: string;
  cliente_endereco?: string;
  itens: OrcamentoItem[];
};

export type NecessidadeOrcamento = {
  produto_id: number;
  produto_nome: string;
  quantidade_necessaria: number;
  quantidade_estoque: number;
  quantidade_faltante: number;
  unidade_medida: string;
  estoque_suficiente: boolean;
};

export type OrdenacaoOrcamento = {
  campo: CampoOrdenacaoOrcamento;
  direcao: DirecaoOrdenacao;
};
