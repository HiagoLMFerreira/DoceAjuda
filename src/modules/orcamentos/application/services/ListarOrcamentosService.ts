import type { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class ListarOrcamentosService {
  constructor(
    private readonly repository: IOrcamentoRepository
  ) {}

  executar(filtro = '') {
    return this.repository.listar(filtro.trim());
  }
}
