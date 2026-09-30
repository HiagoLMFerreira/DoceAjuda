import { CustoFixoDatabase, CustoVariavelDatabase, ParametrosPrecificacao, ReceitaItemPrecificacao, ReceitaParaPrecificacao, getDatabase } from "../../../../core/database/databaseManager";

// ===============================
// PARÂMETROS DE PRECIFICAÇÃO
// ===============================
export async function buscarParametrosPrecificacao(): Promise<ParametrosPrecificacao> {
    const database = await getDatabase();
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
    const parametros = await database.getFirstAsync<ParametrosPrecificacao>(`
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
    `);
    if (!parametros) {
        throw new Error("Não foi possível carregar os parâmetros de precificação.");
    }
    return parametros;
}

export function salvarParametrosPrecificacao(salarioDesejado: number, horasTrabalhadasMes: number, margemLucro: number): Promise<void>;

export function salvarParametrosPrecificacao(valorHora: number, custosFixosMensais: number, horasTrabalhadasMes: number, custosVariaveis: number, margemLucro: number): Promise<void>;

export async function salvarParametrosPrecificacao(primeiroValor: number, segundoValor: number, terceiroValor: number, quartoValor?: number, quintoValor?: number): Promise<void> {
    const database = await getDatabase();
    const usandoFormatoAntigo = quintoValor !== undefined;
    const salarioDesejado = usandoFormatoAntigo
        ? primeiroValor * terceiroValor
        : primeiroValor;
    const horasTrabalhadasMes = usandoFormatoAntigo
        ? terceiroValor
        : segundoValor;
    const margemLucro = usandoFormatoAntigo ? (quintoValor ?? 0) : terceiroValor;
    const custosFixosLegados = usandoFormatoAntigo ? segundoValor : undefined;
    const custosVariaveisLegados = usandoFormatoAntigo ? quartoValor : undefined;
    if (salarioDesejado < 0) {
        throw new Error("O salário desejado não pode ser negativo.");
    }
    if (horasTrabalhadasMes <= 0) {
        throw new Error("As horas trabalhadas no mês devem ser maiores que zero.");
    }
    if (margemLucro < 0 || margemLucro >= 100) {
        throw new Error("A margem de lucro deve estar entre 0% e 99,99%.");
    }
    const valorHora = salarioDesejado / horasTrabalhadasMes;
    await database.runAsync(`
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
    `, [
        salarioDesejado,
        valorHora,
        custosFixosLegados ?? 0,
        horasTrabalhadasMes,
        custosVariaveisLegados ?? 0,
        margemLucro,
    ]);
}

// ===============================
// CRUD DE CUSTOS FIXOS
// ===============================
export async function listarCustosFixos(incluirInativos: boolean = false): Promise<CustoFixoDatabase[]> {
    const database = await getDatabase();
    const where = incluirInativos ? "" : "WHERE ativo = 1";
    return database.getAllAsync<CustoFixoDatabase>(`
    SELECT id, nome, valor, ativo, created_at
    FROM custos_fixos
    ${where}
    ORDER BY nome COLLATE NOCASE ASC
  `);
}

export async function adicionarCustoFixo(nome: string, valor: number): Promise<number> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    if (!nomeTratado) {
        throw new Error("Informe o nome do custo fixo.");
    }
    if (valor < 0) {
        throw new Error("O valor do custo fixo não pode ser negativo.");
    }
    const resultado = await database.runAsync(`INSERT INTO custos_fixos (nome, valor, ativo) VALUES (?, ?, 1)`, nomeTratado, valor);
    return resultado.lastInsertRowId;
}

export async function atualizarCustoFixo(id: number, nome: string, valor: number): Promise<void> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    if (!id)
        throw new Error("Custo fixo inválido.");
    if (!nomeTratado)
        throw new Error("Informe o nome do custo fixo.");
    if (valor < 0)
        throw new Error("O valor do custo fixo não pode ser negativo.");
    await database.runAsync(`UPDATE custos_fixos SET nome = ?, valor = ? WHERE id = ?`, nomeTratado, valor, id);
}

export async function excluirCustoFixo(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id)
        throw new Error("Custo fixo inválido.");
    await database.runAsync("DELETE FROM custos_fixos WHERE id = ?", id);
}

export async function alterarStatusCustoFixo(id: number, ativo: boolean): Promise<void> {
    const database = await getDatabase();
    if (!id)
        throw new Error("Custo fixo inválido.");
    await database.runAsync("UPDATE custos_fixos SET ativo = ? WHERE id = ?", ativo ? 1 : 0, id);
}

