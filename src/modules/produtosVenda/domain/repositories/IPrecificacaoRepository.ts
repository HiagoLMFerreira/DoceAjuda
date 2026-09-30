import type {
  CustoPrecificacao,
  ParametrosPrecificacao,
} from '../models/Precificacao';

export type TipoCustoPrecificacao = 'fixo' | 'variavel';

export interface IPrecificacaoRepository {
  buscarParametros(): Promise<ParametrosPrecificacao>;
  salvarParametros(
    salarioDesejado: number,
    horasTrabalhadasMes: number,
    margemLucro: number
  ): Promise<void>;

  listarCustos(
    tipo: TipoCustoPrecificacao,
    incluirInativos?: boolean
  ): Promise<CustoPrecificacao[]>;

  adicionarCusto(
    tipo: TipoCustoPrecificacao,
    nome: string,
    valor: number
  ): Promise<number>;

  atualizarCusto(
    tipo: TipoCustoPrecificacao,
    id: number,
    nome: string,
    valor: number
  ): Promise<void>;

  alterarStatusCusto(
    tipo: TipoCustoPrecificacao,
    id: number,
    ativo: boolean
  ): Promise<void>;

  excluirCusto(
    tipo: TipoCustoPrecificacao,
    id: number
  ): Promise<void>;
}
