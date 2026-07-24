import type { FiltrosVenda } from '../../domain/models/Venda';
import type { IVendaRepository } from '../../domain/repositories/IVendaRepository';

export class ListarVendasService {
  constructor(
    private readonly repository: IVendaRepository
  ) {}

  executar(filtros: FiltrosVenda = {}) {
    return this.repository.listar({
      termo: filtros.termo?.trim() ?? '',
      ordenarPor: filtros.ordenarPor ?? 'created_at',
      direcao: filtros.direcao ?? 'DESC',
    });
  }
}
