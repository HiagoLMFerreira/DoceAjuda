import type {
  AtualizarProdutoEstoqueDTO,
  CriarProdutoEstoqueDTO,
  FiltrosProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import type { AtualizarProdutoEstoqueService } from '../../application/services/AtualizarProdutoEstoqueService';
import type { CriarProdutoEstoqueService } from '../../application/services/CriarProdutoEstoqueService';
import type { ExcluirProdutoEstoqueService } from '../../application/services/ExcluirProdutoEstoqueService';
import type { ListarProdutosEstoqueService } from '../../application/services/ListarProdutosEstoqueService';

export class EstoqueController {
  constructor(
    private readonly listarService: ListarProdutosEstoqueService,
    private readonly criarService: CriarProdutoEstoqueService,
    private readonly atualizarService: AtualizarProdutoEstoqueService,
    private readonly excluirService: ExcluirProdutoEstoqueService
  ) {}

  listar(filtros?: FiltrosProdutoEstoque) {
    return this.listarService.executar(filtros);
  }

  criar(produto: CriarProdutoEstoqueDTO) {
    return this.criarService.executar(produto);
  }

  atualizar(produto: AtualizarProdutoEstoqueDTO) {
    return this.atualizarService.executar(produto);
  }

  excluir(id: number) {
    return this.excluirService.executar(id);
  }
}
