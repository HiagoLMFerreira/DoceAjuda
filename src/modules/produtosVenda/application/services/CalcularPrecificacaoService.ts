import { ValidationError } from '../../../../core/errors';
import type { ResultadoCustoIngrediente } from '../../domain/models/Precificacao';

const GRAMAS_POR_KG = 1000;
const MILILITROS_POR_LITRO = 1000;

function normalizarUnidade(unidade: string): string {
  return unidade.trim().toLowerCase();
}

function converterParaUnidadeBase(
  quantidade: number,
  unidade: string
): { quantidade: number; familia: 'massa' | 'volume' | 'unidade' | 'outra' } {
  const unidadeNormalizada = normalizarUnidade(unidade);

  switch (unidadeNormalizada) {
    case 'kg':
      return { quantidade: quantidade * GRAMAS_POR_KG, familia: 'massa' };
    case 'g':
      return { quantidade, familia: 'massa' };
    case 'l':
      return { quantidade: quantidade * MILILITROS_POR_LITRO, familia: 'volume' };
    case 'ml':
      return { quantidade, familia: 'volume' };
    case 'un':
      return { quantidade, familia: 'unidade' };
    default:
      return { quantidade, familia: 'outra' };
  }
}

export class CalcularPrecificacaoService {
  calcularCustoIngrediente(
    precoMedio: number,
    quantidadeEmbalagem: number,
    unidadeProduto: string,
    quantidadeUsada: number,
    unidadeUsada: string
  ): ResultadoCustoIngrediente {
    if (precoMedio < 0 || quantidadeEmbalagem <= 0 || quantidadeUsada < 0) {
      return {
        custo: 0,
        unidadeCompativel: false,
        mensagem: 'Os valores do ingrediente são inválidos.',
      };
    }

    const produto = converterParaUnidadeBase(
      quantidadeEmbalagem,
      unidadeProduto
    );
    const uso = converterParaUnidadeBase(
      quantidadeUsada,
      unidadeUsada
    );

    if (
      produto.familia === 'outra' ||
      uso.familia === 'outra' ||
      produto.familia !== uso.familia
    ) {
      return {
        custo: 0,
        unidadeCompativel: false,
        mensagem: 'As unidades de medida não são compatíveis.',
      };
    }

    return {
      custo:
        produto.quantidade > 0
          ? (precoMedio / produto.quantidade) * uso.quantidade
          : 0,
      unidadeCompativel: true,
    };
  }

  calcularCustoMaoDeObra(
    salarioDesejado: number,
    horasMes: number,
    minutosProduto: number
  ): number {
    if (salarioDesejado < 0 || horasMes <= 0 || minutosProduto < 0) {
      return 0;
    }

    const valorHora = salarioDesejado / horasMes;
    return valorHora * (minutosProduto / 60);
  }

  calcularCustoOperacional(
    custosFixos: number,
    custosVariaveis: number,
    horasMes: number,
    minutosProduto: number
  ): number {
    if (horasMes <= 0 || minutosProduto < 0) {
      return 0;
    }

    return (
      ((Math.max(0, custosFixos) + Math.max(0, custosVariaveis)) /
        horasMes) *
      (minutosProduto / 60)
    );
  }

  calcularPrecoSugerido(
    custoTotal: number,
    margemLucro: number
  ): number {
    if (custoTotal < 0) {
      throw new ValidationError('O custo total não pode ser negativo.');
    }

    if (margemLucro < 0 || margemLucro >= 100) {
      throw new ValidationError(
        'A margem de lucro deve estar entre 0% e 99,99%.'
      );
    }

    return custoTotal / (1 - margemLucro / 100);
  }

  extrairNumeroRendimento(rendimento: string): number {
    const encontrado = rendimento
      .replace(',', '.')
      .match(/\d+(\.\d+)?/);

    return encontrado ? Number(encontrado[0]) : 0;
  }
}
