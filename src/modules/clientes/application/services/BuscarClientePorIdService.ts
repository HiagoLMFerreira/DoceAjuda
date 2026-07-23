import { NotFoundError, ValidationError } from '../../../../core/errors';
import type { Cliente } from '../../domain/models/Cliente';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';

export class BuscarClientePorIdService {
  constructor(
    private readonly clienteRepository: IClienteRepository
  ) {}

  async executar(id: number): Promise<Cliente> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Cliente inválido.');
    }

    const cliente = await this.clienteRepository.buscarPorId(id);

    if (!cliente) {
      throw new NotFoundError('Cliente não encontrado.');
    }

    return cliente;
  }
}
