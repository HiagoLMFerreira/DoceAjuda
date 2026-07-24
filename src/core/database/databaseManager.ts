import * as SQLite from "expo-sqlite";

export let db: SQLite.SQLiteDatabase | null = null;

export let databaseInitialization: Promise<SQLite.SQLiteDatabase> | null = null;

// ===============================
// TYPES GERAIS
// ===============================
export type DirecaoOrdenacao = "ASC" | "DESC";

export const UNIDADES_MEDIDA_ESTOQUE = [
    "un",
    "kg",
    "g",
    "l",
    "ml",
    "caixa",
    "pacote",
    "duzia",
] as const;

export type UnidadeMedidaEstoque = (typeof UNIDADES_MEDIDA_ESTOQUE)[number];

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

export type OrdenarProdutoPor = "id" | "nome" | "codigo_barras" | "preco_ultima_entrada" | "preco_medio" | "quantidade" | "unidade_medida";

// ===============================
// TYPES DE COMPRAS
// ===============================
export type StatusCompra = "CONFIRMADA" | "CANCELADA";

export type CompraDatabase = {
    id: number;
    data_compra: string;
    status: StatusCompra;
    valor_total: number;
    observacoes: string;
    created_at: string;
    canceled_at: string | null;
};

export type CompraItemDatabase = {
    id: number;
    compra_id: number;
    produto_id: number;
    produto_nome: string;
    unidade_medida: string;
    quantidade: number;
    quantidade_embalagens: number;
    quantidade_por_embalagem: number;
    unidade_conteudo: string;
    valor_unitario: number;
    valor_unitario_estoque: number;
    subtotal: number;
};

export type CompraDetalhada = CompraDatabase & {
    itens: CompraItemDatabase[];
};

export type NovoItemCompra = {
    produto_id: number;
    quantidade_embalagens: number;
    quantidade_por_embalagem: number;
    unidade_conteudo: string;
    valor_unitario: number;
};

export type NovaCompra = {
    data_compra?: string;
    observacoes?: string;
    itens: NovoItemCompra[];
};

export type OrdenarCompraPor = "id" | "data_compra" | "valor_total" | "status";

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

export type OrdenarClientePor = "id" | "nome" | "total_compras";

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
export type UnidadeMedida = "g" | "kg" | "ml" | "l" | "un";

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
export type TipoDocumentoComercial = "ORCAMENTO" | "VENDA";

export type StatusDocumentoComercial = "PENDENTE" | "CONVERTIDO" | "CONCLUIDA" | "CANCELADA";

export type OrdenarDocumentoComercialPor = "id" | "cliente_nome" | "valor_total" | "status" | "created_at";

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
    estoque_baixado: number;
    estoque_estornado: number;
    canceled_at: string | null;
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
    cliente_telefone?: string;
    cliente_endereco?: string;
    itens: DocumentoComercialItemDatabase[];
};

export type NecessidadeOrcamento = {
    produto_id: number;
    produto_nome: string;
    quantidade_necessaria: number;
    quantidade_estoque: number;
    quantidade_faltante: number;
    unidade_medida: string;
    estoque_suficiente: boolean;
};

