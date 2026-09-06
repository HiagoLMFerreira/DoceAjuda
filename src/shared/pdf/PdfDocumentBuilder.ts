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
          <div class="summary-card ${summary.highlight ? 'highlight' : ''}">
            <span class="summary-label">${escapeHtml(summary.label)}</span>
            <strong class="summary-value">${escapeHtml(summary.value)}</strong>
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
            @page {
              size: A4;
              margin: 32px 32px 48px;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #242329;
              font-size: 11px;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .top-line {
              height: 5px;
              margin-bottom: 22px;
              border-radius: 999px;
              background: #ff3b73;
            }
            .brand-row {
              display: table;
              width: 100%;
              margin-bottom: 22px;
            }
            .brand-main,
            .document-label {
              display: table-cell;
              vertical-align: middle;
            }
            .brand-main {
              width: 70%;
            }
            .brand-mark {
              display: inline-block;
              width: 38px;
              height: 38px;
              margin-right: 10px;
              border-radius: 50%;
              background: #fff0f4;
              color: #ff3b73;
              font-size: 14px;
              font-weight: 900;
              line-height: 38px;
              text-align: center;
              vertical-align: middle;
            }
            .brand-copy {
              display: inline-block;
              vertical-align: middle;
            }
            .brand-name {
              color: #242329;
              font-size: 15px;
              font-weight: 900;
            }
            .brand-tagline {
              margin-top: 2px;
              color: #8a8589;
              font-size: 9px;
            }
            .document-label {
              color: #bd3159;
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 1px;
              text-align: right;
              text-transform: uppercase;
            }
            .report-heading {
              margin-bottom: 18px;
              padding: 18px 20px;
              border: 1px solid #f1e7ea;
              border-radius: 14px;
              background: #fffafb;
            }
            h1 {
              margin: 0;
              color: #242329;
              font-size: 24px;
              font-weight: 900;
              line-height: 1.15;
            }
            .subtitle-row {
              display: table;
              width: 100%;
              margin-top: 8px;
              color: #737178;
            }
            .subtitle,
            .record-count {
              display: table-cell;
              vertical-align: middle;
            }
            .record-count {
              color: #d12e60;
              font-weight: 700;
              text-align: right;
            }
            .section-title {
              margin: 0 0 9px;
              color: #514e52;
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 0.9px;
              text-transform: uppercase;
            }
            .summaries {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              margin-bottom: 20px;
            }
            .summary-card {
              min-height: 60px;
              padding: 11px 12px;
              border: 1px solid #f1e7ea;
              border-radius: 10px;
              background: #fffdfE;
            }
            .summary-card.highlight {
              border-color: #ffd1dd;
              background: #fff0f4;
            }
            .summary-label {
              display: block;
              margin-bottom: 6px;
              color: #737178;
              font-size: 8px;
              font-weight: 700;
            }
            .summary-value {
              display: block;
              color: #242329;
              font-size: 14px;
              font-weight: 900;
              line-height: 1.15;
            }
            .summary-card.highlight .summary-label {
              color: #b9345a;
            }
            .summary-card.highlight .summary-value {
              color: #d12e60;
              font-size: 16px;
            }
            table {
              width: 100%;
              overflow: hidden;
              border-collapse: collapse;
              border: 1px solid #f1e7ea;
              border-radius: 10px;
              page-break-inside: auto;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th {
              padding: 10px 9px;
              border-right: 1px solid rgba(255, 255, 255, 0.18);
              background: #ff3b73;
              color: #ffffff;
              font-size: 8px;
              font-weight: 900;
              letter-spacing: 0.25px;
              text-transform: uppercase;
            }
            td {
              padding: 9px;
              border-bottom: 1px solid #f3ebed;
              color: #514e52;
              font-size: 9px;
              line-height: 1.35;
            }
            tbody tr:nth-child(even) td {
              background: #fff9fa;
            }
            tbody tr:last-child td {
              border-bottom: 0;
            }
            .footer {
              display: table;
              width: 100%;
              margin-top: 22px;
              padding-top: 8px;
              border-top: 1px solid #f1e7ea;
              color: #8a8589;
              font-size: 8px;
            }
            .footer-brand,
            .footer-date {
              display: table-cell;
            }
            .footer-brand {
              color: #bd3159;
              font-weight: 800;
            }
            .footer-date {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="top-line"></div>
          <div class="brand-row">
            <div class="brand-main">
              <span class="brand-mark">DA</span>
              <div class="brand-copy">
                <div class="brand-name">DoceAjuda</div>
                <div class="brand-tagline">Gestão simples para o seu negócio</div>
              </div>
            </div>
            <div class="document-label">Relatório gerencial</div>
          </div>
          <div class="report-heading">
            <h1>${escapeHtml(options.title)}</h1>
            <div class="subtitle-row">
              <div class="subtitle">${escapeHtml(options.subtitle ?? 'Visão consolidada')}</div>
              <div class="record-count">
                ${options.rows.length} ${options.rows.length === 1 ? 'registro' : 'registros'}
              </div>
            </div>
          </div>
          ${summaries ? `<div class="section-title">Resumo do período</div><div class="summaries">${summaries}</div>` : ''}
          <div class="section-title">Detalhamento</div>
          <table>
            <thead><tr>${columns}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">
            <span class="footer-brand">DoceAjuda · Relatório gerencial</span>
            <span class="footer-date">Gerado em ${escapeHtml(options.generatedAt ?? new Date().toLocaleString('pt-BR'))}</span>
          </div>
        </body>
      </html>
    `;
  }
}
