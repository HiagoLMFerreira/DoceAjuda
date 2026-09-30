import type {
  AtualizarClienteDTO,
  CriarClienteDTO,
  FiltroClientes,
} from '../../domain/models/Cliente';
import type { AtualizarClienteService } from '../../application/services/AtualizarClienteService';
import type { BuscarClientePorIdService } from '../../application/services/BuscarClientePorIdService';
import type { CriarClienteService } from '../../application/services/CriarClienteService';
import type { AlterarStatusClienteService } from '../../application/services/AlterarStatusClienteService';
import type { ListarClientesService } from '../../application/services/ListarClientesService';

export class ClienteController {
  constructor(
    private readonly listarClientesService: ListarClientesService,
    private readonly buscarClientePorIdService: BuscarClientePorIdService,
    private readonly criarClienteService: CriarClienteService,
    private readonly atualizarClienteService: AtualizarClienteService,
    private readonly alterarStatusClienteService: AlterarStatusClienteService
  ) {}

  listar(filtros?: FiltroClientes) {
    return this.listarClientesService.executar(filtros);
  }

  buscarPorId(id: number) {
    return this.buscarClientePorIdService.executar(id);
  }

  criar(cliente: CriarClienteDTO) {
    return this.criarClienteService.executar(cliente);
  }

  atualizar(cliente: AtualizarClienteDTO) {
    return this.atualizarClienteService.executar(cliente);
  }

  alterarStatus(id: number, ativo: boolean) {
    return this.alterarStatusClienteService.executar(id, ativo);
  }
}
