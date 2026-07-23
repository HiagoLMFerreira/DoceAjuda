import type { SalvarProdutoVendaDTO } from '../../domain/models/ProdutoVenda';
import type { ProdutoVendaService } from '../../application/services/ProdutoVendaService';
import type { CalcularPrecificacaoService } from '../../application/services/CalcularPrecificacaoService';

export class ProdutoVendaController {
  constructor(
    private readonly produtoService: ProdutoVendaService,
    public readonly calculadora: CalcularPrecificacaoService
  ) {}

  listar(filtro = '') {
    return this.produtoService.listar(filtro);
  }

  buscarDetalhado(id: number) {
    return this.produtoService.buscarDetalhado(id);
  }

  salvar(input: SalvarProdutoVendaDTO, id?: number) {
    return id
      ? this.produtoService.atualizar(id, input)
      : this.produtoService.criar(input);
  }

  excluir(id: number) {
    return this.produtoService.excluir(id);
  }
}
