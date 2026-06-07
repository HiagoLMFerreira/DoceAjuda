import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

// ===============================
// TYPES GERAIS
// ===============================

export type DirecaoOrdenacao = 'ASC' | 'DESC';

// ===============================
// TYPES DE PRODUTOS / ESTOQUE
// ===============================

export type ProdutoEstoque = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_ultima_entrada: number;
  preco_medio: number;
  quantidade: number;
  ativo?: number;
  preco?: number;
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

// ===============================
// TYPES DE CLIENTES
// ===============================

export type ClienteDatabase = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  total_compras: number;
};

export type NovoCliente = {
  nome: string;
  telefone?: string;
  endereco?: string;
};

export type EditarCliente = {
  id: number;
  nome: string;
  telefone?: string;
  endereco?: string;
};

export type OrdenarClientePor = 'id' | 'nome' | 'total_compras';

// ===============================
// DATABASE
// ===============================

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('doceajuda.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        nome TEXT DEFAULT '',
        codigo_barras TEXT DEFAULT '',
        preco_ultima_entrada REAL DEFAULT 0,
        preco_medio REAL DEFAULT 0,
        quantidade REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        preco REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('entrada','saida')),
        quantidade REAL,
        preco_unitario REAL DEFAULT 0,
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

    await aplicarMigracoesProdutos();
    await aplicarMigracoesMovimentacoes();
    await aplicarMigracoesClientes();
  }

  return db;
}

// ===============================
// MIGRAÇÕES
// ===============================

async function colunaExiste(
  database: SQLite.SQLiteDatabase,
  tabela: string,
  coluna: string
): Promise<boolean> {
  const colunas = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${tabela})`
  );

  return colunas.some((item) => item.name === coluna);
}

async function adicionarColunaSeNaoExistir(
  tabela: string,
  coluna: string,
  definicao: string
): Promise<void> {
  const database = db;

  const existe = await colunaExiste(database, tabela, coluna);

  if (!existe) {
    await database.execAsync(`
      ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao};
    `);
  }
}

async function aplicarMigracoesProdutos(): Promise<void> {
  await adicionarColunaSeNaoExistir('produtos', 'nome', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir('produtos', 'codigo_barras', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir(
    'produtos',
    'preco_ultima_entrada',
    'REAL DEFAULT 0'
  );
  await adicionarColunaSeNaoExistir('produtos', 'preco_medio', 'REAL DEFAULT 0');
  await adicionarColunaSeNaoExistir('produtos', 'quantidade', 'REAL DEFAULT 0');
  await adicionarColunaSeNaoExistir('produtos', 'ativo', 'INTEGER DEFAULT 1');
  await adicionarColunaSeNaoExistir('produtos', 'preco', 'REAL DEFAULT 0');

  await db.execAsync(`
    UPDATE produtos
    SET nome = descricao
    WHERE nome IS NULL OR nome = '';
  `);

  await db.execAsync(`
    UPDATE produtos
    SET preco_ultima_entrada = preco
    WHERE (preco_ultima_entrada IS NULL OR preco_ultima_entrada = 0)
      AND preco IS NOT NULL
      AND preco > 0;
  `);

  await db.execAsync(`
    UPDATE produtos
    SET preco_medio = preco
    WHERE (preco_medio IS NULL OR preco_medio = 0)
      AND preco IS NOT NULL
      AND preco > 0;
  `);
}

async function aplicarMigracoesMovimentacoes(): Promise<void> {
  await adicionarColunaSeNaoExistir(
    'movimentacoes',
    'preco_unitario',
    'REAL DEFAULT 0'
  );
}

async function aplicarMigracoesClientes(): Promise<void> {
  await adicionarColunaSeNaoExistir('clientes', 'telefone', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir('clientes', 'endereco', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir(
    'clientes',
    'total_compras',
    'REAL DEFAULT 0'
  );
}

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

function tratarNumero(valor: number | undefined | null): number {
  if (valor === undefined || valor === null || Number.isNaN(valor)) {
    return 0;
  }

  return valor;
}

function validarDirecaoOrdenacao(direcao: DirecaoOrdenacao): DirecaoOrdenacao {
  return direcao === 'DESC' ? 'DESC' : 'ASC';
}

// ===============================
// CRUD DE PRODUTOS / ESTOQUE
// ===============================

export async function listarProdutos(
  ordenarPor: OrdenarProdutoPor = 'nome',
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
    : 'nome';

  const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);

  const resultado = await database.getAllAsync<ProdutoEstoque>(`
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade,
      ativo,
      preco
    FROM produtos
    WHERE ativo = 1
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
  `);

  return resultado;
}

export async function buscarProdutos(
  filtro: string = '',
  ordenarPor: OrdenarProdutoPor = 'nome',
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
    : 'nome';

  const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
  const busca = filtro.trim();

  if (!busca) {
    return listarProdutos(ordenarPor, direcao);
  }

  const buscaNumerica = Number(busca);

  if (!Number.isNaN(buscaNumerica)) {
    const resultado = await database.getAllAsync<ProdutoEstoque>(
      `
      SELECT
        id,
        descricao,
        nome,
        codigo_barras,
        preco_ultima_entrada,
        preco_medio,
        quantidade,
        ativo,
        preco
      FROM produtos
      WHERE ativo = 1
        AND (
          id = ?
          OR nome LIKE ?
          OR descricao LIKE ?
          OR codigo_barras LIKE ?
        )
      ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
      `,
      [buscaNumerica, `%${busca}%`, `%${busca}%`, `%${busca}%`]
    );

    return resultado;
  }

  const resultado = await database.getAllAsync<ProdutoEstoque>(
    `
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade,
      ativo,
      preco
    FROM produtos
    WHERE ativo = 1
      AND (
        nome LIKE ?
        OR descricao LIKE ?
        OR codigo_barras LIKE ?
      )
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
    `,
    [`%${busca}%`, `%${busca}%`, `%${busca}%`]
  );

  return resultado;
}

export async function cadastrarProduto(
  produto: NovoProdutoEstoque
): Promise<void> {
  const database = await getDatabase();

  const nome = produto.nome.trim();
  const codigoBarras = produto.codigo_barras?.trim() || '';
  const precoUltimaEntrada = tratarNumero(produto.preco_ultima_entrada);
  const precoMedio = produto.preco_medio ?? precoUltimaEntrada;
  const quantidade = tratarNumero(produto.quantidade);

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
      quantidade,
      ativo,
      preco
    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `,
    [
      nome,
      nome,
      codigoBarras,
      precoUltimaEntrada,
      precoMedio,
      quantidade,
      precoUltimaEntrada,
    ]
  );
}