export type VendaEstoqueItemDatabase = {
    id: number;
    venda_id: number;
    produto_id: number;
    produto_nome: string;
    unidade_medida: string;
    quantidade: number;
    preco_medio: number;
    created_at: string;
    estornado_at: string | null;
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

export type ProdutoVendaParaDocumento = Pick<ProdutoVendaDatabase, "id" | "nome" | "descricao" | "preco_venda" | "ativo">;

// ===============================
// DATABASE
// ===============================
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
    const database = await SQLite.openDatabaseAsync("doceajuda.db");
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
        compra_id INTEGER,
        compra_item_id INTEGER,
        venda_id INTEGER,
        venda_estoque_item_id INTEGER,
        origem TEXT NOT NULL DEFAULT 'MANUAL',
        data TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );

      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_compra TEXT NOT NULL DEFAULT (date('now','localtime')),
        status TEXT NOT NULL DEFAULT 'CONFIRMADA'
          CHECK(status IN ('CONFIRMADA', 'CANCELADA')),
        valor_total REAL NOT NULL DEFAULT 0,
        observacoes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        canceled_at TEXT
      );

      CREATE TABLE IF NOT EXISTS compra_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        compra_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        produto_nome TEXT NOT NULL DEFAULT '',
        unidade_medida TEXT NOT NULL DEFAULT 'un',
        quantidade REAL NOT NULL,
        quantidade_embalagens REAL NOT NULL DEFAULT 1,
        quantidade_por_embalagem REAL NOT NULL DEFAULT 1,
        unidade_conteudo TEXT NOT NULL DEFAULT 'un',
        valor_unitario REAL NOT NULL,
        valor_unitario_estoque REAL NOT NULL DEFAULT 0,
        subtotal REAL NOT NULL,
        FOREIGN KEY(compra_id) REFERENCES compras(id) ON DELETE CASCADE,
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
        estoque_baixado INTEGER NOT NULL DEFAULT 0
          CHECK(estoque_baixado IN (0, 1)),
        estoque_estornado INTEGER NOT NULL DEFAULT 0
          CHECK(estoque_estornado IN (0, 1)),
        canceled_at TEXT,
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

      CREATE TABLE IF NOT EXISTS venda_estoque_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        produto_nome TEXT NOT NULL DEFAULT '',
        unidade_medida TEXT NOT NULL DEFAULT 'un',
        quantidade REAL NOT NULL CHECK(quantidade > 0),
        preco_medio REAL NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        estornado_at TEXT,
        FOREIGN KEY(venda_id) REFERENCES documentos_comerciais(id),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
      );

      CREATE INDEX IF NOT EXISTS idx_compras_data
        ON compras(data_compra);

      CREATE INDEX IF NOT EXISTS idx_compras_status
        ON compras(status);

      CREATE INDEX IF NOT EXISTS idx_compra_itens_compra
        ON compra_itens(compra_id);

      CREATE INDEX IF NOT EXISTS idx_compra_itens_produto
        ON compra_itens(produto_id);

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

      CREATE UNIQUE INDEX IF NOT EXISTS idx_venda_estoque_produto_unico
        ON venda_estoque_itens(venda_id, produto_id);

      CREATE INDEX IF NOT EXISTS idx_venda_estoque_venda
        ON venda_estoque_itens(venda_id);

      CREATE INDEX IF NOT EXISTS idx_venda_estoque_produto
        ON venda_estoque_itens(produto_id);
    `);
        // As migrações existentes usam a referência global.
        // Ela só fica disponível enquanto a inicialização está protegida pela Promise.
        db = database;
        await aplicarMigracoesProdutos();
        await aplicarMigracoesMovimentacoes();
        await aplicarMigracoesCompras();
        await aplicarMigracoesClientes();
        await aplicarMigracoesReceitas();
        await aplicarMigracoesPrecificacao();
        await aplicarMigracoesDocumentosComerciais();
        return database;
    }
    catch (error) {
        db = null;
        try {
            await database.closeAsync();
        }
        catch {
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
    }
    finally {
        databaseInitialization = null;
    }
}

// ===============================
// MIGRAÇÕES
// ===============================
export async function colunaExiste(database: SQLite.SQLiteDatabase, tabela: string, coluna: string): Promise<boolean> {
    const colunas = await database.getAllAsync<{
        name: string;
    }>(`PRAGMA table_info(${tabela})`);
    return colunas.some((item) => item.name === coluna);
}

export async function adicionarColunaSeNaoExistir(tabela: string, coluna: string, definicao: string): Promise<void> {
    const database = db;
    if (!database) {
        throw new Error("Banco de dados ainda não foi inicializado.");
    }
    const existe = await colunaExiste(database, tabela, coluna);
    if (!existe) {
        await database.execAsync(`
      ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao};
    `);
    }
}

export async function aplicarMigracoesProdutos(): Promise<void> {
    await adicionarColunaSeNaoExistir("produtos", "nome", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("produtos", "codigo_barras", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("produtos", "preco_ultima_entrada", "REAL DEFAULT 0");
    await adicionarColunaSeNaoExistir("produtos", "preco_medio", "REAL DEFAULT 0");
    await adicionarColunaSeNaoExistir("produtos", "quantidade", "REAL DEFAULT 0");
    await adicionarColunaSeNaoExistir("produtos", "ativo", "INTEGER DEFAULT 1");
    await adicionarColunaSeNaoExistir("produtos", "preco", "REAL DEFAULT 0");
    await adicionarColunaSeNaoExistir("produtos", "quantidade_embalagem", "REAL DEFAULT 1");
    await adicionarColunaSeNaoExistir("produtos", "unidade_medida", "TEXT NOT NULL DEFAULT 'un'");
    const database = db;
    if (!database) {
        throw new Error("Banco de dados não inicializado.");
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

export async function aplicarMigracoesMovimentacoes(): Promise<void> {
    await adicionarColunaSeNaoExistir("movimentacoes", "preco_unitario", "REAL DEFAULT 0");
}

export async function aplicarMigracoesCompras(): Promise<void> {
    await adicionarColunaSeNaoExistir("movimentacoes", "compra_id", "INTEGER");
    await adicionarColunaSeNaoExistir("movimentacoes", "compra_item_id", "INTEGER");
    await adicionarColunaSeNaoExistir("compra_itens", "quantidade_embalagens", "REAL NOT NULL DEFAULT 1");
    await adicionarColunaSeNaoExistir("compra_itens", "quantidade_por_embalagem", "REAL NOT NULL DEFAULT 1");
    await adicionarColunaSeNaoExistir("compra_itens", "unidade_conteudo", "TEXT NOT NULL DEFAULT 'un'");
    await adicionarColunaSeNaoExistir("compra_itens", "valor_unitario_estoque", "REAL NOT NULL DEFAULT 0");
    const database = db;
    if (!database) {
        throw new Error("Banco de dados não inicializado.");
    }
    await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_compra
      ON movimentacoes(compra_id);

    CREATE INDEX IF NOT EXISTS idx_movimentacoes_compra_item
      ON movimentacoes(compra_item_id);
  `);
}

