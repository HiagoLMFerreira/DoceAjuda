import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let databaseInitialization: Promise<SQLite.SQLiteDatabase> | null = null;

// ===============================
// TYPES GERAIS
// ===============================

export type DirecaoOrdenacao = 'ASC' | 'DESC';

export const UNIDADES_MEDIDA_ESTOQUE = [
  'un',
  'kg',
  'g',
  'l',
  'ml',
  'caixa',
  'pacote',
  'duzia',
] as const;

export type UnidadeMedidaEstoque =
  (typeof UNIDADES_MEDIDA_ESTOQUE)[number];

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
  quantidade_embalagem: number;
  unidade_medida: string;
  ativo?: number;
  preco?: number;
};

export type NovoProdutoEstoque = {
  nome: string;
  codigo_barras?: string;
  unidade_medida: UnidadeMedidaEstoque;
};

export type EditarProdutoEstoque = {
  id: number;
  nome: string;
  codigo_barras?: string;
  unidade_medida: UnidadeMedidaEstoque;
};

export type OrdenarProdutoPor =
  | 'id'
  | 'nome'
  | 'codigo_barras'
  | 'preco_ultima_entrada'
  | 'preco_medio'
  | 'quantidade'
  | 'unidade_medida';

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
// TYPES DE RECEITAS
// ===============================

export type ReceitaDatabase = {
  id: number;
  nome: string;
  rendimento: string;
  modo_preparo: string;
  created_at: string;
};

