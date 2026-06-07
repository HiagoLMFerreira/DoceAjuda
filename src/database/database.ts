import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export type ProdutoEstoque = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_ultima_entrada: number;
  preco_medio: number;
  quantidade: number;
};

export type NovoProdutoEstoque = {
  nome: string;
  codigo_barras?: string;
  preco_ultima_entrada?: number;
  preco_medio?: number;
  quantidade?: number;
};

export type EditarProdutoEstoque = {
  id: number;
  nome: string;
  codigo_barras?: string;
  preco_ultima_entrada?: number;
  preco_medio?: number;
  quantidade?: number;
};

export type OrdenarProdutoPor =
  | 'id'
  | 'nome'
  | 'codigo_barras'
  | 'preco_ultima_entrada'
  | 'preco_medio'
  | 'quantidade';

export type DirecaoOrdenacao = 'ASC' | 'DESC';

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('doceajuda.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
<<<<<<< Updated upstream
        quantidade REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        preco REAL DEFAULT 0,
        preco_medio REAL DEFAULT 0
=======
        nome TEXT DEFAULT '',
        codigo_barras TEXT DEFAULT '',
        preco_ultima_entrada REAL DEFAULT 0,
        preco_medio REAL DEFAULT 0,
        quantidade REAL DEFAULT 0
>>>>>>> Stashed changes
      );
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('entrada','saida')),
        quantidade REAL,
<<<<<<< Updated upstream
        preco_unitario REAL,
=======
        preco_unitario REAL DEFAULT 0,
>>>>>>> Stashed changes
        data TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        total_compras REAL DEFAULT 0
      );
    `);

<<<<<<< Updated upstream
    // Atualiza tabelas existentes
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN ativo INTEGER DEFAULT 1'); } catch {}
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN preco REAL DEFAULT 0'); } catch {}
    try { await db.execAsync('ALTER TABLE produtos ADD COLUMN preco_medio REAL DEFAULT 0'); } catch {}
    try { await db.execAsync('ALTER TABLE movimentacoes ADD COLUMN preco_unitario REAL'); } catch {}
=======
    // Migração da tabela produtos para quem já tinha o app instalado
    const colunasProdutos = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(produtos)'
    );

    const existeColunaProduto = (nomeColuna: string) =>
      colunasProdutos.some((coluna) => coluna.name === nomeColuna);

    if (!existeColunaProduto('nome')) {
      await db.execAsync(`
        ALTER TABLE produtos ADD COLUMN nome TEXT DEFAULT '';
      `);
    }

    if (!existeColunaProduto('codigo_barras')) {
      await db.execAsync(`
        ALTER TABLE produtos ADD COLUMN codigo_barras TEXT DEFAULT '';
      `);
    }

    if (!existeColunaProduto('preco_ultima_entrada')) {
      await db.execAsync(`
        ALTER TABLE produtos ADD COLUMN preco_ultima_entrada REAL DEFAULT 0;
      `);
    }

    if (!existeColunaProduto('preco_medio')) {
      await db.execAsync(`
        ALTER TABLE produtos ADD COLUMN preco_medio REAL DEFAULT 0;
      `);
    }

    // Mantém compatibilidade com os produtos antigos que usavam "descricao"
    await db.execAsync(`
      UPDATE produtos
      SET nome = descricao
      WHERE nome IS NULL OR nome = '';
    `);

    // Migração da tabela movimentacoes para salvar preço da entrada
    const colunasMovimentacoes = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(movimentacoes)'
    );

    const existeColunaMovimentacao = (nomeColuna: string) =>
      colunasMovimentacoes.some((coluna) => coluna.name === nomeColuna);

    if (!existeColunaMovimentacao('preco_unitario')) {
      await db.execAsync(`
        ALTER TABLE movimentacoes ADD COLUMN preco_unitario REAL DEFAULT 0;
      `);
    }

    // Migração da tabela clientes
    const colunasClientes = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(clientes)'
    );

    const existeColunaCliente = (nomeColuna: string) =>
      colunasClientes.some((coluna) => coluna.name === nomeColuna);

    if (!existeColunaCliente('telefone')) {
      await db.execAsync(`
        ALTER TABLE clientes ADD COLUMN telefone TEXT DEFAULT '';
      `);
    }

    if (!existeColunaCliente('endereco')) {
      await db.execAsync(`
        ALTER TABLE clientes ADD COLUMN endereco TEXT DEFAULT '';
      `);
    }
>>>>>>> Stashed changes
  }
  return db;
}

<<<<<<< Updated upstream
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
=======
// ===============================
// FUNÇÕES DO ESTOQUE
// ===============================

export async function listarProdutos(
  ordenarPor: OrdenarProdutoPor = 'id',
  direcao: DirecaoOrdenacao = 'ASC'
): Promise<ProdutoEstoque[]> {
  const database = await getDatabase();

  const colunasPermitidas: OrdenarProdutoPor[] = [
    'id',
    'nome',
    'codigo_barras',
    'preco_ultima_entrada',
    'preco_medio',
    'quantidade',
  ];

  const colunaOrdenacao = colunasPermitidas.includes(ordenarPor)
    ? ordenarPor
    : 'id';

  const direcaoOrdenacao = direcao === 'DESC' ? 'DESC' : 'ASC';

  const resultado = await database.getAllAsync<ProdutoEstoque>(`
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade
    FROM produtos
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
  `);

  return resultado;
}

export async function cadastrarProduto(produto: NovoProdutoEstoque): Promise<void> {
  const database = await getDatabase();

  const nome = produto.nome.trim();
  const codigoBarras = produto.codigo_barras?.trim() || '';
  const precoUltimaEntrada = produto.preco_ultima_entrada ?? 0;
  const precoMedio = produto.preco_medio ?? precoUltimaEntrada;
  const quantidade = produto.quantidade ?? 0;

  if (!nome) {
    throw new Error('Informe o nome do produto.');
  }

  if (quantidade < 0) {
    throw new Error('A quantidade não pode ser negativa.');
  }

  if (precoUltimaEntrada < 0) {
    throw new Error('O preço da última entrada não pode ser negativo.');
  }

  if (precoMedio < 0) {
    throw new Error('O preço médio não pode ser negativo.');
  }

  await database.runAsync(
    `
    INSERT INTO produtos (
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade
    ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      nome,
      nome,
      codigoBarras,
      precoUltimaEntrada,
      precoMedio,
      quantidade,
    ]
  );
}

