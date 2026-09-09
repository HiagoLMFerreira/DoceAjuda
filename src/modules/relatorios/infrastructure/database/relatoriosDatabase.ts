import type { FiltrosRelatorio, ResultadoRelatorio } from "../../domain/models/Relatorio";
import { StatusCompra, StatusDocumentoComercial, getDatabase } from "../../../../core/database/databaseManager";

export function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

// ===============================
// RELATÓRIOS
// ===============================
export type VendaRelatorioDatabase = {
    id: number;
    data: string;
    cliente_nome: string;
    forma_pagamento: string;
    status: StatusDocumentoComercial;
    valor_total: number;
};

export type CompraRelatorioDatabase = {
    id: number;
    data: string;
    status: StatusCompra;
    valor_total: number;
};

export type EstoqueRelatorioDatabase = {
    id: number;
    nome: string;
    quantidade: number;
    quantidade_minima: number;
    unidade_medida: string;
    preco_medio: number;
    valor_estoque: number;
};

export type ClienteRelatorioDatabase = {
    id: number;
    nome: string;
    telefone: string;
    total_compras: number;
};

export function validarDataRelatorio(data: string, campo: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw new Error(`Informe ${campo} no formato AAAA-MM-DD.`);
    }
    const [ano, mes, dia] = data.split("-").map(Number);
    const dataValidada = new Date(ano, mes - 1, dia);
    if (dataValidada.getFullYear() !== ano ||
        dataValidada.getMonth() !== mes - 1 ||
        dataValidada.getDate() !== dia) {
        throw new Error(`Informe uma ${campo} válida.`);
    }
}

export function validarPeriodoRelatorio(filtros: FiltrosRelatorio): void {
    validarDataRelatorio(filtros.data_inicial, "data inicial");
    validarDataRelatorio(filtros.data_final, "data final");
    if (filtros.data_inicial > filtros.data_final) {
        throw new Error("A data inicial não pode ser maior que a data final.");
    }
}