export type ReceitaItemDatabase = {
  id: number;
  receita_id: number;
  produto_id: number;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type ReceitaItemDetalhado = {
  id: number;
  receita_id: number;
  produto_id: number;
  produto_nome: string;
  codigo_barras: string;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type ReceitaDetalhada = ReceitaDatabase & {
  itens: ReceitaItemDetalhado[];
};

export type NovoItemReceita = {
  produto_id: number;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type ProdutoParaReceita = {
  id: number;
  descricao: string;
  nome: string;
  codigo_barras: string;
  preco_medio: number;
  quantidade: number;
  quantidade_embalagem: number;
  unidade_medida: string;
};

// ===============================
// TYPES DE PRECIFICAÇÃO
// ===============================

export type UnidadeMedida = 'g' | 'kg' | 'ml' | 'l' | 'un';

export type ParametrosPrecificacao = {
  id: number;
  salario_desejado: number;
  horas_trabalhadas_mes: number;
  margem_lucro: number;
  valor_hora: number;
  custos_fixos_mensais: number;
  custos_variaveis: number;
};

export type CustoFixoDatabase = {
  id: number;
  nome: string;
  valor: number;
  ativo: number;
  created_at: string;
};

export type CustoVariavelDatabase = {
  id: number;
  nome: string;
  valor: number;
  ativo: number;
  created_at: string;
};

export type ProdutoParaPrecificacao = {
  id: number;
  nome: string;
  descricao: string;
  codigo_barras: string;
  preco_medio: number;
  quantidade: number;
  quantidade_embalagem: number;
  unidade_medida: string;
};

export type ReceitaItemPrecificacao = {
  id: number;
  receita_id: number;
  produto_id: number;
  produto_nome: string;
  codigo_barras: string;
  preco_medio: number;
  quantidade_embalagem: number;
  unidade_medida_produto: string;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type ReceitaParaPrecificacao = {
  id: number;
  nome: string;
  rendimento: string;
  modo_preparo: string;
  itens: ReceitaItemPrecificacao[];
};


// ===============================
// TYPES DE PRODUTOS PARA VENDA
// ===============================

export type ProdutoVendaDatabase = {
  id: number;
  nome: string;
  descricao: string;
  tempo_producao_minutos: number;
  custo_receitas: number;
  custo_itens: number;
  custo_mao_obra: number;
  custo_operacional: number;
  custo_total: number;
  margem_lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  ativo: number;
  created_at: string;
  updated_at: string;
};

export type ProdutoVendaReceitaInput = {
  receita_id: number;
  quantidade_unidades: number;
};

export type ProdutoVendaItemInput = {
  produto_estoque_id: number;
  quantidade_usada: number;
  unidade_medida: string;
};

export type NovoProdutoVenda = {
  nome: string;
  descricao?: string;
  tempo_producao_minutos: number;
  custo_receitas: number;
  custo_itens: number;
  custo_mao_obra: number;
  custo_operacional: number;
  custo_total: number;
  margem_lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  receitas: ProdutoVendaReceitaInput[];
  itens: ProdutoVendaItemInput[];
};

export type ProdutoVendaReceitaDetalhada = {
  id: number;
  produto_venda_id: number;
  receita_id: number;
  receita_nome: string;
  receita_rendimento: string;
  quantidade_unidades: number;
};

export type ProdutoVendaItemDetalhado = {
  id: number;
  produto_venda_id: number;
  produto_estoque_id: number;
  produto_nome: string;
  quantidade_usada: number;
  unidade_medida: string;
  preco_medio: number;
  quantidade_embalagem: number;
  unidade_medida_produto: string;
};

export type ProdutoVendaDetalhado = ProdutoVendaDatabase & {
  receitas: ProdutoVendaReceitaDetalhada[];
  itens: ProdutoVendaItemDetalhado[];
};

// ===============================
// TYPES DE ORÇAMENTOS / VENDAS
// ===============================

export type TipoDocumentoComercial = 'ORCAMENTO' | 'VENDA';

export type StatusDocumentoComercial =
  | 'PENDENTE'
  | 'CONVERTIDO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type OrdenarDocumentoComercialPor =
  | 'id'
  | 'cliente_nome'
  | 'valor_total'
  | 'created_at';

export type DocumentoComercialDatabase = {
  id: number;
  tipo: TipoDocumentoComercial;
  cliente_id: number;
  cliente_nome: string;
  status: StatusDocumentoComercial;
  valor_total: number;
  observacoes: string;
  forma_pagamento: string;
  data_validade: string;
  orcamento_origem_id: number | null;
  created_at: string;
  updated_at: string;
};

export type DocumentoComercialItemDatabase = {
  id: number;
  documento_id: number;
  produto_venda_id: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
};

export type DocumentoComercialDetalhado = DocumentoComercialDatabase & {
  itens: DocumentoComercialItemDatabase[];
};

export type DocumentoComercialItemInput = {
  produto_venda_id: number;
  quantidade: number;
  valor_unitario?: number;
};

export type NovoDocumentoComercial = {
  tipo: TipoDocumentoComercial;
  cliente_id: number;
  observacoes?: string;
  forma_pagamento?: string;
  data_validade?: string;
  orcamento_origem_id?: number | null;
  status?: StatusDocumentoComercial;
  itens: DocumentoComercialItemInput[];
};

export type ProdutoVendaParaDocumento = Pick<
  ProdutoVendaDatabase,
  'id' | 'nome' | 'descricao' | 'preco_venda' | 'ativo'
>;

// ===============================
// DATABASE
// ===============================

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('doceajuda.db');

  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        nome TEXT DEFAULT '',
        codigo_barras TEXT DEFAULT '',
        preco_ultima_entrada REAL DEFAULT 0,
        preco_medio REAL DEFAULT 0,
        quantidade REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        preco REAL DEFAULT 0,
        quantidade_embalagem REAL DEFAULT 1,
        unidade_medida TEXT NOT NULL DEFAULT 'un'
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

      CREATE TABLE IF NOT EXISTS receitas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        rendimento TEXT DEFAULT '',
        modo_preparo TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now','localtime'))
      );
      
      CREATE TABLE IF NOT EXISTS receita_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receita_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        quantidade_usada TEXT DEFAULT '',
        quantidade_numero REAL DEFAULT 0,
        unidade_medida TEXT DEFAULT 'un',
        FOREIGN KEY(receita_id) REFERENCES receitas(id),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );

      CREATE TABLE IF NOT EXISTS parametros_precificacao (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        salario_desejado REAL DEFAULT 0,
        valor_hora REAL DEFAULT 0,
        custos_fixos_mensais REAL DEFAULT 0,
        horas_trabalhadas_mes REAL DEFAULT 180,
        custos_variaveis REAL DEFAULT 0,
        margem_lucro REAL DEFAULT 30
      );

      CREATE TABLE IF NOT EXISTS custos_fixos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        valor REAL NOT NULL DEFAULT 0,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS custos_variaveis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        valor REAL NOT NULL DEFAULT 0,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime'))
      );


      CREATE TABLE IF NOT EXISTS produtos_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT DEFAULT '',
        tempo_producao_minutos REAL NOT NULL DEFAULT 0,
        custo_receitas REAL NOT NULL DEFAULT 0,
        custo_itens REAL NOT NULL DEFAULT 0,
        custo_mao_obra REAL NOT NULL DEFAULT 0,
        custo_operacional REAL NOT NULL DEFAULT 0,
        custo_total REAL NOT NULL DEFAULT 0,
        margem_lucro REAL NOT NULL DEFAULT 0,
        preco_sugerido REAL NOT NULL DEFAULT 0,
        preco_venda REAL NOT NULL DEFAULT 0,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS produto_venda_receitas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_venda_id INTEGER NOT NULL,
        receita_id INTEGER NOT NULL,
        quantidade_unidades REAL NOT NULL DEFAULT 0,
        FOREIGN KEY(produto_venda_id) REFERENCES produtos_venda(id) ON DELETE CASCADE,
        FOREIGN KEY(receita_id) REFERENCES receitas(id)
      );

      CREATE TABLE IF NOT EXISTS produto_venda_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_venda_id INTEGER NOT NULL,
        produto_estoque_id INTEGER NOT NULL,
        quantidade_usada REAL NOT NULL DEFAULT 0,
        unidade_medida TEXT NOT NULL DEFAULT 'un',
        FOREIGN KEY(produto_venda_id) REFERENCES produtos_venda(id) ON DELETE CASCADE,
        FOREIGN KEY(produto_estoque_id) REFERENCES produtos(id)
      );

      CREATE TABLE IF NOT EXISTS documentos_comerciais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL CHECK(tipo IN ('ORCAMENTO', 'VENDA')),
        cliente_id INTEGER NOT NULL,
        cliente_nome TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PENDENTE'
          CHECK(status IN ('PENDENTE', 'CONVERTIDO', 'CONCLUIDA', 'CANCELADA')),
        valor_total REAL NOT NULL DEFAULT 0,
        observacoes TEXT DEFAULT '',
        forma_pagamento TEXT DEFAULT '',
        data_validade TEXT DEFAULT '',
        orcamento_origem_id INTEGER,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(cliente_id) REFERENCES clientes(id),
        FOREIGN KEY(orcamento_origem_id) REFERENCES documentos_comerciais(id)
      );

      CREATE TABLE IF NOT EXISTS documentos_comerciais_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_id INTEGER NOT NULL,
        produto_venda_id INTEGER NOT NULL,
        produto_nome TEXT NOT NULL,
        quantidade REAL NOT NULL DEFAULT 0,
        valor_unitario REAL NOT NULL DEFAULT 0,
        subtotal REAL NOT NULL DEFAULT 0,
        FOREIGN KEY(documento_id)
          REFERENCES documentos_comerciais(id) ON DELETE CASCADE,
        FOREIGN KEY(produto_venda_id) REFERENCES produtos_venda(id)
      );

      CREATE INDEX IF NOT EXISTS idx_documentos_comerciais_tipo
        ON documentos_comerciais(tipo);

      CREATE INDEX IF NOT EXISTS idx_documentos_comerciais_cliente
        ON documentos_comerciais(cliente_id);

      CREATE INDEX IF NOT EXISTS idx_documentos_comerciais_criacao
        ON documentos_comerciais(created_at);

      CREATE INDEX IF NOT EXISTS idx_documentos_itens_documento
        ON documentos_comerciais_itens(documento_id);

      CREATE INDEX IF NOT EXISTS idx_documentos_itens_produto
        ON documentos_comerciais_itens(produto_venda_id);

      CREATE INDEX IF NOT EXISTS idx_produto_venda_receitas_produto
        ON produto_venda_receitas(produto_venda_id);

      CREATE INDEX IF NOT EXISTS idx_produto_venda_itens_produto
        ON produto_venda_itens(produto_venda_id);
    `);

    // As migrações existentes usam a referência global.
    // Ela só fica disponível enquanto a inicialização está protegida pela Promise.
    db = database;

    await aplicarMigracoesProdutos();
    await aplicarMigracoesMovimentacoes();
    await aplicarMigracoesClientes();
    await aplicarMigracoesReceitas();
    await aplicarMigracoesPrecificacao();

    return database;
  } catch (error) {
    db = null;

    try {
      await database.closeAsync();
    } catch {
      // Ignora falha ao fechar uma conexão cuja inicialização não terminou.
    }

    throw error;
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInitialization) {
    return databaseInitialization;
  }

  if (db) {
    return db;
  }

  databaseInitialization = initializeDatabase();

  try {
    const database = await databaseInitialization;
    db = database;
    return database;
  } finally {
    databaseInitialization = null;
  }
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

  if (!database) {
    throw new Error('Banco de dados ainda não foi inicializado.');
  }

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
  await adicionarColunaSeNaoExistir(
    'produtos',
    'quantidade_embalagem',
    'REAL DEFAULT 1'
  );
  await adicionarColunaSeNaoExistir(
    'produtos',
    'unidade_medida',
    "TEXT NOT NULL DEFAULT 'un'"
  );

  const database = db;

  if (!database) {
    throw new Error('Banco de dados não inicializado.');
  }

  await database.execAsync(`
    UPDATE produtos
    SET nome = descricao
    WHERE nome IS NULL OR nome = '';
  `);

  await database.execAsync(`
    UPDATE produtos
    SET unidade_medida = 'un'
    WHERE unidade_medida IS NULL OR TRIM(unidade_medida) = '';

    CREATE TRIGGER IF NOT EXISTS trg_produtos_unidade_obrigatoria_insert
    BEFORE INSERT ON produtos
    FOR EACH ROW
    WHEN NEW.unidade_medida IS NULL OR TRIM(NEW.unidade_medida) = ''
    BEGIN
      SELECT RAISE(ABORT, 'A unidade de medida e obrigatoria.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_produtos_unidade_obrigatoria_update
    BEFORE UPDATE OF unidade_medida ON produtos
    FOR EACH ROW
    WHEN NEW.unidade_medida IS NULL OR TRIM(NEW.unidade_medida) = ''
    BEGIN
      SELECT RAISE(ABORT, 'A unidade de medida e obrigatoria.');
    END;
  `);

  await database.execAsync(`
    UPDATE produtos
    SET preco_ultima_entrada = preco
    WHERE (preco_ultima_entrada IS NULL OR preco_ultima_entrada = 0)
      AND preco IS NOT NULL
      AND preco > 0;
  `);

  await database.execAsync(`
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

async function aplicarMigracoesReceitas(): Promise<void> {
  await adicionarColunaSeNaoExistir('receitas', 'rendimento', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir('receitas', 'modo_preparo', "TEXT DEFAULT ''");
  await adicionarColunaSeNaoExistir(
    'receitas',
    'created_at',
    "TEXT DEFAULT (datetime('now','localtime'))"
  );

  await adicionarColunaSeNaoExistir(
    'receita_itens',
    'quantidade_usada',
    "TEXT DEFAULT ''"
  );
}

async function aplicarMigracoesPrecificacao(): Promise<void> {

  const database = db;

  if (!database) {
    throw new Error('Banco de dados não inicializado.');
  }

  await adicionarColunaSeNaoExistir(
    'receita_itens',
    'quantidade_numero',
    'REAL DEFAULT 0'
  );

  await adicionarColunaSeNaoExistir(
    'receita_itens',
    'unidade_medida',
    "TEXT DEFAULT 'un'"
  );

  await adicionarColunaSeNaoExistir(
    'parametros_precificacao',
    'salario_desejado',
    'REAL DEFAULT 0'
  );

  await database.runAsync(
    `
    INSERT OR IGNORE INTO parametros_precificacao (
      id,
      salario_desejado,
      valor_hora,
      custos_fixos_mensais,
      horas_trabalhadas_mes,
      custos_variaveis,
      margem_lucro
    ) VALUES (1, 0, 0, 0, 180, 0, 30)
    `
  );

  await database.execAsync(`
    UPDATE parametros_precificacao
    SET salario_desejado = valor_hora * horas_trabalhadas_mes
    WHERE id = 1
      AND (salario_desejado IS NULL OR salario_desejado = 0)
      AND valor_hora > 0
      AND horas_trabalhadas_mes > 0;
  `);
}

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

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
    'unidade_medida',
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
      quantidade_embalagem,
      unidade_medida,
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
    'unidade_medida',
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
        quantidade_embalagem,
        unidade_medida,
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
      quantidade_embalagem,
      unidade_medida,
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
  const unidadeMedida = produto.unidade_medida?.trim().toLowerCase() || '';

  if (!nome) {
    throw new Error('Informe o nome do produto.');
  }

  if (
    !UNIDADES_MEDIDA_ESTOQUE.includes(
      unidadeMedida as UnidadeMedidaEstoque
    )
  ) {
    throw new Error('Selecione uma unidade de medida válida.');
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
      quantidade_embalagem,
      unidade_medida,
      ativo,
      preco
    ) VALUES (?, ?, ?, 0, 0, 0, 1, ?, 1, 0)
    `,
    [nome, nome, codigoBarras, unidadeMedida]
  );
}

export async function editarProduto(
  produto: EditarProdutoEstoque
): Promise<void> {
  const database = await getDatabase();

  const nome = produto.nome.trim();
  const codigoBarras = produto.codigo_barras?.trim() || '';
  const unidadeMedida = produto.unidade_medida?.trim().toLowerCase() || '';

  if (!produto.id) {
    throw new Error('Produto inválido.');
  }

  if (!nome) {
    throw new Error('Informe o nome do produto.');
  }

  if (
    !UNIDADES_MEDIDA_ESTOQUE.includes(
      unidadeMedida as UnidadeMedidaEstoque
    )
  ) {
    throw new Error('Selecione uma unidade de medida válida.');
  }

  await database.runAsync(
    `
    UPDATE produtos
    SET
      descricao = ?,
      nome = ?,
      codigo_barras = ?,
      unidade_medida = ?
    WHERE id = ?
    `,
    [nome, nome, codigoBarras, unidadeMedida, produto.id]
  );
}

export async function excluirProduto(produtoId: number): Promise<void> {
  const database = await getDatabase();

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  const usoEmProdutoVenda = await database.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM produto_venda_itens
    WHERE produto_estoque_id = ?
    `,
    [produtoId]
  );

  if ((usoEmProdutoVenda?.total ?? 0) > 0) {
    throw new Error(
      'Este item está sendo utilizado em um produto para venda e não pode ser excluído.'
    );
  }

  await database.runAsync(
    'DELETE FROM movimentacoes WHERE produto_id = ?',
    [produtoId]
  );

  await database.runAsync(
    'DELETE FROM receita_itens WHERE produto_id = ?',
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
      quantidade_embalagem,
      unidade_medida,
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
): Promise<number> {
  const database = await getDatabase();

  const nomeTratado = nome.trim();
  const telefoneTratado = telefone.trim();
  const enderecoTratado = endereco.trim();

  if (!nomeTratado) {
    throw new Error('Informe o nome do cliente.');
  }

  const resultado = await database.runAsync(
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

  return resultado.lastInsertRowId;
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

  const usoEmDocumento = await database.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM documentos_comerciais
    WHERE cliente_id = ?
    `,
    [id]
  );

  if ((usoEmDocumento?.total ?? 0) > 0) {
    throw new Error(
      'Este cliente possui orçamentos ou vendas vinculados e não pode ser excluído.'
    );
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

// ===============================
// CRUD DE RECEITAS
// ===============================

export async function listarReceitas(
  filtro: string = ''
): Promise<ReceitaDatabase[]> {
  const database = await getDatabase();
  const busca = filtro.trim();

  if (busca) {
    const buscaNumerica = Number(busca);

    if (!Number.isNaN(buscaNumerica)) {
      const resultado = await database.getAllAsync<ReceitaDatabase>(
        `
        SELECT
          id,
          nome,
          rendimento,
          modo_preparo,
          created_at
        FROM receitas
        WHERE id = ? OR nome LIKE ? OR rendimento LIKE ?
        ORDER BY nome COLLATE NOCASE ASC
        `,
        [buscaNumerica, `%${busca}%`, `%${busca}%`]
      );

      return resultado;
    }

    const resultado = await database.getAllAsync<ReceitaDatabase>(
      `
      SELECT
        id,
        nome,
        rendimento,
        modo_preparo,
        created_at
      FROM receitas
      WHERE nome LIKE ? OR rendimento LIKE ?
      ORDER BY nome COLLATE NOCASE ASC
      `,
      [`%${busca}%`, `%${busca}%`]
    );

    return resultado;
  }

  const resultado = await database.getAllAsync<ReceitaDatabase>(`
    SELECT
      id,
      nome,
      rendimento,
      modo_preparo,
      created_at
    FROM receitas
    ORDER BY nome COLLATE NOCASE ASC
  `);

  return resultado;
}

export async function adicionarReceita(
  nome: string,
  rendimento: string = '',
  modoPreparo: string = ''
): Promise<number> {
  const database = await getDatabase();

  const nomeTratado = nome.trim();
  const rendimentoTratado = rendimento.trim();
  const modoPreparoTratado = modoPreparo.trim();

  if (!nomeTratado) {
    throw new Error('Informe o nome da receita.');
  }

  if (!rendimentoTratado) {
    throw new Error('Informe o rendimento da receita.');
  }

  if (!modoPreparoTratado) {
    throw new Error('Informe o modo de preparo da receita.');
  }

  const resultado = await database.runAsync(
    `
    INSERT INTO receitas (
      nome,
      rendimento,
      modo_preparo
    ) VALUES (?, ?, ?)
    `,
    [nomeTratado, rendimentoTratado, modoPreparoTratado]
  );

  return resultado.lastInsertRowId;
}

export async function atualizarReceita(
  id: number,
  nome: string,
  rendimento: string = '',
  modoPreparo: string = ''
): Promise<void> {
  const database = await getDatabase();

  const nomeTratado = nome.trim();
  const rendimentoTratado = rendimento.trim();
  const modoPreparoTratado = modoPreparo.trim();

  if (!id) {
    throw new Error('Receita inválida.');
  }

  if (!nomeTratado) {
    throw new Error('Informe o nome da receita.');
  }

  if (!rendimentoTratado) {
    throw new Error('Informe o rendimento da receita.');
  }

  if (!modoPreparoTratado) {
    throw new Error('Informe o modo de preparo da receita.');
  }

  await database.runAsync(
    `
    UPDATE receitas
    SET
      nome = ?,
      rendimento = ?,
      modo_preparo = ?
    WHERE id = ?
    `,
    [nomeTratado, rendimentoTratado, modoPreparoTratado, id]
  );
}

export async function excluirReceita(id: number): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Receita inválida.');
  }

  const usoEmProdutoVenda = await database.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM produto_venda_receitas
    WHERE receita_id = ?
    `,
    [id]
  );

  if ((usoEmProdutoVenda?.total ?? 0) > 0) {
    throw new Error(
      'Esta receita está sendo utilizada em um produto para venda e não pode ser excluída.'
    );
  }

  await database.runAsync(
    'DELETE FROM receita_itens WHERE receita_id = ?',
    [id]
  );

  await database.runAsync(
    'DELETE FROM receitas WHERE id = ?',
    [id]
  );
}

export async function buscarReceitaPorId(
  id: number
): Promise<ReceitaDatabase | null> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Receita inválida.');
  }

  const receita = await database.getFirstAsync<ReceitaDatabase>(
    `
    SELECT
      id,
      nome,
      rendimento,
      modo_preparo,
      created_at
    FROM receitas
    WHERE id = ?
    `,
    [id]
  );

  return receita ?? null;
}

