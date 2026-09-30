import { CalcularCompraService } from '../application/services/CalcularCompraService';
import { CompraService } from '../application/services/CompraService';
import { ListarProdutosCompraService } from '../application/services/ListarProdutosCompraService';
import { ValidarCompraService } from '../application/services/ValidarCompraService';
import { SQLiteCompraRepository } from '../infrastructure/repositories/SQLiteCompraRepository';
import { SQLiteProdutoCompraRepository } from '../infrastructure/repositories/SQLiteProdutoCompraRepository';
import { CompraController } from '../presentation/controllers/CompraController';

const compraRepository = new SQLiteCompraRepository();
const produtoRepository =
  new SQLiteProdutoCompraRepository();

export const compraController = new CompraController(
  new CompraService(
    compraRepository,
    new ValidarCompraService()
  ),
  new ListarProdutosCompraService(produtoRepository),
  new CalcularCompraService()
);
