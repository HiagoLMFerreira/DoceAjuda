import { ValidationError } from '../../../../core/errors';
import { UNIDADES_RECEITA, type SalvarReceitaDTO, type UnidadeReceita } from '../../domain/models/Receita';

export class ValidarReceitaService {
  executar(input: SalvarReceitaDTO): SalvarReceitaDTO {
    const nome = input.nome.trim();
    const rendimento = input.rendimento.trim();
    const modoPreparo = input.modo_preparo.trim();

    if (!nome) throw new ValidationError('Informe o nome da receita.');
    if (!rendimento) throw new ValidationError('Informe o rendimento da receita.');
    if (!input.itens.length) {
      throw new ValidationError('Adicione pelo menos um produto à receita.');
    }

    const ids = new Set<number>();
    const itens = input.itens.map((item) => {
      if (!Number.isInteger(item.produto_id) || item.produto_id <= 0) {
        throw new ValidationError('Produto inválido.');
      }
      if (ids.has(item.produto_id)) {
        throw new ValidationError('Esse produto já foi adicionado. Edite o item existente.');
      }
      ids.add(item.produto_id);

      if (!Number.isFinite(item.quantidade_numero) || item.quantidade_numero <= 0) {
        throw new ValidationError('Informe uma quantidade válida.');
      }

      const unidade = item.unidade_medida.trim().toLowerCase() as UnidadeReceita;
      if (!UNIDADES_RECEITA.includes(unidade)) {
        throw new ValidationError('Selecione uma unidade de medida válida.');
      }

      return {
        produto_id: item.produto_id,
        quantidade_numero: item.quantidade_numero,
        unidade_medida: unidade,
        quantidade_usada: `${item.quantidade_numero} ${unidade}`,
      };
    });

    return { nome, rendimento, modo_preparo: modoPreparo, itens };
  }
}
