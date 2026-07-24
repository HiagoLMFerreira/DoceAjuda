import { BuscarVendaService } from '../application/services/BuscarVendaService';
import { CancelarVendaService } from '../application/services/CancelarVendaService';
import { ListarVendasService } from '../application/services/ListarVendasService';
import { ValidarOperacaoVendaService } from '../application/services/ValidarOperacaoVendaService';
import { LegacyVendaRepository } from '../infrastructure/repositories/LegacyVendaRepository';
import { VendaController } from '../presentation/controllers/VendaController';

const repository = new LegacyVendaRepository();

export const vendaController = new VendaController(
  new ListarVendasService(repository),
  new BuscarVendaService(repository),
  new CancelarVendaService(repository),
  new ValidarOperacaoVendaService()
);
