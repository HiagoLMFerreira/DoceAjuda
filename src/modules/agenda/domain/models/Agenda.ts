export type AgendaEncomenda = {
  id: number;
  tipo: 'ORCAMENTO' | 'VENDA';
  clienteId: number;
  clienteNome: string;
  dataEncomenda: string;
  finalidade: string;
  status: string;
  valorTotal: number;
  sinalPagamento: number;
};

export type AgendaItemEncomenda = {
  id: number;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
};

export type AgendaEncomendaDetalhada = AgendaEncomenda & {
  clienteTelefone: string;
  clienteEndereco: string;
  observacoes: string;
  formaPagamento: string;
  valorPago: number;
  valorReceber: number;
  itens: AgendaItemEncomenda[];
};

export type AgendaNecessidade = {
  produtoId: number;
  produtoNome: string;
  quantidadeNecessaria: number;
  quantidadeEstoque: number;
  quantidadeFaltante: number;
  unidadeMedida: string;
  estoqueSuficiente: boolean;
};

export type AgendaFiltros = {
  dataInicio?: string;
  dataFim?: string;
};
