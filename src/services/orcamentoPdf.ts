import type { DocumentoComercialDetalhado } from '../core/database/databaseManager';
import {
  formatCurrency,
  formatDateOnlyBR,
  formatDecimal,
} from '../core/formatters';
import { PdfDocumentBuilder } from '../shared/pdf/PdfDocumentBuilder';
import { pdfService } from '../shared/pdf/PdfService';

const pdfBuilder = new PdfDocumentBuilder();

function formatarStatus(status: DocumentoComercialDetalhado['status']): string {
  const rotulos = {
    PENDENTE: 'Pendente',
    CONVERTIDO: 'Convertido em venda',
    CONCLUIDA: 'Concluído',
    CANCELADA: 'Cancelado',
  } as const;

  return rotulos[status];
}

export async function compartilharPdfOrcamento(
  orcamento: DocumentoComercialDetalhado
): Promise<void> {
  const html = pdfBuilder.buildTableDocument({
    title: `Orçamento #${orcamento.id}`,
    subtitle: 'Proposta comercial',
    metadata: [
      { label: 'Cliente', value: orcamento.cliente_nome },
      { label: 'Telefone', value: orcamento.cliente_telefone || 'Não informado' },
      { label: 'Endereço', value: orcamento.cliente_endereco || 'Não informado' },
      { label: 'Finalidade', value: orcamento.finalidade || 'Não informada' },
      { label: 'Data da encomenda', value: formatDateOnlyBR(orcamento.data_encomenda) },
      { label: 'Validade', value: orcamento.data_validade || 'Não informada' },
      { label: 'Status', value: formatarStatus(orcamento.status) },
    ],
    columns: [
      { key: 'produto', title: 'Produto' },
      { key: 'quantidade', title: 'Qtd.', align: 'center' },
      { key: 'unitario', title: 'Valor unitário', align: 'right' },
      { key: 'subtotal', title: 'Subtotal', align: 'right' },
    ],
    rows: orcamento.itens.map((item) => ({
      produto: item.produto_nome,
      quantidade: formatDecimal(item.quantidade),
      unitario: formatCurrency(item.valor_unitario),
      subtotal: formatCurrency(item.subtotal),
    })),
    summaries: [
      {
        label: 'Produtos diferentes',
        value: String(orcamento.itens.length),
      },
      {
        label: 'Quantidade total',
        value: formatDecimal(
          orcamento.itens.reduce((total, item) => total + Number(item.quantidade || 0), 0)
        ),
      },
      {
        label: 'Valor total',
        value: formatCurrency(orcamento.valor_total),
        highlight: true,
      },
    ],
    summaryTitle: 'Resumo do orçamento',
    notes: orcamento.observacoes
      ? { title: 'Observações', text: orcamento.observacoes }
      : undefined,
  });

  await pdfService.generateAndShare({
    html,
    dialogTitle: `Orçamento #${orcamento.id}`,
    fileName: `Orçamento ${orcamento.id} - ${orcamento.cliente_nome}`,
  });
}
