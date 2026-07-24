import {
  NotFoundError,
  ValidationError,
} from '../../../../core/errors';
import type { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class BuscarOrcamentoService {
  constructor(
    private readonly repository: IOrcamentoRepository
  ) {}

  async executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Orçamento inválido.');
    }

    const orcamento = await this.repository.buscarPorId(id);

    if (!orcamento || orcamento.tipo !== 'ORCAMENTO') {
      throw new NotFoundError('Orçamento não encontrado.');
    }

    return orcamento;
  }
}
