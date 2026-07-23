import {
  BusinessRuleError,
  ValidationError,
} from '../../../../core/errors';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';

export class ExcluirClienteService {
  constructor(
    private readonly clienteRepository: IClienteRepository
  ) {}

  async executar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Cliente inválido.');
    }

    const possuiVinculos =
      await this.clienteRepository.possuiDocumentosVinculados(id);

    if (possuiVinculos) {
      throw new BusinessRuleError(
        'Este cliente possui orçamentos ou vendas vinculados e não pode ser excluído.'
      );
    }

    await this.clienteRepository.excluir(id);
  }
}
