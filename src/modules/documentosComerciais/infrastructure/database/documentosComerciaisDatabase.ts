import * as SQLite from "expo-sqlite";
import { DirecaoOrdenacao, DocumentoComercialDatabase, DocumentoComercialDetalhado, DocumentoComercialItemDatabase, NecessidadeOrcamento, NovoDocumentoComercial, OrdenarDocumentoComercialPor, ProdutoVendaParaDocumento, StatusDocumentoComercial, TipoDocumentoComercial, VendaEstoqueItemDatabase, getDatabase } from "../../../../core/database/databaseManager";
import { validarDirecaoOrdenacao } from "../../../estoque/infrastructure/database/estoqueDatabase";
import { extrairNumeroRendimento, normalizarUnidade } from "../../../produtosVenda/infrastructure/database/precificacaoDatabase";

// ===============================
// CRUD COMPARTILHADO DE ORÇAMENTOS / VENDAS
// ===============================
export type ItemDocumentoPreparado = {
    produto_venda_id: number;
    produto_nome: string;
    quantidade: number;
    valor_unitario: number;
    subtotal: number;
};

export type VendaControleEstoque = {
    id: number;
    tipo: TipoDocumentoComercial;
    cliente_id: number;
    status: StatusDocumentoComercial;
    estoque_baixado: number;
    estoque_estornado: number;
};

