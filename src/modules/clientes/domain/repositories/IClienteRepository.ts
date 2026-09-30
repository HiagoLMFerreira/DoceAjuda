import type {
  AtualizarClienteDTO,
  Cliente,
  CriarClienteDTO,
  FiltroClientes,
} from '../models/Cliente';

export interface IClienteRepository {
  listar(filtros?: FiltroClientes): Promise<Cliente[]>;
  buscarPorId(id: number): Promise<Cliente | null>;
  criar(cliente: CriarClienteDTO): Promise<number>;
  atualizar(cliente: AtualizarClienteDTO): Promise<void>;
  alterarStatus(id: number, ativo: boolean): Promise<void>;
}
