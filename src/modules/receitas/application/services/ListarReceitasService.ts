import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';
export class ListarReceitasService {
  constructor(private readonly repository: IReceitaRepository) {}
  executar() { return this.repository.listar(); }
}
