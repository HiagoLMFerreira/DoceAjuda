export const UNIDADES_MEDIDA_ESTOQUE = [
  'un',
  'kg',
  'g',
  'l',
  'ml',
  'caixa',
  'pacote',
  'duzia',
] as const;

export type UnidadeMedidaEstoque =
  (typeof UNIDADES_MEDIDA_ESTOQUE)[number];

export type ProdutoEstoque = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_ultima_entrada: number;
  preco_medio: number;
  quantidade: number;
  quantidade_embalagem: number;
  unidade_medida: string;
  ativo?: number;
  preco?: number;
};

export type CriarProdutoEstoqueDTO = {
  nome: string;
  codigo_barras?: string;
  unidade_medida: UnidadeMedidaEstoque;
};

export type AtualizarProdutoEstoqueDTO =
  CriarProdutoEstoqueDTO & {
    id: number;
  };

export type OrdenarProdutoEstoquePor =
  | 'id'
  | 'nome'
  | 'codigo_barras'
  | 'preco_ultima_entrada'
  | 'preco_medio'
  | 'quantidade'
  | 'unidade_medida';

export type DirecaoOrdenacao = 'ASC' | 'DESC';

export type FiltrosProdutoEstoque = {
  termo?: string;
  ordenarPor?: OrdenarProdutoEstoquePor;
  direcao?: DirecaoOrdenacao;
};

export type ModoFormularioProduto = 'cadastro' | 'edicao';
export type CampoScannerEstoque = 'busca' | 'formulario';

export type FormularioProdutoEstoque = {
  nome: string;
  codigoBarras: string;
  unidadeMedida: UnidadeMedidaEstoque;
};
