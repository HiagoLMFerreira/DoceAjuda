import { SQLiteReceitaRepository } from '../infrastructure/repositories/SQLiteReceitaRepository';
import { SQLiteProdutoParaReceitaRepository } from '../infrastructure/repositories/SQLiteProdutoParaReceitaRepository';
import { ValidarReceitaService } from '../application/services/ValidarReceitaService';
import { ListarReceitasService } from '../application/services/ListarReceitasService';
import { BuscarReceitaDetalhadaService } from '../application/services/BuscarReceitaDetalhadaService';
import { SalvarReceitaService } from '../application/services/SalvarReceitaService';
import { AtualizarReceitaService } from '../application/services/AtualizarReceitaService';
import { ExcluirReceitaService } from '../application/services/ExcluirReceitaService';
import { ListarProdutosParaReceitaService } from '../application/services/ListarProdutosParaReceitaService';
import { ReceitaController } from '../presentation/controllers/ReceitaController';

const receitaRepository = new SQLiteReceitaRepository();
const produtoRepository = new SQLiteProdutoParaReceitaRepository();
const validator = new ValidarReceitaService();

export const receitaController = new ReceitaController(
  new ListarReceitasService(receitaRepository),
  new BuscarReceitaDetalhadaService(receitaRepository),
  new SalvarReceitaService(receitaRepository, validator),
  new AtualizarReceitaService(receitaRepository, validator),
  new ExcluirReceitaService(receitaRepository),
  new ListarProdutosParaReceitaService(produtoRepository),
);
