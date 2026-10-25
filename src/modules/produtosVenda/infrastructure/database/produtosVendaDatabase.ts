import * as SQLite from "expo-sqlite";
import { precificarProdutosAtuais } from './precificacaoProdutosDatabase';
import { NovoProdutoVenda, ProdutoVendaDatabase, ProdutoVendaDetalhado, ProdutoVendaItemDetalhado, ProdutoVendaReceitaDetalhada, getDatabase } from "../../../../core/database/databaseManager";

// ===============================
// CRUD DE PRODUTOS PARA VENDA
// ===============================
export function validarProdutoVenda(produto: NovoProdutoVenda): void {
    if (!produto.nome.trim()) {
        throw new Error("Informe o nome do produto para venda.");
    }
    if (produto.tempo_producao_minutos <= 0) {
        throw new Error("Informe um tempo de produção maior que zero.");
    }
    if (produto.margem_lucro < 0 || produto.margem_lucro >= 100) {
        throw new Error("A margem de lucro deve estar entre 0% e 99,99%.");
    }
    if (produto.preco_venda <= 0) {
        throw new Error("Informe o preço definitivo de venda.");
    }
    if (produto.receitas.length === 0 && produto.itens.length === 0) {
        throw new Error("Adicione pelo menos uma receita ou item do estoque.");
    }
    const receitaInvalida = produto.receitas.some((item) => !item.receita_id || item.quantidade_unidades <= 0);
    if (receitaInvalida) {
        throw new Error("Existe uma receita com quantidade inválida.");
    }
    const itemInvalido = produto.itens.some((item) => !item.produto_estoque_id ||
        item.quantidade_usada <= 0 ||
        !item.unidade_medida.trim());
    if (itemInvalido) {
        throw new Error("Existe um item do estoque com quantidade inválida.");
    }
}

export async function listarProdutosVenda(filtro: string = "", incluirInativos: boolean = false): Promise<ProdutoVendaDatabase[]> {
    const database = await getDatabase();
    const busca = filtro.trim();
    const condicaoAtivo = incluirInativos ? "" : "pv.ativo = 1";
    const condicoes: string[] = [];
    const parametros: (string | number)[] = [];
    if (condicaoAtivo) {
        condicoes.push(condicaoAtivo);
    }
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            condicoes.push("(pv.id = ? OR pv.nome LIKE ? OR pv.descricao LIKE ?)");
            parametros.push(buscaNumerica, `%${busca}%`, `%${busca}%`);
        }
        else {
            condicoes.push("(pv.nome LIKE ? OR pv.descricao LIKE ?)");
            parametros.push(`%${busca}%`, `%${busca}%`);
        }
    }
    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";
    const produtos = await database.getAllAsync<ProdutoVendaDatabase>(`
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
    `, parametros);
    return precificarProdutosAtuais(produtos);
}

export async function buscarProdutoVendaPorId(id: number): Promise<ProdutoVendaDatabase | null> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Produto para venda inválido.");
    }
    const produto = await database.getFirstAsync<ProdutoVendaDatabase>(`
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
    `, [id]);
    return produto ? (await precificarProdutosAtuais([produto]))[0] : null;
}

export async function buscarProdutoVendaDetalhado(id: number): Promise<ProdutoVendaDetalhado | null> {
    const database = await getDatabase();
    const produto = await buscarProdutoVendaPorId(id);
    if (!produto) {
        return null;
    }
    const receitas = await database.getAllAsync<ProdutoVendaReceitaDetalhada>(`
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
    `, [id]);
    const itens = await database.getAllAsync<ProdutoVendaItemDetalhado>(`
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
    `, [id]);
    return {
        ...produto,
        receitas,
        itens,
    };
}

export async function inserirComposicaoProdutoVenda(database: SQLite.SQLiteDatabase, produtoVendaId: number, produto: NovoProdutoVenda): Promise<void> {
    for (const receita of produto.receitas) {
        await database.runAsync(`
      INSERT INTO produto_venda_receitas (
        produto_venda_id,
        receita_id,
        quantidade_unidades
      ) VALUES (?, ?, ?)
      `, [produtoVendaId, receita.receita_id, receita.quantidade_unidades]);
    }
    for (const item of produto.itens) {
        await database.runAsync(`
      INSERT INTO produto_venda_itens (
        produto_venda_id,
        produto_estoque_id,
        quantidade_usada,
        unidade_medida
      ) VALUES (?, ?, ?, ?)
      `, [
            produtoVendaId,
            item.produto_estoque_id,
            item.quantidade_usada,
            item.unidade_medida.trim().toLowerCase(),
        ]);
    }
}

export async function salvarProdutoVendaCompleto(produto: NovoProdutoVenda): Promise<number> {
    validarProdutoVenda(produto);
    const database = await getDatabase();
    let produtoVendaId = 0;
    await database.withTransactionAsync(async () => {
        const resultado = await database.runAsync(`
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
      `, [
            produto.nome.trim(),
            produto.descricao?.trim() ?? "",
            produto.tempo_producao_minutos,
            produto.custo_receitas,
            produto.custo_itens,
            produto.custo_mao_obra,
            produto.custo_operacional,
            produto.custo_total,
            produto.margem_lucro,
            produto.preco_sugerido,
            produto.preco_venda,
        ]);
        produtoVendaId = resultado.lastInsertRowId;
        await inserirComposicaoProdutoVenda(database, produtoVendaId, produto);
    });
    return produtoVendaId;
}

export async function atualizarProdutoVendaCompleto(id: number, produto: NovoProdutoVenda): Promise<void> {
    if (!id) {
        throw new Error("Produto para venda inválido.");
    }
    validarProdutoVenda(produto);
    const database = await getDatabase();
    await database.withTransactionAsync(async () => {
        await database.runAsync(`
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
      `, [
            produto.nome.trim(),
            produto.descricao?.trim() ?? "",
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
        ]);
        await database.runAsync("DELETE FROM produto_venda_receitas WHERE produto_venda_id = ?", [id]);
        await database.runAsync("DELETE FROM produto_venda_itens WHERE produto_venda_id = ?", [id]);
        await inserirComposicaoProdutoVenda(database, id, produto);
    });
}

export async function excluirProdutoVenda(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Produto para venda inválido.");
    }
    const usoEmDocumento = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM documentos_comerciais_itens
    WHERE produto_venda_id = ?
    `, [id]);
    if ((usoEmDocumento?.total ?? 0) > 0) {
        throw new Error("Este produto está sendo utilizado em um orçamento ou venda e não pode ser excluído.");
    }
    await database.runAsync("DELETE FROM produtos_venda WHERE id = ?", [id]);
}

export async function alterarStatusProdutoVenda(id: number, ativo: boolean): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Produto para venda inválido.");
    }
    await database.runAsync(`
    UPDATE produtos_venda
    SET ativo = ?, updated_at = datetime('now','localtime')
    WHERE id = ?
    `, [ativo ? 1 : 0, id]);
}
