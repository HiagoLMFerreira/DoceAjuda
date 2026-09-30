import { BusinessRuleError, ValidationError } from '../../../../core/errors';
import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';
export class ExcluirReceitaService {
  constructor(private readonly repository: IReceitaRepository) {}
  async executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Receita inválida.');
    if (await this.repository.estaEmUso(id)) {
      throw new BusinessRuleError('Esta receita está sendo utilizada em um produto para venda e não pode ser excluída.');
    }
    await this.repository.excluir(id);
  }
}
