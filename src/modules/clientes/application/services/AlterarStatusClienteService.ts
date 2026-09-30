import { ValidationError } from '../../../../core/errors';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';

export class AlterarStatusClienteService {
  constructor(private readonly repository: IClienteRepository) {}

  executar(id: number, ativo: boolean): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Cliente inválido.');
    }

    return this.repository.alterarStatus(id, ativo);
  }
}
