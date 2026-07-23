import { ValidationError } from '../../../../core/errors';
import type { AtualizarReceitaDTO } from '../../domain/models/Receita';
import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';
import type { ValidarReceitaService } from './ValidarReceitaService';
export class AtualizarReceitaService {
  constructor(private readonly repository: IReceitaRepository, private readonly validator: ValidarReceitaService) {}
  async executar(input: AtualizarReceitaDTO) {
    if (!Number.isInteger(input.id) || input.id <= 0) throw new ValidationError('Receita inválida.');
    await this.repository.atualizar({ id: input.id, ...this.validator.executar(input) });
  }
}
