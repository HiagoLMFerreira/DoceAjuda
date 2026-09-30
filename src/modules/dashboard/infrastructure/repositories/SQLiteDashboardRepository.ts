import { getDatabase } from '../../../../core/database/databaseManager';
import type {
  DashboardData,
  DashboardContaReceber,
  DashboardEstoqueCritico,
  DashboardProdutoMaisVendido,
  DashboardVendaDia,
  DashboardVendaRecente,
} from '../../domain/models/Dashboard';
import type { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';

type ResumoRow = {
  vendasHoje: number | null;
  vendasMes: number | null;
  quantidadeVendasHoje: number | null;
  ticketMedioHoje: number | null;
  clientesCadastrados: number | null;
  orcamentosPendentes: number | null;
  produtosEstoqueBaixo: number | null;
  valorContasReceber: number | null;
  quantidadeContasReceber: number | null;
};

type VendaDiaRow = {
  data: string;
  total: number;
};

type VendaRecenteRow = {
  id: number;
  clienteNome: string;
  valorTotal: number;
  formaPagamento: string;
  status: string;
  createdAt: string;
};

type ProdutoMaisVendidoRow = {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valorTotal: number;
};

type EstoqueCriticoRow = {
  id: number;
  nome: string;
  quantidade: number;
  unidadeMedida: string;
};

type DataEncomendaRow = {
  dataEncomenda: string;
};

type ContaReceberRow = DashboardContaReceber & {
  valorPendente: number | null;
};

const DIAS_SEMANA = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
];