export function arredondarValorMonetario(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function obterStatusInicialDocumento(tipo: TipoDocumentoComercial): StatusDocumentoComercial {
    return tipo === "ORCAMENTO" ? "PENDENTE" : "CONCLUIDA";
}

export function validarStatusDocumento(tipo: TipoDocumentoComercial, status: StatusDocumentoComercial): void {
    const statusOrcamento: StatusDocumentoComercial[] = [
        "PENDENTE",
        "CONVERTIDO",
        "CANCELADA",
    ];
    const statusVenda: StatusDocumentoComercial[] = ["CONCLUIDA", "CANCELADA"];
    const permitido = tipo === "ORCAMENTO"
        ? statusOrcamento.includes(status)
        : statusVenda.includes(status);
    if (!permitido) {
        throw new Error("O status informado não é válido para este documento.");
    }
}

export async function atualizarTotalComprasClienteInterno(database: SQLite.SQLiteDatabase, clienteId: number): Promise<void> {
    await database.runAsync(`
    UPDATE clientes
    SET total_compras = (
      SELECT COALESCE(SUM(valor_total), 0)
      FROM documentos_comerciais
      WHERE tipo = 'VENDA'
        AND status = 'CONCLUIDA'
        AND cliente_id = ?
    )
    WHERE id = ?
    `, [clienteId, clienteId]);
}

export async function prepararDocumentoComercial(database: SQLite.SQLiteDatabase, documento: NovoDocumentoComercial): Promise<{
    clienteNome: string;
    status: StatusDocumentoComercial;
    itens: ItemDocumentoPreparado[];
    valorTotal: number;
}> {
    if (documento.tipo !== "ORCAMENTO" && documento.tipo !== "VENDA") {
        throw new Error("Tipo de documento comercial inválido.");
    }
    if (!documento.cliente_id) {
        throw new Error("Selecione um cliente.");
    }
    if (!documento.itens.length) {
        throw new Error("Adicione pelo menos um produto.");
    }
    if (documento.tipo === "VENDA" && !documento.forma_pagamento?.trim()) {
        throw new Error("Selecione a forma de pagamento.");
    }
    const cliente = await database.getFirstAsync<{
        id: number;
        nome: string;
    }>(`SELECT id, nome FROM clientes WHERE id = ?`, [documento.cliente_id]);
    if (!cliente) {
        throw new Error("Cliente não encontrado.");
    }
    const status = documento.status ?? obterStatusInicialDocumento(documento.tipo);
    validarStatusDocumento(documento.tipo, status);
    if (documento.tipo === "VENDA" && status !== "CONCLUIDA") {
        throw new Error("Uma nova venda deve ser concluída antes de ser salva.");
    }
    const produtosAdicionados = new Set<number>();
    const itens: ItemDocumentoPreparado[] = [];
    for (const item of documento.itens) {
        if (!item.produto_venda_id) {
            throw new Error("Existe um produto inválido no documento.");
        }
        if (produtosAdicionados.has(item.produto_venda_id)) {
            throw new Error("O mesmo produto foi adicionado mais de uma vez. Altere a quantidade do item existente.");
        }
        if (!Number.isFinite(item.quantidade) || item.quantidade <= 0) {
            throw new Error("A quantidade dos produtos deve ser maior que zero.");
        }
        const produto = await database.getFirstAsync<ProdutoVendaParaDocumento>(`
      SELECT id, nome, descricao, preco_venda, ativo
      FROM produtos_venda
      WHERE id = ? AND ativo = 1
      `, [item.produto_venda_id]);
        if (!produto) {
            throw new Error("Um dos produtos não foi encontrado ou está inativo.");
        }
        const valorUnitario = item.valor_unitario ?? produto.preco_venda;
        if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
            throw new Error(`Informe um valor unitário válido para o produto ${produto.nome}.`);
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
    const valorTotal = arredondarValorMonetario(itens.reduce((total, item) => total + item.subtotal, 0));
    return {
        clienteNome: cliente.nome,
        status,
        itens,
        valorTotal,
    };
}

export async function inserirItensDocumentoComercial(database: SQLite.SQLiteDatabase, documentoId: number, itens: ItemDocumentoPreparado[]): Promise<void> {
    for (const item of itens) {
        await database.runAsync(`
      INSERT INTO documentos_comerciais_itens (
        documento_id,
        produto_venda_id,
        produto_nome,
        quantidade,
        valor_unitario,
        subtotal
      ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
            documentoId,
            item.produto_venda_id,
            item.produto_nome,
            item.quantidade,
            item.valor_unitario,
            item.subtotal,
        ]);
    }
}

export function montarMensagemEstoqueInsuficiente(necessidades: NecessidadeOrcamento[]): string {
    const itens = necessidades
        .filter((item) => !item.estoque_suficiente)
        .map((item) => `• ${item.produto_nome}: necessário ${item.quantidade_necessaria.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} ${item.unidade_medida}; disponível ${item.quantidade_estoque.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} ${item.unidade_medida}`);
    return `Estoque insuficiente para concluir a venda:\n${itens.join("\n")}`;
}

export async function baixarEstoqueVendaDentroTransacao(database: SQLite.SQLiteDatabase, vendaId: number): Promise<void> {
    const venda = await database.getFirstAsync<VendaControleEstoque>(`
    SELECT
      id,
      tipo,
      cliente_id,
      status,
      estoque_baixado,
      estoque_estornado
    FROM documentos_comerciais
    WHERE id = ?
    `, [vendaId]);
    if (!venda || venda.tipo !== "VENDA") {
        throw new Error("Venda não encontrada.");
    }
    if (venda.status === "CANCELADA") {
        throw new Error("Uma venda cancelada não pode movimentar o estoque.");
    }
    if (venda.status !== "CONCLUIDA") {
        throw new Error("Somente vendas concluídas podem descontar o estoque.");
    }
    if (venda.estoque_baixado === 1) {
        throw new Error("O estoque desta venda já foi descontado.");
    }
    if (venda.estoque_estornado === 1) {
        throw new Error("O estoque desta venda já foi estornado.");
    }
    const reserva = await database.runAsync(`
    UPDATE documentos_comerciais
    SET estoque_baixado = 1,
        updated_at = datetime('now','localtime')
    WHERE id = ?
      AND tipo = 'VENDA'
      AND status = 'CONCLUIDA'
      AND estoque_baixado = 0
      AND estoque_estornado = 0
    `, [vendaId]);
    if (reserva.changes !== 1) {
        throw new Error("Não foi possível reservar a baixa de estoque da venda.");
    }
    const necessidades = await calcularNecessidadesDocumentoComercialInterno(database, vendaId);
    if (!necessidades.length) {
        throw new Error("A venda não possui ingredientes, produtos diretos ou embalagens para movimentar.");
    }
    const necessidadesMovimentaveis = necessidades.filter((item) => item.quantidade_necessaria > 0.000001);
    if (!necessidadesMovimentaveis.length) {
        throw new Error("A composição da venda não gerou nenhuma quantidade válida para descontar do estoque.");
    }
    const insuficientes = necessidadesMovimentaveis.filter((item) => !item.estoque_suficiente);
    if (insuficientes.length) {
        throw new Error(montarMensagemEstoqueInsuficiente(insuficientes));
    }
    for (const necessidade of necessidadesMovimentaveis) {
        const quantidade = arredondarQuantidadeNecessidade(necessidade.quantidade_necessaria);
        const produto = await database.getFirstAsync<{
            id: number;
            nome: string;
            unidade_medida: string;
            quantidade: number;
            preco_medio: number;
        }>(`
      SELECT id, nome, unidade_medida, quantidade, preco_medio
      FROM produtos
      WHERE id = ?
      `, [necessidade.produto_id]);
        if (!produto) {
            throw new Error(`O produto ${necessidade.produto_nome} não foi encontrado no estoque.`);
        }
        const atualizacao = await database.runAsync(`
      UPDATE produtos
      SET quantidade = MAX(0, quantidade - ?)
      WHERE id = ?
        AND quantidade + 0.000001 >= ?
      `, [quantidade, produto.id, quantidade]);
        if (atualizacao.changes !== 1) {
            throw new Error(`O estoque de ${produto.nome} foi alterado e não é mais suficiente para concluir a venda.`);
        }
        const snapshot = await database.runAsync(`
      INSERT INTO venda_estoque_itens (
        venda_id,
        produto_id,
        produto_nome,
        unidade_medida,
        quantidade,
        preco_medio
      ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
            vendaId,
            produto.id,
            produto.nome,
            produto.unidade_medida,
            quantidade,
            Number(produto.preco_medio || 0),
        ]);
        await database.runAsync(`
      INSERT INTO movimentacoes (
        produto_id,
        tipo,
        quantidade,
        preco_unitario,
        venda_id,
        venda_estoque_item_id,
        origem
      ) VALUES (?, 'saida', ?, ?, ?, ?, 'VENDA')
      `, [
            produto.id,
            quantidade,
            Number(produto.preco_medio || 0),
            vendaId,
            snapshot.lastInsertRowId,
        ]);
    }
}

export async function concluirVenda(vendaId: number): Promise<void> {
    const database = await getDatabase();
    if (!vendaId) {
        throw new Error("Venda inválida.");
    }
    await database.withTransactionAsync(async () => {
        await baixarEstoqueVendaDentroTransacao(database, vendaId);
        const venda = await database.getFirstAsync<{
            cliente_id: number;
        }>(`SELECT cliente_id FROM documentos_comerciais WHERE id = ?`, [vendaId]);
        if (venda) {
            await atualizarTotalComprasClienteInterno(database, venda.cliente_id);
        }
    });
}

export async function listarItensEstoqueVenda(vendaId: number): Promise<VendaEstoqueItemDatabase[]> {
    const database = await getDatabase();
    if (!vendaId) {
        throw new Error("Venda inválida.");
    }
    return database.getAllAsync<VendaEstoqueItemDatabase>(`
    SELECT
      id,
      venda_id,
      produto_id,
      produto_nome,
      unidade_medida,
      quantidade,
      preco_medio,
      created_at,
      estornado_at
    FROM venda_estoque_itens
    WHERE venda_id = ?
    ORDER BY produto_nome COLLATE NOCASE ASC
    `, [vendaId]);
}

export async function cancelarVenda(vendaId: number): Promise<void> {
    const database = await getDatabase();
    if (!vendaId) {
        throw new Error("Venda inválida.");
    }
    await database.withTransactionAsync(async () => {
        const venda = await database.getFirstAsync<VendaControleEstoque>(`
      SELECT
        id,
        tipo,
        cliente_id,
        status,
        estoque_baixado,
        estoque_estornado
      FROM documentos_comerciais
      WHERE id = ?
      `, [vendaId]);
        if (!venda || venda.tipo !== "VENDA") {
            throw new Error("Venda não encontrada.");
        }
        if (venda.status === "CANCELADA") {
            throw new Error("Esta venda já está cancelada.");
        }
        if (venda.status !== "CONCLUIDA") {
            throw new Error("Somente vendas concluídas podem ser canceladas.");
        }
        if (venda.estoque_baixado !== 1) {
            throw new Error("Esta venda não possui uma baixa de estoque registrada e não pode ser estornada automaticamente.");
        }
        if (venda.estoque_estornado === 1) {
            throw new Error("O estoque desta venda já foi estornado.");
        }
        const itensEstoque = await database.getAllAsync<VendaEstoqueItemDatabase>(`
      SELECT
        id,
        venda_id,
        produto_id,
        produto_nome,
        unidade_medida,
        quantidade,
        preco_medio,
        created_at,
        estornado_at
      FROM venda_estoque_itens
      WHERE venda_id = ?
      ORDER BY id ASC
      `, [vendaId]);
        if (!itensEstoque.length) {
            throw new Error("Não foi encontrado o histórico de itens descontados desta venda.");
        }
        const reserva = await database.runAsync(`
      UPDATE documentos_comerciais
      SET
        status = 'CANCELADA',
        estoque_estornado = 1,
        canceled_at = datetime('now','localtime'),
        updated_at = datetime('now','localtime')
      WHERE id = ?
        AND tipo = 'VENDA'
        AND status = 'CONCLUIDA'
        AND estoque_baixado = 1
        AND estoque_estornado = 0
      `, [vendaId]);
        if (reserva.changes !== 1) {
            throw new Error("Não foi possível reservar o estorno desta venda.");
        }
        for (const item of itensEstoque) {
            if (item.estornado_at) {
                throw new Error(`O item ${item.produto_nome} já possui estorno registrado.`);
            }
            const produto = await database.getFirstAsync<{
                id: number;
            }>(`SELECT id FROM produtos WHERE id = ?`, [item.produto_id]);
            if (!produto) {
                throw new Error(`O produto ${item.produto_nome} não foi encontrado para realizar o estorno.`);
            }
            await database.runAsync(`
        UPDATE produtos
        SET quantidade = quantidade + ?
        WHERE id = ?
        `, [item.quantidade, item.produto_id]);
            await database.runAsync(`
        INSERT INTO movimentacoes (
          produto_id,
          tipo,
          quantidade,
          preco_unitario,
          venda_id,
          venda_estoque_item_id,
          origem
        ) VALUES (?, 'entrada', ?, ?, ?, ?, 'CANCELAMENTO_VENDA')
        `, [item.produto_id, item.quantidade, item.preco_medio, vendaId, item.id]);
            await database.runAsync(`
        UPDATE venda_estoque_itens
        SET estornado_at = datetime('now','localtime')
        WHERE id = ? AND estornado_at IS NULL
        `, [item.id]);
        }
        await atualizarTotalComprasClienteInterno(database, venda.cliente_id);
    });
}

export async function buscarProdutosVendaParaDocumento(filtro: string = ""): Promise<ProdutoVendaParaDocumento[]> {
    const database = await getDatabase();
    const busca = filtro.trim();
    const parametros: (string | number)[] = [];
    let condicaoBusca = "";
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            condicaoBusca = `
        AND (id = ? OR nome LIKE ? OR descricao LIKE ?)
      `;
            parametros.push(buscaNumerica, `%${busca}%`, `%${busca}%`);
        }
        else {
            condicaoBusca = `
        AND (nome LIKE ? OR descricao LIKE ?)
      `;
            parametros.push(`%${busca}%`, `%${busca}%`);
        }
    }
    return database.getAllAsync<ProdutoVendaParaDocumento>(`
    SELECT id, nome, descricao, preco_venda, ativo
    FROM produtos_venda
    WHERE ativo = 1
    ${condicaoBusca}
    ORDER BY nome COLLATE NOCASE ASC
    LIMIT 30
    `, parametros);
}

