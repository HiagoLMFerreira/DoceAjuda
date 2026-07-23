export type ProdutoVenda = {
  id: number;
  nome: string;
  descricao: string;
  tempo_producao_minutos: number;
  custo_receitas: number;
  custo_itens: number;
  custo_mao_obra: number;
  custo_operacional: number;
  custo_total: number;
  margem_lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  ativo: number;
  created_at: string;
  updated_at: string;
};

export type ProdutoVendaReceitaInput = {
  receita_id: number;
  quantidade_unidades: number;
};

export type ProdutoVendaItemInput = {
  produto_estoque_id: number;
  quantidade_usada: number;
  unidade_medida: string;
};

export type SalvarProdutoVendaDTO = {
  nome: string;
  descricao?: string;
  tempo_producao_minutos: number;
  custo_receitas: number;
  custo_itens: number;
  custo_mao_obra: number;
  custo_operacional: number;
  custo_total: number;
  margem_lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  receitas: ProdutoVendaReceitaInput[];
  itens: ProdutoVendaItemInput[];
};

export type ProdutoVendaDetalhado = ProdutoVenda & {
  receitas: Array<{
    id: number;
    produto_venda_id: number;
    receita_id: number;
    receita_nome: string;
    receita_rendimento: string;
    quantidade_unidades: number;
  }>;
  itens: Array<{
    id: number;
    produto_venda_id: number;
    produto_estoque_id: number;
    produto_nome: string;
    quantidade_usada: number;
    unidade_medida: string;
    preco_medio: number;
    quantidade_embalagem: number;
    unidade_medida_produto: string;
  }>;
};
