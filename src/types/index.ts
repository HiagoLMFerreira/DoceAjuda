export interface Produto {
  id: number;
  descricao: string;
  quantidade: number;
}

export interface Cliente {
  id: number;
  nome: string;
  total_compras: number;
}

export type RootStackParamList = {
  Login: undefined;
  Menu: undefined;
  Estoque: undefined;
  Receitas: undefined;
  Orcamentos: undefined;
  Vendas: undefined;
  Clientes: undefined;
};