export async function aplicarMigracoesClientes(): Promise<void> {
    await adicionarColunaSeNaoExistir("clientes", "telefone", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("clientes", "endereco", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("clientes", "total_compras", "REAL DEFAULT 0");
}

export async function aplicarMigracoesReceitas(): Promise<void> {
    await adicionarColunaSeNaoExistir("receitas", "rendimento", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("receitas", "modo_preparo", "TEXT DEFAULT ''");
    await adicionarColunaSeNaoExistir("receitas", "created_at", "TEXT DEFAULT (datetime('now','localtime'))");
    await adicionarColunaSeNaoExistir("receita_itens", "quantidade_usada", "TEXT DEFAULT ''");
}

export async function aplicarMigracoesPrecificacao(): Promise<void> {
    const database = db;
    if (!database) {
        throw new Error("Banco de dados não inicializado.");
    }
    await adicionarColunaSeNaoExistir("receita_itens", "quantidade_numero", "REAL DEFAULT 0");
    await adicionarColunaSeNaoExistir("receita_itens", "unidade_medida", "TEXT DEFAULT 'un'");
    await adicionarColunaSeNaoExistir("parametros_precificacao", "salario_desejado", "REAL DEFAULT 0");
    await database.runAsync(`
    INSERT OR IGNORE INTO parametros_precificacao (
      id,
      salario_desejado,
      valor_hora,
      custos_fixos_mensais,
      horas_trabalhadas_mes,
      custos_variaveis,
      margem_lucro
    ) VALUES (1, 0, 0, 0, 180, 0, 30)
    `);
    await database.execAsync(`
    UPDATE parametros_precificacao
    SET salario_desejado = valor_hora * horas_trabalhadas_mes
    WHERE id = 1
      AND (salario_desejado IS NULL OR salario_desejado = 0)
      AND valor_hora > 0
      AND horas_trabalhadas_mes > 0;
  `);
}

export async function aplicarMigracoesDocumentosComerciais(): Promise<void> {
    const database = db;
    if (!database) {
        throw new Error("Banco de dados não inicializado.");
    }
    await adicionarColunaSeNaoExistir("documentos_comerciais", "estoque_baixado", "INTEGER NOT NULL DEFAULT 0 CHECK(estoque_baixado IN (0, 1))");
    await adicionarColunaSeNaoExistir("documentos_comerciais", "estoque_estornado", "INTEGER NOT NULL DEFAULT 0 CHECK(estoque_estornado IN (0, 1))");
    await adicionarColunaSeNaoExistir("documentos_comerciais", "canceled_at", "TEXT");
    await adicionarColunaSeNaoExistir("movimentacoes", "venda_id", "INTEGER");
    await adicionarColunaSeNaoExistir("movimentacoes", "venda_estoque_item_id", "INTEGER");
    await adicionarColunaSeNaoExistir("movimentacoes", "origem", "TEXT NOT NULL DEFAULT 'MANUAL'");
    await database.execAsync(`
    CREATE TABLE IF NOT EXISTS venda_estoque_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      produto_nome TEXT NOT NULL DEFAULT '',
      unidade_medida TEXT NOT NULL DEFAULT 'un',
      quantidade REAL NOT NULL CHECK(quantidade > 0),
      preco_medio REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      estornado_at TEXT,
      FOREIGN KEY(venda_id) REFERENCES documentos_comerciais(id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_venda_estoque_produto_unico
      ON venda_estoque_itens(venda_id, produto_id);

    CREATE INDEX IF NOT EXISTS idx_venda_estoque_venda
      ON venda_estoque_itens(venda_id);

    CREATE INDEX IF NOT EXISTS idx_venda_estoque_produto
      ON venda_estoque_itens(produto_id);

    CREATE INDEX IF NOT EXISTS idx_movimentacoes_venda
      ON movimentacoes(venda_id);

    CREATE INDEX IF NOT EXISTS idx_movimentacoes_venda_item
      ON movimentacoes(venda_estoque_item_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_movimentacoes_venda_item_tipo_unico
      ON movimentacoes(venda_estoque_item_id, tipo)
      WHERE venda_estoque_item_id IS NOT NULL;

    CREATE TRIGGER IF NOT EXISTS trg_venda_orcamento_unico_insert
    BEFORE INSERT ON documentos_comerciais
    FOR EACH ROW
    WHEN NEW.tipo = 'VENDA'
      AND NEW.orcamento_origem_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM documentos_comerciais
        WHERE tipo = 'VENDA'
          AND orcamento_origem_id = NEW.orcamento_origem_id
      )
    BEGIN
      SELECT RAISE(ABORT, 'Este orçamento já foi transformado em venda.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_venda_orcamento_unico_update
    BEFORE UPDATE OF orcamento_origem_id, tipo ON documentos_comerciais
    FOR EACH ROW
    WHEN NEW.tipo = 'VENDA'
      AND NEW.orcamento_origem_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM documentos_comerciais
        WHERE tipo = 'VENDA'
          AND orcamento_origem_id = NEW.orcamento_origem_id
          AND id <> NEW.id
      )
    BEGIN
      SELECT RAISE(ABORT, 'Este orçamento já foi transformado em venda.');
    END;
  `);
}