export async function listarDocumentosComerciais(tipo: TipoDocumentoComercial | "TODOS" = "TODOS", filtro: string = "", ordenarPor: OrdenarDocumentoComercialPor = "created_at", direcao: DirecaoOrdenacao = "DESC"): Promise<DocumentoComercialDatabase[]> {
    const database = await getDatabase();
    const colunasPermitidas: Record<OrdenarDocumentoComercialPor, string> = {
        id: "dc.id",
        cliente_nome: "dc.cliente_nome",
        valor_total: "dc.valor_total",
        status: "dc.status",
        created_at: "dc.created_at",
    };
    const colunaOrdenacao = colunasPermitidas[ordenarPor] ?? "dc.created_at";
    const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
    const condicoes: string[] = [];
    const parametros: (string | number)[] = [];
    const busca = filtro.trim();
    if (tipo !== "TODOS") {
        condicoes.push("dc.tipo = ?");
        parametros.push(tipo);
    }
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            condicoes.push("(dc.id = ? OR dc.cliente_nome LIKE ? OR dc.status LIKE ?)");
            parametros.push(buscaNumerica, `%${busca}%`, `%${busca}%`);
        }
        else {
            condicoes.push("(dc.cliente_nome LIKE ? OR dc.status LIKE ? OR dc.forma_pagamento LIKE ?)");
            parametros.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
        }
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    return database.getAllAsync<DocumentoComercialDatabase>(`
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
      dc.estoque_baixado,
      dc.estoque_estornado,
      dc.canceled_at,
      dc.created_at,
      dc.updated_at
    FROM documentos_comerciais dc
    ${where}
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}, dc.id ${direcaoOrdenacao}
    `, parametros);
}

