import { ValidationError } from '../../../../core/errors';
import type {
  AtualizarProdutoEstoqueDTO,
  CriarProdutoEstoqueDTO,
  UnidadeMedidaEstoque,
} from '../../domain/models/ProdutoEstoque';
import { UNIDADES_MEDIDA_ESTOQUE } from '../../domain/models/ProdutoEstoque';

type ProdutoValidado = {
  nome: string;
  codigo_barras: string;
  unidade_medida: UnidadeMedidaEstoque;
  quantidade_minima: number;
};

export class ValidarProdutoEstoqueService {
  executar(
    produto: CriarProdutoEstoqueDTO | AtualizarProdutoEstoqueDTO
  ): ProdutoValidado {
    const nome = produto.nome.trim();
    const codigoBarras = produto.codigo_barras?.trim() ?? '';
    const unidade = produto.unidade_medida?.trim().toLowerCase();
    const quantidadeMinima = Number(produto.quantidade_minima ?? 0);

    if (!nome) {
      throw new ValidationError('Informe o nome do produto.');
    }

    if (
      !UNIDADES_MEDIDA_ESTOQUE.includes(
        unidade as UnidadeMedidaEstoque
      )
    ) {
      throw new ValidationError(
        'Selecione uma unidade de medida válida.'
      );
    }

    if (!Number.isFinite(quantidadeMinima) || quantidadeMinima < 0) {
      throw new ValidationError('Informe uma quantidade mínima válida.');
    }

    return {
      nome,
      codigo_barras: codigoBarras,
      unidade_medida: unidade as UnidadeMedidaEstoque,
      quantidade_minima: quantidadeMinima,
    };
  }
}
