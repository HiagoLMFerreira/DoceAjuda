import type { SalvarReceitaDTO } from '../../domain/models/Receita';
import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';
import type { ValidarReceitaService } from './ValidarReceitaService';
export class SalvarReceitaService {
  constructor(private readonly repository: IReceitaRepository, private readonly validator: ValidarReceitaService) {}
  executar(input: SalvarReceitaDTO) { return this.repository.criar(this.validator.executar(input)); }
}