export async function listarOrcamentos(filtro: string = "", ordenarPor: OrdenarDocumentoComercialPor = "created_at", direcao: DirecaoOrdenacao = "DESC"): Promise<DocumentoComercialDatabase[]> {
    return listarDocumentosComerciais("ORCAMENTO", filtro, ordenarPor, direcao);
}

export async function listarVendas(filtro: string = "", ordenarPor: OrdenarDocumentoComercialPor = "created_at", direcao: DirecaoOrdenacao = "DESC"): Promise<DocumentoComercialDatabase[]> {
    return listarDocumentosComerciais("VENDA", filtro, ordenarPor, direcao);
}

export async function listarItensDocumentoComercial(documentoId: number): Promise<DocumentoComercialItemDatabase[]> {
    const database = await getDatabase();
    if (!documentoId) {
        throw new Error("Documento comercial inválido.");
    }
    return database.getAllAsync<DocumentoComercialItemDatabase>(`
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
    `, [documentoId]);
}

export async function buscarDocumentoComercialPorId(id: number): Promise<DocumentoComercialDetalhado | null> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Documento comercial inválido.");
    }
    const documento = await database.getFirstAsync<Omit<DocumentoComercialDetalhado, "itens">>(`
    SELECT
      dc.id,
      dc.tipo,
      dc.cliente_id,
      dc.cliente_nome,
      COALESCE(c.telefone, '') AS cliente_telefone,
      COALESCE(c.endereco, '') AS cliente_endereco,
      dc.status,
      dc.valor_total,
      dc.observacoes,
      dc.forma_pagamento,
      dc.data_validade,
      dc.orcamento_origem_id,
      dc.estoque_baixado,
      dc.estoque_estornado,
      dc.canceled_at,
      dc.created_at,
      dc.updated_at
    FROM documentos_comerciais dc
    LEFT JOIN clientes c ON c.id = dc.cliente_id
    WHERE dc.id = ?
    `, [id]);
    if (!documento) {
        return null;
    }
    const itens = await listarItensDocumentoComercial(id);
    return {
        ...documento,
        itens,
    };
}

