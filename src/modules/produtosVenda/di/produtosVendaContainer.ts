import { CalcularPrecificacaoService } from '../application/services/CalcularPrecificacaoService';
import { ProdutoVendaService } from '../application/services/ProdutoVendaService';
import { ValidarProdutoVendaService } from '../application/services/ValidarProdutoVendaService';
import { SQLiteProdutoVendaRepository } from '../infrastructure/repositories/SQLiteProdutoVendaRepository';
import { SQLitePrecificacaoRepository } from '../infrastructure/repositories/SQLitePrecificacaoRepository';
import { ProdutoVendaController } from '../presentation/controllers/ProdutoVendaController';

const produtoRepository = new SQLiteProdutoVendaRepository();
export const precificacaoRepository =
  new SQLitePrecificacaoRepository();

const calculadora = new CalcularPrecificacaoService();

export const produtoVendaController =
  new ProdutoVendaController(
    new ProdutoVendaService(
      produtoRepository,
      new ValidarProdutoVendaService()
    ),
    calculadora
  );
