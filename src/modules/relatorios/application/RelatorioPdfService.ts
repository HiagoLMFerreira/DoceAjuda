import { PdfDocumentBuilder } from '../../../shared/pdf/PdfDocumentBuilder';
import { pdfService } from '../../../shared/pdf/PdfService';
import type { ResultadoRelatorio } from '../domain/models/Relatorio';

export class RelatorioPdfService {
  private readonly builder =
    new PdfDocumentBuilder();

  async gerarECompartilhar(
    resultado: ResultadoRelatorio
  ): Promise<void> {
    const html = this.builder.buildTableDocument({
      title: resultado.titulo,
      subtitle: resultado.periodo,
      columns: resultado.colunas.map((coluna) => ({
        key: coluna.chave,
        title: coluna.titulo,
        align: coluna.alinhamento,
      })),
      rows: resultado.linhas,
      summaries: resultado.resumo.map((resumo) => ({
        label: resumo.rotulo,
        value: resumo.valor,
        highlight: resumo.destaque,
      })),
      generatedAt: resultado.gerado_em,
    });

    await pdfService.generateAndShare({
      html,
      dialogTitle: resultado.titulo,
      fileName: `${resultado.titulo} - ${resultado.periodo}`,
    });
  }
}
