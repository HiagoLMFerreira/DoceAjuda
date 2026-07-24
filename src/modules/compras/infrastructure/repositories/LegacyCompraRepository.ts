import {
  buscarCompraPorId,
  cadastrarCompra,
  cancelarCompra,
  excluirCompra,
  listarCompras,
} from '../../../../database/database';
import type {
  Compra,
  CompraDetalhada,
  FiltrosCompra,
  NovaCompra,
} from '../../domain/models/Compra';
import type { ICompraRepository } from '../../domain/repositories/ICompraRepository';

export class LegacyCompraRepository
  implements ICompraRepository
{
  listar(filtros: FiltrosCompra = {}): Promise<Compra[]> {
    return listarCompras(
      filtros.termo ?? '',
      filtros.ordenarPor ?? 'data_compra',
      filtros.direcao ?? 'DESC'
    );
  }

  buscarPorId(id: number): Promise<CompraDetalhada | null> {
    return buscarCompraPorId(id);
  }

  cadastrar(input: NovaCompra): Promise<number> {
    return cadastrarCompra(input);
  }

  cancelar(id: number): Promise<void> {
    return cancelarCompra(id);
  }

  excluir(id: number): Promise<void> {
    return excluirCompra(id);
  }
}
