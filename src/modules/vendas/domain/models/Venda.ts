export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';
export type DirecaoOrdenacao = 'ASC' | 'DESC';

export type OrdenarVendaPor =
  | 'id'
  | 'cliente_nome'
  | 'valor_total'
  | 'status'
  | 'created_at';

export type Venda = {
  id: number;
  tipo: 'VENDA';
  cliente_id: number;
  cliente_nome: string;
  status: StatusVenda;
  valor_total: number;
  observacoes: string;
  forma_pagamento: string;
  data_validade: string;
  data_encomenda: string;
  finalidade: string;
  sinal_pagamento: number;
  orcamento_origem_id: number | null;
  estoque_baixado: number;
  estoque_estornado: number;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VendaItem = {
  id: number;
  documento_id: number;
  produto_venda_id: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
};

export type VendaDetalhada = Venda & {
  saldo_receber?: number;
  cliente_telefone?: string;
  cliente_endereco?: string;
  itens: VendaItem[];
};

export type VendaEstoqueItem = {
  id: number;
  venda_id: number;
  produto_id: number;
  produto_nome: string;
  unidade_medida: string;
  quantidade: number;
  preco_medio: number;
  created_at: string;
  estornado_at: string | null;
};

export type FiltrosVenda = {
  termo?: string;
  ordenarPor?: OrdenarVendaPor;
  direcao?: DirecaoOrdenacao;
};
