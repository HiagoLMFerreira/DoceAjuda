import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  DocumentoComercialDetalhado,
  formatarMoeda,
} from "../database/database";

function escaparHtml(valor: string | number | null | undefined): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarDataPdf(data: string): string {
  if (!data) return "-";

  const normalizada = data.includes("T") ? data : data.replace(" ", "T");
  const objetoData = new Date(normalizada);

  if (Number.isNaN(objetoData.getTime())) {
    return escaparHtml(data);
  }

  return objetoData.toLocaleDateString("pt-BR");
}

function formatarQuantidadePdf(valor: number): string {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function criarHtmlOrcamento(orcamento: DocumentoComercialDetalhado): string {
  const linhasItens = orcamento.itens
    .map(
      (item) => `
        <tr>
          <td class="produto">${escaparHtml(item.produto_nome)}</td>
          <td class="numero">${formatarQuantidadePdf(item.quantidade)}</td>
          <td class="numero">${escaparHtml(formatarMoeda(item.valor_unitario))}</td>
          <td class="numero destaque">${escaparHtml(formatarMoeda(item.subtotal))}</td>
        </tr>
      `,
    )
    .join("");

  const telefone = orcamento.cliente_telefone?.trim() || "-";
  const endereco = orcamento.cliente_endereco?.trim() || "-";
  const validade = orcamento.data_validade?.trim() || "-";
  const observacoes = orcamento.observacoes?.trim();

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    <style>
      @page {
        size: A4;
        margin: 18mm 15mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #171717;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        background: #ffffff;
      }

      .cabecalho {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 3px solid #111111;
        padding-bottom: 14px;
        margin-bottom: 18px;
      }

      .marca {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.4px;
      }

      .submarca {
        margin-top: 2px;
        color: #666666;
        font-size: 11px;
      }

      .documento {
        text-align: right;
      }

      .documento-titulo {
        font-size: 22px;
        font-weight: 800;
      }

      .documento-id {
        margin-top: 3px;
        color: #555555;
        font-weight: 700;
      }

      .grade-dados {
        display: grid;
        grid-template-columns: 1.35fr 0.65fr;
        gap: 12px;
        margin-bottom: 18px;
      }

      .card {
        border: 1px solid #dddddd;
        border-radius: 10px;
        padding: 13px;
        break-inside: avoid;
      }

      .card-titulo {
        margin-bottom: 8px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: #666666;
      }

      .linha-dado {
        margin-top: 4px;
      }

      .rotulo {
        color: #666666;
        font-weight: 700;
      }

      .valor {
        font-weight: 700;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 6px;
      }

      thead {
        display: table-header-group;
      }

      th {
        padding: 10px 8px;
        background: #eeeeee;
        border-bottom: 2px solid #bdbdbd;
        font-size: 10px;
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      td {
        padding: 11px 8px;
        border-bottom: 1px solid #e5e5e5;
        vertical-align: top;
      }

      tr {
        break-inside: avoid;
      }

      .produto {
        width: 45%;
        font-weight: 700;
      }

      .numero {
        text-align: right;
        white-space: nowrap;
      }

      .destaque {
        font-weight: 800;
      }

      .resumo {
        width: 48%;
        margin-top: 18px;
        margin-left: auto;
        break-inside: avoid;
      }

      .total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-radius: 10px;
        background: #111111;
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
      }

      .observacoes {
        margin-top: 18px;
        padding: 13px;
        border-radius: 10px;
        background: #f4f4f4;
        break-inside: avoid;
      }

      .observacoes-titulo {
        margin-bottom: 5px;
        font-weight: 800;
      }

      .rodape {
        margin-top: 24px;
        padding-top: 10px;
        border-top: 1px solid #dddddd;
        color: #777777;
        font-size: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="cabecalho">
      <div>
        <div class="marca">DoceAjuda</div>
        <div class="submarca">Orçamento comercial</div>
      </div>

      <div class="documento">
        <div class="documento-titulo">ORÇAMENTO</div>
        <div class="documento-id">Nº ${escaparHtml(orcamento.id)}</div>
      </div>
    </header>

    <section class="grade-dados">
      <div class="card">
        <div class="card-titulo">Dados do cliente</div>
        <div class="linha-dado">
          <span class="rotulo">Nome:</span>
          <span class="valor">${escaparHtml(orcamento.cliente_nome)}</span>
        </div>
        <div class="linha-dado">
          <span class="rotulo">Telefone:</span>
          <span class="valor">${escaparHtml(telefone)}</span>
        </div>
        <div class="linha-dado">
          <span class="rotulo">Endereço:</span>
          <span class="valor">${escaparHtml(endereco)}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-titulo">Informações</div>
        <div class="linha-dado">
          <span class="rotulo">Data:</span>
          <span class="valor">${formatarDataPdf(orcamento.created_at)}</span>
        </div>
        <div class="linha-dado">
          <span class="rotulo">Validade:</span>
          <span class="valor">${escaparHtml(validade)}</span>
        </div>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="numero">Quantidade</th>
          <th class="numero">Valor unitário</th>
          <th class="numero">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${linhasItens}
      </tbody>
    </table>

    <section class="resumo">
      <div class="total">
        <span>VALOR TOTAL</span>
        <span>${escaparHtml(formatarMoeda(orcamento.valor_total))}</span>
      </div>
    </section>

    ${
      observacoes
        ? `
          <section class="observacoes">
            <div class="observacoes-titulo">Observações</div>
            <div>${escaparHtml(observacoes).replace(/\n/g, "<br />")}</div>
          </section>
        `
        : ""
    }

    <footer class="rodape">
      Documento gerado pelo DoceAjuda.
    </footer>
  </body>
</html>`;
}

export async function gerarPdfOrcamento(
  orcamento: DocumentoComercialDetalhado,
): Promise<string> {
  const html = criarHtmlOrcamento(orcamento);
  const resultado = await Print.printToFileAsync({
    html,
    width: 595,
    height: 842,
  });

  return resultado.uri;
}

export async function compartilharPdfOrcamento(
  orcamento: DocumentoComercialDetalhado,
): Promise<void> {
  const compartilhamentoDisponivel = await Sharing.isAvailableAsync();

  if (!compartilhamentoDisponivel) {
    throw new Error(
      "O compartilhamento de arquivos não está disponível neste dispositivo.",
    );
  }

  const uri = await gerarPdfOrcamento(orcamento);

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: `Compartilhar orçamento #${orcamento.id}`,
  });
}