export async function adicionarItemReceita(
  receitaId: number,
  produtoId: number,
  quantidadeUsada: string,
  quantidadeNumero: number,
  unidadeMedida: string
): Promise<void> {
  const database = await getDatabase();

  const quantidadeTratada = quantidadeUsada.trim();

  if (!receitaId) {
    throw new Error('Receita inválida.');
  }

  if (!produtoId) {
    throw new Error('Produto inválido.');
  }

  if (!quantidadeTratada || !quantidadeNumero || quantidadeNumero <= 0) {
    throw new Error('Informe uma quantidade usada válida para o produto.');
  }

  const unidadeTratada = unidadeMedida.trim().toLowerCase() || 'un';

  await database.runAsync(
    `
    INSERT INTO receita_itens (
      receita_id,
      produto_id,
      quantidade_usada,
      quantidade_numero,
      unidade_medida
    ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      receitaId,
      produtoId,
      quantidadeTratada,
      quantidadeNumero,
      unidadeTratada,
    ]
  );
}

export async function listarItensReceita(
  receitaId: number
): Promise<ReceitaItemDetalhado[]> {
  const database = await getDatabase();

  if (!receitaId) {
    throw new Error('Receita inválida.');
  }

  const itens = await database.getAllAsync<ReceitaItemDetalhado>(
    `
    SELECT
      ri.id,
      ri.receita_id,
      ri.produto_id,
      p.nome AS produto_nome,
      p.codigo_barras,
      ri.quantidade_usada,
      ri.quantidade_numero,
      ri.unidade_medida
    FROM receita_itens ri
    INNER JOIN produtos p ON p.id = ri.produto_id
    WHERE ri.receita_id = ?
    ORDER BY p.nome COLLATE NOCASE ASC
    `,
    [receitaId]
  );

  return itens;
}

export async function excluirItensReceita(receitaId: number): Promise<void> {
  const database = await getDatabase();

  if (!receitaId) {
    throw new Error('Receita inválida.');
  }

  await database.runAsync(
    'DELETE FROM receita_itens WHERE receita_id = ?',
    [receitaId]
  );
}

export async function buscarReceitaDetalhada(
  id: number
): Promise<ReceitaDetalhada | null> {
  const receita = await buscarReceitaPorId(id);

  if (!receita) {
    return null;
  }

  const itens = await listarItensReceita(id);

  return {
    ...receita,
    itens,
  };
}

export async function salvarReceitaCompleta(
  nome: string,
  rendimento: string,
  modoPreparo: string,
  itens: NovoItemReceita[]
): Promise<number> {
  if (!itens.length) {
    throw new Error('Adicione pelo menos um produto à receita.');
  }

  const receitaId = await adicionarReceita(nome, rendimento, modoPreparo);

  for (const item of itens) {
    await adicionarItemReceita(
      receitaId,
      item.produto_id,
      item.quantidade_usada,
      item.quantidade_numero,
      item.unidade_medida
    );
  }

  return receitaId;
}

export async function editarReceitaCompleta(
  receitaId: number,
  nome: string,
  rendimento: string,
  modoPreparo: string,
  itens: NovoItemReceita[]
): Promise<void> {
  if (!receitaId) {
    throw new Error('Receita inválida.');
  }

  if (!itens.length) {
    throw new Error('Adicione pelo menos um produto à receita.');
  }

  await atualizarReceita(receitaId, nome, rendimento, modoPreparo);

  await excluirItensReceita(receitaId);

  for (const item of itens) {
    await adicionarItemReceita(
      receitaId,
      item.produto_id,
      item.quantidade_usada,
      item.quantidade_numero,
      item.unidade_medida
    );
  }
}

export async function buscarProdutosParaReceita(
  filtro: string = ''
): Promise<ProdutoParaReceita[]> {
  const database = await getDatabase();
  const busca = filtro.trim();

  if (!busca) {
    return [];
  }

  const buscaNumerica = Number(busca);

  if (!Number.isNaN(buscaNumerica)) {
    const resultado = await database.getAllAsync<ProdutoParaReceita>(
      `
      SELECT
        id,
        descricao,
        nome,
        codigo_barras,
        preco_medio,
        quantidade,
        quantidade_embalagem,
        unidade_medida
      FROM produtos
      WHERE ativo = 1
        AND (
          id = ?
          OR nome LIKE ?
          OR descricao LIKE ?
          OR codigo_barras LIKE ?
        )
      ORDER BY nome COLLATE NOCASE ASC
      LIMIT 20
      `,
      [buscaNumerica, `%${busca}%`, `%${busca}%`, `%${busca}%`]
    );

    return resultado;
  }

  const resultado = await database.getAllAsync<ProdutoParaReceita>(
    `
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_medio,
      quantidade,
      quantidade_embalagem,
      unidade_medida
    FROM produtos
    WHERE ativo = 1
      AND (
        nome LIKE ?
        OR descricao LIKE ?
        OR codigo_barras LIKE ?
      )
    ORDER BY nome COLLATE NOCASE ASC
    LIMIT 20
    `,
    [`%${busca}%`, `%${busca}%`, `%${busca}%`]
  );

  return resultado;
}

export async function buscarProdutoPorCodigoBarras(
  codigoBarras: string
): Promise<ProdutoParaReceita | null> {
  const database = await getDatabase();
  const codigoTratado = codigoBarras.trim();

  if (!codigoTratado) {
    return null;
  }

  const produto = await database.getFirstAsync<ProdutoParaReceita>(
    `
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_medio,
      quantidade,
      quantidade_embalagem,
      unidade_medida
    FROM produtos
    WHERE ativo = 1
      AND codigo_barras = ?
    LIMIT 1
    `,
    [codigoTratado]
  );

  return produto ?? null;
}

// ===============================
// PARÂMETROS DE PRECIFICAÇÃO
// ===============================

export async function buscarParametrosPrecificacao(): Promise<ParametrosPrecificacao> {
  const database = await getDatabase();

  await database.runAsync(
    `
    INSERT OR IGNORE INTO parametros_precificacao (
      id,
      salario_desejado,
      valor_hora,
      custos_fixos_mensais,
      horas_trabalhadas_mes,
      custos_variaveis,
      margem_lucro
    ) VALUES (1, 0, 0, 0, 180, 0, 30)
    `
  );

  const parametros = await database.getFirstAsync<ParametrosPrecificacao>(
    `
    SELECT
      p.id,
      p.salario_desejado,
      p.horas_trabalhadas_mes,
      p.margem_lucro,
      CASE
        WHEN p.horas_trabalhadas_mes > 0
          THEN p.salario_desejado / p.horas_trabalhadas_mes
        ELSE 0
      END AS valor_hora,
      COALESCE((
        SELECT SUM(valor)
        FROM custos_fixos
        WHERE ativo = 1
      ), p.custos_fixos_mensais, 0) AS custos_fixos_mensais,
      COALESCE((
        SELECT SUM(valor)
        FROM custos_variaveis
        WHERE ativo = 1
      ), p.custos_variaveis, 0) AS custos_variaveis
    FROM parametros_precificacao p
    WHERE p.id = 1
    `
  );

  if (!parametros) {
    throw new Error('Não foi possível carregar os parâmetros de precificação.');
  }

  return parametros;
}

export function salvarParametrosPrecificacao(
  salarioDesejado: number,
  horasTrabalhadasMes: number,
  margemLucro: number
): Promise<void>;

export function salvarParametrosPrecificacao(
  valorHora: number,
  custosFixosMensais: number,
  horasTrabalhadasMes: number,
  custosVariaveis: number,
  margemLucro: number
): Promise<void>;

export async function salvarParametrosPrecificacao(
  primeiroValor: number,
  segundoValor: number,
  terceiroValor: number,
  quartoValor?: number,
  quintoValor?: number
): Promise<void> {
  const database = await getDatabase();

  const usandoFormatoAntigo = quintoValor !== undefined;

  const salarioDesejado = usandoFormatoAntigo
    ? primeiroValor * terceiroValor
    : primeiroValor;

  const horasTrabalhadasMes = usandoFormatoAntigo
    ? terceiroValor
    : segundoValor;

  const margemLucro = usandoFormatoAntigo
    ? quintoValor ?? 0
    : terceiroValor;

  const custosFixosLegados = usandoFormatoAntigo ? segundoValor : undefined;
  const custosVariaveisLegados = usandoFormatoAntigo ? quartoValor : undefined;

  if (salarioDesejado < 0) {
    throw new Error('O salário desejado não pode ser negativo.');
  }

  if (horasTrabalhadasMes <= 0) {
    throw new Error('As horas trabalhadas no mês devem ser maiores que zero.');
  }

  if (margemLucro < 0 || margemLucro >= 100) {
    throw new Error('A margem de lucro deve estar entre 0% e 99,99%.');
  }

  const valorHora = salarioDesejado / horasTrabalhadasMes;

  await database.runAsync(
    `
    INSERT OR REPLACE INTO parametros_precificacao (
      id,
      salario_desejado,
      valor_hora,
      custos_fixos_mensais,
      horas_trabalhadas_mes,
      custos_variaveis,
      margem_lucro
    ) VALUES (
      1,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
    `,
    [
      salarioDesejado,
      valorHora,
      custosFixosLegados ?? 0,
      horasTrabalhadasMes,
      custosVariaveisLegados ?? 0,
      margemLucro,
    ]
  );
}

// ===============================
// CRUD DE CUSTOS FIXOS
// ===============================

export async function listarCustosFixos(
  incluirInativos: boolean = false
): Promise<CustoFixoDatabase[]> {
  const database = await getDatabase();

  const where = incluirInativos ? '' : 'WHERE ativo = 1';

  return database.getAllAsync<CustoFixoDatabase>(`
    SELECT id, nome, valor, ativo, created_at
    FROM custos_fixos
    ${where}
    ORDER BY nome COLLATE NOCASE ASC
  `);
}

export async function adicionarCustoFixo(
  nome: string,
  valor: number
): Promise<number> {
  const database = await getDatabase();
  const nomeTratado = nome.trim();

  if (!nomeTratado) {
    throw new Error('Informe o nome do custo fixo.');
  }

  if (valor < 0) {
    throw new Error('O valor do custo fixo não pode ser negativo.');
  }

  const resultado = await database.runAsync(
    `INSERT INTO custos_fixos (nome, valor, ativo) VALUES (?, ?, 1)`,
    nomeTratado,
    valor
  );

  return resultado.lastInsertRowId;
}

export async function atualizarCustoFixo(
  id: number,
  nome: string,
  valor: number
): Promise<void> {
  const database = await getDatabase();
  const nomeTratado = nome.trim();

  if (!id) throw new Error('Custo fixo inválido.');
  if (!nomeTratado) throw new Error('Informe o nome do custo fixo.');
  if (valor < 0) throw new Error('O valor do custo fixo não pode ser negativo.');

  await database.runAsync(
    `UPDATE custos_fixos SET nome = ?, valor = ? WHERE id = ?`,
    nomeTratado,
    valor,
    id
  );
}

export async function excluirCustoFixo(id: number): Promise<void> {
  const database = await getDatabase();
  if (!id) throw new Error('Custo fixo inválido.');
  await database.runAsync('DELETE FROM custos_fixos WHERE id = ?', id);
}

export async function alterarStatusCustoFixo(
  id: number,
  ativo: boolean
): Promise<void> {
  const database = await getDatabase();
  if (!id) throw new Error('Custo fixo inválido.');
  await database.runAsync(
    'UPDATE custos_fixos SET ativo = ? WHERE id = ?',
    ativo ? 1 : 0,
    id
  );
}

export async function obterTotalCustosFixos(): Promise<number> {
  const database = await getDatabase();
  const resultado = await database.getFirstAsync<{ total: number }>(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM custos_fixos
    WHERE ativo = 1
  `);
  return resultado?.total ?? 0;
}

// ===============================
// CRUD DE CUSTOS VARIÁVEIS
// ===============================

export async function listarCustosVariaveis(
  incluirInativos: boolean = false
): Promise<CustoVariavelDatabase[]> {
  const database = await getDatabase();

  const where = incluirInativos ? '' : 'WHERE ativo = 1';

  return database.getAllAsync<CustoVariavelDatabase>(`
    SELECT id, nome, valor, ativo, created_at
    FROM custos_variaveis
    ${where}
    ORDER BY nome COLLATE NOCASE ASC
  `);
}

export async function adicionarCustoVariavel(
  nome: string,
  valor: number
): Promise<number> {
  const database = await getDatabase();
  const nomeTratado = nome.trim();

  if (!nomeTratado) {
    throw new Error('Informe o nome do custo variável.');
  }

  if (valor < 0) {
    throw new Error('O valor do custo variável não pode ser negativo.');
  }

  const resultado = await database.runAsync(
    `INSERT INTO custos_variaveis (nome, valor, ativo) VALUES (?, ?, 1)`,
    nomeTratado,
    valor
  );

  return resultado.lastInsertRowId;
}

export async function atualizarCustoVariavel(
  id: number,
  nome: string,
  valor: number
): Promise<void> {
  const database = await getDatabase();
  const nomeTratado = nome.trim();

  if (!id) throw new Error('Custo variável inválido.');
  if (!nomeTratado) throw new Error('Informe o nome do custo variável.');
  if (valor < 0) throw new Error('O valor do custo variável não pode ser negativo.');

  await database.runAsync(
    `UPDATE custos_variaveis SET nome = ?, valor = ? WHERE id = ?`,
    nomeTratado,
    valor,
    id
  );
}

export async function excluirCustoVariavel(id: number): Promise<void> {
  const database = await getDatabase();
  if (!id) throw new Error('Custo variável inválido.');
  await database.runAsync('DELETE FROM custos_variaveis WHERE id = ?', id);
}

export async function alterarStatusCustoVariavel(
  id: number,
  ativo: boolean
): Promise<void> {
  const database = await getDatabase();
  if (!id) throw new Error('Custo variável inválido.');
  await database.runAsync(
    'UPDATE custos_variaveis SET ativo = ? WHERE id = ?',
    ativo ? 1 : 0,
    id
  );
}

export async function obterTotalCustosVariaveis(): Promise<number> {
  const database = await getDatabase();
  const resultado = await database.getFirstAsync<{ total: number }>(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM custos_variaveis
    WHERE ativo = 1
  `);
  return resultado?.total ?? 0;
}

export async function buscarReceitaParaPrecificacao(
  receitaId: number
): Promise<ReceitaParaPrecificacao | null> {
  const database = await getDatabase();

  const receita = await database.getFirstAsync<{
    id: number;
    nome: string;
    rendimento: string;
    modo_preparo: string;
  }>(
    `
    SELECT
      id,
      nome,
      rendimento,
      modo_preparo
    FROM receitas
    WHERE id = ?
    `,
    [receitaId]
  );

  if (!receita) {
    return null;
  }

  const itens = await database.getAllAsync<ReceitaItemPrecificacao>(
    `
    SELECT
      ri.id,
      ri.receita_id,
      ri.produto_id,
      p.nome AS produto_nome,
      p.codigo_barras,
      p.preco_medio,
      p.quantidade_embalagem,
      p.unidade_medida AS unidade_medida_produto,
      ri.quantidade_usada,
      ri.quantidade_numero,
      ri.unidade_medida
    FROM receita_itens ri
    INNER JOIN produtos p ON p.id = ri.produto_id
    WHERE ri.receita_id = ?
    ORDER BY p.nome COLLATE NOCASE ASC
    `,
    [receitaId]
  );

  return {
    ...receita,
    itens,
  };
}

export function extrairNumeroRendimento(rendimento: string): number {
  const match = rendimento.replace(',', '.').match(/\d+(\.\d+)?/);

  if (!match) {
    return 0;
  }

  return Number(match[0]);
}


// ===============================
// CRUD DE PRODUTOS PARA VENDA
// ===============================

function validarProdutoVenda(produto: NovoProdutoVenda): void {
  if (!produto.nome.trim()) {
    throw new Error('Informe o nome do produto para venda.');
  }

  if (produto.tempo_producao_minutos <= 0) {
    throw new Error('Informe um tempo de produção maior que zero.');
  }

  if (produto.margem_lucro < 0 || produto.margem_lucro >= 100) {
    throw new Error('A margem de lucro deve estar entre 0% e 99,99%.');
  }

  if (produto.preco_venda <= 0) {
    throw new Error('Informe o preço definitivo de venda.');
  }

  if (produto.receitas.length === 0 && produto.itens.length === 0) {
    throw new Error('Adicione pelo menos uma receita ou item do estoque.');
  }

  const receitaInvalida = produto.receitas.some(
    (item) => !item.receita_id || item.quantidade_unidades <= 0
  );

  if (receitaInvalida) {
    throw new Error('Existe uma receita com quantidade inválida.');
  }

  const itemInvalido = produto.itens.some(
    (item) =>
      !item.produto_estoque_id ||
      item.quantidade_usada <= 0 ||
      !item.unidade_medida.trim()
  );

  if (itemInvalido) {
    throw new Error('Existe um item do estoque com quantidade inválida.');
  }
}

export async function listarProdutosVenda(
  filtro: string = '',
  incluirInativos: boolean = false
): Promise<ProdutoVendaDatabase[]> {
  const database = await getDatabase();
  const busca = filtro.trim();
  const condicaoAtivo = incluirInativos ? '' : 'pv.ativo = 1';
  const condicoes: string[] = [];
  const parametros: (string | number)[] = [];

  if (condicaoAtivo) {
    condicoes.push(condicaoAtivo);
  }

  if (busca) {
    const buscaNumerica = Number(busca);

    if (!Number.isNaN(buscaNumerica)) {
      condicoes.push('(pv.id = ? OR pv.nome LIKE ? OR pv.descricao LIKE ?)');
      parametros.push(buscaNumerica, `%${busca}%`, `%${busca}%`);
    } else {
      condicoes.push('(pv.nome LIKE ? OR pv.descricao LIKE ?)');
      parametros.push(`%${busca}%`, `%${busca}%`);
    }
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

  return database.getAllAsync<ProdutoVendaDatabase>(
    `
    SELECT
      pv.id,
      pv.nome,
      pv.descricao,
      pv.tempo_producao_minutos,
      pv.custo_receitas,
      pv.custo_itens,
      pv.custo_mao_obra,
      pv.custo_operacional,
      pv.custo_total,
      pv.margem_lucro,
      pv.preco_sugerido,
      pv.preco_venda,
      pv.ativo,
      pv.created_at,
      pv.updated_at
    FROM produtos_venda pv
    ${where}
    ORDER BY pv.nome COLLATE NOCASE ASC
    `,
    parametros
  );
}

export async function buscarProdutoVendaPorId(
  id: number
): Promise<ProdutoVendaDatabase | null> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Produto para venda inválido.');
  }

  const produto = await database.getFirstAsync<ProdutoVendaDatabase>(
    `
    SELECT
      id,
      nome,
      descricao,
      tempo_producao_minutos,
      custo_receitas,
      custo_itens,
      custo_mao_obra,
      custo_operacional,
      custo_total,
      margem_lucro,
      preco_sugerido,
      preco_venda,
      ativo,
      created_at,
      updated_at
    FROM produtos_venda
    WHERE id = ?
    `,
    [id]
  );

  return produto ?? null;
}

export async function buscarProdutoVendaDetalhado(
  id: number
): Promise<ProdutoVendaDetalhado | null> {
  const database = await getDatabase();
  const produto = await buscarProdutoVendaPorId(id);

  if (!produto) {
    return null;
  }

  const receitas = await database.getAllAsync<ProdutoVendaReceitaDetalhada>(
    `
    SELECT
      pvr.id,
      pvr.produto_venda_id,
      pvr.receita_id,
      r.nome AS receita_nome,
      r.rendimento AS receita_rendimento,
      pvr.quantidade_unidades
    FROM produto_venda_receitas pvr
    INNER JOIN receitas r ON r.id = pvr.receita_id
    WHERE pvr.produto_venda_id = ?
    ORDER BY r.nome COLLATE NOCASE ASC
    `,
    [id]
  );

  const itens = await database.getAllAsync<ProdutoVendaItemDetalhado>(
    `
    SELECT
      pvi.id,
      pvi.produto_venda_id,
      pvi.produto_estoque_id,
      p.nome AS produto_nome,
      pvi.quantidade_usada,
      pvi.unidade_medida,
      p.preco_medio,
      p.quantidade_embalagem,
      p.unidade_medida AS unidade_medida_produto
    FROM produto_venda_itens pvi
    INNER JOIN produtos p ON p.id = pvi.produto_estoque_id
    WHERE pvi.produto_venda_id = ?
    ORDER BY p.nome COLLATE NOCASE ASC
    `,
    [id]
  );

  return {
    ...produto,
    receitas,
    itens,
  };
}

async function inserirComposicaoProdutoVenda(
  database: SQLite.SQLiteDatabase,
  produtoVendaId: number,
  produto: NovoProdutoVenda
): Promise<void> {
  for (const receita of produto.receitas) {
    await database.runAsync(
      `
      INSERT INTO produto_venda_receitas (
        produto_venda_id,
        receita_id,
        quantidade_unidades
      ) VALUES (?, ?, ?)
      `,
      [produtoVendaId, receita.receita_id, receita.quantidade_unidades]
    );
  }

  for (const item of produto.itens) {
    await database.runAsync(
      `
      INSERT INTO produto_venda_itens (
        produto_venda_id,
        produto_estoque_id,
        quantidade_usada,
        unidade_medida
      ) VALUES (?, ?, ?, ?)
      `,
      [
        produtoVendaId,
        item.produto_estoque_id,
        item.quantidade_usada,
        item.unidade_medida.trim().toLowerCase(),
      ]
    );
  }
}

export async function salvarProdutoVendaCompleto(
  produto: NovoProdutoVenda
): Promise<number> {
  validarProdutoVenda(produto);
  const database = await getDatabase();
  let produtoVendaId = 0;

  await database.withTransactionAsync(async () => {
    const resultado = await database.runAsync(
      `
      INSERT INTO produtos_venda (
        nome,
        descricao,
        tempo_producao_minutos,
        custo_receitas,
        custo_itens,
        custo_mao_obra,
        custo_operacional,
        custo_total,
        margem_lucro,
        preco_sugerido,
        preco_venda,
        ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        produto.nome.trim(),
        produto.descricao?.trim() ?? '',
        produto.tempo_producao_minutos,
        produto.custo_receitas,
        produto.custo_itens,
        produto.custo_mao_obra,
        produto.custo_operacional,
        produto.custo_total,
        produto.margem_lucro,
        produto.preco_sugerido,
        produto.preco_venda,
      ]
    );

    produtoVendaId = resultado.lastInsertRowId;
    await inserirComposicaoProdutoVenda(database, produtoVendaId, produto);
  });

  return produtoVendaId;
}