export async function salvarDocumentoComercialCompleto(documento: NovoDocumentoComercial): Promise<number> {
    const database = await getDatabase();
    if (documento.tipo === "VENDA" && documento.orcamento_origem_id) {
        throw new Error("Para vincular uma venda a um orçamento, utilize a conversão do orçamento em venda.");
    }
    const preparado = await prepararDocumentoComercial(database, documento);
    let documentoId = 0;
    await database.withTransactionAsync(async () => {
        const resultado = await database.runAsync(`
      INSERT INTO documentos_comerciais (
        tipo,
        cliente_id,
        cliente_nome,
        status,
        valor_total,
        observacoes,
        forma_pagamento,
        data_validade,
        orcamento_origem_id,
        estoque_baixado,
        estoque_estornado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
      `, [
            documento.tipo,
            documento.cliente_id,
            preparado.clienteNome,
            preparado.status,
            preparado.valorTotal,
            documento.observacoes?.trim() ?? "",
            documento.forma_pagamento?.trim() ?? "",
            documento.data_validade?.trim() ?? "",
            null,
        ]);
        documentoId = resultado.lastInsertRowId;
        await inserirItensDocumentoComercial(database, documentoId, preparado.itens);
        if (documento.tipo === "VENDA") {
            await baixarEstoqueVendaDentroTransacao(database, documentoId);
            await atualizarTotalComprasClienteInterno(database, documento.cliente_id);
        }
    });
    return documentoId;
}

export async function converterOrcamentoEmVenda(orcamentoId: number, venda: NovoDocumentoComercial): Promise<number> {
    const database = await getDatabase();
    if (!orcamentoId) {
        throw new Error("Orçamento inválido.");
    }
    const orcamento = await database.getFirstAsync<{
        id: number;
        tipo: TipoDocumentoComercial;
        status: StatusDocumentoComercial;
    }>(`
    SELECT id, tipo, status
    FROM documentos_comerciais
    WHERE id = ?
    `, [orcamentoId]);
    if (!orcamento || orcamento.tipo !== "ORCAMENTO") {
        throw new Error("Orçamento não encontrado.");
    }
    if (orcamento.status !== "PENDENTE") {
        throw new Error("Somente orçamentos pendentes podem ser transformados em venda.");
    }
    const vendaExistente = await database.getFirstAsync<{
        id: number;
    }>(`
    SELECT id
    FROM documentos_comerciais
    WHERE tipo = 'VENDA'
      AND orcamento_origem_id = ?
    LIMIT 1
    `, [orcamentoId]);
    if (vendaExistente) {
        throw new Error("Este orçamento já foi transformado em venda.");
    }
    const formaPagamento = venda.forma_pagamento?.trim() ?? "";
    if (!formaPagamento) {
        throw new Error("Selecione a forma de pagamento.");
    }
    const documentoVenda: NovoDocumentoComercial = {
        ...venda,
        tipo: "VENDA",
        status: "CONCLUIDA",
        data_validade: "",
        forma_pagamento: formaPagamento,
        orcamento_origem_id: orcamentoId,
    };
    const preparado = await prepararDocumentoComercial(database, documentoVenda);
    let vendaId = 0;
    await database.withTransactionAsync(async () => {
        const reservaOrcamento = await database.runAsync(`
      UPDATE documentos_comerciais
      SET
        status = 'CONVERTIDO',
        updated_at = datetime('now','localtime')
      WHERE id = ?
        AND tipo = 'ORCAMENTO'
        AND status = 'PENDENTE'
        AND NOT EXISTS (
          SELECT 1
          FROM documentos_comerciais venda_existente
          WHERE venda_existente.tipo = 'VENDA'
            AND venda_existente.orcamento_origem_id = ?
        )
      `, [orcamentoId, orcamentoId]);
        if (reservaOrcamento.changes !== 1) {
            throw new Error("Este orçamento já foi transformado em venda.");
        }
        const resultado = await database.runAsync(`
      INSERT INTO documentos_comerciais (
        tipo,
        cliente_id,
        cliente_nome,
        status,
        valor_total,
        observacoes,
        forma_pagamento,
        data_validade,
        orcamento_origem_id,
        estoque_baixado,
        estoque_estornado
      ) VALUES ('VENDA', ?, ?, 'CONCLUIDA', ?, ?, ?, '', ?, 0, 0)
      `, [
            documentoVenda.cliente_id,
            preparado.clienteNome,
            preparado.valorTotal,
            documentoVenda.observacoes?.trim() ?? "",
            formaPagamento,
            orcamentoId,
        ]);
        vendaId = resultado.lastInsertRowId;
        await inserirItensDocumentoComercial(database, vendaId, preparado.itens);
        await baixarEstoqueVendaDentroTransacao(database, vendaId);
        await atualizarTotalComprasClienteInterno(database, documentoVenda.cliente_id);
    });
    return vendaId;
}

