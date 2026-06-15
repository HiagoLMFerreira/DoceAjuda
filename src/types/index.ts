export interface Produto {
  id: number;
  descricao: string;
  quantidade: number;
  ativo: number;
  preco: number;
  preco_medio: number;
}

export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  total_compras: number;
};

export type RootStackParamList = {
  Login: undefined;
  Menu: undefined;
  Estoque: undefined;
  Receitas: undefined;
  Orcamentos: undefined;
  Vendas: undefined;
  Clientes: undefined;
  ProdutosVenda: undefined;
  Compras: undefined;
};