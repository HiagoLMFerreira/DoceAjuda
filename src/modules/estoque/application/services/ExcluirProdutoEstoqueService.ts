import {
  BusinessRuleError,
  ValidationError,
} from '../../../../core/errors';
import type { IProdutoEstoqueRepository } from '../../domain/repositories/IProdutoEstoqueRepository';

export class ExcluirProdutoEstoqueService {
  constructor(
    private readonly repository: IProdutoEstoqueRepository
  ) {}

  async executar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Produto inválido.');
    }

    const vinculos = await this.repository.buscarVinculos(id);

    if (vinculos.compras > 0) {
      throw new BusinessRuleError(
        'Este item possui histórico de compras e não pode ser excluído. Você pode inativá-lo.'
      );
    }

    if (vinculos.produtosVenda > 0) {
      throw new BusinessRuleError(
        'Este item está sendo utilizado em um produto para venda e não pode ser excluído.'
      );
    }

    if (vinculos.historicoVendas > 0) {
      throw new BusinessRuleError(
        'Este item possui histórico de vendas e não pode ser excluído. Você pode inativá-lo.'
      );
    }

    await this.repository.excluir(id);
  }
}
