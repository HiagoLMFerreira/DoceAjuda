import { gerarRelatorio, listarFormasPagamentoRelatorio } from "./database/relatoriosDatabase";
import type {
  FiltrosRelatorio,
  ResultadoRelatorio,
} from '../domain/models/Relatorio';
import type { IRelatorioRepository } from '../domain/repositories/IRelatorioRepository';

export class SQLiteRelatorioRepository
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
