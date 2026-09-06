import { formatDateOnlyBR, formatDecimal } from '../../../core/formatters';
import { PdfDocumentBuilder } from '../../../shared/pdf/PdfDocumentBuilder';
import { pdfService } from '../../../shared/pdf/PdfService';
import type {
  AgendaEncomendaDetalhada,
  AgendaNecessidade,
} from '../domain/models/Agenda';

export class AgendaPdfService {
  private readonly builder = new PdfDocumentBuilder();

  async exportarEncomenda(
    encomenda: AgendaEncomendaDetalhada,
    necessidades: AgendaNecessidade[]
  ): Promise<void> {
    const html = this.criarDocumento({
      titulo: `Necessidades da encomenda #${encomenda.id}`,
      subtitulo: `${encomenda.clienteNome} · ${encomenda.finalidade} · ${formatDateOnlyBR(encomenda.dataEncomenda)}`,
      necessidades,
      quantidadeEncomendas: 1,
    });

    await pdfService.generateAndShare({
      html,
      dialogTitle: `Necessidades da encomenda #${encomenda.id}`,
    });
  }

  async exportarDia(
    data: string,
    quantidadeEncomendas: number,
    necessidades: AgendaNecessidade[]
  ): Promise<void> {
    const dataFormatada = formatDateOnlyBR(data);
    const html = this.criarDocumento({
      titulo: `Necessidades do dia ${dataFormatada}`,
      subtitulo: 'Lista consolidada de ingredientes e embalagens',
      necessidades,
      quantidadeEncomendas,
    });

    await pdfService.generateAndShare({
      html,
      dialogTitle: `Necessidades de ${dataFormatada}`,
    });
  }

  private criarDocumento(options: {
    titulo: string;
    subtitulo: string;
    necessidades: AgendaNecessidade[];
    quantidadeEncomendas: number;
  }): string {
    return this.builder.buildTableDocument({
      title: options.titulo,
      subtitle: options.subtitulo,
      columns: [
        { key: 'produto', title: 'Produto' },
        { key: 'quantidade', title: 'Quantidade necessária', align: 'right' },
      ],
      rows: options.necessidades.map((item) => ({
        produto: item.produtoNome,
        quantidade: `${formatDecimal(item.quantidadeNecessaria)} ${item.unidadeMedida}`,
      })),
      summaries: [
        {
          label: 'Encomendas consideradas',
          value: String(options.quantidadeEncomendas),
        },
        {
          label: 'Insumos diferentes',
          value: String(options.necessidades.length),
          highlight: true,
        },
      ],
      summaryTitle: 'Resumo da produção',
    });
  }
}
