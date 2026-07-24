import { CalcularCompraService } from '../application/services/CalcularCompraService';
import { CompraService } from '../application/services/CompraService';
import { ListarProdutosCompraService } from '../application/services/ListarProdutosCompraService';
import { ValidarCompraService } from '../application/services/ValidarCompraService';
import { LegacyCompraRepository } from '../infrastructure/repositories/LegacyCompraRepository';
import { LegacyProdutoCompraRepository } from '../infrastructure/repositories/LegacyProdutoCompraRepository';
import { CompraController } from '../presentation/controllers/CompraController';

const compraRepository = new LegacyCompraRepository();
const produtoRepository =
  new LegacyProdutoCompraRepository();

export const compraController = new CompraController(
  new CompraService(
    compraRepository,
    new ValidarCompraService()
  ),
  new ListarProdutosCompraService(produtoRepository),
  new CalcularCompraService()
);
