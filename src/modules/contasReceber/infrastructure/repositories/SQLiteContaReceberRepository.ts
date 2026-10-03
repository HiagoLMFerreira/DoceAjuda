import { getDatabase } from '../../../../core/database/databaseManager';
import type { ContaReceber, DefinirContaDTO, BaixarContaDTO } from '../../domain/models/ContaReceber';
import type { IContaReceberRepository } from '../../domain/repositories/IContaReceberRepository';

export class SQLiteContaReceberRepository implements IContaReceberRepository {
  async listar(): Promise<ContaReceber[]> {
    const db = await getDatabase();
    return db.getAllAsync<ContaReceber>(`
      SELECT cr.* FROM contas_receber cr
      JOIN documentos_comerciais dc ON dc.id = cr.venda_id
      WHERE cr.status IN ('PENDENTE', 'PAGO') AND dc.status = 'CONCLUIDA'
      ORDER BY CASE WHEN cr.status = 'PAGO' THEN 1 ELSE 0 END,
        cr.data_vencimento, cr.cliente_nome COLLATE NOCASE, cr.id
    `);
  }

  async definir(dados: DefinirContaDTO): Promise<void> {
    const db = await getDatabase();
    const result = await db.runAsync(`
      UPDATE contas_receber SET data_vencimento = ?, forma_pagamento = ?,
        updated_at = datetime('now','localtime')
      WHERE id = ? AND status = 'PENDENTE'
        AND EXISTS (SELECT 1 FROM documentos_comerciais dc
          WHERE dc.id = contas_receber.venda_id AND dc.status = 'CONCLUIDA')
    `, [dados.dataVencimento, dados.formaPagamento, dados.id]);
    if (result.changes !== 1) throw new Error('A conta não está mais em aberto. Atualize a listagem.');
  }

  async baixar(dados: BaixarContaDTO): Promise<void> {
    const db = await getDatabase();
    // Uma única atualização condicional torna a baixa atômica e impede duplicidade.
    const result = await db.runAsync(`
      UPDATE contas_receber SET status = 'PAGO', valor_pendente = 0,
        data_vencimento = ?, forma_pagamento = ?, data_pagamento = ?,
        updated_at = datetime('now','localtime')
      WHERE id = ? AND status = 'PENDENTE' AND valor_pendente > 0
        AND EXISTS (SELECT 1 FROM documentos_comerciais dc
          WHERE dc.id = contas_receber.venda_id AND dc.status = 'CONCLUIDA')
    `, [dados.dataVencimento, dados.formaPagamento, dados.dataPagamento, dados.id]);
    if (result.changes !== 1) throw new Error('Esta conta já foi baixada ou não está mais disponível. Atualize a listagem.');
  }
}
