import { AtualizarClienteService } from '../application/services/AtualizarClienteService';
import { BuscarClientePorIdService } from '../application/services/BuscarClientePorIdService';
import { CriarClienteService } from '../application/services/CriarClienteService';
import { AlterarStatusClienteService } from '../application/services/AlterarStatusClienteService';
import { ListarClientesService } from '../application/services/ListarClientesService';
import { ValidarClienteService } from '../application/services/ValidarClienteService';
import { SQLiteClienteRepository } from '../infrastructure/repositories/SQLiteClienteRepository';
import { ClienteController } from '../presentation/controllers/ClienteController';

const clienteRepository = new SQLiteClienteRepository();
const validarClienteService = new ValidarClienteService();

const listarClientesService = new ListarClientesService(clienteRepository);
const buscarClientePorIdService =
  new BuscarClientePorIdService(clienteRepository);
const criarClienteService = new CriarClienteService(
  clienteRepository,
  validarClienteService
);
const atualizarClienteService = new AtualizarClienteService(
  clienteRepository,
  validarClienteService
);
const alterarStatusClienteService = new AlterarStatusClienteService(clienteRepository);

export const clienteController = new ClienteController(
  listarClientesService,
  buscarClientePorIdService,
  criarClienteService,
  atualizarClienteService,
  alterarStatusClienteService
);
