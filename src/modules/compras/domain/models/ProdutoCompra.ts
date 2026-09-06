export type ProdutoCompra = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_ultima_entrada: number;
  preco_medio: number;
  quantidade: number;
  quantidade_minima: number;
  quantidade_embalagem: number;
  unidade_medida: string;
  ativo?: number;
};
