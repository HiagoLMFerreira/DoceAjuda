export type TipoRelatorio = 'VENDAS' | 'COMPRAS' | 'ESTOQUE' | 'CLIENTES';

export type StatusVisualizacaoRelatorio =
  | 'INICIAL'
  | 'CARREGANDO'
  | 'SUCESSO'
  | 'VAZIO'
  | 'ERRO';

export type PeriodoRelatorio = {
  data_inicial: string;
  data_final: string;
};

export type FiltrosRelatorio = PeriodoRelatorio & {
  tipo: TipoRelatorio;
  forma_pagamento: string;
};

export type AlinhamentoColunaRelatorio = 'left' | 'center' | 'right';

export type ColunaRelatorio = {
  chave: string;
  titulo: string;
  largura?: number;
  alinhamento?: AlinhamentoColunaRelatorio;
};

export type LinhaRelatorio = {
  id: string | number;
  [chave: string]: string | number;
};

export type ResumoRelatorio = {
  rotulo: string;
  valor: string;
  destaque?: boolean;
};

export type ResultadoRelatorio = {
  tipo: TipoRelatorio;
  titulo: string;
  periodo: string;
  colunas: ColunaRelatorio[];
  linhas: LinhaRelatorio[];
  resumo: ResumoRelatorio[];
  gerado_em: string;
};
