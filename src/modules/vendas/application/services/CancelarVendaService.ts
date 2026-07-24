import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../../core/errors';
import type { IVendaRepository } from '../../domain/repositories/IVendaRepository';

export class CancelarVendaService {
  constructor(
    private readonly repository: IVendaRepository
  ) {}

  async executar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Venda inválida.');
    }

    const venda = await this.repository.buscarPorId(id);

    if (!venda || venda.tipo !== 'VENDA') {
      throw new NotFoundError('Venda não encontrada.');
    }

    if (venda.status === 'CANCELADA') {
      throw new BusinessRuleError(
        'Esta venda já está cancelada.'
      );
    }

    if (venda.status !== 'CONCLUIDA') {
      throw new BusinessRuleError(
        'Somente vendas concluídas podem ser canceladas.'
      );
    }

    if (venda.estoque_baixado !== 1) {
      throw new BusinessRuleError(
        'Esta venda não possui uma baixa de estoque válida.'
      );
    }

    if (venda.estoque_estornado === 1) {
      throw new BusinessRuleError(
        'O estoque desta venda já foi estornado.'
      );
    }

    await this.repository.cancelar(id);
  }
}