export async function atualizarProdutoVendaCompleto(
  id: number,
  produto: NovoProdutoVenda
): Promise<void> {
  if (!id) {
    throw new Error('Produto para venda inválido.');
  }

  validarProdutoVenda(produto);
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
      UPDATE produtos_venda
      SET
        nome = ?,
        descricao = ?,
        tempo_producao_minutos = ?,
        custo_receitas = ?,
        custo_itens = ?,
        custo_mao_obra = ?,
        custo_operacional = ?,
        custo_total = ?,
        margem_lucro = ?,
        preco_sugerido = ?,
        preco_venda = ?,
        updated_at = datetime('now','localtime')
      WHERE id = ?
      `,
      [
        produto.nome.trim(),
        produto.descricao?.trim() ?? '',
        produto.tempo_producao_minutos,
        produto.custo_receitas,
        produto.custo_itens,
        produto.custo_mao_obra,
        produto.custo_operacional,
        produto.custo_total,
        produto.margem_lucro,
        produto.preco_sugerido,
        produto.preco_venda,
        id,
      ]
    );

    await database.runAsync(
      'DELETE FROM produto_venda_receitas WHERE produto_venda_id = ?',
      [id]
    );

    await database.runAsync(
      'DELETE FROM produto_venda_itens WHERE produto_venda_id = ?',
      [id]
    );

    await inserirComposicaoProdutoVenda(database, id, produto);
  });
}

export async function excluirProdutoVenda(id: number): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Produto para venda inválido.');
  }

  const usoEmDocumento = await database.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM documentos_comerciais_itens
    WHERE produto_venda_id = ?
    `,
    [id]
  );

  if ((usoEmDocumento?.total ?? 0) > 0) {
    throw new Error(
      'Este produto está sendo utilizado em um orçamento ou venda e não pode ser excluído.'
    );
  }

  await database.runAsync('DELETE FROM produtos_venda WHERE id = ?', [id]);
}

