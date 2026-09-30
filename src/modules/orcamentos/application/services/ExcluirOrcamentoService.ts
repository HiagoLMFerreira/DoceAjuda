import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../../core/errors';
import type { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class ExcluirOrcamentoService {
  constructor(
    private readonly repository: IOrcamentoRepository
  ) {}

  async executar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Orçamento inválido.');
    }

    const orcamento = await this.repository.buscarPorId(id);

    if (!orcamento || orcamento.tipo !== 'ORCAMENTO') {
      throw new NotFoundError('Orçamento não encontrado.');
    }

    if (orcamento.status !== 'PENDENTE') {
      throw new BusinessRuleError(
        'Somente orçamentos pendentes podem ser excluídos.'
      );
    }

    await this.repository.excluir(id);
  }
}
