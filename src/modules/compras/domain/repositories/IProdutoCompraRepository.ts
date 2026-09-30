import type { ProdutoCompra } from '../models/ProdutoCompra';

export interface IProdutoCompraRepository {
  listarAtivos(): Promise<ProdutoCompra[]>;
}
