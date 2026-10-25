import { getDatabase, ProdutoVendaDatabase } from '../../../../core/database/databaseManager';
import { buscarParametrosPrecificacao, calcularCustoIngrediente, calcularCustoMaoDeObra, calcularCustoOperacionalRateado, calcularPrecoSugerido, extrairNumeroRendimento } from './precificacaoDatabase';

type Componente = {
  produto_venda_id: number;
  preco_medio: number;
  quantidade_embalagem: number;
  unidade_produto: string;
  quantidade: number;
  unidade: string;
  receita_id?: number;
  rendimento?: string;
  quantidade_unidades?: number;
};

// Projeção de leitura: preserva os preços de venda e os valores históricos salvos.
// Carrega a composição em lote, sem uma consulta por produto/ingrediente.
export async function precificarProdutosAtuais(produtos: ProdutoVendaDatabase[]): Promise<ProdutoVendaDatabase[]> {
  if (!produtos.length) return produtos;
  const database = await getDatabase();
  const [parametros, itens, receitas, totais] = await Promise.all([
    buscarParametrosPrecificacao(),
    database.getAllAsync<Componente>(`
      SELECT pvi.produto_venda_id, p.preco_medio, p.quantidade_embalagem,
        p.unidade_medida AS unidade_produto, pvi.quantidade_usada AS quantidade,
        pvi.unidade_medida AS unidade
      FROM produto_venda_itens pvi INNER JOIN produtos p ON p.id = pvi.produto_estoque_id`),
    database.getAllAsync<Componente>(`
      SELECT pvr.produto_venda_id, pvr.receita_id, pvr.quantidade_unidades,
        r.rendimento, p.preco_medio, p.quantidade_embalagem,
        p.unidade_medida AS unidade_produto, ri.quantidade_numero AS quantidade,
        ri.unidade_medida AS unidade
      FROM produto_venda_receitas pvr
      INNER JOIN receitas r ON r.id = pvr.receita_id
      INNER JOIN receita_itens ri ON ri.receita_id = r.id
      INNER JOIN produtos p ON p.id = ri.produto_id`),
    database.getFirstAsync<{ fixos: number; variaveis: number }>(`
      SELECT (SELECT COALESCE(SUM(valor), 0) FROM custos_fixos WHERE ativo = 1) AS fixos,
        (SELECT COALESCE(SUM(valor), 0) FROM custos_variaveis WHERE ativo = 1) AS variaveis`),
  ]);
  const custosItens = new Map<number, number>();
  const custosReceitas = new Map<number, number>();
  const custo = (item: Componente) => calcularCustoIngrediente(item.preco_medio,
    item.quantidade_embalagem, item.unidade_produto, item.quantidade, item.unidade).custo;
  for (const item of itens) {
    custosItens.set(item.produto_venda_id, (custosItens.get(item.produto_venda_id) ?? 0) + custo(item));
  }
  for (const item of receitas) {
    const rendimento = extrairNumeroRendimento(item.rendimento ?? '');
    const valor = rendimento > 0 ? custo(item) / rendimento * (item.quantidade_unidades ?? 0) : 0;
    custosReceitas.set(item.produto_venda_id, (custosReceitas.get(item.produto_venda_id) ?? 0) + valor);
  }
  return produtos.map(produto => {
    const custo_receitas = custosReceitas.get(produto.id) ?? 0;
    const custo_itens = custosItens.get(produto.id) ?? 0;
    const custo_mao_obra = calcularCustoMaoDeObra(parametros.salario_desejado, parametros.horas_trabalhadas_mes, produto.tempo_producao_minutos);
    const custo_operacional = calcularCustoOperacionalRateado(totais?.fixos ?? 0, totais?.variaveis ?? 0, parametros.horas_trabalhadas_mes, produto.tempo_producao_minutos);
    const custo_total = custo_receitas + custo_itens + custo_mao_obra + custo_operacional;
    return { ...produto, custo_receitas, custo_itens, custo_mao_obra, custo_operacional,
      custo_total, margem_lucro: parametros.margem_lucro,
      preco_sugerido: calcularPrecoSugerido(custo_total, parametros.margem_lucro) };
  });
}
