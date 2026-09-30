import { ValidationError } from '../../../../core/errors';
import type { NovaCompra } from '../../domain/models/Compra';

export class ValidarCompraService {
  executar(input: NovaCompra): NovaCompra {
    if (!input.itens.length) {
      throw new ValidationError(
        'Adicione pelo menos um item.'
      );
    }

    const produtos = new Set<number>();

    const itens = input.itens.map((item) => {
      if (
        !Number.isInteger(item.produto_id) ||
        item.produto_id <= 0
      ) {
        throw new ValidationError('Selecione um produto válido.');
      }

      if (produtos.has(item.produto_id)) {
        throw new ValidationError(
          'O mesmo produto foi adicionado mais de uma vez. Edite o item existente.'
        );
      }

      if (
        !Number.isFinite(item.quantidade_embalagens) ||
        item.quantidade_embalagens <= 0
      ) {
        throw new ValidationError(
          'A quantidade de embalagens deve ser maior que zero.'
        );
      }

      if (
        !Number.isFinite(item.quantidade_por_embalagem) ||
        item.quantidade_por_embalagem <= 0
      ) {
        throw new ValidationError(
          'O conteúdo por embalagem deve ser maior que zero.'
        );
      }

      if (
        !Number.isFinite(item.valor_unitario) ||
        item.valor_unitario < 0
      ) {
        throw new ValidationError(
          'O valor unitário da embalagem não pode ser negativo.'
        );
      }

      produtos.add(item.produto_id);

      return {
        ...item,
        unidade_conteudo: item.unidade_conteudo.trim().toLowerCase(),
      };
    });

    return {
      data_compra: input.data_compra?.trim(),
      observacoes: input.observacoes?.trim() ?? '',
      itens,
    };
  }
}