export function formatarDataRelatorio(data: string): string {
    const partes = data.split("-");
    if (partes.length !== 3)
        return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function formatarNumeroRelatorio(valor: number): string {
    return Number(valor || 0).toLocaleString("pt-BR", {
        maximumFractionDigits: 3,
    });
}

export function gerarDataHoraRelatorio(): string {
    return new Date().toLocaleString("pt-BR");
}

export function descricaoPeriodoRelatorio(filtros: FiltrosRelatorio): string {
    return `De ${formatarDataRelatorio(filtros.data_inicial)} até ${formatarDataRelatorio(filtros.data_final)}`;
}

export async function listarFormasPagamentoRelatorio(): Promise<string[]> {
    const database = await getDatabase();
    const formas = await database.getAllAsync<{
        forma_pagamento: string;
    }>(`
    SELECT DISTINCT TRIM(forma_pagamento) AS forma_pagamento
    FROM documentos_comerciais
    WHERE tipo = 'VENDA'
      AND TRIM(forma_pagamento) <> ''
    ORDER BY forma_pagamento COLLATE NOCASE ASC
  `);
    return formas.map((item) => item.forma_pagamento);
}

export async function gerarRelatorioVendas(filtros: FiltrosRelatorio): Promise<ResultadoRelatorio> {
    validarPeriodoRelatorio(filtros);
    const database = await getDatabase();
    const parametros: Array<string | number> = [
        filtros.data_inicial,
        filtros.data_final,
    ];
    let filtroFormaPagamento = "";
    if (filtros.forma_pagamento &&
        filtros.forma_pagamento.trim().toUpperCase() !== "TODAS") {
        filtroFormaPagamento = `
      AND UPPER(TRIM(dc.forma_pagamento)) = UPPER(TRIM(?))
    `;
        parametros.push(filtros.forma_pagamento.trim());
    }
    const vendas = await database.getAllAsync<VendaRelatorioDatabase>(`
    SELECT
      dc.id,
      strftime('%d/%m/%Y', dc.created_at) AS data,
      dc.cliente_nome,
      COALESCE(NULLIF(TRIM(dc.forma_pagamento), ''), 'Não informada')
        AS forma_pagamento,
      dc.status,
      dc.valor_total
    FROM documentos_comerciais dc
    WHERE dc.tipo = 'VENDA'
      AND date(dc.created_at) BETWEEN date(?) AND date(?)
      ${filtroFormaPagamento}
    ORDER BY dc.created_at DESC, dc.id DESC
    `, parametros);
    const concluidas = vendas.filter((item) => item.status === "CONCLUIDA");
    const canceladas = vendas.filter((item) => item.status === "CANCELADA");
    const faturamento = concluidas.reduce((total, item) => total + Number(item.valor_total || 0), 0);
    return {
        tipo: "VENDAS",
        titulo: "Relatório de Vendas",
        periodo: descricaoPeriodoRelatorio(filtros),
        colunas: [
            { chave: "numero", titulo: "VENDA", largura: 75, alinhamento: "center" },
            { chave: "data", titulo: "DATA", largura: 95, alinhamento: "center" },
            { chave: "cliente", titulo: "CLIENTE", largura: 180 },
            { chave: "pagamento", titulo: "PAGAMENTO", largura: 130 },
            { chave: "status", titulo: "STATUS", largura: 105, alinhamento: "center" },
            { chave: "total", titulo: "TOTAL", largura: 115, alinhamento: "right" },
        ],
        linhas: vendas.map((item) => ({
            id: item.id,
            numero: `#${item.id}`,
            data: item.data,
            cliente: item.cliente_nome,
            pagamento: item.forma_pagamento,
            status: item.status,
            total: formatarMoeda(item.valor_total),
        })),
        resumo: [
            { rotulo: "Registros", valor: String(vendas.length) },
            { rotulo: "Concluídas", valor: String(concluidas.length) },
            { rotulo: "Canceladas", valor: String(canceladas.length) },
            { rotulo: "Faturamento", valor: formatarMoeda(faturamento), destaque: true },
        ],
        gerado_em: gerarDataHoraRelatorio(),
    };
}

export async function gerarRelatorioCompras(filtros: FiltrosRelatorio): Promise<ResultadoRelatorio> {
    validarPeriodoRelatorio(filtros);
    const database = await getDatabase();
    const compras = await database.getAllAsync<CompraRelatorioDatabase>(`
    SELECT
      c.id,
      strftime('%d/%m/%Y', c.data_compra) AS data,
      c.status,
      c.valor_total
    FROM compras c
    WHERE date(c.data_compra) BETWEEN date(?) AND date(?)
    ORDER BY c.data_compra DESC, c.id DESC
    `, [filtros.data_inicial, filtros.data_final]);
    const confirmadas = compras.filter((item) => item.status === "CONFIRMADA");
    const canceladas = compras.filter((item) => item.status === "CANCELADA");
    const valorConfirmado = confirmadas.reduce((total, item) => total + Number(item.valor_total || 0), 0);
    return {
        tipo: "COMPRAS",
        titulo: "Relatório de Compras",
        periodo: descricaoPeriodoRelatorio(filtros),
        colunas: [
            { chave: "numero", titulo: "COMPRA", largura: 90, alinhamento: "center" },
            { chave: "data", titulo: "DATA", largura: 110, alinhamento: "center" },
            { chave: "status", titulo: "STATUS", largura: 130, alinhamento: "center" },
            { chave: "total", titulo: "TOTAL", largura: 130, alinhamento: "right" },
        ],
        linhas: compras.map((item) => ({
            id: item.id,
            numero: `#${item.id}`,
            data: item.data,
            status: item.status,
            total: formatarMoeda(item.valor_total),
        })),
        resumo: [
            { rotulo: "Registros", valor: String(compras.length) },
            { rotulo: "Confirmadas", valor: String(confirmadas.length) },
            { rotulo: "Canceladas", valor: String(canceladas.length) },
            {
                rotulo: "Valor confirmado",
                valor: formatarMoeda(valorConfirmado),
                destaque: true,
            },
        ],
        gerado_em: gerarDataHoraRelatorio(),
    };
}

export async function gerarRelatorioEstoque(): Promise<ResultadoRelatorio> {
    const database = await getDatabase();
    const produtos = await database.getAllAsync<EstoqueRelatorioDatabase>(`
    SELECT
      p.id,
      p.nome,
      p.quantidade,
      p.quantidade_minima,
      p.unidade_medida,
      p.preco_medio,
      p.quantidade * p.preco_medio AS valor_estoque
    FROM produtos p
    WHERE p.ativo = 1
    ORDER BY p.nome COLLATE NOCASE ASC
  `);
    const semEstoque = produtos.filter((item) => Number(item.quantidade || 0) <= 0.000001);
    const abaixoDoMinimo = produtos.filter((item) => {
        const minimo = Number(item.quantidade_minima || 0);
        return minimo > 0 && Number(item.quantidade || 0) <= minimo;
    });
    const valorEstoque = produtos.reduce((total, item) => total + Number(item.valor_estoque || 0), 0);
    return {
        tipo: "ESTOQUE",
        titulo: "Relatório de Estoque",
        periodo: "Situação atual do estoque",
        colunas: [
            { chave: "codigo", titulo: "ID", largura: 65, alinhamento: "center" },
            { chave: "produto", titulo: "PRODUTO", largura: 165 },
            { chave: "quantidade", titulo: "QUANTIDADE", largura: 110, alinhamento: "right" },
            { chave: "quantidade_minima", titulo: "MÍNIMO", largura: 100, alinhamento: "right" },
            { chave: "situacao", titulo: "SITUAÇÃO", largura: 105, alinhamento: "center" },
            { chave: "preco_medio", titulo: "PREÇO MÉDIO", largura: 110, alinhamento: "right" },
            { chave: "valor_estoque", titulo: "VALOR EM ESTOQUE", largura: 130, alinhamento: "right" },
        ],
        linhas: produtos.map((item) => {
            const quantidade = Number(item.quantidade || 0);
            const minimo = Number(item.quantidade_minima || 0);
            return {
                id: item.id,
                codigo: `#${item.id}`,
                produto: item.nome,
                quantidade: `${formatarNumeroRelatorio(quantidade)} ${item.unidade_medida}`,
                quantidade_minima: minimo > 0
                    ? `${formatarNumeroRelatorio(minimo)} ${item.unidade_medida}`
                    : "Não definido",
                situacao: quantidade <= 0.000001
                    ? "Sem estoque"
                    : minimo > 0 && quantidade <= minimo
                        ? "Abaixo do mínimo"
                        : "Regular",
                preco_medio: formatarMoeda(item.preco_medio),
                valor_estoque: formatarMoeda(item.valor_estoque),
            };
        }),
        resumo: [
            { rotulo: "Itens ativos", valor: String(produtos.length) },
            { rotulo: "Sem estoque", valor: String(semEstoque.length) },
            { rotulo: "Abaixo do mínimo", valor: String(abaixoDoMinimo.length) },
            {
                rotulo: "Custo estimado",
                valor: formatarMoeda(valorEstoque),
                destaque: true,
            },
        ],
        gerado_em: gerarDataHoraRelatorio(),
    };
}

export async function gerarRelatorioClientes(): Promise<ResultadoRelatorio> {
    const database = await getDatabase();
    const clientes = await database.getAllAsync<ClienteRelatorioDatabase>(`
    SELECT
      c.id,
      c.nome,
      c.telefone,
      c.total_compras
    FROM clientes c
    WHERE c.ativo = 1
    ORDER BY c.nome COLLATE NOCASE ASC
  `);
    const clientesComCompras = clientes.filter((item) => Number(item.total_compras || 0) > 0);
    const totalCompras = clientes.reduce((total, item) => total + Number(item.total_compras || 0), 0);
    return {
        tipo: "CLIENTES",
        titulo: "Relatório de Clientes",
        periodo: "Situação atual dos clientes",
        colunas: [
            { chave: "codigo", titulo: "ID", largura: 65, alinhamento: "center" },
            { chave: "cliente", titulo: "CLIENTE", largura: 200 },
            { chave: "telefone", titulo: "TELEFONE", largura: 145 },
            { chave: "total_compras", titulo: "TOTAL EM COMPRAS", largura: 150, alinhamento: "right" },
        ],
        linhas: clientes.map((item) => ({
            id: item.id,
            codigo: `#${item.id}`,
            cliente: item.nome,
            telefone: item.telefone || "Não informado",
            total_compras: formatarMoeda(item.total_compras),
        })),
        resumo: [
            { rotulo: "Clientes", valor: String(clientes.length) },
            { rotulo: "Com compras", valor: String(clientesComCompras.length) },
            {
                rotulo: "Total em compras",
                valor: formatarMoeda(totalCompras),
                destaque: true,
            },
        ],
        gerado_em: gerarDataHoraRelatorio(),
    };
}

export async function gerarRelatorio(filtros: FiltrosRelatorio): Promise<ResultadoRelatorio> {
    switch (filtros.tipo) {
        case "VENDAS":
            return gerarRelatorioVendas(filtros);
        case "COMPRAS":
            return gerarRelatorioCompras(filtros);
        case "ESTOQUE":
            return gerarRelatorioEstoque();
        case "CLIENTES":
            return gerarRelatorioClientes();
        default:
            throw new Error("Tipo de relatório inválido.");
    }
}
