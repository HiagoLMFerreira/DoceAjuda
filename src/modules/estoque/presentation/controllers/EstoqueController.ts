import type {
  AtualizarProdutoEstoqueDTO,
  CriarProdutoEstoqueDTO,
  FiltrosProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import type { AtualizarProdutoEstoqueService } from '../../application/services/AtualizarProdutoEstoqueService';
import type { CriarProdutoEstoqueService } from '../../application/services/CriarProdutoEstoqueService';
import type { AlterarStatusProdutoEstoqueService } from '../../application/services/AlterarStatusProdutoEstoqueService';
import type { ListarProdutosEstoqueService } from '../../application/services/ListarProdutosEstoqueService';

export class EstoqueController {
  constructor(
    private readonly listarService: ListarProdutosEstoqueService,
    private readonly criarService: CriarProdutoEstoqueService,
    private readonly atualizarService: AtualizarProdutoEstoqueService,
    private readonly alterarStatusService: AlterarStatusProdutoEstoqueService
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

  alterarStatus(id: number, ativo: boolean) {
    return this.alterarStatusService.executar(id, ativo);
  }
}
