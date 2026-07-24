import type { BuscarOrcamentoService } from '../../application/services/BuscarOrcamentoService';
import type { CalcularNecessidadesOrcamentoService } from '../../application/services/CalcularNecessidadesOrcamentoService';
import type { ExcluirOrcamentoService } from '../../application/services/ExcluirOrcamentoService';
import type { ListarOrcamentosService } from '../../application/services/ListarOrcamentosService';
import type { ValidarOperacaoOrcamentoService } from '../../application/services/ValidarOperacaoOrcamentoService';
import type { OrcamentoDetalhado } from '../../domain/models/Orcamento';

export class OrcamentoController {
  constructor(
    private readonly listarService: ListarOrcamentosService,
    private readonly buscarService: BuscarOrcamentoService,
    private readonly necessidadesService: CalcularNecessidadesOrcamentoService,
    private readonly excluirService: ExcluirOrcamentoService,
    private readonly validarOperacaoService: ValidarOperacaoOrcamentoService
  ) {}

  listar(filtro = '') {
    return this.listarService.executar(filtro);
  }

  buscarPorId(id: number) {
    return this.buscarService.executar(id);
  }

  calcularNecessidades(id: number) {
    return this.necessidadesService.executar(id);
  }

  excluir(id: number) {
    return this.excluirService.executar(id);
  }

  validarEdicao(orcamento: OrcamentoDetalhado) {
    return this.validarOperacaoService.validarEdicao(
      orcamento
    );
  }

  validarConversao(orcamento: OrcamentoDetalhado) {
    return this.validarOperacaoService.validarConversao(
      orcamento
    );
  }

  validarExclusao(orcamento: OrcamentoDetalhado) {
    return this.validarOperacaoService.validarExclusao(
      orcamento
    );
  }
}