export async function editarProduto(
  produto: EditarProdutoEstoque
): Promise<void> {
  const database = await getDatabase();

  const nome = produto.nome.trim();
  const codigoBarras = produto.codigo_barras?.trim() || '';
  const precoUltimaEntrada = tratarNumero(produto.preco_ultima_entrada);
  const precoMedio = tratarNumero(produto.preco_medio);
  const quantidade = tratarNumero(produto.quantidade);

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
      quantidade = ?,
      preco = ?
    WHERE id = ?
    `,
    [
      nome,
      nome,
      codigoBarras,
      precoUltimaEntrada,
      precoMedio,
      quantidade,
      precoUltimaEntrada,
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

export async function inativarProduto(produtoId: number): Promise<void> {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  await database.runAsync(
    'UPDATE produtos SET ativo = 0 WHERE id = ?',
    [produtoId]
  );
}

export async function buscarProdutoPorId(
  produtoId: number
): Promise<ProdutoEstoque | null> {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  const produto = await database.getFirstAsync<ProdutoEstoque>(
    `
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade,
      ativo,
      preco
    FROM produtos
    WHERE id = ?
    `,
    [produtoId]
  );

  return produto ?? null;
}

// ===============================
// MOVIMENTAÇÕES DE ESTOQUE
// ===============================

export async function inserirMovimentacao(
  produtoId: number,
  tipo: 'entrada' | 'saida',
  qtd: number,
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
  );

  if (tipo === 'entrada') {
    const quantidadeAtual = produto.quantidade;
    const precoMedioAtual = produto.preco_medio || 0;
    const novaQuantidade = quantidadeAtual + qtd;

    let novoPrecoMedio = precoMedioAtual;

    if (precoUnitario > 0 && novaQuantidade > 0) {
      novoPrecoMedio =
        (quantidadeAtual * precoMedioAtual + qtd * precoUnitario) /
        novaQuantidade;
    }

    await database.runAsync(
      `
      UPDATE produtos
      SET
        quantidade = ?,
        preco_ultima_entrada = ?,
        preco_medio = ?,
        preco = ?
      WHERE id = ?
      `,
      [
        novaQuantidade,
        precoUnitario > 0 ? precoUnitario : produto.preco_ultima_entrada,
        novoPrecoMedio,
        precoUnitario > 0 ? precoUnitario : produto.preco ?? 0,
        produtoId,
      ]
    );
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

export async function listarMovimentacoesProduto(produtoId: number) {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  const movimentacoes = await database.getAllAsync(
    `
    SELECT
      id,
      produto_id,
      tipo,
      quantidade,
      preco_unitario,
      data
    FROM movimentacoes
    WHERE produto_id = ?
    ORDER BY id DESC
    `,
    [produtoId]
  );

  return movimentacoes;
}

// ===============================
// CRUD DE CLIENTES
// ===============================

export async function listarClientes(
  filtro: string = '',
  ordenarPor: OrdenarClientePor = 'nome',
  direcao: DirecaoOrdenacao = 'ASC'
): Promise<ClienteDatabase[]> {
  const database = await getDatabase();

  const colunasPermitidas: OrdenarClientePor[] = [
    'id',
    'nome',
    'total_compras',
  ];

  const colunaOrdenacao = colunasPermitidas.includes(ordenarPor)
    ? ordenarPor
    : 'nome';

  const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
  const busca = filtro.trim();

  if (busca) {
    const buscaNumerica = Number(busca);

    if (!Number.isNaN(buscaNumerica)) {
      const resultado = await database.getAllAsync<ClienteDatabase>(
        `
        SELECT
          id,
          nome,
          telefone,
          endereco,
          total_compras
        FROM clientes
        WHERE id = ? OR nome LIKE ?
        ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
        `,
        [buscaNumerica, `%${busca}%`]
      );

      return resultado;
    }

    const resultado = await database.getAllAsync<ClienteDatabase>(
      `
      SELECT
        id,
        nome,
        telefone,
        endereco,
        total_compras
      FROM clientes
      WHERE nome LIKE ?
      ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
      `,
      [`%${busca}%`]
    );

    return resultado;
  }

  const resultado = await database.getAllAsync<ClienteDatabase>(`
    SELECT
      id,
      nome,
      telefone,
      endereco,
      total_compras
    FROM clientes
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
  `);

  return resultado;
}

export async function adicionarCliente(
  nome: string,
  telefone: string = '',
  endereco: string = ''
): Promise<void> {
  const database = await getDatabase();

  const nomeTratado = nome.trim();
  const telefoneTratado = telefone.trim();
  const enderecoTratado = endereco.trim();

  if (!nomeTratado) {
    throw new Error('Informe o nome do cliente.');
  }

  await database.runAsync(
    `
    INSERT INTO clientes (
      nome,
      telefone,
      endereco,
      total_compras
    ) VALUES (?, ?, ?, 0)
    `,
    [nomeTratado, telefoneTratado, enderecoTratado]
  );
}

export async function atualizarCliente(
  id: number,
  nome: string,
  telefone: string = '',
  endereco: string = ''
): Promise<void> {
  const database = await getDatabase();

  const nomeTratado = nome.trim();
  const telefoneTratado = telefone.trim();
  const enderecoTratado = endereco.trim();

  if (!id) {
    throw new Error('Cliente inválido.');
  }

  if (!nomeTratado) {
    throw new Error('Informe o nome do cliente.');
  }

  await database.runAsync(
    `
    UPDATE clientes
    SET
      nome = ?,
      telefone = ?,
      endereco = ?
    WHERE id = ?
    `,
    [nomeTratado, telefoneTratado, enderecoTratado, id]
  );
}

export async function excluirCliente(id: number): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Cliente inválido.');
  }

  await database.runAsync(
    'DELETE FROM clientes WHERE id = ?',
    [id]
  );
}

export async function buscarClientePorId(
  id: number
): Promise<ClienteDatabase | null> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Cliente inválido.');
  }

  const cliente = await database.getFirstAsync<ClienteDatabase>(
    `
    SELECT
      id,
      nome,
      telefone,
      endereco,
      total_compras
    FROM clientes
    WHERE id = ?
    `,
    [id]
  );

  return cliente ?? null;
}

export async function atualizarTotalComprasCliente(
  id: number,
  valorTotal: number
): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Cliente inválido.');
  }

  if (valorTotal < 0) {
    throw new Error('O valor total não pode ser negativo.');
  }

  await database.runAsync(
    `
    UPDATE clientes
    SET total_compras = ?
    WHERE id = ?
    `,
    [valorTotal, id]
  );
}