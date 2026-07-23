import { getDatabaseConnection } from '../../../../core/database';
import { DatabaseError } from '../../../../core/errors';
import type { AtualizarReceitaDTO, Receita, ReceitaDetalhada, ReceitaItem, SalvarReceitaDTO } from '../../domain/models/Receita';
import type { IReceitaRepository } from '../../domain/repositories/IReceitaRepository';

export class SQLiteReceitaRepository implements IReceitaRepository {
  async listar(): Promise<Receita[]> {
    try {
      const db = await getDatabaseConnection();
      return db.getAllAsync<Receita>(`
        SELECT id, nome, rendimento, modo_preparo, created_at
        FROM receitas
        ORDER BY nome COLLATE NOCASE ASC
      `);
    } catch (error) {
      throw new DatabaseError('Não foi possível carregar as receitas.', error);
    }
  }

  async buscarDetalhada(id: number): Promise<ReceitaDetalhada | null> {
    try {
      const db = await getDatabaseConnection();
      const receita = await db.getFirstAsync<Receita>(`
        SELECT id, nome, rendimento, modo_preparo, created_at
        FROM receitas WHERE id = ?
      `, [id]);
      if (!receita) return null;

      const itens = await db.getAllAsync<ReceitaItem>(`
        SELECT ri.id, ri.receita_id, ri.produto_id,
               COALESCE(NULLIF(p.nome, ''), p.descricao) AS produto_nome,
               p.codigo_barras, ri.quantidade_usada,
               ri.quantidade_numero, ri.unidade_medida
        FROM receita_itens ri
        INNER JOIN produtos p ON p.id = ri.produto_id
        WHERE ri.receita_id = ?
        ORDER BY produto_nome COLLATE NOCASE ASC
      `, [id]);

      return { ...receita, itens };
    } catch (error) {
      throw new DatabaseError('Não foi possível abrir os detalhes da receita.', error);
    }
  }

  async criar(input: SalvarReceitaDTO): Promise<number> {
    try {
      const db = await getDatabaseConnection();
      let id = 0;
      await db.withTransactionAsync(async () => {
        const result = await db.runAsync(`
          INSERT INTO receitas (nome, rendimento, modo_preparo)
          VALUES (?, ?, ?)
        `, [input.nome, input.rendimento, input.modo_preparo]);
        id = Number(result.lastInsertRowId);

        for (const item of input.itens) {
          await db.runAsync(`
            INSERT INTO receita_itens
              (receita_id, produto_id, quantidade_usada, quantidade_numero, unidade_medida)
            VALUES (?, ?, ?, ?, ?)
          `, [id, item.produto_id, item.quantidade_usada, item.quantidade_numero, item.unidade_medida]);
        }
      });
      return id;
    } catch (error) {
      throw new DatabaseError('Não foi possível salvar a receita.', error);
    }
  }

  async atualizar(input: AtualizarReceitaDTO): Promise<void> {
    try {
      const db = await getDatabaseConnection();
      await db.withTransactionAsync(async () => {
        const result = await db.runAsync(`
          UPDATE receitas SET nome = ?, rendimento = ?, modo_preparo = ?
          WHERE id = ?
        `, [input.nome, input.rendimento, input.modo_preparo, input.id]);
        if (result.changes !== 1) throw new Error('Receita não encontrada.');

        await db.runAsync('DELETE FROM receita_itens WHERE receita_id = ?', [input.id]);
        for (const item of input.itens) {
          await db.runAsync(`
            INSERT INTO receita_itens
              (receita_id, produto_id, quantidade_usada, quantidade_numero, unidade_medida)
            VALUES (?, ?, ?, ?, ?)
          `, [input.id, item.produto_id, item.quantidade_usada, item.quantidade_numero, item.unidade_medida]);
        }
      });
    } catch (error) {
      throw new DatabaseError('Não foi possível salvar a receita.', error);
    }
  }

  async estaEmUso(id: number): Promise<boolean> {
    try {
      const db = await getDatabaseConnection();
      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM produto_venda_receitas WHERE receita_id = ?',
        [id]
      );
      return Number(result?.total ?? 0) > 0;
    } catch (error) {
      throw new DatabaseError('Não foi possível verificar os vínculos da receita.', error);
    }
  }

  async excluir(id: number): Promise<void> {
    try {
      const db = await getDatabaseConnection();
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM receita_itens WHERE receita_id = ?', [id]);
        const result = await db.runAsync('DELETE FROM receitas WHERE id = ?', [id]);
        if (result.changes !== 1) throw new Error('Receita não encontrada.');
      });
    } catch (error) {
      throw new DatabaseError('Não foi possível excluir a receita.', error);
    }
  }
}