export async function alterarStatusProdutoVenda(
  id: number,
  ativo: boolean
): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Produto para venda inválido.');
  }

  await database.runAsync(
    `
    UPDATE produtos_venda
    SET ativo = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
    `,
    [ativo ? 1 : 0, id]
  );
}

// ===============================
// CRUD COMPARTILHADO DE ORÇAMENTOS / VENDAS
// ===============================

type ItemDocumentoPreparado = {
  produto_venda_id: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
};

function arredondarValorMonetario(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function obterStatusInicialDocumento(
  tipo: TipoDocumentoComercial
): StatusDocumentoComercial {
  return tipo === 'ORCAMENTO' ? 'PENDENTE' : 'CONCLUIDA';
}

function validarStatusDocumento(
  tipo: TipoDocumentoComercial,
  status: StatusDocumentoComercial
): void {
  const statusOrcamento: StatusDocumentoComercial[] = [
    'PENDENTE',
    'CONVERTIDO',
    'CANCELADA',
  ];

  const statusVenda: StatusDocumentoComercial[] = [
    'CONCLUIDA',
    'CANCELADA',
  ];

  const permitido =
    tipo === 'ORCAMENTO'
      ? statusOrcamento.includes(status)
      : statusVenda.includes(status);

  if (!permitido) {
    throw new Error('O status informado não é válido para este documento.');
  }
}

async function prepararDocumentoComercial(
  database: SQLite.SQLiteDatabase,
  documento: NovoDocumentoComercial
): Promise<{
  clienteNome: string;
  status: StatusDocumentoComercial;
  itens: ItemDocumentoPreparado[];
  valorTotal: number;
}> {
  if (documento.tipo !== 'ORCAMENTO' && documento.tipo !== 'VENDA') {
    throw new Error('Tipo de documento comercial inválido.');
  }

  if (!documento.cliente_id) {
    throw new Error('Selecione um cliente.');
  }

  if (!documento.itens.length) {
    throw new Error('Adicione pelo menos um produto.');
  }

  const cliente = await database.getFirstAsync<{ id: number; nome: string }>(
    `SELECT id, nome FROM clientes WHERE id = ?`,
    [documento.cliente_id]
  );

  if (!cliente) {
    throw new Error('Cliente não encontrado.');
  }

  const status = documento.status ?? obterStatusInicialDocumento(documento.tipo);
  validarStatusDocumento(documento.tipo, status);

  const produtosAdicionados = new Set<number>();
  const itens: ItemDocumentoPreparado[] = [];

  for (const item of documento.itens) {
    if (!item.produto_venda_id) {
      throw new Error('Existe um produto inválido no documento.');
    }

    if (produtosAdicionados.has(item.produto_venda_id)) {
      throw new Error(
        'O mesmo produto foi adicionado mais de uma vez. Altere a quantidade do item existente.'
      );
    }

    if (!Number.isFinite(item.quantidade) || item.quantidade <= 0) {
      throw new Error('A quantidade dos produtos deve ser maior que zero.');
    }

    const produto = await database.getFirstAsync<ProdutoVendaParaDocumento>(
      `
      SELECT id, nome, descricao, preco_venda, ativo
      FROM produtos_venda
      WHERE id = ? AND ativo = 1
      `,
      [item.produto_venda_id]
    );

    if (!produto) {
      throw new Error('Um dos produtos não foi encontrado ou está inativo.');
    }

    const valorUnitario = item.valor_unitario ?? produto.preco_venda;

    if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
      throw new Error(
        `Informe um valor unitário válido para o produto ${produto.nome}.`
      );
    }

    const quantidade = item.quantidade;
    const subtotal = arredondarValorMonetario(quantidade * valorUnitario);

    itens.push({
      produto_venda_id: produto.id,
      produto_nome: produto.nome,
      quantidade,
      valor_unitario: arredondarValorMonetario(valorUnitario),
      subtotal,
    });

    produtosAdicionados.add(produto.id);
  }

  const valorTotal = arredondarValorMonetario(
    itens.reduce((total, item) => total + item.subtotal, 0)
  );

  return {
    clienteNome: cliente.nome,
    status,
    itens,
    valorTotal,
  };
}

