import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../../core/errors';
import type {
  FiltrosCompra,
  NovaCompra,
} from '../../domain/models/Compra';
import type { ICompraRepository } from '../../domain/repositories/ICompraRepository';
import type { ValidarCompraService } from './ValidarCompraService';

export class CompraService {
  constructor(
    private readonly repository: ICompraRepository,
    private readonly validator: ValidarCompraService
  ) {}

  listar(filtros: FiltrosCompra = {}) {
    return this.repository.listar({
      termo: filtros.termo?.trim() ?? '',
      ordenarPor: filtros.ordenarPor ?? 'data_compra',
      direcao: filtros.direcao ?? 'DESC',
    });
  }

  async buscarPorId(id: number) {
    this.validarId(id);

    const compra = await this.repository.buscarPorId(id);

    if (!compra) {
      throw new NotFoundError('Compra não encontrada.');
    }

    return compra;
  }

  cadastrar(input: NovaCompra) {
    return this.repository.cadastrar(
      this.validator.executar(input)
    );
  }

  async cancelar(id: number) {
    this.validarId(id);

    const compra = await this.repository.buscarPorId(id);

    if (!compra) {
      throw new NotFoundError('Compra não encontrada.');
    }

    if (compra.status === 'CANCELADA') {
      throw new BusinessRuleError(
        'Esta compra já está cancelada.'
      );
    }

    await this.repository.cancelar(id);
  }

  async excluir(id: number) {
    this.validarId(id);

    const compra = await this.repository.buscarPorId(id);

    if (!compra) {
      throw new NotFoundError('Compra não encontrada.');
    }

    if (compra.status !== 'CANCELADA') {
      throw new BusinessRuleError(
        'Somente compras canceladas podem ser excluídas.'
      );
    }

    await this.repository.excluir(id);
  }

  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Compra inválida.');
    }
  }
}
