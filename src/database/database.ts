import * as SQLite from 'expo-sqlite';
import { Cliente } from '../types';
import { terminate } from 'firebase/data-connect';

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
        telefone TEXT DEFAULT '',
        endereco TEXT DEFAULT '',
        total_compras REAL DEFAULT 0
      );
    `);

  const colunasClientes = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(clientes)'
    );

    const existeColunaEndereco = colunasClientes.some(
      (coluna) => coluna.name === 'endereco'
    );

    const existeColunaTelefone = colunasClientes.some(
      (coluna) => coluna.name === 'telefone'
    );

    if (!existeColunaTelefone) {
      await db.execAsync(`
        ALTER TABLE clientes ADD COLUMN telefone TEXT DEFAULT '';
      `);
    }

    if (!existeColunaEndereco) {
      await db.execAsync(`
        ALTER TABLE clientes ADD COLUMN endereco TEXT DEFAULT '';
      `);
    }
  }

  return db;
}

// Funções auxiliares para manipulação do estoque
export async function inserirMovimentacao(
  produtoId: number,
  tipo: 'entrada' | 'saida',
  qtd: number
) {
  const database = await getDatabase();

  await database.runAsync(
    'INSERT INTO movimentacoes (produto_id, tipo, quantidade) VALUES (?, ?, ?)',
    [produtoId, tipo, qtd]
  );

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

// ===============================
// CRUD DE CLIENTES
// ===============================

export async function listarClientes(filtro: string = ''): Promise<Cliente[]> {
  const database = await getDatabase();

  if (filtro.trim()) {
    const resultado = await database.getAllAsync<Cliente>(
      'SELECT * FROM clientes WHERE nome LIKE ? ORDER BY nome ASC',
      [`%${filtro.trim()}%`]
    );

    return resultado;
  }

  const resultado = await database.getAllAsync<Cliente>(
    'SELECT * FROM clientes ORDER BY nome ASC'
  );

  return resultado;
}

export async function adicionarCliente(
  nome: string,
  telefone: string,
  endereco: string
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    'INSERT INTO clientes (nome, telefone, endereco, total_compras) VALUES (?, ?, ?, 0)',
    [nome.trim(), telefone.trim(), endereco.trim()]
  );
}

export async function atualizarCliente(
  id: number,
  nome: string,
  telefone: string,
  endereco: string
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    'UPDATE clientes SET nome = ?, telefone = ?, endereco = ? WHERE id = ?',
    [nome.trim(), telefone.trim(), endereco.trim(), id]
  );
}

export async function excluirCliente(id: number): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    'DELETE FROM clientes WHERE id = ?',
    [id]
  );
}