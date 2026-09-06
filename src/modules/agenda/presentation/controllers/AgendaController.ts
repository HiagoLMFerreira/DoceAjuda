import type { BuscarDetalhesEncomendaService } from '../../application/services/BuscarDetalhesEncomendaService';
import type { CalcularNecessidadesDiaService } from '../../application/services/CalcularNecessidadesDiaService';
import type { CalcularNecessidadesEncomendaService } from '../../application/services/CalcularNecessidadesEncomendaService';
import type { ListarEncomendasService } from '../../application/services/ListarEncomendasService';
import type { AgendaFiltros } from '../../domain/models/Agenda';

export class AgendaController {
  constructor(
    private readonly listarService: ListarEncomendasService,
    private readonly detalhesService: BuscarDetalhesEncomendaService,
    private readonly necessidadesEncomendaService: CalcularNecessidadesEncomendaService,
    private readonly necessidadesDiaService: CalcularNecessidadesDiaService
  ) {}

  listar(filtros?: AgendaFiltros) {
    return this.listarService.executar(filtros);
  }

  buscarDetalhes(id: number) {
    return this.detalhesService.executar(id);
  }

  calcularNecessidadesEncomenda(id: number) {
    return this.necessidadesEncomendaService.executar(id);
  }

  calcularNecessidadesDia(data: string) {
    return this.necessidadesDiaService.executar(data);
  }
}
