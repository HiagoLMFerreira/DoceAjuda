export const UNIDADES_RECEITA = ['g', 'kg', 'ml', 'l', 'un'] as const;
export type UnidadeReceita = (typeof UNIDADES_RECEITA)[number];

export type Receita = {
  id: number;
  nome: string;
  rendimento: string;
  modo_preparo: string;
  created_at: string;
};

export type ReceitaItem = {
  id: number;
  receita_id: number;
  produto_id: number;
  produto_nome: string;
  codigo_barras: string;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type ReceitaDetalhada = Receita & { itens: ReceitaItem[] };

export type ItemReceitaInput = {
  produto_id: number;
  quantidade_usada: string;
  quantidade_numero: number;
  unidade_medida: string;
};

export type SalvarReceitaDTO = {
  nome: string;
  rendimento: string;
  modo_preparo: string;
  itens: ItemReceitaInput[];
};

export type AtualizarReceitaDTO = SalvarReceitaDTO & { id: number };

export type OrdenarReceitaPor = 'nome' | 'rendimento';
export type DirecaoOrdenacaoReceita = 'ASC' | 'DESC';
export type ModoFormularioReceita = 'cadastro' | 'edicao';

export type ItemReceitaFormulario = ItemReceitaInput & {
  produto_nome: string;
};

export type FormularioReceita = {
  nome: string;
  rendimento: string;
  modoPreparo: string;
  itens: ItemReceitaFormulario[];
};
