import { listarProdutos } from "../../../estoque/infrastructure/database/estoqueDatabase";
import type { ProdutoCompra } from '../../domain/models/ProdutoCompra';
import type { IProdutoCompraRepository } from '../../domain/repositories/IProdutoCompraRepository';

export class SQLiteProdutoCompraRepository
  implements IProdutoCompraRepository
{
  listarAtivos(): Promise<ProdutoCompra[]> {
    return listarProdutos(
      'nome',
      'ASC'
    ) as Promise<ProdutoCompra[]>;
  }
}
