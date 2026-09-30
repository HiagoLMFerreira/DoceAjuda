import {
  NotFoundError,
  ValidationError,
} from '../../../../core/errors';
import type { IVendaRepository } from '../../domain/repositories/IVendaRepository';

export class BuscarVendaService {
  constructor(
    private readonly repository: IVendaRepository
  ) {}

  async executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Venda inválida.');
    }

    const venda = await this.repository.buscarPorId(id);

    if (!venda || venda.tipo !== 'VENDA') {
      throw new NotFoundError('Venda não encontrada.');
    }

    return venda;
  }
}
