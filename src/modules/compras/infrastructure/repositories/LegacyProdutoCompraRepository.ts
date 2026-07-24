import { listarProdutos } from '../../../../database/database';
import type { ProdutoCompra } from '../../domain/models/ProdutoCompra';
import type { IProdutoCompraRepository } from '../../domain/repositories/IProdutoCompraRepository';

export class LegacyProdutoCompraRepository
  implements IProdutoCompraRepository
{
  listarAtivos(): Promise<ProdutoCompra[]> {
    return listarProdutos(
      'nome',
      'ASC'
    ) as Promise<ProdutoCompra[]>;
  }
}
