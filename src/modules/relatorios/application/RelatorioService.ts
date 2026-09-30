import { ValidationError } from '../../../core/errors';
import type {
  FiltrosRelatorio,
  TipoRelatorio,
} from '../domain/models/Relatorio';
import type { IRelatorioRepository } from '../domain/repositories/IRelatorioRepository';

export class RelatorioService {
  constructor(
    private readonly repository: IRelatorioRepository
  ) {}

  gerar(filtros: FiltrosRelatorio) {
    this.validate(filtros);
    return this.repository.gerar(filtros);
  }

  listarFormasPagamento() {
    return this.repository.listarFormasPagamento();
  }

  private validate(filtros: FiltrosRelatorio) {
    const tipos: TipoRelatorio[] = [
      'VENDAS',
      'COMPRAS',
      'ESTOQUE',
      'CLIENTES',
    ];

    if (!tipos.includes(filtros.tipo)) {
      throw new ValidationError(
        'Selecione um tipo de relatório válido.'
      );
    }

    if (
      filtros.tipo === 'VENDAS' ||
      filtros.tipo === 'COMPRAS'
    ) {
      if (
        !filtros.data_inicial ||
        !filtros.data_final
      ) {
        throw new ValidationError(
          'Informe o período do relatório.'
        );
      }

      if (
        filtros.data_inicial >
        filtros.data_final
      ) {
        throw new ValidationError(
          'A data inicial não pode ser posterior à data final.'
        );
      }
    }
  }
}
