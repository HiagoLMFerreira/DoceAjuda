import type { IAgendaRepository } from '../../domain/repositories/IAgendaRepository';

export class CalcularNecessidadesEncomendaService {
  constructor(private readonly repository: IAgendaRepository) {}

  executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Encomenda inválida.');
    }

    return this.repository.calcularNecessidadesEncomenda(id);
  }
}
