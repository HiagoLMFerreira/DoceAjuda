import { escapeHtml } from '../formatters/html';

export type PdfTableColumn = {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
};

export class PdfDocumentBuilder {
  buildTableDocument(options: {
    title: string;
    subtitle?: string;
    columns: PdfTableColumn[];
    rows: Array<Record<string, unknown>>;
    summaries?: Array<{
      label: string;
      value: string;
      highlight?: boolean;
    }>;
    generatedAt?: string;
  }): string {
    const columns = options.columns
      .map(
        (column) => `
          <th style="text-align:${column.align ?? 'left'}">
            ${escapeHtml(column.title)}
          </th>
        `
      )
      .join('');

    const rows = options.rows
      .map(
        (row) => `
          <tr>
            ${options.columns
              .map(
                (column) => `
                  <td style="text-align:${column.align ?? 'left'}">
                    ${escapeHtml(row[column.key])}
                  </td>
                `
              )
              .join('')}
          </tr>
        `
      )
      .join('');

    const summaries = (options.summaries ?? [])
      .map(
        (summary) => `
          <div class="summary ${summary.highlight ? 'highlight' : ''}">
            <span>${escapeHtml(summary.label)}</span>
            <strong>${escapeHtml(summary.value)}</strong>
          </div>
        `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <style>
            @page { margin: 28px; }
            body {
              font-family: Arial, sans-serif;
              color: #222;
              font-size: 11px;
            }
            h1 {
              font-size: 22px;
              margin: 0 0 5px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18px;
            }
            th {
              background: #111;
              color: #fff;
              padding: 8px;
            }
            td {
              border-bottom: 1px solid #ddd;
              padding: 8px;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              padding: 7px 0;
              border-bottom: 1px solid #ddd;
            }
            .highlight {
              font-size: 13px;
            }
            .footer {
              margin-top: 24px;
              color: #777;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(options.title)}</h1>
          ${
            options.subtitle
              ? `<div class="subtitle">${escapeHtml(options.subtitle)}</div>`
              : ''
          }
          <table>
            <thead><tr>${columns}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
          ${summaries}
          <div class="footer">
            Gerado em ${escapeHtml(options.generatedAt ?? new Date().toLocaleString('pt-BR'))}
          </div>
        </body>
      </html>
    `;
  }
}
