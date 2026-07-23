import { CalcularPrecificacaoService } from '../application/services/CalcularPrecificacaoService';
import { ProdutoVendaService } from '../application/services/ProdutoVendaService';
import { ValidarProdutoVendaService } from '../application/services/ValidarProdutoVendaService';
import { LegacyProdutoVendaRepository } from '../infrastructure/repositories/LegacyProdutoVendaRepository';
import { LegacyPrecificacaoRepository } from '../infrastructure/repositories/LegacyPrecificacaoRepository';
import { ProdutoVendaController } from '../presentation/controllers/ProdutoVendaController';

const produtoRepository = new LegacyProdutoVendaRepository();
export const precificacaoRepository =
  new LegacyPrecificacaoRepository();

const calculadora = new CalcularPrecificacaoService();

export const produtoVendaController =
  new ProdutoVendaController(
    new ProdutoVendaService(
      produtoRepository,
      new ValidarProdutoVendaService()
    ),
    calculadora
  );
