import { getDatabaseConnection } from '../../../../core/database';
import { DatabaseError } from '../../../../core/errors';
import type { ProdutoParaReceita } from '../../domain/models/ProdutoParaReceita';
import type { IProdutoParaReceitaRepository } from '../../domain/repositories/IProdutoParaReceitaRepository';

export class SQLiteProdutoParaReceitaRepository implements IProdutoParaReceitaRepository {
  async listarAtivos(): Promise<ProdutoParaReceita[]> {
    try {
      const db = await getDatabaseConnection();
      return db.getAllAsync<ProdutoParaReceita>(`
        SELECT id, descricao, nome, codigo_barras, preco_medio,
               quantidade, quantidade_embalagem, unidade_medida, ativo
        FROM produtos
        WHERE ativo = 1
        ORDER BY nome COLLATE NOCASE ASC
      `);
    } catch (error) {
      throw new DatabaseError('Não foi possível carregar os produtos do estoque.', error);
    }
  }
}
