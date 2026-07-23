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
};

export class ValidarProdutoEstoqueService {
  executar(
    produto: CriarProdutoEstoqueDTO | AtualizarProdutoEstoqueDTO
  ): ProdutoValidado {
    const nome = produto.nome.trim();
    const codigoBarras = produto.codigo_barras?.trim() ?? '';
    const unidade = produto.unidade_medida?.trim().toLowerCase();

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

    return {
      nome,
      codigo_barras: codigoBarras,
      unidade_medida: unidade as UnidadeMedidaEstoque,
    };
  }
}
