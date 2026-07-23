export type ProdutoParaReceita = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_medio: number;
  quantidade: number;
  quantidade_embalagem: number;
  unidade_medida: string;
  ativo?: number;
};
