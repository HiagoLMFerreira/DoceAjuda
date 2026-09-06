import { getDatabase } from '../../../../core/database/databaseManager';
import {
  buscarDocumentoComercialPorId,
  calcularNecessidadesDocumentosComerciais,
} from '../../../documentosComerciais/infrastructure/database/documentosComerciaisDatabase';
import type {
  AgendaEncomenda,
  AgendaEncomendaDetalhada,
  AgendaFiltros,
  AgendaNecessidade,
} from '../../domain/models/Agenda';
import type { IAgendaRepository } from '../../domain/repositories/IAgendaRepository';

type AgendaRow = AgendaEncomenda & {
  valorTotal: number | null;
  sinalPagamento: number | null;
};

type ContaReceberRow = {
  valor_original: number | null;
  valor_pendente: number | null;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
};

type DocumentoIdRow = { id: number };

const CONDICAO_ENCOMENDA_ATIVA = `
  dc.data_encomenda <> ''
  AND dc.status <> 'CANCELADA'
  AND (
    dc.tipo = 'VENDA'
    OR (dc.tipo = 'ORCAMENTO' AND dc.status = 'PENDENTE')
  )
`;

function mapearNecessidades(
  necessidades: Awaited<ReturnType<typeof calcularNecessidadesDocumentosComerciais>>
): AgendaNecessidade[] {
  return necessidades.map((item) => ({
    produtoId: item.produto_id,
    produtoNome: item.produto_nome,
    quantidadeNecessaria: item.quantidade_necessaria,
    quantidadeEstoque: item.quantidade_estoque,
    quantidadeFaltante: item.quantidade_faltante,
    unidadeMedida: item.unidade_medida,
    estoqueSuficiente: item.estoque_suficiente,
  }));
}

export class SQLiteAgendaRepository implements IAgendaRepository {
  async listar(filtros: AgendaFiltros = {}): Promise<AgendaEncomenda[]> {
    const database = await getDatabase();
    const conditions = [`(${CONDICAO_ENCOMENDA_ATIVA})`];
    const parameters: string[] = [];

    if (filtros.dataInicio) {
      conditions.push('dc.data_encomenda >= ?');
      parameters.push(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      conditions.push('dc.data_encomenda <= ?');
      parameters.push(filtros.dataFim);
    }

    const rows = await database.getAllAsync<AgendaRow>(`
      SELECT
        dc.id,
        dc.tipo,
        dc.cliente_id AS clienteId,
        dc.cliente_nome AS clienteNome,
        dc.data_encomenda AS dataEncomenda,
        dc.finalidade,
        dc.status,
        dc.valor_total AS valorTotal,
        dc.sinal_pagamento AS sinalPagamento
      FROM documentos_comerciais dc
      WHERE ${conditions.join(' AND ')}
      ORDER BY dc.data_encomenda ASC, dc.cliente_nome COLLATE NOCASE ASC, dc.id ASC
    `, parameters);

    return rows.map((item) => ({
      ...item,
      valorTotal: Number(item.valorTotal) || 0,
      sinalPagamento: Number(item.sinalPagamento) || 0,
    }));
  }

  async buscarDetalhes(id: number): Promise<AgendaEncomendaDetalhada | null> {
    const documento = await buscarDocumentoComercialPorId(id);
    if (!documento || !documento.data_encomenda) return null;

    const database = await getDatabase();
    const conta = documento.tipo === 'VENDA'
      ? await database.getFirstAsync<ContaReceberRow>(`
          SELECT valor_original, valor_pendente, status
          FROM contas_receber
          WHERE venda_id = ?
          LIMIT 1
        `, [id])
      : null;

    const valorTotal = Number(documento.valor_total) || 0;
    const valorReceber = documento.tipo === 'ORCAMENTO'
      ? valorTotal
      : conta?.status === 'PENDENTE'
        ? Number(conta.valor_pendente) || 0
        : 0;
    const valorPago = documento.tipo === 'ORCAMENTO'
      ? 0
      : conta?.status === 'PAGO'
        ? Number(conta.valor_original) || valorTotal
        : Math.max(0, valorTotal - valorReceber);

    return {
      id: documento.id,
      tipo: documento.tipo,
      clienteId: documento.cliente_id,
      clienteNome: documento.cliente_nome,
      clienteTelefone: documento.cliente_telefone ?? '',
      clienteEndereco: documento.cliente_endereco ?? '',
      dataEncomenda: documento.data_encomenda,
      finalidade: documento.finalidade,
      status: documento.status,
      valorTotal,
      sinalPagamento: Number(documento.sinal_pagamento) || 0,
      valorPago,
      valorReceber,
      observacoes: documento.observacoes ?? '',
      formaPagamento: documento.forma_pagamento ?? '',
      itens: documento.itens.map((item) => ({
        id: item.id,
        produtoNome: item.produto_nome,
        quantidade: Number(item.quantidade) || 0,
        valorUnitario: Number(item.valor_unitario) || 0,
        subtotal: Number(item.subtotal) || 0,
      })),
    };
  }

  async calcularNecessidadesEncomenda(id: number): Promise<AgendaNecessidade[]> {
    return mapearNecessidades(
      await calcularNecessidadesDocumentosComerciais([id])
    );
  }

  async calcularNecessidadesDia(data: string): Promise<AgendaNecessidade[]> {
    const database = await getDatabase();
    const documentos = await database.getAllAsync<DocumentoIdRow>(`
      SELECT dc.id
      FROM documentos_comerciais dc
      WHERE ${CONDICAO_ENCOMENDA_ATIVA}
        AND dc.data_encomenda = ?
      ORDER BY dc.id ASC
    `, [data]);

    return mapearNecessidades(
      await calcularNecessidadesDocumentosComerciais(
        documentos.map((documento) => documento.id)
      )
    );
  }
}