async function inserirItensDocumentoComercial(
  database: SQLite.SQLiteDatabase,
  documentoId: number,
  itens: ItemDocumentoPreparado[]
): Promise<void> {
  for (const item of itens) {
    await database.runAsync(
      `
      INSERT INTO documentos_comerciais_itens (
        documento_id,
        produto_venda_id,
        produto_nome,
        quantidade,
        valor_unitario,
        subtotal
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        documentoId,
        item.produto_venda_id,
        item.produto_nome,
        item.quantidade,
        item.valor_unitario,
        item.subtotal,
      ]
    );
  }
}

export async function buscarProdutosVendaParaDocumento(
  filtro: string = ''
): Promise<ProdutoVendaParaDocumento[]> {
  const database = await getDatabase();
  const busca = filtro.trim();
  const parametros: (string | number)[] = [];
  let condicaoBusca = '';

  if (busca) {
    const buscaNumerica = Number(busca);

    if (!Number.isNaN(buscaNumerica)) {
      condicaoBusca = `
        AND (id = ? OR nome LIKE ? OR descricao LIKE ?)
      `;
      parametros.push(buscaNumerica, `%${busca}%`, `%${busca}%`);
    } else {
      condicaoBusca = `
        AND (nome LIKE ? OR descricao LIKE ?)
      `;
      parametros.push(`%${busca}%`, `%${busca}%`);
    }
  }

  return database.getAllAsync<ProdutoVendaParaDocumento>(
    `
    SELECT id, nome, descricao, preco_venda, ativo
    FROM produtos_venda
    WHERE ativo = 1
    ${condicaoBusca}
    ORDER BY nome COLLATE NOCASE ASC
    LIMIT 30
    `,
    parametros
  );
}

export async function listarDocumentosComerciais(
  tipo: TipoDocumentoComercial | 'TODOS' = 'TODOS',
  filtro: string = '',
  ordenarPor: OrdenarDocumentoComercialPor = 'created_at',
  direcao: DirecaoOrdenacao = 'DESC'
): Promise<DocumentoComercialDatabase[]> {
  const database = await getDatabase();

  const colunasPermitidas: Record<OrdenarDocumentoComercialPor, string> = {
    id: 'dc.id',
    cliente_nome: 'dc.cliente_nome',
    valor_total: 'dc.valor_total',
    created_at: 'dc.created_at',
  };

  const colunaOrdenacao = colunasPermitidas[ordenarPor] ?? 'dc.created_at';
  const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
  const condicoes: string[] = [];
  const parametros: (string | number)[] = [];
  const busca = filtro.trim();

  if (tipo !== 'TODOS') {
    condicoes.push('dc.tipo = ?');
    parametros.push(tipo);
  }

  if (busca) {
    const buscaNumerica = Number(busca);

    if (!Number.isNaN(buscaNumerica)) {
      condicoes.push('(dc.id = ? OR dc.cliente_nome LIKE ?)');
      parametros.push(buscaNumerica, `%${busca}%`);
    } else {
      condicoes.push('dc.cliente_nome LIKE ?');
      parametros.push(`%${busca}%`);
    }
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  return database.getAllAsync<DocumentoComercialDatabase>(
    `
    SELECT
      dc.id,
      dc.tipo,
      dc.cliente_id,
      dc.cliente_nome,
      dc.status,
      dc.valor_total,
      dc.observacoes,
      dc.forma_pagamento,
      dc.data_validade,
      dc.orcamento_origem_id,
      dc.created_at,
      dc.updated_at
    FROM documentos_comerciais dc
    ${where}
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}, dc.id ${direcaoOrdenacao}
    `,
    parametros
  );
}

export async function listarOrcamentos(
  filtro: string = '',
  ordenarPor: OrdenarDocumentoComercialPor = 'created_at',
  direcao: DirecaoOrdenacao = 'DESC'
): Promise<DocumentoComercialDatabase[]> {
  return listarDocumentosComerciais(
    'ORCAMENTO',
    filtro,
    ordenarPor,
    direcao
  );
}

export async function listarVendas(
  filtro: string = '',
  ordenarPor: OrdenarDocumentoComercialPor = 'created_at',
  direcao: DirecaoOrdenacao = 'DESC'
): Promise<DocumentoComercialDatabase[]> {
  return listarDocumentosComerciais('VENDA', filtro, ordenarPor, direcao);
}

export async function listarItensDocumentoComercial(
  documentoId: number
): Promise<DocumentoComercialItemDatabase[]> {
  const database = await getDatabase();

  if (!documentoId) {
    throw new Error('Documento comercial inválido.');
  }

  return database.getAllAsync<DocumentoComercialItemDatabase>(
    `
    SELECT
      id,
      documento_id,
      produto_venda_id,
      produto_nome,
      quantidade,
      valor_unitario,
      subtotal
    FROM documentos_comerciais_itens
    WHERE documento_id = ?
    ORDER BY id ASC
    `,
    [documentoId]
  );
}

export async function buscarDocumentoComercialPorId(
  id: number
): Promise<DocumentoComercialDetalhado | null> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Documento comercial inválido.');
  }

  const documento = await database.getFirstAsync<DocumentoComercialDatabase>(
    `
    SELECT
      id,
      tipo,
      cliente_id,
      cliente_nome,
      status,
      valor_total,
      observacoes,
      forma_pagamento,
      data_validade,
      orcamento_origem_id,
      created_at,
      updated_at
    FROM documentos_comerciais
    WHERE id = ?
    `,
    [id]
  );

  if (!documento) {
    return null;
  }

  const itens = await listarItensDocumentoComercial(id);

  return {
    ...documento,
    itens,
  };
}

export async function salvarDocumentoComercialCompleto(
  documento: NovoDocumentoComercial
): Promise<number> {
  const database = await getDatabase();
  const preparado = await prepararDocumentoComercial(database, documento);
  let documentoId = 0;

  await database.withTransactionAsync(async () => {
    const resultado = await database.runAsync(
      `
      INSERT INTO documentos_comerciais (
        tipo,
        cliente_id,
        cliente_nome,
        status,
        valor_total,
        observacoes,
        forma_pagamento,
        data_validade,
        orcamento_origem_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        documento.tipo,
        documento.cliente_id,
        preparado.clienteNome,
        preparado.status,
        preparado.valorTotal,
        documento.observacoes?.trim() ?? '',
        documento.forma_pagamento?.trim() ?? '',
        documento.data_validade?.trim() ?? '',
        documento.orcamento_origem_id ?? null,
      ]
    );

    documentoId = resultado.lastInsertRowId;
    await inserirItensDocumentoComercial(
      database,
      documentoId,
      preparado.itens
    );

    if (documento.tipo === 'VENDA') {
      await database.runAsync(
        `
        UPDATE clientes
        SET total_compras = (
          SELECT COALESCE(SUM(valor_total), 0)
          FROM documentos_comerciais
          WHERE tipo = 'VENDA'
            AND status = 'CONCLUIDA'
            AND cliente_id = ?
        )
        WHERE id = ?
        `,
        [documento.cliente_id, documento.cliente_id]
      );
    }
  });

  return documentoId;
}


