import {
  gerarRelatorio,
  listarFormasPagamentoRelatorio,
} from '../../../database/database';
import type {
  FiltrosRelatorio,
  ResultadoRelatorio,
} from '../domain/models/Relatorio';
import type { IRelatorioRepository } from '../domain/repositories/IRelatorioRepository';

export class LegacyRelatorioRepository
  implements IRelatorioRepository
{
  gerar(
    filtros: FiltrosRelatorio
  ): Promise<ResultadoRelatorio> {
    return gerarRelatorio(filtros);
  }

  listarFormasPagamento(): Promise<string[]> {
    return listarFormasPagamentoRelatorio();
  }
}
