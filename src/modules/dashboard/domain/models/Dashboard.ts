export type DashboardResumo = {
  vendasHoje: number;
  quantidadeVendasHoje: number;
  ticketMedioHoje: number;
  clientesCadastrados: number;
  orcamentosPendentes: number;
  produtosEstoqueBaixo: number;
};

export type DashboardVendaDia = {
  data: string;
  rotulo: string;
  total: number;
};

export type DashboardVendaRecente = {
  id: number;
  clienteNome: string;
  valorTotal: number;
  formaPagamento: string;
  status: string;
  createdAt: string;
};

export type DashboardProdutoMaisVendido = {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valorTotal: number;
};

export type DashboardEstoqueCritico = {
  id: number;
  nome: string;
  quantidade: number;
  unidadeMedida: string;
};

export type DashboardData = {
  resumo: DashboardResumo;
  vendasSemana: DashboardVendaDia[];
  vendasRecentes: DashboardVendaRecente[];
  produtosMaisVendidos: DashboardProdutoMaisVendido[];
  estoqueCritico: DashboardEstoqueCritico[];
};
