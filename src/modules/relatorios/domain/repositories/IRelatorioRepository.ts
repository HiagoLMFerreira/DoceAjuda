import type {
  FiltrosRelatorio,
  ResultadoRelatorio,
} from '../models/Relatorio';

export interface IRelatorioRepository {
  gerar(
    filtros: FiltrosRelatorio
  ): Promise<ResultadoRelatorio>;

  listarFormasPagamento(): Promise<string[]>;
}
