import {
  buscarDocumentoComercialPorId,
  cancelarVenda,
  listarVendas,
} from '../../../../database/database';
import type {
  FiltrosVenda,
  Venda,
  VendaDetalhada,
} from '../../domain/models/Venda';
import type { IVendaRepository } from '../../domain/repositories/IVendaRepository';

export class LegacyVendaRepository
  implements IVendaRepository
{
  listar(filtros: FiltrosVenda = {}): Promise<Venda[]> {
    return listarVendas(
      filtros.termo ?? '',
      filtros.ordenarPor ?? 'created_at',
      filtros.direcao ?? 'DESC'
    ) as Promise<Venda[]>;
  }

  buscarPorId(id: number): Promise<VendaDetalhada | null> {
    return buscarDocumentoComercialPorId(
      id
    ) as Promise<VendaDetalhada | null>;
  }

  cancelar(id: number): Promise<void> {
    return cancelarVenda(id);
  }
}
