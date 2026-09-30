import type {
  FiltrosProdutoEstoque,
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import type { IProdutoEstoqueRepository } from '../../domain/repositories/IProdutoEstoqueRepository';

export class ListarProdutosEstoqueService {
  constructor(
    private readonly repository: IProdutoEstoqueRepository
  ) {}

  executar(
    filtros: FiltrosProdutoEstoque = {}
  ): Promise<ProdutoEstoque[]> {
    return this.repository.listar({
      termo: filtros.termo?.trim() ?? '',
      ordenarPor: filtros.ordenarPor ?? 'nome',
      direcao: filtros.direcao ?? 'ASC',
    });
  }
}
