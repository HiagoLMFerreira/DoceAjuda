export type {
  CustoFixoDatabase,
  CustoVariavelDatabase,
  NovoProdutoVenda,
  ParametrosPrecificacao,
  ProdutoEstoque,
  ProdutoParaReceita,
  ProdutoVendaDatabase,
  ProdutoVendaDetalhado,
  ReceitaDatabase,
  ReceitaParaPrecificacao,
} from '../../../../database/database';

export {
  buscarReceitaParaPrecificacao,
  formatarMoeda,
  listarProdutos,
  listarReceitas,
} from '../../../../database/database';

import {
  adicionarCustoFixo as legacyAdicionarCustoFixo,
  adicionarCustoVariavel as legacyAdicionarCustoVariavel,
  alterarStatusCustoFixo as legacyAlterarStatusCustoFixo,
  alterarStatusCustoVariavel as legacyAlterarStatusCustoVariavel,
  atualizarCustoFixo as legacyAtualizarCustoFixo,
  atualizarCustoVariavel as legacyAtualizarCustoVariavel,
  excluirCustoFixo as legacyExcluirCustoFixo,
  excluirCustoVariavel as legacyExcluirCustoVariavel,
  listarCustosFixos as legacyListarCustosFixos,
  listarCustosVariaveis as legacyListarCustosVariaveis,
} from '../../../../database/database';

import { produtoVendaController, precificacaoRepository } from '../../di/produtosVendaContainer';
import type { NovoProdutoVenda } from '../../../../database/database';

export const listarProdutosVenda = (filtro = '') =>
  produtoVendaController.listar(filtro);

export const buscarProdutoVendaDetalhado = (id: number) =>
  produtoVendaController.buscarDetalhado(id);

export const salvarProdutoVendaCompleto = (input: NovoProdutoVenda) =>
  produtoVendaController.salvar(input);

export const atualizarProdutoVendaCompleto = (
  id: number,
  input: NovoProdutoVenda
) => produtoVendaController.salvar(input, id);

export const excluirProdutoVenda = (id: number) =>
  produtoVendaController.excluir(id);

export const buscarParametrosPrecificacao = () =>
  precificacaoRepository.buscarParametros();

export const salvarParametrosPrecificacao = (
  salarioDesejado: number,
  horasTrabalhadasMes: number,
  margemLucro: number
) =>
  precificacaoRepository.salvarParametros(
    salarioDesejado,
    horasTrabalhadasMes,
    margemLucro
  );

export const listarCustosFixos = legacyListarCustosFixos;
export const listarCustosVariaveis = legacyListarCustosVariaveis;
export const adicionarCustoFixo = legacyAdicionarCustoFixo;
export const adicionarCustoVariavel = legacyAdicionarCustoVariavel;
export const atualizarCustoFixo = legacyAtualizarCustoFixo;
export const atualizarCustoVariavel = legacyAtualizarCustoVariavel;
export const alterarStatusCustoFixo = legacyAlterarStatusCustoFixo;
export const alterarStatusCustoVariavel = legacyAlterarStatusCustoVariavel;
export const excluirCustoFixo = legacyExcluirCustoFixo;
export const excluirCustoVariavel = legacyExcluirCustoVariavel;

export const calcularCustoIngrediente = (
  precoMedio: number,
  quantidadeEmbalagem: number,
  unidadeProduto: string,
  quantidadeUsada: number,
  unidadeUsada: string
) =>
  produtoVendaController.calculadora.calcularCustoIngrediente(
    precoMedio,
    quantidadeEmbalagem,
    unidadeProduto,
    quantidadeUsada,
    unidadeUsada
  );

export const calcularCustoMaoDeObra = (
  salarioDesejado: number,
  horasMes: number,
  minutosProduto: number
) =>
  produtoVendaController.calculadora.calcularCustoMaoDeObra(
    salarioDesejado,
    horasMes,
    minutosProduto
  );

export const calcularCustoOperacionalRateado = (
  custosFixos: number,
  custosVariaveis: number,
  horasMes: number,
  minutosProduto: number
) =>
  produtoVendaController.calculadora.calcularCustoOperacional(
    custosFixos,
    custosVariaveis,
    horasMes,
    minutosProduto
  );

export const calcularPrecoSugerido = (
  custoTotal: number,
  margemLucro: number
) =>
  produtoVendaController.calculadora.calcularPrecoSugerido(
    custoTotal,
    margemLucro
  );

export const extrairNumeroRendimento = (rendimento: string) =>
  produtoVendaController.calculadora.extrairNumeroRendimento(
    rendimento
  );
