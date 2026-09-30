import type {
  Cliente,
  FiltroClientes,
} from '../../domain/models/Cliente';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';

export class ListarClientesService {
  constructor(
    private readonly clienteRepository: IClienteRepository
  ) {}

  executar(filtros: FiltroClientes = {}): Promise<Cliente[]> {
    return this.clienteRepository.listar({
      termo: filtros.termo?.trim() ?? '',
      ordenarPor: filtros.ordenarPor ?? 'nome',
      direcao: filtros.direcao ?? 'ASC',
    });
  }
}
