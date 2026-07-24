import type {
  FiltrosCompra,
  NovaCompra,
} from '../../domain/models/Compra';
import type { CompraService } from '../../application/services/CompraService';
import type { ListarProdutosCompraService } from '../../application/services/ListarProdutosCompraService';
import type { CalcularCompraService } from '../../application/services/CalcularCompraService';

export class CompraController {
  constructor(
    private readonly compraService: CompraService,
    private readonly produtoService: ListarProdutosCompraService,
    public readonly calculadora: CalcularCompraService
  ) {}

  listar(filtros?: FiltrosCompra) {
    return this.compraService.listar(filtros);
  }

  buscarPorId(id: number) {
    return this.compraService.buscarPorId(id);
  }

  cadastrar(input: NovaCompra) {
    return this.compraService.cadastrar(input);
  }

  cancelar(id: number) {
    return this.compraService.cancelar(id);
  }

  excluir(id: number) {
    return this.compraService.excluir(id);
  }

  listarProdutos() {
    return this.produtoService.executar();
  }
}
