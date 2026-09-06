import { ClienteDatabase, DirecaoOrdenacao, OrdenarClientePor, getDatabase } from "../../../../core/database/databaseManager";
import { validarDirecaoOrdenacao } from "../../../estoque/infrastructure/database/estoqueDatabase";

// ===============================
// CRUD DE CLIENTES
// ===============================
export async function listarClientes(filtro: string = "", ordenarPor: OrdenarClientePor = "nome", direcao: DirecaoOrdenacao = "ASC"): Promise<ClienteDatabase[]> {
    const database = await getDatabase();
    const colunasPermitidas: OrdenarClientePor[] = [
        "id",
        "nome",
        "total_compras",
    ];
    const colunaOrdenacao = colunasPermitidas.includes(ordenarPor)
        ? ordenarPor
        : "nome";
    const direcaoOrdenacao = validarDirecaoOrdenacao(direcao);
    const busca = filtro.trim();
    if (busca) {
        const buscaNumerica = Number(busca);
        if (!Number.isNaN(buscaNumerica)) {
            const resultado = await database.getAllAsync<ClienteDatabase>(`
        SELECT
          id,
          nome,
          telefone,
          endereco,
          total_compras,
          ativo
        FROM clientes
        WHERE ativo = 1
          AND (id = ? OR nome LIKE ?)
        ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
        `, [buscaNumerica, `%${busca}%`]);
            return resultado;
        }
        const resultado = await database.getAllAsync<ClienteDatabase>(`
      SELECT
        id,
        nome,
        telefone,
        endereco,
        total_compras,
        ativo
      FROM clientes
      WHERE ativo = 1
        AND nome LIKE ?
      ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
      `, [`%${busca}%`]);
        return resultado;
    }
    const resultado = await database.getAllAsync<ClienteDatabase>(`
    SELECT
      id,
      nome,
      telefone,
      endereco,
      total_compras,
      ativo
    FROM clientes
    WHERE ativo = 1
    ORDER BY ${colunaOrdenacao} ${direcaoOrdenacao}
  `);
    return resultado;
}

export async function adicionarCliente(nome: string, telefone: string = "", endereco: string = ""): Promise<number> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    const telefoneTratado = telefone.trim();
    const enderecoTratado = endereco.trim();
    if (!nomeTratado) {
        throw new Error("Informe o nome do cliente.");
    }
    const resultado = await database.runAsync(`
    INSERT INTO clientes (
      nome,
      telefone,
      endereco,
      total_compras,
      ativo
    ) VALUES (?, ?, ?, 0)
    `, [nomeTratado, telefoneTratado, enderecoTratado]);
    return resultado.lastInsertRowId;
}

export async function atualizarCliente(id: number, nome: string, telefone: string = "", endereco: string = ""): Promise<void> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    const telefoneTratado = telefone.trim();
    const enderecoTratado = endereco.trim();
    if (!id) {
        throw new Error("Cliente inválido.");
    }
    if (!nomeTratado) {
        throw new Error("Informe o nome do cliente.");
    }
    await database.runAsync(`
    UPDATE clientes
    SET
      nome = ?,
      telefone = ?,
      endereco = ?
    WHERE id = ?
    `, [nomeTratado, telefoneTratado, enderecoTratado, id]);
}

export async function excluirCliente(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Cliente inválido.");
    }
    const usoEmDocumento = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COUNT(*) AS total
    FROM documentos_comerciais
    WHERE cliente_id = ?
    `, [id]);
    if ((usoEmDocumento?.total ?? 0) > 0) {
        throw new Error("Este cliente possui orçamentos ou vendas vinculados e não pode ser excluído.");
    }
    await database.runAsync("DELETE FROM clientes WHERE id = ?", [id]);
}

export async function buscarClientePorId(id: number): Promise<ClienteDatabase | null> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Cliente inválido.");
    }
    const cliente = await database.getFirstAsync<ClienteDatabase>(`
    SELECT
      id,
      nome,
      telefone,
      endereco,
      total_compras
    FROM clientes
    WHERE id = ?
    `, [id]);
    return cliente ?? null;
}

export async function atualizarTotalComprasCliente(id: number, valorTotal: number): Promise<void> {
    const database = await getDatabase();
    if (!id) {
        throw new Error("Cliente inválido.");
    }
    if (valorTotal < 0) {
        throw new Error("O valor total não pode ser negativo.");
    }
    await database.runAsync(`
    UPDATE clientes
    SET total_compras = ?
    WHERE id = ?
    `, [valorTotal, id]);
}
