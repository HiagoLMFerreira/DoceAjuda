export type {
  CustoFixoDatabase, CustoVariavelDatabase, NovoProdutoVenda, ParametrosPrecificacao,
  ProdutoEstoque, ProdutoParaReceita, ProdutoVendaDatabase, ProdutoVendaDetalhado,
  ReceitaDatabase, ReceitaParaPrecificacao,
} from '../../../core/database/databaseManager';

export { buscarReceitaParaPrecificacao } from '../infrastructure/database/precificacaoDatabase';
export { listarProdutos } from '../../estoque/infrastructure/database/estoqueDatabase';
export { listarReceitas } from '../../receitas/infrastructure/database/receitasDatabase';
export { formatarMoeda } from '../../relatorios/infrastructure/database/relatoriosDatabase';

import {
  adicionarCustoFixo, adicionarCustoVariavel, alterarStatusCustoFixo, alterarStatusCustoVariavel,
  atualizarCustoFixo, atualizarCustoVariavel, excluirCustoFixo, excluirCustoVariavel,
  listarCustosFixos, listarCustosVariaveis,
} from '../infrastructure/database/precificacaoDatabase';
import { produtoVendaController, precificacaoRepository } from '../di/produtosVendaContainer';
import type { NovoProdutoVenda } from '../../../core/database/databaseManager';

export const listarProdutosVenda = (filtro = '') => produtoVendaController.listar(filtro);
export const buscarProdutoVendaDetalhado = (id: number) => produtoVendaController.buscarDetalhado(id);
export const salvarProdutoVendaCompleto = (input: NovoProdutoVenda) => produtoVendaController.salvar(input);
export const atualizarProdutoVendaCompleto = (id: number, input: NovoProdutoVenda) => produtoVendaController.salvar(input, id);
export const excluirProdutoVenda = (id: number) => produtoVendaController.excluir(id);
export const buscarParametrosPrecificacao = () => precificacaoRepository.buscarParametros();
export const salvarParametrosPrecificacao = (salarioDesejado: number, horasTrabalhadasMes: number, margemLucro: number) =>
  precificacaoRepository.salvarParametros(salarioDesejado, horasTrabalhadasMes, margemLucro);
export { listarCustosFixos, listarCustosVariaveis, adicionarCustoFixo, adicionarCustoVariavel, atualizarCustoFixo, atualizarCustoVariavel, alterarStatusCustoFixo, alterarStatusCustoVariavel, excluirCustoFixo, excluirCustoVariavel };
export const calcularCustoIngrediente = (precoMedio:number, quantidadeEmbalagem:number, unidadeProduto:string, quantidadeUsada:number, unidadeUsada:string) => produtoVendaController.calculadora.calcularCustoIngrediente(precoMedio, quantidadeEmbalagem, unidadeProduto, quantidadeUsada, unidadeUsada);
export const calcularCustoMaoDeObra = (salarioDesejado:number, horasMes:number, minutosProduto:number) => produtoVendaController.calculadora.calcularCustoMaoDeObra(salarioDesejado, horasMes, minutosProduto);
export const calcularCustoOperacionalRateado = (custosFixos:number, custosVariaveis:number, horasMes:number, minutosProduto:number) => produtoVendaController.calculadora.calcularCustoOperacional(custosFixos, custosVariaveis, horasMes, minutosProduto);
export const calcularPrecoSugerido = (custoTotal:number, margemLucro:number) => produtoVendaController.calculadora.calcularPrecoSugerido(custoTotal, margemLucro);
export const extrairNumeroRendimento = (rendimento:string) => produtoVendaController.calculadora.extrairNumeroRendimento(rendimento);