export async function obterTotalCustosFixos(): Promise<number> {
    const database = await getDatabase();
    const resultado = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM custos_fixos
    WHERE ativo = 1
  `);
    return resultado?.total ?? 0;
}

// ===============================
// CRUD DE CUSTOS VARIÁVEIS
// ===============================
export async function listarCustosVariaveis(incluirInativos: boolean = false): Promise<CustoVariavelDatabase[]> {
    const database = await getDatabase();
    const where = incluirInativos ? "" : "WHERE ativo = 1";
    return database.getAllAsync<CustoVariavelDatabase>(`
    SELECT id, nome, valor, ativo, created_at
    FROM custos_variaveis
    ${where}
    ORDER BY nome COLLATE NOCASE ASC
  `);
}

export async function adicionarCustoVariavel(nome: string, valor: number): Promise<number> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    if (!nomeTratado) {
        throw new Error("Informe o nome do custo variável.");
    }
    if (valor < 0) {
        throw new Error("O valor do custo variável não pode ser negativo.");
    }
    const resultado = await database.runAsync(`INSERT INTO custos_variaveis (nome, valor, ativo) VALUES (?, ?, 1)`, nomeTratado, valor);
    return resultado.lastInsertRowId;
}

export async function atualizarCustoVariavel(id: number, nome: string, valor: number): Promise<void> {
    const database = await getDatabase();
    const nomeTratado = nome.trim();
    if (!id)
        throw new Error("Custo variável inválido.");
    if (!nomeTratado)
        throw new Error("Informe o nome do custo variável.");
    if (valor < 0)
        throw new Error("O valor do custo variável não pode ser negativo.");
    await database.runAsync(`UPDATE custos_variaveis SET nome = ?, valor = ? WHERE id = ?`, nomeTratado, valor, id);
}

export async function excluirCustoVariavel(id: number): Promise<void> {
    const database = await getDatabase();
    if (!id)
        throw new Error("Custo variável inválido.");
    await database.runAsync("DELETE FROM custos_variaveis WHERE id = ?", id);
}

export async function alterarStatusCustoVariavel(id: number, ativo: boolean): Promise<void> {
    const database = await getDatabase();
    if (!id)
        throw new Error("Custo variável inválido.");
    await database.runAsync("UPDATE custos_variaveis SET ativo = ? WHERE id = ?", ativo ? 1 : 0, id);
}

export async function obterTotalCustosVariaveis(): Promise<number> {
    const database = await getDatabase();
    const resultado = await database.getFirstAsync<{
        total: number;
    }>(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM custos_variaveis
    WHERE ativo = 1
  `);
    return resultado?.total ?? 0;
}

export async function buscarReceitaParaPrecificacao(receitaId: number): Promise<ReceitaParaPrecificacao | null> {
    const database = await getDatabase();
    const receita = await database.getFirstAsync<{
        id: number;
        nome: string;
        rendimento: string;
        modo_preparo: string;
    }>(`
    SELECT
      id,
      nome,
      rendimento,
      modo_preparo
    FROM receitas
    WHERE id = ?
    `, [receitaId]);
    if (!receita) {
        return null;
    }
    const itens = await database.getAllAsync<ReceitaItemPrecificacao>(`
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
    `, [receitaId]);
    return {
        ...receita,
        itens,
    };
}

