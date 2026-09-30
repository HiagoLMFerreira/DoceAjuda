export type StatusCompra = 'CONFIRMADA' | 'CANCELADA';
export type DirecaoOrdenacao = 'ASC' | 'DESC';
export type OrdenarCompraPor =
  | 'id'
  | 'data_compra'
  | 'valor_total'
  | 'status';

export type UnidadeConteudoCompra =
  | 'un'
  | 'duzia'
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'caixa'
  | 'pacote';

export type Compra = {
  id: number;
  data_compra: string;
  status: StatusCompra;
  valor_total: number;
  observacoes: string;
  created_at: string;
  canceled_at: string | null;
};

export type CompraItem = {
  id: number;
  compra_id: number;
  produto_id: number;
  produto_nome: string;
  unidade_medida: string;
  quantidade: number;
  quantidade_embalagens: number;
  quantidade_por_embalagem: number;
  unidade_conteudo: string;
  valor_unitario: number;
  valor_unitario_estoque: number;
  subtotal: number;
};

export type CompraDetalhada = Compra & {
  itens: CompraItem[];
};

export type NovoItemCompra = {
  produto_id: number;
  quantidade_embalagens: number;
  quantidade_por_embalagem: number;
  unidade_conteudo: string;
  valor_unitario: number;
};

export type NovaCompra = {
  data_compra?: string;
  observacoes?: string;
  itens: NovoItemCompra[];
};

export type FiltrosCompra = {
  termo?: string;
  ordenarPor?: OrdenarCompraPor;
  direcao?: DirecaoOrdenacao;
};
