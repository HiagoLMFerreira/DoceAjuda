export type { RootStackParamList } from '../app/navigation/types';
export * from './relatorios';

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