export function extrairNumeroRendimento(rendimento: string): number {
    const match = rendimento.replace(",", ".").match(/\d+(\.\d+)?/);
    if (!match) {
        return 0;
    }
    return Number(match[0]);
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

export function normalizarUnidade(unidade: string): string {
    const unidadeTratada = unidade
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (unidadeTratada === "unidade" ||
        unidadeTratada === "unidades" ||
        unidadeTratada === "und") {
        return "un";
    }
    if (unidadeTratada === "litro" || unidadeTratada === "litros") {
        return "l";
    }
    if (unidadeTratada === "caixas") {
        return "caixa";
    }
    if (unidadeTratada === "pacotes") {
        return "pacote";
    }
    if (unidadeTratada === "duzias") {
        return "duzia";
    }
    return unidadeTratada;
}

export function obterGrupoUnidade(unidade: string): "peso" | "volume" | "unidade" | "desconhecida" {
    const unidadeNormalizada = normalizarUnidade(unidade);
    if (unidadeNormalizada === "g" || unidadeNormalizada === "kg") {
        return "peso";
    }
    if (unidadeNormalizada === "ml" || unidadeNormalizada === "l") {
        return "volume";
    }
    if (unidadeNormalizada === "un" ||
        unidadeNormalizada === "caixa" ||
        unidadeNormalizada === "pacote" ||
        unidadeNormalizada === "duzia") {
        return "unidade";
    }
    return "desconhecida";
}

export function obterUnidadeBase(unidade: string): string {
    const grupo = obterGrupoUnidade(unidade);
    if (grupo === "peso") {
        return "g";
    }
    if (grupo === "volume") {
        return "ml";
    }
    if (grupo === "unidade") {
        return "un";
    }
    return "";
}

export function converterParaUnidadeBase(quantidade: number, unidade: string): number {
    const unidadeNormalizada = normalizarUnidade(unidade);
    if (!quantidade || quantidade <= 0) {
        return 0;
    }
    switch (unidadeNormalizada) {
        case "kg":
            return quantidade * 1000;
        case "g":
            return quantidade;
        case "l":
            return quantidade * 1000;
        case "ml":
            return quantidade;
        case "duzia":
            return quantidade * 12;
        case "un":
        case "caixa":
        case "pacote":
            return quantidade;
        default:
            return quantidade;
    }
}

export function unidadesSaoCompativeis(unidadeProduto: string, unidadeReceita: string): boolean {
    const grupoProduto = obterGrupoUnidade(unidadeProduto);
    const grupoReceita = obterGrupoUnidade(unidadeReceita);
    if (grupoProduto === "desconhecida" || grupoReceita === "desconhecida") {
        return false;
    }
    return grupoProduto === grupoReceita;
}

export function calcularCustoIngrediente(precoMedio: number, quantidadeEmbalagem: number, unidadeProduto: string, quantidadeUsada: number, unidadeReceita: string): ResultadoCalculoIngrediente {
    if (!precoMedio || precoMedio <= 0) {
        return {
            custo: 0,
            unidadeCompativel: false,
            quantidadeEmbalagemBase: 0,
            quantidadeUsadaBase: 0,
            unidadeBase: "",
            mensagem: "Produto sem preço médio cadastrado.",
        };
    }
    if (!quantidadeEmbalagem || quantidadeEmbalagem <= 0) {
        return {
            custo: 0,
            unidadeCompativel: false,
            quantidadeEmbalagemBase: 0,
            quantidadeUsadaBase: 0,
            unidadeBase: "",
            mensagem: "Produto sem quantidade da embalagem cadastrada.",
        };
    }
    if (!quantidadeUsada || quantidadeUsada <= 0) {
        return {
            custo: 0,
            unidadeCompativel: false,
            quantidadeEmbalagemBase: 0,
            quantidadeUsadaBase: 0,
            unidadeBase: "",
            mensagem: "Quantidade usada inválida.",
        };
    }
    if (!unidadesSaoCompativeis(unidadeProduto, unidadeReceita)) {
        return {
            custo: 0,
            unidadeCompativel: false,
            quantidadeEmbalagemBase: 0,
            quantidadeUsadaBase: 0,
            unidadeBase: "",
            mensagem: `Unidades incompatíveis: produto em ${unidadeProduto} e receita em ${unidadeReceita}.`,
        };
    }
    const quantidadeEmbalagemBase = converterParaUnidadeBase(quantidadeEmbalagem, unidadeProduto);
    const quantidadeUsadaBase = converterParaUnidadeBase(quantidadeUsada, unidadeReceita);
    const unidadeBase = obterUnidadeBase(unidadeProduto);
    if (!quantidadeEmbalagemBase || !quantidadeUsadaBase) {
        return {
            custo: 0,
            unidadeCompativel: false,
            quantidadeEmbalagemBase,
            quantidadeUsadaBase,
            unidadeBase,
            mensagem: "Não foi possível converter as unidades.",
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

export function calcularValorHora(salarioDesejado: number, horasTrabalhadasMes: number): number {
    if (salarioDesejado < 0 || horasTrabalhadasMes <= 0)
        return 0;
    return salarioDesejado / horasTrabalhadasMes;
}

export function calcularCustoMaoDeObra(salarioDesejado: number, horasTrabalhadasMes: number, minutosGastosNoProduto: number): number {
    if (minutosGastosNoProduto <= 0)
        return 0;
    const valorHora = calcularValorHora(salarioDesejado, horasTrabalhadasMes);
    return valorHora * (minutosGastosNoProduto / 60);
}

export function calcularCustoOperacionalRateado(custosFixosTotais: number, custosVariaveisTotais: number, horasTrabalhadasMes: number, minutosGastosNoProduto: number): number {
    if (horasTrabalhadasMes <= 0 || minutosGastosNoProduto <= 0)
        return 0;
    const horasGastasNoProduto = minutosGastosNoProduto / 60;
    return (((custosFixosTotais + custosVariaveisTotais) / horasTrabalhadasMes) *
        horasGastasNoProduto);
}

export function calcularPrecoSugerido(custoTotal: number, margemLucro: number): number {
    if (custoTotal < 0 || margemLucro < 0 || margemLucro >= 100)
        return 0;
    return custoTotal / (1 - margemLucro / 100);
}
