import type { IAgendaRepository } from '../../domain/repositories/IAgendaRepository';

export class BuscarDetalhesEncomendaService {
  constructor(private readonly repository: IAgendaRepository) {}

  async executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Encomenda inválida.');
    }

    return this.repository.buscarDetalhes(id);
  }
}
