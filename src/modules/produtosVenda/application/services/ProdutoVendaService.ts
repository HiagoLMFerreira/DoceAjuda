import { BusinessRuleError, NotFoundError } from '../../../../core/errors';
import type { SalvarProdutoVendaDTO } from '../../domain/models/ProdutoVenda';
import type { IProdutoVendaRepository } from '../../domain/repositories/IProdutoVendaRepository';
import type { ValidarProdutoVendaService } from './ValidarProdutoVendaService';

export class ProdutoVendaService {
  constructor(
    private readonly repository: IProdutoVendaRepository,
    private readonly validator: ValidarProdutoVendaService
  ) {}

  listar(filtro = '') {
    return this.repository.listar(filtro.trim());
  }

  async buscarDetalhado(id: number) {
    const produto = await this.repository.buscarDetalhado(id);

    if (!produto) {
      throw new NotFoundError('Produto para venda não encontrado.');
    }

    return produto;
  }

  criar(input: SalvarProdutoVendaDTO) {
    return this.repository.criar(
      this.validator.executar(input)
    );
  }

  atualizar(id: number, input: SalvarProdutoVendaDTO) {
    return this.repository.atualizar(
      id,
      this.validator.executar(input)
    );
  }

  async excluir(id: number) {
    if (await this.repository.possuiDocumentosVinculados(id)) {
      throw new BusinessRuleError(
        'Este produto possui orçamentos ou vendas vinculados e não pode ser excluído.'
      );
    }

    await this.repository.excluir(id);
  }
}
