export type ParametrosPrecificacao = {
  id: number;
  salario_desejado: number;
  horas_trabalhadas_mes: number;
  margem_lucro: number;
  valor_hora: number;
  custos_fixos_mensais: number;
  custos_variaveis: number;
};

export type CustoPrecificacao = {
  id: number;
  nome: string;
  valor: number;
  ativo: number;
  created_at: string;
};

export type ResultadoCustoIngrediente = {
  custo: number;
  unidadeCompativel: boolean;
  mensagem?: string;
};
