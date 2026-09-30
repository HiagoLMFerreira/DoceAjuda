import { NovoItemReceita, ProdutoParaReceita, ReceitaDatabase, ReceitaDetalhada, ReceitaItemDetalhado, getDatabase } from "../../../../core/database/databaseManager";

// ===============================
// CRUD DE RECEITAS
// ===============================
export async function listarReceitas(filtro: string = ""): Promise<ReceitaDatabase[]> {
    const database = await getDatabase();
    const busca = filtro.trim();
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            const resultado = await database.getAllAsync<ReceitaDatabase>(`
        SELECT
          id,
          nome,
          rendimento,
          modo_preparo,
          created_at
        FROM receitas
        WHERE id = ? OR nome LIKE ? OR rendimento LIKE ?
        ORDER BY nome COLLATE NOCASE ASC
        `, [buscaNumerica, `%${busca}%`, `%${busca}%`]);
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
      WHERE nome LIKE ? OR rendimento LIKE ?
      ORDER BY nome COLLATE NOCASE ASC
      `, [`%${busca}%`, `%${busca}%`]);
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

export async function adicionarReceita(nome: string, rendimento: string = "", modoPreparo: string = ""): Promise<number> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    const rendimentoTratado = rendimento.trim();
    const modoPreparoTratado = modoPreparo.trim();
    if (!nomeTratado) {
        throw new Error("Informe o nome da receita.");
    }
    if (!rendimentoTratado) {
        throw new Error("Informe o rendimento da receita.");
    }
    if (!modoPreparoTratado) {
        throw new Error("Informe o modo de preparo da receita.");
    }
    const resultado = await database.runAsync(`
    INSERT INTO receitas (
      nome,
      rendimento,
      modo_preparo
    ) VALUES (?, ?, ?)
    `, [nomeTratado, rendimentoTratado, modoPreparoTratado]);
    return resultado.lastInsertRowId;
}

export async function atualizarReceita(id: number, nome: string, rendimento: string = "", modoPreparo: string = ""): Promise<void> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    const rendimentoTratado = rendimento.trim();
    const modoPreparoTratado = modoPreparo.trim();
    if (!id) {
        throw new Error("Receita inválida.");
    }
    if (!nomeTratado) {
        throw new Error("Informe o nome da receita.");
    }
    if (!rendimentoTratado) {
        throw new Error("Informe o rendimento da receita.");
    }
    if (!modoPreparoTratado) {
        throw new Error("Informe o modo de preparo da receita.");
    }
    await database.runAsync(`
    UPDATE receitas
    SET
      nome = ?,
      rendimento = ?,
      modo_preparo = ?
    WHERE id = ?
    `, [nomeTratado, rendimentoTratado, modoPreparoTratado, id]);
}

export async function excluirReceita(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Receita inválida.");
    }
    const usoEmProdutoVenda = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM produto_venda_receitas
    WHERE receita_id = ?
    `, [id]);
    if ((usoEmProdutoVenda?.total ?? 0) > 0) {
        throw new Error("Esta receita está sendo utilizada em um produto para venda e não pode ser excluída.");
    }
    await database.runAsync("DELETE FROM receita_itens WHERE receita_id = ?", [
        id,
    ]);
    await database.runAsync("DELETE FROM receitas WHERE id = ?", [id]);
}

export async function buscarReceitaPorId(id: number): Promise<ReceitaDatabase | null> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Receita inválida.");
    }
    const receita = await database.getFirstAsync<ReceitaDatabase>(`
    SELECT
      id,
      nome,
      rendimento,
      modo_preparo,
      created_at
    FROM receitas
    WHERE id = ?
    `, [id]);
    return receita ?? null;
}

export async function adicionarItemReceita(receitaId: number, produtoId: number, quantidadeUsada: string, quantidadeNumero: number, unidadeMedida: string): Promise<void> {
    const database = await getDatabase();
    const quantidadeTratada = quantidadeUsada.trim();
    if (!receitaId) {
        throw new Error("Receita inválida.");
    }
    if (!produtoId) {
        throw new Error("Produto inválido.");
    }
    if (!quantidadeTratada || !quantidadeNumero || quantidadeNumero <= 0) {
        throw new Error("Informe uma quantidade usada válida para o produto.");
    }
    const unidadeTratada = unidadeMedida.trim().toLowerCase() || "un";
    await database.runAsync(`
    INSERT INTO receita_itens (
      receita_id,
      produto_id,
      quantidade_usada,
      quantidade_numero,
      unidade_medida
    ) VALUES (?, ?, ?, ?, ?)
    `, [receitaId, produtoId, quantidadeTratada, quantidadeNumero, unidadeTratada]);
}

export async function listarItensReceita(receitaId: number): Promise<ReceitaItemDetalhado[]> {
    const database = await getDatabase();
    if (!receitaId) {
        throw new Error("Receita inválida.");
    }
    const itens = await database.getAllAsync<ReceitaItemDetalhado>(`
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
    `, [receitaId]);
    return itens;
}

export async function excluirItensReceita(receitaId: number): Promise<void> {
    const database = await getDatabase();
    if (!receitaId) {
        throw new Error("Receita inválida.");
    }
    await database.runAsync("DELETE FROM receita_itens WHERE receita_id = ?", [
        receitaId,
    ]);
}

export async function buscarReceitaDetalhada(id: number): Promise<ReceitaDetalhada | null> {
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

export async function salvarReceitaCompleta(nome: string, rendimento: string, modoPreparo: string, itens: NovoItemReceita[]): Promise<number> {
    if (!itens.length) {
        throw new Error("Adicione pelo menos um produto à receita.");
    }
    const receitaId = await adicionarReceita(nome, rendimento, modoPreparo);
    for (const item of itens) {
        await adicionarItemReceita(receitaId, item.produto_id, item.quantidade_usada, item.quantidade_numero, item.unidade_medida);
    }
    return receitaId;
}

export async function editarReceitaCompleta(receitaId: number, nome: string, rendimento: string, modoPreparo: string, itens: NovoItemReceita[]): Promise<void> {
    if (!receitaId) {
        throw new Error("Receita inválida.");
    }
    if (!itens.length) {
        throw new Error("Adicione pelo menos um produto à receita.");
    }
    await atualizarReceita(receitaId, nome, rendimento, modoPreparo);
    await excluirItensReceita(receitaId);
    for (const item of itens) {
        await adicionarItemReceita(receitaId, item.produto_id, item.quantidade_usada, item.quantidade_numero, item.unidade_medida);
    }
}

export async function buscarProdutosParaReceita(filtro: string = ""): Promise<ProdutoParaReceita[]> {
    const database = await getDatabase();
    const busca = filtro.trim();
    if (!busca) {
        return [];
    }
    const buscaNumerica = Number(busca);
    if (!Number.isNaN(buscaNumerica)) {
        const resultado = await database.getAllAsync<ProdutoParaReceita>(`
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
      `, [buscaNumerica, `%${busca}%`, `%${busca}%`, `%${busca}%`]);
        return resultado;
    }
    const resultado = await database.getAllAsync<ProdutoParaReceita>(`
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
    `, [`%${busca}%`, `%${busca}%`, `%${busca}%`]);
    return resultado;
}

export async function buscarProdutoPorCodigoBarras(codigoBarras: string): Promise<ProdutoParaReceita | null> {
    const database = await getDatabase();
    const codigoTratado = codigoBarras.trim();
    if (!codigoTratado) {
        return null;
    }
    const produto = await database.getFirstAsync<ProdutoParaReceita>(`
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
    `, [codigoTratado]);
    return produto ?? null;
}
