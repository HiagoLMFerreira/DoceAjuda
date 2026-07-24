import type { IProdutoCompraRepository } from '../../domain/repositories/IProdutoCompraRepository';

export class ListarProdutosCompraService {
  constructor(
    private readonly repository: IProdutoCompraRepository
  ) {}

  executar() {
    return this.repository.listarAtivos();
  }
}
