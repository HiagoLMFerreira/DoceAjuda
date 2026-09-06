import { ValidationError } from '../../../../core/errors';
import type { IProdutoEstoqueRepository } from '../../domain/repositories/IProdutoEstoqueRepository';

export class AlterarStatusProdutoEstoqueService {
  constructor(private readonly repository: IProdutoEstoqueRepository) {}

  executar(id: number, ativo: boolean): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Produto inválido.');
    }

    return this.repository.alterarStatus(id, ativo);
  }
}
