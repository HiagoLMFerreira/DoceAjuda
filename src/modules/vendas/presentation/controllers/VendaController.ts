import type { BuscarVendaService } from '../../application/services/BuscarVendaService';
import type { CancelarVendaService } from '../../application/services/CancelarVendaService';
import type { ListarVendasService } from '../../application/services/ListarVendasService';
import type { ValidarOperacaoVendaService } from '../../application/services/ValidarOperacaoVendaService';
import type {
  FiltrosVenda,
  VendaDetalhada,
} from '../../domain/models/Venda';

export class VendaController {
  constructor(
    private readonly listarService: ListarVendasService,
    private readonly buscarService: BuscarVendaService,
    private readonly cancelarService: CancelarVendaService,
    private readonly validarOperacaoService: ValidarOperacaoVendaService
  ) {}

  listar(filtros?: FiltrosVenda) {
    return this.listarService.executar(filtros);
  }

  buscarPorId(id: number) {
    return this.buscarService.executar(id);
  }

  cancelar(id: number) {
    return this.cancelarService.executar(id);
  }

  validarCancelamento(venda: VendaDetalhada) {
    return this.validarOperacaoService.validarCancelamento(
      venda
    );
  }
}
