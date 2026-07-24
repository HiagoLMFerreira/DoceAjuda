import { ValidationError } from '../../../../core/errors';
import type { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class CalcularNecessidadesOrcamentoService {
  constructor(
    private readonly repository: IOrcamentoRepository
  ) {}

  executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Orçamento inválido.');
    }

    return this.repository.calcularNecessidades(id);
  }
}