export async function converterOrcamentoEmVenda(
  orcamentoId: number,
  venda: NovoDocumentoComercial
): Promise<number> {
  const database = await getDatabase();

  if (!orcamentoId) {
    throw new Error('Orçamento inválido.');
  }

  const orcamento = await database.getFirstAsync<{
    id: number;
    tipo: TipoDocumentoComercial;
    status: StatusDocumentoComercial;
  }>(
    `
    SELECT id, tipo, status
    FROM documentos_comerciais
    WHERE id = ?
    `,
    [orcamentoId]
  );

  if (!orcamento || orcamento.tipo !== 'ORCAMENTO') {
    throw new Error('Orçamento não encontrado.');
  }

  if (orcamento.status !== 'PENDENTE') {
    throw new Error('Somente orçamentos pendentes podem ser transformados em venda.');
  }

  const vendaExistente = await database.getFirstAsync<{ id: number }>(
    `
    SELECT id
    FROM documentos_comerciais
    WHERE tipo = 'VENDA'
      AND orcamento_origem_id = ?
    LIMIT 1
    `,
    [orcamentoId]
  );

  if (vendaExistente) {
    throw new Error('Este orçamento já foi transformado em venda.');
  }

  const formaPagamento = venda.forma_pagamento?.trim() ?? '';

  if (!formaPagamento) {
    throw new Error('Selecione a forma de pagamento.');
  }

  const documentoVenda: NovoDocumentoComercial = {
    ...venda,
    tipo: 'VENDA',
    status: 'CONCLUIDA',
    data_validade: '',
    forma_pagamento: formaPagamento,
    orcamento_origem_id: orcamentoId,
  };

  const preparado = await prepararDocumentoComercial(database, documentoVenda);
  let vendaId = 0;

  await database.withTransactionAsync(async () => {
    const resultado = await database.runAsync(
      `
      INSERT INTO documentos_comerciais (
        tipo,
        cliente_id,
        cliente_nome,
        status,
        valor_total,
        observacoes,
        forma_pagamento,
        data_validade,
        orcamento_origem_id
      ) VALUES ('VENDA', ?, ?, 'CONCLUIDA', ?, ?, ?, '', ?)
      `,
      [
        documentoVenda.cliente_id,
        preparado.clienteNome,
        preparado.valorTotal,
        documentoVenda.observacoes?.trim() ?? '',
        formaPagamento,
        orcamentoId,
      ]
    );

    vendaId = resultado.lastInsertRowId;

    await inserirItensDocumentoComercial(
      database,
      vendaId,
      preparado.itens
    );

    await database.runAsync(
      `
      UPDATE documentos_comerciais
      SET
        status = 'CONVERTIDO',
        updated_at = datetime('now','localtime')
      WHERE id = ?
        AND tipo = 'ORCAMENTO'
        AND status = 'PENDENTE'
      `,
      [orcamentoId]
    );

    await database.runAsync(
      `
      UPDATE clientes
      SET total_compras = (
        SELECT COALESCE(SUM(valor_total), 0)
        FROM documentos_comerciais
        WHERE tipo = 'VENDA'
          AND status = 'CONCLUIDA'
          AND cliente_id = ?
      )
      WHERE id = ?
      `,
      [documentoVenda.cliente_id, documentoVenda.cliente_id]
    );
  });

  return vendaId;
}

