import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('doceajuda.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        quantidade REAL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('entrada','saida')),
        quantidade REAL,
        data TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        total_compras REAL DEFAULT 0
      );
    `);
  }
  return db;
}

// Funções auxiliares para manipulação do estoque
export async function inserirMovimentacao(produtoId: number, tipo: 'entrada'|'saida', qtd: number) {
  const database = await getDatabase();
  
  // Registra a movimentação
  await database.runAsync(
    'INSERT INTO movimentacoes (produto_id, tipo, quantidade) VALUES (?, ?, ?)',
    [produtoId, tipo, qtd]
  );
  
  // Atualiza o estoque
  if (tipo === 'entrada') {
    await database.runAsync(
      'UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?',
      [qtd, produtoId]
    );
  } else {
    await database.runAsync(
      'UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
      [qtd, produtoId]
    );
  }
}
// Demais funções CRUD para produtos e clientes...