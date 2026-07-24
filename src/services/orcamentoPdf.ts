import type { DocumentoComercialDetalhado } from "../core/database/databaseManager";
import { escapeHtml } from '../shared/formatters/html';
import { pdfService } from '../shared/pdf/PdfService';

function formatCurrency(value: number): string {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export async function compartilharPdfOrcamento(
  orcamento: DocumentoComercialDetalhado
): Promise<void> {
  const rows = orcamento.itens
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.produto_nome)}</td>
          <td style="text-align:center">${escapeHtml(item.quantidade)}</td>
          <td style="text-align:right">${escapeHtml(formatCurrency(item.valor_unitario))}</td>
          <td style="text-align:right">${escapeHtml(formatCurrency(item.subtotal))}</td>
        </tr>
      `
    )
    .join('');

  const html = `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 28px; }
        body { font-family: Arial, sans-serif; color: #222; font-size: 12px; }
        h1 { margin: 0 0 6px; font-size: 23px; }
        .meta { color: #555; margin-bottom: 18px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #111; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .total { margin-top: 16px; text-align: right; font-size: 16px; font-weight: bold; }
        .obs { margin-top: 18px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>Orçamento #${escapeHtml(orcamento.id)}</h1>
      <div class="meta">
        <strong>Cliente:</strong> ${escapeHtml(orcamento.cliente_nome)}<br />
        <strong>Telefone:</strong> ${escapeHtml(orcamento.cliente_telefone || '-')}<br />
        <strong>Validade:</strong> ${escapeHtml(orcamento.data_validade || '-')}<br />
        <strong>Status:</strong> ${escapeHtml(orcamento.status)}
      </div>
      <table>
        <thead>
          <tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: ${escapeHtml(formatCurrency(orcamento.valor_total))}</div>
      ${orcamento.observacoes ? `<div class="obs"><strong>Observações:</strong><br />${escapeHtml(orcamento.observacoes)}</div>` : ''}
    </body>
  </html>`;

  await pdfService.generateAndShare({
    html,
    dialogTitle: `Orçamento #${orcamento.id}`,
  });
}