export async function atualizarDocumentoComercialCompleto(
  id: number,
  documento: NovoDocumentoComercial
): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Documento comercial inválido.');
  }

  const atual = await database.getFirstAsync<{
    id: number;
    tipo: TipoDocumentoComercial;
    status: StatusDocumentoComercial;
    orcamento_origem_id: number | null;
  }>(
    `
    SELECT id, tipo, status, orcamento_origem_id
    FROM documentos_comerciais
    WHERE id = ?
    `,
    [id]
  );

  if (!atual) {
    throw new Error('Documento comercial não encontrado.');
  }

  if (atual.tipo !== documento.tipo) {
    throw new Error(
      'Não é permitido alterar o tipo do documento. A conversão de orçamento em venda será feita em uma operação própria.'
    );
  }

  const documentoAtualizado: NovoDocumentoComercial = {
    ...documento,
    status: documento.status ?? atual.status,
    orcamento_origem_id:
      documento.orcamento_origem_id === undefined
        ? atual.orcamento_origem_id
        : documento.orcamento_origem_id,
  };

  const preparado = await prepararDocumentoComercial(
    database,
    documentoAtualizado
  );

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
      UPDATE documentos_comerciais
      SET
        cliente_id = ?,
        cliente_nome = ?,
        status = ?,
        valor_total = ?,
        observacoes = ?,
        forma_pagamento = ?,
        data_validade = ?,
        orcamento_origem_id = ?,
        updated_at = datetime('now','localtime')
      WHERE id = ?
      `,
      [
        documento.cliente_id,
        preparado.clienteNome,
        preparado.status,
        preparado.valorTotal,
        documento.observacoes?.trim() ?? '',
        documento.forma_pagamento?.trim() ?? '',
        documento.data_validade?.trim() ?? '',
        documentoAtualizado.orcamento_origem_id ?? null,
        id,
      ]
    );

    await database.runAsync(
      'DELETE FROM documentos_comerciais_itens WHERE documento_id = ?',
      [id]
    );

    await inserirItensDocumentoComercial(database, id, preparado.itens);
  });
}

export async function excluirDocumentoComercial(id: number): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Documento comercial inválido.');
  }

  const documento = await database.getFirstAsync<{
    id: number;
    tipo: TipoDocumentoComercial;
    status: StatusDocumentoComercial;
  }>(
    `SELECT id, tipo, status FROM documentos_comerciais WHERE id = ?`,
    [id]
  );

  if (!documento) {
    throw new Error('Documento comercial não encontrado.');
  }

  const documentosRelacionados = await database.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM documentos_comerciais
    WHERE orcamento_origem_id = ?
    `,
    [id]
  );

  if ((documentosRelacionados?.total ?? 0) > 0) {
    throw new Error(
      'Este orçamento já possui uma venda vinculada e não pode ser excluído.'
    );
  }

  await database.runAsync(
    'DELETE FROM documentos_comerciais WHERE id = ?',
    [id]
  );
}

export async function atualizarStatusDocumentoComercial(
  id: number,
  status: StatusDocumentoComercial
): Promise<void> {
  const database = await getDatabase();

  if (!id) {
    throw new Error('Documento comercial inválido.');
  }

  const documento = await database.getFirstAsync<{
    tipo: TipoDocumentoComercial;
  }>(
    `SELECT tipo FROM documentos_comerciais WHERE id = ?`,
    [id]
  );

  if (!documento) {
    throw new Error('Documento comercial não encontrado.');
  }

  validarStatusDocumento(documento.tipo, status);

  await database.runAsync(
    `
    UPDATE documentos_comerciais
    SET status = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
    `,
    [status, id]
  );
}

// ===============================
// FUNÇÕES DE CÁLCULO / UNIDADES
// ===============================

export type ResultadoCalculoIngrediente = {
  custo: number;
  unidadeCompativel: boolean;
  quantidadeEmbalagemBase: number;
  quantidadeUsadaBase: number;
  unidadeBase: string;
  mensagem?: string;
};

function normalizarUnidade(unidade: string): string {
  const unidadeTratada = unidade
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    unidadeTratada === 'unidade' ||
    unidadeTratada === 'unidades' ||
    unidadeTratada === 'und'
  ) {
    return 'un';
  }

  if (unidadeTratada === 'litro' || unidadeTratada === 'litros') {
    return 'l';
  }

  if (unidadeTratada === 'caixas') {
    return 'caixa';
  }

  if (unidadeTratada === 'pacotes') {
    return 'pacote';
  }

  if (unidadeTratada === 'duzias') {
    return 'duzia';
  }

  return unidadeTratada;
}

function obterGrupoUnidade(unidade: string): 'peso' | 'volume' | 'unidade' | 'desconhecida' {
  const unidadeNormalizada = normalizarUnidade(unidade);

  if (unidadeNormalizada === 'g' || unidadeNormalizada === 'kg') {
    return 'peso';
  }

  if (unidadeNormalizada === 'ml' || unidadeNormalizada === 'l') {
    return 'volume';
  }

  if (
    unidadeNormalizada === 'un' ||
    unidadeNormalizada === 'caixa' ||
    unidadeNormalizada === 'pacote' ||
    unidadeNormalizada === 'duzia'
  ) {
    return 'unidade';
  }

  return 'desconhecida';
}

function obterUnidadeBase(unidade: string): string {
  const grupo = obterGrupoUnidade(unidade);

  if (grupo === 'peso') {
    return 'g';
  }

  if (grupo === 'volume') {
    return 'ml';
  }

  if (grupo === 'unidade') {
    return 'un';
  }

  return '';
}

export function converterParaUnidadeBase(
  quantidade: number,
  unidade: string
): number {
  const unidadeNormalizada = normalizarUnidade(unidade);

  if (!quantidade || quantidade <= 0) {
    return 0;
  }

  switch (unidadeNormalizada) {
    case 'kg':
      return quantidade * 1000;

    case 'g':
      return quantidade;

    case 'l':
      return quantidade * 1000;

    case 'ml':
      return quantidade;

    case 'duzia':
      return quantidade * 12;

    case 'un':
    case 'caixa':
    case 'pacote':
      return quantidade;

    default:
      return quantidade;
  }
}

export function unidadesSaoCompativeis(
  unidadeProduto: string,
  unidadeReceita: string
): boolean {
  const grupoProduto = obterGrupoUnidade(unidadeProduto);
  const grupoReceita = obterGrupoUnidade(unidadeReceita);

  if (grupoProduto === 'desconhecida' || grupoReceita === 'desconhecida') {
    return false;
  }

  return grupoProduto === grupoReceita;
}

export function calcularCustoIngrediente(
  precoMedio: number,
  quantidadeEmbalagem: number,
  unidadeProduto: string,
  quantidadeUsada: number,
  unidadeReceita: string
): ResultadoCalculoIngrediente {
  if (!precoMedio || precoMedio <= 0) {
    return {
      custo: 0,
      unidadeCompativel: false,
      quantidadeEmbalagemBase: 0,
      quantidadeUsadaBase: 0,
      unidadeBase: '',
      mensagem: 'Produto sem preço médio cadastrado.',
    };
  }

  if (!quantidadeEmbalagem || quantidadeEmbalagem <= 0) {
    return {
      custo: 0,
      unidadeCompativel: false,
      quantidadeEmbalagemBase: 0,
      quantidadeUsadaBase: 0,
      unidadeBase: '',
      mensagem: 'Produto sem quantidade da embalagem cadastrada.',
    };
  }

  if (!quantidadeUsada || quantidadeUsada <= 0) {
    return {
      custo: 0,
      unidadeCompativel: false,
      quantidadeEmbalagemBase: 0,
      quantidadeUsadaBase: 0,
      unidadeBase: '',
      mensagem: 'Quantidade usada inválida.',
    };
  }

  if (!unidadesSaoCompativeis(unidadeProduto, unidadeReceita)) {
    return {
      custo: 0,
      unidadeCompativel: false,
      quantidadeEmbalagemBase: 0,
      quantidadeUsadaBase: 0,
      unidadeBase: '',
      mensagem: `Unidades incompatíveis: produto em ${unidadeProduto} e receita em ${unidadeReceita}.`,
    };
  }

  const quantidadeEmbalagemBase = converterParaUnidadeBase(
    quantidadeEmbalagem,
    unidadeProduto
  );

  const quantidadeUsadaBase = converterParaUnidadeBase(
    quantidadeUsada,
    unidadeReceita
  );

  const unidadeBase = obterUnidadeBase(unidadeProduto);

  if (!quantidadeEmbalagemBase || !quantidadeUsadaBase) {
    return {
      custo: 0,
      unidadeCompativel: false,
      quantidadeEmbalagemBase,
      quantidadeUsadaBase,
      unidadeBase,
      mensagem: 'Não foi possível converter as unidades.',
    };
  }

  const custo = (precoMedio / quantidadeEmbalagemBase) * quantidadeUsadaBase;

  return {
    custo,
    unidadeCompativel: true,
    quantidadeEmbalagemBase,
    quantidadeUsadaBase,
    unidadeBase,
  };
}

export function calcularValorHora(
  salarioDesejado: number,
  horasTrabalhadasMes: number
): number {
  if (salarioDesejado < 0 || horasTrabalhadasMes <= 0) return 0;
  return salarioDesejado / horasTrabalhadasMes;
}

export function calcularCustoMaoDeObra(
  salarioDesejado: number,
  horasTrabalhadasMes: number,
  minutosGastosNoProduto: number
): number {
  if (minutosGastosNoProduto <= 0) return 0;
  const valorHora = calcularValorHora(salarioDesejado, horasTrabalhadasMes);
  return valorHora * (minutosGastosNoProduto / 60);
}

export function calcularCustoOperacionalRateado(
  custosFixosTotais: number,
  custosVariaveisTotais: number,
  horasTrabalhadasMes: number,
  minutosGastosNoProduto: number
): number {
  if (horasTrabalhadasMes <= 0 || minutosGastosNoProduto <= 0) return 0;

  const horasGastasNoProduto = minutosGastosNoProduto / 60;

  return (
    ((custosFixosTotais + custosVariaveisTotais) / horasTrabalhadasMes) *
    horasGastasNoProduto
  );
}

export function calcularPrecoSugerido(
  custoTotal: number,
  margemLucro: number
): number {
  if (custoTotal < 0 || margemLucro < 0 || margemLucro >= 100) return 0;
  return custoTotal / (1 - margemLucro / 100);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}