import { BuscarOrcamentoService } from '../application/services/BuscarOrcamentoService';
import { CalcularNecessidadesOrcamentoService } from '../application/services/CalcularNecessidadesOrcamentoService';
import { ExcluirOrcamentoService } from '../application/services/ExcluirOrcamentoService';
import { ListarOrcamentosService } from '../application/services/ListarOrcamentosService';
import { ValidarOperacaoOrcamentoService } from '../application/services/ValidarOperacaoOrcamentoService';
import { SQLiteOrcamentoRepository } from '../infrastructure/repositories/SQLiteOrcamentoRepository';
import { OrcamentoController } from '../presentation/controllers/OrcamentoController';

const repository = new SQLiteOrcamentoRepository();

export const orcamentoController =
  new OrcamentoController(
    new ListarOrcamentosService(repository),
    new BuscarOrcamentoService(repository),
    new CalcularNecessidadesOrcamentoService(
      repository
    ),
    new ExcluirOrcamentoService(repository),
    new ValidarOperacaoOrcamentoService()
  );
