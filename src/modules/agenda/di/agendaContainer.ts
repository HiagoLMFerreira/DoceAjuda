import { AgendaPdfService } from '../application/AgendaPdfService';
import { BuscarDetalhesEncomendaService } from '../application/services/BuscarDetalhesEncomendaService';
import { CalcularNecessidadesDiaService } from '../application/services/CalcularNecessidadesDiaService';
import { CalcularNecessidadesEncomendaService } from '../application/services/CalcularNecessidadesEncomendaService';
import { ListarEncomendasService } from '../application/services/ListarEncomendasService';
import { SQLiteAgendaRepository } from '../infrastructure/repositories/SQLiteAgendaRepository';
import { AgendaController } from '../presentation/controllers/AgendaController';

const agendaRepository = new SQLiteAgendaRepository();
const listarEncomendasService = new ListarEncomendasService(agendaRepository);
const buscarDetalhesService = new BuscarDetalhesEncomendaService(agendaRepository);
const calcularNecessidadesEncomendaService =
  new CalcularNecessidadesEncomendaService(agendaRepository);
const calcularNecessidadesDiaService =
  new CalcularNecessidadesDiaService(agendaRepository);

export const agendaController = new AgendaController(
  listarEncomendasService,
  buscarDetalhesService,
  calcularNecessidadesEncomendaService,
  calcularNecessidadesDiaService
);

export const agendaPdfService = new AgendaPdfService();
