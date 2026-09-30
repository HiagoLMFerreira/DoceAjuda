import type { CriarProdutoEstoqueDTO } from '../../domain/models/ProdutoEstoque';
import type { IProdutoEstoqueRepository } from '../../domain/repositories/IProdutoEstoqueRepository';
import type { ValidarProdutoEstoqueService } from './ValidarProdutoEstoqueService';

export class CriarProdutoEstoqueService {
  constructor(
    private readonly repository: IProdutoEstoqueRepository,
    private readonly validator: ValidarProdutoEstoqueService
  ) {}

  executar(produto: CriarProdutoEstoqueDTO): Promise<number> {
    return this.repository.criar(
      this.validator.executar(produto)
    );
  }
}
