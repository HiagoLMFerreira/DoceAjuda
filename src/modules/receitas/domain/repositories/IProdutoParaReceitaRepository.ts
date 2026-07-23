import type { ProdutoParaReceita } from '../models/ProdutoParaReceita';

export interface IProdutoParaReceitaRepository {
  listarAtivos(): Promise<ProdutoParaReceita[]>;
}
