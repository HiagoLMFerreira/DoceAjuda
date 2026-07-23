import { NotFoundError, ValidationError } from '../../../../core/errors';
import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';
export class BuscarReceitaDetalhadaService {
  constructor(private readonly repository: IReceitaRepository) {}
  async executar(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Receita inválida.');
    const receita = await this.repository.buscarDetalhada(id);
    if (!receita) throw new NotFoundError('Receita não encontrada.');
    return receita;
  }
}
