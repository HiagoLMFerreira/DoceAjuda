import { relatorioPdfService } from '../modules/relatorios/di/relatoriosContainer';
import type { ResultadoRelatorio } from '../modules/relatorios/domain/models/Relatorio';

export const gerarECompartilharPdfRelatorio = (
  resultado: ResultadoRelatorio
) => relatorioPdfService.gerarECompartilhar(resultado);
