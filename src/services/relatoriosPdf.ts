import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ResultadoRelatorio } from '../types/relatorios';

function escaparHtml(valor: string | number): string {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function montarHtmlRelatorio(resultado: ResultadoRelatorio): string {
  const resumo = resultado.resumo
    .map(
      (item) => `
        <div class="resumo-item ${item.destaque ? 'destaque' : ''}">
          <span>${escaparHtml(item.rotulo)}</span>
          <strong>${escaparHtml(item.valor)}</strong>
        </div>
      `,
    )
    .join('');

  const cabecalho = resultado.colunas
    .map((coluna) => `<th>${escaparHtml(coluna.titulo)}</th>`)
    .join('');

  const linhas = resultado.linhas
    .map(
      (linha) => `
        <tr>
          ${resultado.colunas
            .map(
              (coluna) =>
                `<td>${escaparHtml(linha[coluna.chave] ?? '')}</td>`,
            )
            .join('')}
        </tr>
      `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <style>
          @page { margin: 24px; }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
          }
          .cabecalho {
            border-bottom: 3px solid #1a1a1a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .marca {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #555;
          }
          h1 {
            font-size: 23px;
            margin: 6px 0 0;
          }
          .periodo, .gerado-em {
            color: #666;
            font-size: 11px;
            margin-top: 5px;
          }
          .resumo {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 18px;
          }
          .resumo-item {
            min-width: 150px;
            border: 1px solid #d7d7d7;
            border-radius: 8px;
            padding: 9px 11px;
          }
          .resumo-item span {
            display: block;
            color: #666;
            font-size: 10px;
            margin-bottom: 4px;
          }
          .resumo-item strong {
            font-size: 14px;
          }
          .resumo-item.destaque {
            color: #fff;
            background: #1a1a1a;
            border-color: #1a1a1a;
          }
          .resumo-item.destaque span { color: #ddd; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          th {
            background: #d1d1d1;
            text-align: left;
            padding: 8px 6px;
            border: 1px solid #bdbdbd;
          }
          td {
            padding: 7px 6px;
            border: 1px solid #dedede;
            vertical-align: top;
          }
          tr:nth-child(even) td { background: #f6f6f6; }
          .rodape {
            margin-top: 14px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            color: #777;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <div class="marca">DOCE AJUDA</div>
          <h1>${escaparHtml(resultado.titulo)}</h1>
          ${
            resultado.periodo
              ? `<div class="periodo">${escaparHtml(resultado.periodo)}</div>`
              : ''
          }
          <div class="gerado-em">Gerado em ${escaparHtml(
            resultado.gerado_em,
          )}</div>
        </div>

        <div class="resumo">${resumo}</div>

        <table>
          <thead><tr>${cabecalho}</tr></thead>
          <tbody>${linhas}</tbody>
        </table>

        <div class="rodape">
          Documento gerado pelo aplicativo Doce Ajuda.
        </div>
      </body>
    </html>
  `;
}

export async function gerarECompartilharPdfRelatorio(
  resultado: ResultadoRelatorio,
): Promise<void> {
  if (!resultado.linhas.length) {
    throw new Error('Não existem resultados para gerar o PDF.');
  }

  const compartilhamentoDisponivel = await Sharing.isAvailableAsync();

  if (!compartilhamentoDisponivel) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  const html = montarHtmlRelatorio(resultado);
  const arquivo = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(arquivo.uri, {
    mimeType: 'application/pdf',
    UTI: '.pdf',
    dialogTitle: `Compartilhar ${resultado.titulo}`,
  });
}
