import { ValidationError } from '../../../../core/errors';
import type { AtualizarProdutoEstoqueDTO } from '../../domain/models/ProdutoEstoque';
import type { IProdutoEstoqueRepository } from '../../domain/repositories/IProdutoEstoqueRepository';
import type { ValidarProdutoEstoqueService } from './ValidarProdutoEstoqueService';

export class AtualizarProdutoEstoqueService {
  constructor(
    private readonly repository: IProdutoEstoqueRepository,
    private readonly validator: ValidarProdutoEstoqueService
  ) {}

  async executar(
    produto: AtualizarProdutoEstoqueDTO
  ): Promise<void> {
    if (!Number.isInteger(produto.id) || produto.id <= 0) {
      throw new ValidationError('Produto inválido.');
    }

    await this.repository.atualizar({
      id: produto.id,
      ...this.validator.executar(produto),
    });
  }
}