function formatarDataSql(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function criarUltimosSeteDias(
  vendas: VendaDiaRow[]
): DashboardVendaDia[] {
  const totaisPorData = new Map(
    vendas.map((item) => [
      item.data,
      Number(item.total) || 0,
    ])
  );

  return Array.from(
    {
      length: 7,
    },
    (_, indice) => {
      const data = new Date();
      data.setHours(0, 0, 0, 0);
      data.setDate(data.getDate() - (6 - indice));

      const dataSql = formatarDataSql(data);

      return {
        data: dataSql,
        rotulo: DIAS_SEMANA[data.getDay()],
        total: totaisPorData.get(dataSql) ?? 0,
      };
    }
  );
}

export class SQLiteDashboardRepository
  implements IDashboardRepository
{
  async carregar(): Promise<DashboardData> {
    const db = await getDatabase();

    const resumo = await db.getFirstAsync<ResumoRow>(`
      SELECT
        (
          SELECT COALESCE(SUM(valor_total), 0)
          FROM documentos_comerciais
          WHERE tipo = 'VENDA'
            AND status = 'CONCLUIDA'
            AND date(created_at, 'localtime') =
                date('now', 'localtime')
        ) AS vendasHoje,
        (
          SELECT COALESCE(SUM(valor_total), 0)
          FROM documentos_comerciais
          WHERE tipo = 'VENDA'
            AND status = 'CONCLUIDA'
            AND strftime('%Y-%m', created_at, 'localtime') =
                strftime('%Y-%m', 'now', 'localtime')
        ) AS vendasMes,
        (
          SELECT COUNT(*)
          FROM documentos_comerciais
          WHERE tipo = 'VENDA'
            AND status = 'CONCLUIDA'
            AND date(created_at, 'localtime') =
                date('now', 'localtime')
        ) AS quantidadeVendasHoje,
        (
          SELECT COALESCE(AVG(valor_total), 0)
          FROM documentos_comerciais
          WHERE tipo = 'VENDA'
            AND status = 'CONCLUIDA'
            AND date(created_at, 'localtime') =
                date('now', 'localtime')
        ) AS ticketMedioHoje,
        (
          SELECT COUNT(*)
          FROM clientes
          WHERE ativo = 1
        ) AS clientesCadastrados,
        (
          SELECT COUNT(*)
          FROM documentos_comerciais
          WHERE tipo = 'ORCAMENTO'
            AND status = 'PENDENTE'
        ) AS orcamentosPendentes,
        (
          SELECT COUNT(*)
          FROM produtos
          WHERE ativo = 1
            AND quantidade_minima > 0
            AND quantidade <= quantidade_minima
        ) AS produtosEstoqueBaixo
        ,(
          SELECT COALESCE(SUM(valor_pendente), 0)
          FROM contas_receber
          WHERE status = 'PENDENTE'
        ) AS valorContasReceber
        ,(
          SELECT COUNT(*)
          FROM contas_receber
          WHERE status = 'PENDENTE'
        ) AS quantidadeContasReceber
    `);

    const vendasSemanaRows =
      await db.getAllAsync<VendaDiaRow>(`
        SELECT
          date(created_at, 'localtime') AS data,
          COALESCE(SUM(valor_total), 0) AS total
        FROM documentos_comerciais
        WHERE tipo = 'VENDA'
          AND status = 'CONCLUIDA'
          AND date(created_at, 'localtime') >=
              date('now', 'localtime', '-6 days')
        GROUP BY date(created_at, 'localtime')
        ORDER BY data ASC
      `);

    const vendasRecentes =
      await db.getAllAsync<VendaRecenteRow>(`
        SELECT
          id,
          cliente_nome AS clienteNome,
          valor_total AS valorTotal,
          forma_pagamento AS formaPagamento,
          status,
          created_at AS createdAt
        FROM documentos_comerciais
        WHERE tipo = 'VENDA'
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT 4
      `);

    const produtosMaisVendidos =
      await db.getAllAsync<ProdutoMaisVendidoRow>(`
        SELECT
          i.produto_venda_id AS produtoId,
          i.produto_nome AS produtoNome,
          COALESCE(SUM(i.quantidade), 0) AS quantidade,
          COALESCE(SUM(i.subtotal), 0) AS valorTotal
        FROM documentos_comerciais_itens i
        INNER JOIN documentos_comerciais d
          ON d.id = i.documento_id
        WHERE d.tipo = 'VENDA'
          AND d.status = 'CONCLUIDA'
        GROUP BY
          i.produto_venda_id,
          i.produto_nome
        ORDER BY quantidade DESC, valorTotal DESC
        LIMIT 4
      `);

    const estoqueCritico =
      await db.getAllAsync<EstoqueCriticoRow>(`
        SELECT
          id,
          CASE
            WHEN TRIM(nome) <> '' THEN nome
            ELSE descricao
          END AS nome,
          quantidade,
          unidade_medida AS unidadeMedida
        FROM produtos
        WHERE ativo = 1
          AND quantidade_minima > 0
          AND quantidade <= quantidade_minima
        ORDER BY quantidade ASC, nome ASC
        LIMIT 4
      `);

    const datasEncomendas =
      await db.getAllAsync<DataEncomendaRow>(`
        SELECT DISTINCT dc.data_encomenda AS dataEncomenda
        FROM documentos_comerciais dc
        WHERE dc.data_encomenda <> ''
          AND dc.status <> 'CANCELADA'
          AND (
            dc.tipo = 'VENDA'
            OR (dc.tipo = 'ORCAMENTO' AND dc.status = 'PENDENTE')
          )
        ORDER BY dc.data_encomenda ASC
      `);

    const contasReceber =
      await db.getAllAsync<ContaReceberRow>(`
        SELECT
          id,
          venda_id AS vendaId,
          cliente_nome AS clienteNome,
          descricao,
          valor_pendente AS valorPendente,
          data_vencimento AS dataVencimento
        FROM contas_receber
        WHERE status = 'PENDENTE'
        ORDER BY
          CASE WHEN data_vencimento = '' THEN 1 ELSE 0 END,
          data_vencimento ASC,
          id ASC
        LIMIT 4
      `);

    return {
      resumo: {
        vendasHoje:
          Number(resumo?.vendasHoje) || 0,
        vendasMes:
          Number(resumo?.vendasMes) || 0,
        quantidadeVendasHoje:
          Number(resumo?.quantidadeVendasHoje) || 0,
        ticketMedioHoje:
          Number(resumo?.ticketMedioHoje) || 0,
        clientesCadastrados:
          Number(resumo?.clientesCadastrados) || 0,
        orcamentosPendentes:
          Number(resumo?.orcamentosPendentes) || 0,
        produtosEstoqueBaixo:
          Number(resumo?.produtosEstoqueBaixo) || 0,
        valorContasReceber:
          Number(resumo?.valorContasReceber) || 0,
        quantidadeContasReceber:
          Number(resumo?.quantidadeContasReceber) || 0,
      },
      vendasSemana:
        criarUltimosSeteDias(vendasSemanaRows),
      vendasRecentes: vendasRecentes.map(
        (item) => ({
          ...item,
          valorTotal: Number(item.valorTotal) || 0,
        })
      ),
      produtosMaisVendidos:
        produtosMaisVendidos.map((item) => ({
          ...item,
          quantidade: Number(item.quantidade) || 0,
          valorTotal: Number(item.valorTotal) || 0,
        })),
      estoqueCritico: estoqueCritico.map(
        (item) => ({
          ...item,
          quantidade: Number(item.quantidade) || 0,
        })
      ),
      datasEncomendas: datasEncomendas.map((item) => item.dataEncomenda),
      contasReceber: contasReceber.map((item) => ({
        ...item,
        valorPendente: Number(item.valorPendente) || 0,
      })),
    };
  }
}