export async function atualizarDocumentoComercialCompleto(id: number, documento: NovoDocumentoComercial): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Documento comercial inválido.");
    }
    const atual = await database.getFirstAsync<{
        id: number;
        tipo: TipoDocumentoComercial;
        status: StatusDocumentoComercial;
        orcamento_origem_id: number | null;
        estoque_baixado: number;
        estoque_estornado: number;
    }>(`
    SELECT
      id,
      tipo,
      status,
      orcamento_origem_id,
      estoque_baixado,
      estoque_estornado
    FROM documentos_comerciais
    WHERE id = ?
    `, [id]);
    if (!atual) {
        throw new Error("Documento comercial não encontrado.");
    }
    if (atual.tipo !== documento.tipo) {
        throw new Error("Não é permitido alterar o tipo do documento. A conversão de orçamento em venda será feita em uma operação própria.");
    }
    if (atual.tipo === "VENDA") {
        throw new Error(atual.status === "CANCELADA"
            ? "Uma venda cancelada permanece disponível somente para consulta."
            : "Uma venda concluída não pode ser editada porque o estoque já foi movimentado.");
    }
    if (atual.status !== "PENDENTE") {
        throw new Error("Somente orçamentos pendentes podem ser editados.");
    }
    const documentoAtualizado: NovoDocumentoComercial = {
        ...documento,
        status: documento.status ?? atual.status,
        orcamento_origem_id: atual.orcamento_origem_id,
    };
    const preparado = await prepararDocumentoComercial(database, documentoAtualizado);
    await database.withTransactionAsync(async () => {
        const atualizacao = await database.runAsync(`
      UPDATE documentos_comerciais
      SET
        cliente_id = ?,
        cliente_nome = ?,
        status = ?,
        valor_total = ?,
        observacoes = ?,
        forma_pagamento = ?,
        data_validade = ?,
        updated_at = datetime('now','localtime')
      WHERE id = ?
        AND tipo = 'ORCAMENTO'
        AND status = 'PENDENTE'
      `, [
            documento.cliente_id,
            preparado.clienteNome,
            preparado.status,
            preparado.valorTotal,
            documento.observacoes?.trim() ?? "",
            documento.forma_pagamento?.trim() ?? "",
            documento.data_validade?.trim() ?? "",
            id,
        ]);
        if (atualizacao.changes !== 1) {
            throw new Error("O orçamento não está mais disponível para edição.");
        }
        await database.runAsync("DELETE FROM documentos_comerciais_itens WHERE documento_id = ?", [id]);
        await inserirItensDocumentoComercial(database, id, preparado.itens);
    });
}

