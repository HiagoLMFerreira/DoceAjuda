import type {
  AgendaEncomenda,
  AgendaEncomendaDetalhada,
  AgendaFiltros,
  AgendaNecessidade,
} from '../models/Agenda';

export interface IAgendaRepository {
  listar(filtros?: AgendaFiltros): Promise<AgendaEncomenda[]>;
  buscarDetalhes(id: number): Promise<AgendaEncomendaDetalhada | null>;
  calcularNecessidadesEncomenda(id: number): Promise<AgendaNecessidade[]>;
  calcularNecessidadesDia(data: string): Promise<AgendaNecessidade[]>;
}
