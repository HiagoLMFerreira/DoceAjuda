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
        quantidade REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        preco REAL DEFAULT 0,
        preco_medio REAL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('entrada','saida')),
        quantidade REAL,
        preco_unitario REAL,
        data TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        total_compras REAL DEFAULT 0
      );
    `);

    // Atualiza tabelas existentes
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN ativo INTEGER DEFAULT 1'); } catch {}
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN preco REAL DEFAULT 0'); } catch {}
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN preco_medio REAL DEFAULT 0'); } catch {}
    try { await db.execAsync('ALTER TABLE movimentacoes ADD COLUMN preco_unitario REAL'); } catch {}
  }
  return db;
}

// ---------- PREÇO MÉDIO ----------
export async function atualizarPrecoMedio(produtoId: number) {
  const database = await getDatabase();
  const entradas = await database.getAllAsync(
    `SELECT preco_unitario FROM movimentacoes 
     WHERE produto_id = ? AND tipo = 'entrada' AND preco_unitario IS NOT NULL 
     ORDER BY id DESC LIMIT 3`,
    [produtoId]
  ) as { preco_unitario: number }[];

  let media = 0;
  if (entradas.length > 0) {
    const precos = entradas.map(e => e.preco_unitario);
    media = precos.reduce((a, b) => a + b, 0) / precos.length;
  }

  await database.runAsync(
    'UPDATE produtos SET preco_medio = ? WHERE id = ?',
    [media, produtoId]
  );
}

// ---------- MOVIMENTAÇÃO (ATUALIZADA) ----------
export async function inserirMovimentacao(
  produtoId: number,
  tipo: 'entrada' | 'saida',
  qtd: number,
  precoUnitario?: number
) {
  const database = await getDatabase();

  // Se for saída, verifica o estoque
  if (tipo === 'saida') {
    const produto = await database.getFirstAsync(
      'SELECT quantidade FROM produtos WHERE id = ?',
      [produtoId]
    );
    if (!produto || (produto as any).quantidade < qtd) {
      throw new Error('Quantidade insuficiente em estoque.');
    }
  }

  // Registra a movimentação
  await database.runAsync(
    'INSERT INTO movimentacoes (produto_id, tipo, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
    [produtoId, tipo, qtd, precoUnitario ?? null]
  );

  if (tipo === 'entrada') {
    await database.runAsync(
      'UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?',
      [qtd, produtoId]
    );
    if (precoUnitario && precoUnitario > 0) {
      await database.runAsync(
        'UPDATE produtos SET preco = ? WHERE id = ?',
        [precoUnitario, produtoId]
      );
    }
    await atualizarPrecoMedio(produtoId);  // ✅ recalcula a média
  } else {
    await database.runAsync(
      'UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
      [qtd, produtoId]
    );
  }
}

// ---------- CRUD PRODUTOS ----------
export async function listarProdutos(filtro: string = '', somenteAtivos: boolean = true) {
  const db = await getDatabase();
  let query = 'SELECT * FROM produtos WHERE 1=1';
  const params: any[] = [];

  if (somenteAtivos) {
    query += ' AND ativo = 1';
  }
  if (filtro.trim()) {
    query += ' AND descricao LIKE ?';
    params.push(`%${filtro.trim()}%`);
  }
  query += ' ORDER BY id';
  return await db.getAllAsync(query, params);
}

export async function cadastrarProduto(descricao: string, preco: number = 0) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO produtos (descricao, quantidade, ativo, preco) VALUES (?, 0, 1, ?)',
    [descricao, preco]
  );
}

export async function atualizarProduto(id: number, descricao: string, preco?: number) {
  const db = await getDatabase();
  if (preco !== undefined) {
    await db.runAsync(
      'UPDATE produtos SET descricao = ?, preco = ? WHERE id = ?',
      [descricao, preco, id]
    );
  } else {
    await db.runAsync(
      'UPDATE produtos SET descricao = ? WHERE id = ?',
      [descricao, id]
    );
  }
}

export async function inativarProduto(id: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE produtos SET ativo = 0 WHERE id = ?', [id]);
}