export async function excluirDocumentoComercial(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Documento comercial inválido.");
    }
    const documento = await database.getFirstAsync<{
        id: number;
        tipo: TipoDocumentoComercial;
        status: StatusDocumentoComercial;
    }>(`SELECT id, tipo, status FROM documentos_comerciais WHERE id = ?`, [id]);
    if (!documento) {
        throw new Error("Documento comercial não encontrado.");
    }
    if (documento.tipo === "VENDA") {
        throw new Error("Vendas não podem ser excluídas. Quando necessário, cancele a venda para preservar o histórico.");
    }
    const documentosRelacionados = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM documentos_comerciais
    WHERE orcamento_origem_id = ?
    `, [id]);
    if ((documentosRelacionados?.total ?? 0) > 0) {
        throw new Error("Este orçamento já possui uma venda vinculada e não pode ser excluído.");
    }
    await database.runAsync("DELETE FROM documentos_comerciais WHERE id = ?", [
        id,
    ]);
}

export async function atualizarStatusDocumentoComercial(id: number, status: StatusDocumentoComercial): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Documento comercial inválido.");
    }
    const documento = await database.getFirstAsync<{
        tipo: TipoDocumentoComercial;
        status: StatusDocumentoComercial;
        estoque_baixado: number;
    }>(`
    SELECT tipo, status, estoque_baixado
    FROM documentos_comerciais
    WHERE id = ?
    `, [id]);
    if (!documento) {
        throw new Error("Documento comercial não encontrado.");
    }
    validarStatusDocumento(documento.tipo, status);
    if (documento.tipo === "VENDA") {
        if (status === "CANCELADA") {
            await cancelarVenda(id);
            return;
        }
        if (status === "CONCLUIDA") {
            if (documento.status === "CANCELADA") {
                throw new Error("Uma venda cancelada não pode ser reativada.");
            }
            if (documento.estoque_baixado === 0) {
                await concluirVenda(id);
            }
            return;
        }
    }
    if (documento.status === "CONVERTIDO") {
        throw new Error("Um orçamento convertido permanece disponível somente para consulta.");
    }
    if (documento.status === "CANCELADA" && status !== "CANCELADA") {
        throw new Error("Um orçamento cancelado não pode ser reativado.");
    }
    if (status === "CONVERTIDO") {
        throw new Error("O orçamento só pode receber o status convertido durante a transformação em venda.");
    }
    if (documento.status === status) {
        return;
    }
    await database.runAsync(`
    UPDATE documentos_comerciais
    SET
      status = ?,
      canceled_at = CASE
        WHEN ? = 'CANCELADA' THEN datetime('now','localtime')
        ELSE NULL
      END,
      updated_at = datetime('now','localtime')
    WHERE id = ?
      AND tipo = 'ORCAMENTO'
    `, [status, status, id]);
}

export function arredondarQuantidadeNecessidade(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 1000000) / 1000000;
}

export function converterQuantidadeNecessidade(quantidade: number, unidadeOrigem: string, unidadeDestino: string): number {
    const origem = normalizarUnidade(unidadeOrigem);
    const destino = normalizarUnidade(unidadeDestino);
    if (!Number.isFinite(quantidade) || quantidade < 0) {
        throw new Error("Foi encontrada uma quantidade inválida na composição.");
    }
    if (origem === destino) {
        return quantidade;
    }
    const unidades: Record<string, {
        grupo: string;
        fator: number;
    }> = {
        g: { grupo: "peso", fator: 1 },
        kg: { grupo: "peso", fator: 1000 },
        ml: { grupo: "volume", fator: 1 },
        l: { grupo: "volume", fator: 1000 },
        un: { grupo: "contagem", fator: 1 },
        duzia: { grupo: "contagem", fator: 12 },
        caixa: { grupo: "caixa", fator: 1 },
        pacote: { grupo: "pacote", fator: 1 },
    };
    const configuracaoOrigem = unidades[origem];
    const configuracaoDestino = unidades[destino];
    if (!configuracaoOrigem ||
        !configuracaoDestino ||
        configuracaoOrigem.grupo !== configuracaoDestino.grupo) {
        throw new Error(`Não é possível converter a necessidade de ${unidadeOrigem} para ${unidadeDestino}.`);
    }
    return (quantidade * configuracaoOrigem.fator) / configuracaoDestino.fator;
}

export async function calcularNecessidadesDocumentoComercialInterno(database: SQLite.SQLiteDatabase, documentoId: number): Promise<NecessidadeOrcamento[]> {
    type LinhaNecessidadeDireta = {
        produto_id: number;
        produto_nome: string;
        quantidade_estoque: number;
        unidade_estoque: string;
        quantidade_usada: number;
        unidade_origem: string;
        quantidade_produto_venda: number;
    };
    type LinhaNecessidadeReceita = {
        produto_id: number;
        produto_nome: string;
        quantidade_estoque: number;
        unidade_estoque: string;
        quantidade_ingrediente: number;
        unidade_origem: string;
        quantidade_unidades_receita: number;
        rendimento: string;
        quantidade_produto_venda: number;
    };
    const itensDiretos = await database.getAllAsync<LinhaNecessidadeDireta>(`
    SELECT
      p.id AS produto_id,
      p.nome AS produto_nome,
      p.quantidade AS quantidade_estoque,
      p.unidade_medida AS unidade_estoque,
      pvi.quantidade_usada,
      pvi.unidade_medida AS unidade_origem,
      dci.quantidade AS quantidade_produto_venda
    FROM documentos_comerciais_itens dci
    INNER JOIN produto_venda_itens pvi
      ON pvi.produto_venda_id = dci.produto_venda_id
    INNER JOIN produtos p
      ON p.id = pvi.produto_estoque_id
    WHERE dci.documento_id = ?
    `, [documentoId]);
    const ingredientesReceitas = await database.getAllAsync<LinhaNecessidadeReceita>(`
      SELECT
        p.id AS produto_id,
        p.nome AS produto_nome,
        p.quantidade AS quantidade_estoque,
        p.unidade_medida AS unidade_estoque,
        ri.quantidade_numero AS quantidade_ingrediente,
        ri.unidade_medida AS unidade_origem,
        pvr.quantidade_unidades AS quantidade_unidades_receita,
        r.rendimento,
        dci.quantidade AS quantidade_produto_venda
      FROM documentos_comerciais_itens dci
      INNER JOIN produto_venda_receitas pvr
        ON pvr.produto_venda_id = dci.produto_venda_id
      INNER JOIN receitas r
        ON r.id = pvr.receita_id
      INNER JOIN receita_itens ri
        ON ri.receita_id = r.id
      INNER JOIN produtos p
        ON p.id = ri.produto_id
      WHERE dci.documento_id = ?
      `, [documentoId]);
    const acumulado = new Map<number, {
        produto_id: number;
        produto_nome: string;
        quantidade_necessaria: number;
        quantidade_estoque: number;
        unidade_medida: string;
    }>();
    const adicionarNecessidade = (produtoId: number, produtoNome: string, quantidadeEstoque: number, unidadeEstoque: string, quantidadeOrigem: number, unidadeOrigem: string) => {
        const quantidadeConvertida = converterQuantidadeNecessidade(quantidadeOrigem, unidadeOrigem, unidadeEstoque);
        const itemAtual = acumulado.get(produtoId);
        if (itemAtual) {
            itemAtual.quantidade_necessaria += quantidadeConvertida;
            return;
        }
        acumulado.set(produtoId, {
            produto_id: produtoId,
            produto_nome: produtoNome,
            quantidade_necessaria: quantidadeConvertida,
            quantidade_estoque: Number(quantidadeEstoque || 0),
            unidade_medida: normalizarUnidade(unidadeEstoque),
        });
    };
    // Embalagens e outros produtos cadastrados diretamente na composição.
    for (const item of itensDiretos) {
        const quantidadeNecessaria = Number(item.quantidade_usada || 0) *
            Number(item.quantidade_produto_venda || 0);
        adicionarNecessidade(item.produto_id, item.produto_nome, item.quantidade_estoque, item.unidade_estoque, quantidadeNecessaria, item.unidade_origem);
    }
    // Ingredientes das receitas, respeitando o rendimento cadastrado.
    for (const item of ingredientesReceitas) {
        const rendimento = extrairNumeroRendimento(item.rendimento);
        if (rendimento <= 0) {
            throw new Error(`A receita que utiliza ${item.produto_nome} possui rendimento inválido.`);
        }
        const quantidadeReceitasNecessaria = (Number(item.quantidade_unidades_receita || 0) *
            Number(item.quantidade_produto_venda || 0)) /
            rendimento;
        const quantidadeIngredienteNecessaria = Number(item.quantidade_ingrediente || 0) * quantidadeReceitasNecessaria;
        adicionarNecessidade(item.produto_id, item.produto_nome, item.quantidade_estoque, item.unidade_estoque, quantidadeIngredienteNecessaria, item.unidade_origem);
    }
    return Array.from(acumulado.values())
        .map((item) => {
        const quantidadeNecessaria = arredondarQuantidadeNecessidade(item.quantidade_necessaria);
        const quantidadeEstoque = arredondarQuantidadeNecessidade(item.quantidade_estoque);
        const quantidadeFaltante = arredondarQuantidadeNecessidade(Math.max(0, quantidadeNecessaria - quantidadeEstoque));
        return {
            produto_id: item.produto_id,
            produto_nome: item.produto_nome,
            quantidade_necessaria: quantidadeNecessaria,
            quantidade_estoque: quantidadeEstoque,
            quantidade_faltante: quantidadeFaltante,
            unidade_medida: item.unidade_medida,
            estoque_suficiente: quantidadeFaltante <= 0.000001,
        };
    })
        .sort((a, b) => a.produto_nome.localeCompare(b.produto_nome, "pt-BR", {
        sensitivity: "base",
    }));
}

export async function calcularNecessidadesOrcamento(orcamentoId: number): Promise<NecessidadeOrcamento[]> {
    const database = await getDatabase();
    if (!orcamentoId) {
        throw new Error("Orçamento inválido.");
    }
    const orcamento = await database.getFirstAsync<{
        id: number;
        tipo: TipoDocumentoComercial;
    }>(`
    SELECT id, tipo
    FROM documentos_comerciais
    WHERE id = ?
    `, [orcamentoId]);
    if (!orcamento || orcamento.tipo !== "ORCAMENTO") {
        throw new Error("Orçamento não encontrado.");
    }
    return calcularNecessidadesDocumentoComercialInterno(database, orcamentoId);
}

export async function calcularNecessidadesVenda(vendaId: number): Promise<NecessidadeOrcamento[]> {
    const database = await getDatabase();
    if (!vendaId) {
        throw new Error("Venda inválida.");
    }
    const venda = await database.getFirstAsync<{
        id: number;
        tipo: TipoDocumentoComercial;
    }>(`
    SELECT id, tipo
    FROM documentos_comerciais
    WHERE id = ?
    `, [vendaId]);
    if (!venda || venda.tipo !== "VENDA") {
        throw new Error("Venda não encontrada.");
    }
    return calcularNecessidadesDocumentoComercialInterno(database, vendaId);
}
