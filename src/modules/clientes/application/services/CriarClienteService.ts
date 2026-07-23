import type { CriarClienteDTO } from '../../domain/models/Cliente';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';
import type { ValidarClienteService } from './ValidarClienteService';

export class CriarClienteService {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly validarClienteService: ValidarClienteService
  ) {}

  executar(cliente: CriarClienteDTO): Promise<number> {
    const clienteValidado = this.validarClienteService.executar(cliente);
    return this.clienteRepository.criar(clienteValidado);
  }
}
