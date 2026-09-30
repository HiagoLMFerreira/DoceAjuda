import { ValidationError } from '../../../../core/errors';
import type { AtualizarClienteDTO } from '../../domain/models/Cliente';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';
import type { ValidarClienteService } from './ValidarClienteService';

export class AtualizarClienteService {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly validarClienteService: ValidarClienteService
  ) {}

  async executar(cliente: AtualizarClienteDTO): Promise<void> {
    if (!Number.isInteger(cliente.id) || cliente.id <= 0) {
      throw new ValidationError('Cliente inválido.');
    }

    const clienteValidado = this.validarClienteService.executar(cliente);

    await this.clienteRepository.atualizar({
      id: cliente.id,
      ...clienteValidado,
    });
  }
}