export async function editarProduto(produto: EditarProdutoEstoque): Promise<void> {
  const database = await getDatabase();

  const nome = produto.nome.trim();
  const codigoBarras = produto.codigo_barras?.trim() || '';
  const precoUltimaEntrada = produto.preco_ultima_entrada ?? 0;
  const precoMedio = produto.preco_medio ?? 0;
  const quantidade = produto.quantidade ?? 0;

  if (!produto.id) {
    throw new Error('Produto inválido.');
  }

  if (!nome) {
    throw new Error('Informe o nome do produto.');
  }

  if (quantidade < 0) {
    throw new Error('A quantidade não pode ser negativa.');
  }

  if (precoUltimaEntrada < 0) {
    throw new Error('O preço da última entrada não pode ser negativo.');
  }

  if (precoMedio < 0) {
    throw new Error('O preço médio não pode ser negativo.');
  }

  await database.runAsync(
    `
    UPDATE produtos
    SET
      descricao = ?,
      nome = ?,
      codigo_barras = ?,
      preco_ultima_entrada = ?,
      preco_medio = ?,
      quantidade = ?
    WHERE id = ?
    `,
    [
      nome,
      nome,
      codigoBarras,
      precoUltimaEntrada,
      precoMedio,
      quantidade,
      produto.id,
    ]
  );
}

export async function excluirProduto(produtoId: number): Promise<void> {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  await database.runAsync(
    'DELETE FROM movimentacoes WHERE produto_id = ?',
    [produtoId]
  );

  await database.runAsync(
    'DELETE FROM produtos WHERE id = ?',
    [produtoId]
  );
}

export async function buscarProdutoPorId(
  produtoId: number
): Promise<ProdutoEstoque | null> {
  const database = await getDatabase();

  const produto = await database.getFirstAsync<ProdutoEstoque>(
    `
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade
    FROM produtos
    WHERE id = ?
    `,
    [produtoId]
  );

  return produto ?? null;
}

>>>>>>> Stashed changes
export async function inserirMovimentacao(
  produtoId: number,
  tipo: 'entrada' | 'saida',
  qtd: number,
<<<<<<< Updated upstream
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
=======
  precoUnitario: number = 0
): Promise<void> {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  if (qtd <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }

  if (precoUnitario < 0) {
    throw new Error('O preço não pode ser negativo.');
  }

  const produto = await buscarProdutoPorId(produtoId);

  if (!produto) {
    throw new Error('Produto não encontrado.');
  }

  if (tipo === 'saida' && qtd > produto.quantidade) {
    throw new Error('Não é possível fazer uma saída maior que o estoque atual.');
  }

  await database.runAsync(
    `
    INSERT INTO movimentacoes (
      produto_id,
      tipo,
      quantidade,
      preco_unitario
    ) VALUES (?, ?, ?, ?)
    `,
    [produtoId, tipo, qtd, precoUnitario]
>>>>>>> Stashed changes
  );

  if (tipo === 'entrada') {
    const quantidadeAtual = produto.quantidade;
    const precoMedioAtual = produto.preco_medio || 0;
    const novaQuantidade = quantidadeAtual + qtd;

    let novoPrecoMedio = precoMedioAtual;

    if (precoUnitario > 0) {
      novoPrecoMedio =
        ((quantidadeAtual * precoMedioAtual) + (qtd * precoUnitario)) /
        novaQuantidade;
    }

    await database.runAsync(
      `
      UPDATE produtos
      SET
        quantidade = ?,
        preco_ultima_entrada = ?,
        preco_medio = ?
      WHERE id = ?
      `,
      [
        novaQuantidade,
        precoUnitario > 0 ? precoUnitario : produto.preco_ultima_entrada,
        novoPrecoMedio,
        produtoId,
      ]
    );
    if (precoUnitario && precoUnitario > 0) {
      await database.runAsync(
        'UPDATE produtos SET preco = ? WHERE id = ?',
        [precoUnitario, produtoId]
      );
    }
    await atualizarPrecoMedio(produtoId);  // ✅ recalcula a média
  } else {
    const novaQuantidade = produto.quantidade - qtd;

    if (novaQuantidade < 0) {
      throw new Error('A quantidade não pode ficar negativa.');
    }

    await database.runAsync(
      `
      UPDATE produtos
      SET quantidade = ?
      WHERE id = ?
      `,
      [novaQuantidade, produtoId]
    );
  }
}
<<<<<<< Updated upstream

// ---------- CRUD PRODUTOS ----------
export async function listarProdutos(filtro: string = '', somenteAtivos: boolean = true) {
  const db = await getDatabase();
  let query = 'SELECT * FROM produtos WHERE 1=1';
  const params: any[] = [];
=======
// ===============================
// CRUD DE CLIENTES
// ===============================
>>>>>>> Stashed changes

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