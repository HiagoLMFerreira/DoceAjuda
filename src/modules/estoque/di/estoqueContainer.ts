import { AtualizarProdutoEstoqueService } from '../application/services/AtualizarProdutoEstoqueService';
import { CriarProdutoEstoqueService } from '../application/services/CriarProdutoEstoqueService';
import { AlterarStatusProdutoEstoqueService } from '../application/services/AlterarStatusProdutoEstoqueService';
import { ListarProdutosEstoqueService } from '../application/services/ListarProdutosEstoqueService';
import { ValidarProdutoEstoqueService } from '../application/services/ValidarProdutoEstoqueService';
import { SQLiteProdutoEstoqueRepository } from '../infrastructure/repositories/SQLiteProdutoEstoqueRepository';
import { EstoqueController } from '../presentation/controllers/EstoqueController';

const repository = new SQLiteProdutoEstoqueRepository();
const validator = new ValidarProdutoEstoqueService();

export const estoqueController = new EstoqueController(
  new ListarProdutosEstoqueService(repository),
  new CriarProdutoEstoqueService(repository, validator),
  new AtualizarProdutoEstoqueService(repository, validator),
  new AlterarStatusProdutoEstoqueService(repository)
);
