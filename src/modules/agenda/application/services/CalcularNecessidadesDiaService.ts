import type { IAgendaRepository } from '../../domain/repositories/IAgendaRepository';

export class CalcularNecessidadesDiaService {
  constructor(private readonly repository: IAgendaRepository) {}

  executar(data: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new Error('Selecione uma data válida.');
    }

    return this.repository.calcularNecessidadesDia(data);
  }
}
