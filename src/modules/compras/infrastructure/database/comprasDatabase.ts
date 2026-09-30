import { CompraDatabase, CompraDetalhada, CompraItemDatabase, DirecaoOrdenacao, NovaCompra, OrdenarCompraPor, ProdutoEstoque, getDatabase } from "../../../../core/database/databaseManager";
import { validarDirecaoOrdenacao } from "../../../estoque/infrastructure/database/estoqueDatabase";

// ===============================
// CRUD DE COMPRAS
// ===============================
export function arredondarCompra(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function validarDataCompra(dataCompra?: string): string {
    const data = dataCompra?.trim();
    if (!data) {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw new Error("Informe a data da compra no formato AAAA-MM-DD.");
    }
    return data;
}

export function normalizarUnidadeCompra(unidade: string): string {
    const valor = unidade.trim().toLowerCase();
    if (valor === "litro" || valor === "litros")
        return "l";
    if (valor === "unidade" || valor === "unidades" || valor === "und")
        return "un";
    if (valor === "dúzia" || valor === "duzias" || valor === "dúzias")
        return "duzia";
    return valor;
}

export function converterQuantidadeCompra(quantidade: number, unidadeOrigem: string, unidadeDestino: string): number {
    const origem = normalizarUnidadeCompra(unidadeOrigem);
    const destino = normalizarUnidadeCompra(unidadeDestino);
    if (origem === destino)
        return quantidade;
    const fatores: Record<string, {
        grupo: string;
        fator: number;
    }> = {
        g: { grupo: "peso", fator: 1 },
        kg: { grupo: "peso", fator: 1000 },
        ml: { grupo: "volume", fator: 1 },
        l: { grupo: "volume", fator: 1000 },
        un: { grupo: "unidade", fator: 1 },
        duzia: { grupo: "unidade", fator: 12 },
    };
    const origemConfig = fatores[origem];
    const destinoConfig = fatores[destino];
    if (!origemConfig ||
        !destinoConfig ||
        origemConfig.grupo !== destinoConfig.grupo) {
        throw new Error(`Não é possível converter ${unidadeOrigem} para ${unidadeDestino}.`);
    }
    return (quantidade * origemConfig.fator) / destinoConfig.fator;
}

export async function cadastrarCompra(compra: NovaCompra): Promise<number> {
    const database = await getDatabase();
    if (!compra.itens?.length) {
        throw new Error("Adicione pelo menos um item à compra.");
    }
    const dataCompra = validarDataCompra(compra.data_compra);
    const observacoes = compra.observacoes?.trim() ?? "";
    const produtosAdicionados = new Set<number>();
    let compraId = 0;
    await database.withTransactionAsync(async () => {
        const itensPreparados: Array<{
            produto: ProdutoEstoque;
            quantidadeEmbalagens: number;
            quantidadePorEmbalagem: number;
            unidadeConteudo: string;
            quantidadeConvertida: number;
            valorUnitario: number;
            valorUnitarioEstoque: number;
            subtotal: number;
        }> = [];
        for (const item of compra.itens) {
            if (!item.produto_id) {
                throw new Error("Existe um produto inválido na compra.");
            }
            if (produtosAdicionados.has(item.produto_id)) {
                throw new Error("O mesmo produto foi adicionado mais de uma vez. Edite o item existente.");
            }
            if (!Number.isFinite(item.quantidade_embalagens) ||
                item.quantidade_embalagens <= 0) {
                throw new Error("A quantidade de embalagens deve ser maior que zero.");
            }
            if (!Number.isFinite(item.quantidade_por_embalagem) ||
                item.quantidade_por_embalagem <= 0) {
                throw new Error("O conteúdo por embalagem deve ser maior que zero.");
            }
            if (!Number.isFinite(item.valor_unitario) || item.valor_unitario < 0) {
                throw new Error("O valor unitário da embalagem não pode ser negativo.");
            }
            const produto = await database.getFirstAsync<ProdutoEstoque>(`SELECT * FROM produtos WHERE id = ? AND ativo = 1`, [item.produto_id]);
            if (!produto) {
                throw new Error("Um dos produtos não foi encontrado ou está inativo.");
            }
            const unidadeConteudo = normalizarUnidadeCompra(item.unidade_conteudo);
            if (!unidadeConteudo) {
                throw new Error(`Informe a unidade do conteúdo de ${produto.nome}.`);
            }
            const conteudoTotal = item.quantidade_embalagens * item.quantidade_por_embalagem;
            const quantidadeConvertida = converterQuantidadeCompra(conteudoTotal, unidadeConteudo, produto.unidade_medida);
            if (!Number.isFinite(quantidadeConvertida) || quantidadeConvertida <= 0) {
                throw new Error(`A quantidade convertida de ${produto.nome} é inválida.`);
            }
            const valorUnitario = arredondarCompra(item.valor_unitario);
            const subtotal = arredondarCompra(item.quantidade_embalagens * valorUnitario);
            const valorUnitarioEstoque = subtotal / quantidadeConvertida;
            itensPreparados.push({
                produto,
                quantidadeEmbalagens: item.quantidade_embalagens,
                quantidadePorEmbalagem: item.quantidade_por_embalagem,
                unidadeConteudo,
                quantidadeConvertida,
                valorUnitario,
                valorUnitarioEstoque,
                subtotal,
            });
            produtosAdicionados.add(produto.id);
        }
        const valorTotal = arredondarCompra(itensPreparados.reduce((total, item) => total + item.subtotal, 0));
        const resultadoCompra = await database.runAsync(`INSERT INTO compras (data_compra, status, valor_total, observacoes)
       VALUES (?, 'CONFIRMADA', ?, ?)`, [dataCompra, valorTotal, observacoes]);
        compraId = resultadoCompra.lastInsertRowId;
        for (const item of itensPreparados) {
            const resultadoItem = await database.runAsync(`INSERT INTO compra_itens (
          compra_id, produto_id, produto_nome, unidade_medida, quantidade,
          quantidade_embalagens, quantidade_por_embalagem, unidade_conteudo,
          valor_unitario, valor_unitario_estoque, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                compraId,
                item.produto.id,
                item.produto.nome,
                item.produto.unidade_medida,
                item.quantidadeConvertida,
                item.quantidadeEmbalagens,
                item.quantidadePorEmbalagem,
                item.unidadeConteudo,
                item.valorUnitario,
                item.valorUnitarioEstoque,
                item.subtotal,
            ]);
            const quantidadeAtual = item.produto.quantidade || 0;
            const precoMedioAtual = item.produto.preco_medio || 0;
            const novaQuantidade = quantidadeAtual + item.quantidadeConvertida;
            const novoPrecoMedio = novaQuantidade > 0
                ? (quantidadeAtual * precoMedioAtual +
                    item.quantidadeConvertida * item.valorUnitarioEstoque) /
                    novaQuantidade
                : 0;
            await database.runAsync(`UPDATE produtos
         SET quantidade = ?, preco_ultima_entrada = ?, preco_medio = ?,
             preco = ?, quantidade_embalagem = 1
         WHERE id = ?`, [
                novaQuantidade,
                item.valorUnitarioEstoque,
                novoPrecoMedio,
                item.valorUnitarioEstoque,
                item.produto.id,
            ]);
            await database.runAsync(`INSERT INTO movimentacoes (
          produto_id,
          tipo,
          quantidade,
          preco_unitario,
          compra_id,
          compra_item_id,
          origem
        ) VALUES (?, 'entrada', ?, ?, ?, ?, 'COMPRA')`, [
                item.produto.id,
                item.quantidadeConvertida,
                item.valorUnitarioEstoque,
                compraId,
                resultadoItem.lastInsertRowId,
            ]);
        }
    });
    return compraId;
}

export async function listarCompras(filtro: string = "", ordenarPor: OrdenarCompraPor = "data_compra", direcao: DirecaoOrdenacao = "DESC"): Promise<CompraDatabase[]> {
    const database = await getDatabase();
    const colunasPermitidas: Record<OrdenarCompraPor, string> = {
        id: "c.id",
        data_compra: "c.data_compra",
        valor_total: "c.valor_total",
        status: "c.status",
    };
    const colunaOrdenacao = colunasPermitidas[ordenarPor] ?? "c.data_compra";
    const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
    const busca = filtro.trim();
    const parametros: Array<string | number> = [];
    let where = "";
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            where = `
        WHERE c.id = ?
          OR EXISTS (
            SELECT 1
            FROM compra_itens ci
            WHERE ci.compra_id = c.id
              AND ci.produto_nome LIKE ?
          )
      `;
            parametros.push(buscaNumerica, `%${busca}%`);
        }
        else {
            where = `
        WHERE c.status LIKE ?
          OR c.data_compra LIKE ?
          OR EXISTS (
            SELECT 1
            FROM compra_itens ci
            WHERE ci.compra_id = c.id
              AND ci.produto_nome LIKE ?
          )
      `;
            parametros.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
        }
    }
    return database.getAllAsync<CompraDatabase>(`
    SELECT
      c.id,
      c.data_compra,
      c.status,
      c.valor_total,
      c.observacoes,
      c.created_at,
      c.canceled_at
    FROM compras c
    ${where}
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}, c.id ${direcaoOrdenacao}
    `, parametros);
}

export async function listarItensCompra(compraId: number): Promise<CompraItemDatabase[]> {
    const database = await getDatabase();
    if (!compraId) {
        throw new Error("Compra inválida.");
    }
    return database.getAllAsync<CompraItemDatabase>(`
    SELECT
      id,
      compra_id,
      produto_id,
      produto_nome,
      unidade_medida,
      quantidade,
      quantidade_embalagens,
      quantidade_por_embalagem,
      unidade_conteudo,
      valor_unitario,
      valor_unitario_estoque,
      subtotal
    FROM compra_itens
    WHERE compra_id = ?
    ORDER BY id ASC
    `, [compraId]);
}

export async function buscarCompraPorId(compraId: number): Promise<CompraDetalhada | null> {
    const database = await getDatabase();
    if (!compraId) {
        throw new Error("Compra inválida.");
    }
    const compra = await database.getFirstAsync<CompraDatabase>(`
    SELECT
      id,
      data_compra,
      status,
      valor_total,
      observacoes,
      created_at,
      canceled_at
    FROM compras
    WHERE id = ?
    `, [compraId]);
    if (!compra) {
        return null;
    }
    return {
        ...compra,
        itens: await listarItensCompra(compraId),
    };
}

export async function cancelarCompra(compraId: number): Promise<void> {
    const database = await getDatabase();
    if (!compraId) {
        throw new Error("Compra inválida.");
    }
    await database.withTransactionAsync(async () => {
        const compra = await database.getFirstAsync<CompraDatabase>(`SELECT * FROM compras WHERE id = ?`, [compraId]);
        if (!compra) {
            throw new Error("Compra não encontrada.");
        }
        if (compra.status === "CANCELADA") {
            throw new Error("Esta compra já está cancelada.");
        }
        const itens = await database.getAllAsync<CompraItemDatabase>(`SELECT * FROM compra_itens WHERE compra_id = ? ORDER BY id DESC`, [compraId]);
        for (const item of itens) {
            const movimentacaoCompra = await database.getFirstAsync<{
                id: number;
            }>(`
        SELECT id
        FROM movimentacoes
        WHERE compra_item_id = ?
        LIMIT 1
        `, [item.id]);
            if (!movimentacaoCompra) {
                throw new Error(`Não foi encontrada a movimentação da compra para o produto ${item.produto_nome}.`);
            }
            const movimentacaoPosterior = await database.getFirstAsync<{
                id: number;
            }>(`
        SELECT id
        FROM movimentacoes
        WHERE produto_id = ?
          AND id > ?
        LIMIT 1
        `, [item.produto_id, movimentacaoCompra.id]);
            if (movimentacaoPosterior) {
                throw new Error(`A compra não pode ser cancelada porque o produto ${item.produto_nome} possui movimentações posteriores.`);
            }
            const produto = await database.getFirstAsync<ProdutoEstoque>(`SELECT * FROM produtos WHERE id = ?`, [item.produto_id]);
            if (!produto) {
                throw new Error(`O produto ${item.produto_nome} não foi encontrado.`);
            }
            if (produto.quantidade < item.quantidade) {
                throw new Error(`Não existe estoque suficiente de ${item.produto_nome} para cancelar esta compra.`);
            }
            const quantidadeAnterior = produto.quantidade - item.quantidade;
            const valorTotalAnterior = produto.quantidade * produto.preco_medio -
                item.quantidade * item.valor_unitario_estoque;
            const precoMedioAnterior = quantidadeAnterior > 0
                ? Math.max(0, valorTotalAnterior / quantidadeAnterior)
                : 0;
            const ultimaEntradaAnterior = await database.getFirstAsync<{
                preco_unitario: number;
            }>(`
        SELECT preco_unitario
        FROM movimentacoes
        WHERE produto_id = ?
          AND tipo = 'entrada'
          AND id < ?
        ORDER BY id DESC
        LIMIT 1
        `, [item.produto_id, movimentacaoCompra.id]);
            const precoUltimaEntradaAnterior = ultimaEntradaAnterior?.preco_unitario ?? 0;
            await database.runAsync(`
        UPDATE produtos
        SET
          quantidade = ?,
          preco_medio = ?,
          preco_ultima_entrada = ?,
          preco = ?
        WHERE id = ?
        `, [
                quantidadeAnterior,
                precoMedioAnterior,
                precoUltimaEntradaAnterior,
                precoUltimaEntradaAnterior,
                item.produto_id,
            ]);
            await database.runAsync(`DELETE FROM movimentacoes WHERE compra_item_id = ?`, [item.id]);
        }
        await database.runAsync(`
      UPDATE compras
      SET
        status = 'CANCELADA',
        canceled_at = datetime('now','localtime')
      WHERE id = ?
      `, [compraId]);
    });
}

export async function excluirCompra(compraId: number): Promise<void> {
    const database = await getDatabase();
    if (!compraId) {
        throw new Error("Compra inválida.");
    }
    const compra = await database.getFirstAsync<CompraDatabase>(`SELECT * FROM compras WHERE id = ?`, [compraId]);
    if (!compra) {
        throw new Error("Compra não encontrada.");
    }
    if (compra.status !== "CANCELADA") {
        throw new Error("Somente compras canceladas podem ser excluídas. Cancele a compra primeiro para estornar o estoque.");
    }
    await database.runAsync(`DELETE FROM compras WHERE id = ?`, [compraId]);
}
