import { ValidationError } from '../../../../core/errors';
import type { SalvarProdutoVendaDTO } from '../../domain/models/ProdutoVenda';

export class ValidarProdutoVendaService {
  executar(input: SalvarProdutoVendaDTO): SalvarProdutoVendaDTO {
    const nome = input.nome.trim();

    if (!nome) {
      throw new ValidationError('Informe o nome do produto.');
    }

    if (
      !Number.isFinite(input.tempo_producao_minutos) ||
      input.tempo_producao_minutos < 0
    ) {
      throw new ValidationError(
        'Informe um tempo de produção válido.'
      );
    }

    if (
      !Number.isFinite(input.preco_venda) ||
      input.preco_venda <= 0
    ) {
      throw new ValidationError(
        'Informe um preço de venda válido.'
      );
    }

    if (
      input.receitas.length === 0 &&
      input.itens.length === 0
    ) {
      throw new ValidationError(
        'Adicione ao menos uma receita ou item ao produto.'
      );
    }

    return {
      ...input,
      nome,
      descricao: input.descricao?.trim() ?? '',
    };
  }
}
