import { DirecaoOrdenacao, EditarProdutoEstoque, NovoProdutoEstoque, OrdenarProdutoPor, ProdutoEstoque, UNIDADES_MEDIDA_ESTOQUE, UnidadeMedidaEstoque, getDatabase } from "../../../../core/database/databaseManager";

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
export function validarDirecaoOrdenacao(direcao: DirecaoOrdenacao): DirecaoOrdenacao {
    return direcao === "DESC" ? "DESC" : "ASC";
}

// ===============================
// CRUD DE PRODUTOS / ESTOQUE
// ===============================
export async function listarProdutos(ordenarPor: OrdenarProdutoPor = "nome", direcao: DirecaoOrdenacao = "ASC"): Promise<ProdutoEstoque[]> {
    const database = await getDatabase();
    const colunasPermitidas: OrdenarProdutoPor[] = [
        "id",
        "nome",
        "codigo_barras",
        "preco_ultima_entrada",
        "preco_medio",
        "quantidade",
        "unidade_medida",
    ];
    const colunaOrdenacao = colunasPermitidas.includes(ordenarPor)
        ? ordenarPor
        : "nome";
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
      quantidade_minima,
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

export async function buscarProdutos(filtro: string = "", ordenarPor: OrdenarProdutoPor = "nome", direcao: DirecaoOrdenacao = "ASC"): Promise<ProdutoEstoque[]> {
    const database = await getDatabase();
    const colunasPermitidas: OrdenarProdutoPor[] = [
        "id",
        "nome",
        "codigo_barras",
        "preco_ultima_entrada",
        "preco_medio",
        "quantidade",
        "unidade_medida",
    ];
    const colunaOrdenacao = colunasPermitidas.includes(ordenarPor)
        ? ordenarPor
        : "nome";
    const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
    const busca = filtro.trim();
    if (!busca) {
        return listarProdutos(ordenarPor, direcao);
    }
    const buscaNumerica = Number(busca);
    if (!Number.isNaN(buscaNumerica)) {
        const resultado = await database.getAllAsync<ProdutoEstoque>(`
      SELECT
        id,
        descricao,
        nome,
        codigo_barras,
        preco_ultima_entrada,
        preco_medio,
        quantidade,
        quantidade_minima,
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
      `, [buscaNumerica, `%${busca}%`, `%${busca}%`, `%${busca}%`]);
        return resultado;
    }
    const resultado = await database.getAllAsync<ProdutoEstoque>(`
    SELECT
      id,
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade,
      quantidade_minima,
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
    `, [`%${busca}%`, `%${busca}%`, `%${busca}%`]);
    return resultado;
}

export async function cadastrarProduto(produto: NovoProdutoEstoque): Promise<void> {
    const database = await getDatabase();
    const nome = produto.nome.trim();
    const codigoBarras = produto.codigo_barras?.trim() || "";
    const unidadeMedida = produto.unidade_medida?.trim().toLowerCase() || "";
    if (!nome) {
        throw new Error("Informe o nome do produto.");
    }
    if (!UNIDADES_MEDIDA_ESTOQUE.includes(unidadeMedida as UnidadeMedidaEstoque)) {
        throw new Error("Selecione uma unidade de medida válida.");
    }
    await database.runAsync(`
    INSERT INTO produtos (
      descricao,
      nome,
      codigo_barras,
      preco_ultima_entrada,
      preco_medio,
      quantidade,
      quantidade_minima,
      quantidade_embalagem,
      unidade_medida,
      ativo,
      preco
    ) VALUES (?, ?, ?, 0, 0, 0, ?, 1, ?, 1, 0)
    `, [nome, nome, codigoBarras, produto.quantidade_minima ?? 0, unidadeMedida]);
}

export async function editarProduto(produto: EditarProdutoEstoque): Promise<void> {
    const database = await getDatabase();
    const nome = produto.nome.trim();
    const codigoBarras = produto.codigo_barras?.trim() || "";
    const unidadeMedida = produto.unidade_medida?.trim().toLowerCase() || "";
    if (!produto.id) {
        throw new Error("Produto inválido.");
    }
    if (!nome) {
        throw new Error("Informe o nome do produto.");
    }
    if (!UNIDADES_MEDIDA_ESTOQUE.includes(unidadeMedida as UnidadeMedidaEstoque)) {
        throw new Error("Selecione uma unidade de medida válida.");
    }
    await database.runAsync(`
    UPDATE produtos
    SET
      descricao = ?,
      nome = ?,
      codigo_barras = ?,
      unidade_medida = ?,
      quantidade_minima = ?
    WHERE id = ?
    `, [nome, nome, codigoBarras, unidadeMedida, produto.quantidade_minima ?? 0, produto.id]);
}

export async function excluirProduto(produtoId: number): Promise<void> {
    const database = await getDatabase();
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    const usoEmCompra = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM compra_itens
    WHERE produto_id = ?
    `, [produtoId]);
    if ((usoEmCompra?.total ?? 0) > 0) {
        throw new Error("Este item possui histórico de compras e não pode ser excluído. Você pode inativá-lo.");
    }
    const usoEmProdutoVenda = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM produto_venda_itens
    WHERE produto_estoque_id = ?
    `, [produtoId]);
    if ((usoEmProdutoVenda?.total ?? 0) > 0) {
        throw new Error("Este item está sendo utilizado em um produto para venda e não pode ser excluído.");
    }
    const usoEmHistoricoVenda = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM venda_estoque_itens
    WHERE produto_id = ?
    `, [produtoId]);
    if ((usoEmHistoricoVenda?.total ?? 0) > 0) {
        throw new Error("Este item possui histórico de vendas e não pode ser excluído. Você pode inativá-lo.");
    }
    await database.runAsync("DELETE FROM movimentacoes WHERE produto_id = ?", [
        produtoId,
    ]);
    await database.runAsync("DELETE FROM receita_itens WHERE produto_id = ?", [
        produtoId,
    ]);
    await database.runAsync("DELETE FROM produtos WHERE id = ?", [produtoId]);
}

export async function inativarProduto(produtoId: number): Promise<void> {
    const database = await getDatabase();
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    await database.runAsync("UPDATE produtos SET ativo = 0 WHERE id = ?", [
        produtoId,
    ]);
}

export async function buscarProdutoPorId(produtoId: number): Promise<ProdutoEstoque | null> {
    const database = await getDatabase();
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    const produto = await database.getFirstAsync<ProdutoEstoque>(`
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
    `, [produtoId]);
    return produto ?? null;
}

// ===============================
// MOVIMENTAÇÕES DE ESTOQUE
// ===============================
export async function inserirMovimentacao(produtoId: number, tipo: "entrada" | "saida", qtd: number, precoUnitario: number = 0): Promise<void> {
    const database = await getDatabase();
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    if (qtd <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
    }
    if (precoUnitario < 0) {
        throw new Error("O preço não pode ser negativo.");
    }
    const produto = await buscarProdutoPorId(produtoId);
    if (!produto) {
        throw new Error("Produto não encontrado.");
    }
    if (tipo === "saida" && qtd > produto.quantidade) {
        throw new Error("Não é possível fazer uma saída maior que o estoque atual.");
    }
    await database.runAsync(`
    INSERT INTO movimentacoes (
      produto_id,
      tipo,
      quantidade,
      preco_unitario,
      origem
    ) VALUES (?, ?, ?, ?, 'MANUAL')
    `, [produtoId, tipo, qtd, precoUnitario]);
    if (tipo === "entrada") {
        const quantidadeAtual = produto.quantidade;
        const precoMedioAtual = produto.preco_medio || 0;
        const novaQuantidade = quantidadeAtual + qtd;
        let novoPrecoMedio = precoMedioAtual;
        if (precoUnitario > 0 && novaQuantidade > 0) {
            novoPrecoMedio =
                (quantidadeAtual * precoMedioAtual + qtd * precoUnitario) /
                    novaQuantidade;
        }
        await database.runAsync(`
      UPDATE produtos
      SET
        quantidade = ?,
        preco_ultima_entrada = ?,
        preco_medio = ?,
        preco = ?
      WHERE id = ?
      `, [
            novaQuantidade,
            precoUnitario > 0 ? precoUnitario : produto.preco_ultima_entrada,
            novoPrecoMedio,
            precoUnitario > 0 ? precoUnitario : (produto.preco ?? 0),
            produtoId,
        ]);
    }
    else {
        const novaQuantidade = produto.quantidade - qtd;
        if (novaQuantidade < 0) {
            throw new Error("A quantidade não pode ficar negativa.");
        }
        await database.runAsync(`
      UPDATE produtos
      SET quantidade = ?
      WHERE id = ?
      `, [novaQuantidade, produtoId]);
    }
}

export async function listarMovimentacoesProduto(produtoId: number) {
    const database = await getDatabase();
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    const movimentacoes = await database.getAllAsync(`
    SELECT
      id,
      produto_id,
      tipo,
      quantidade,
      preco_unitario,
      compra_id,
      venda_id,
      origem,
      data
    FROM movimentacoes
    WHERE produto_id = ?
    ORDER BY id DESC
    `, [produtoId]);
    return movimentacoes;
}
