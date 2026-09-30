import type { AgendaFiltros } from '../../domain/models/Agenda';
import type { IAgendaRepository } from '../../domain/repositories/IAgendaRepository';

export class ListarEncomendasService {
  constructor(private readonly repository: IAgendaRepository) {}

  executar(filtros?: AgendaFiltros) {
    return this.repository.listar(filtros);
  }
}
