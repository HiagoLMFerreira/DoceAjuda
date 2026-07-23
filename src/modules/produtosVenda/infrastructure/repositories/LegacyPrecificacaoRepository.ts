import {
  adicionarCustoFixo,
  adicionarCustoVariavel,
  alterarStatusCustoFixo,
  alterarStatusCustoVariavel,
  atualizarCustoFixo,
  atualizarCustoVariavel,
  buscarParametrosPrecificacao,
  excluirCustoFixo,
  excluirCustoVariavel,
  listarCustosFixos,
  listarCustosVariaveis,
  salvarParametrosPrecificacao,
} from '../../../../database/database';
import type {
  CustoPrecificacao,
  ParametrosPrecificacao,
} from '../../domain/models/Precificacao';
import type {
  IPrecificacaoRepository,
  TipoCustoPrecificacao,
} from '../../domain/repositories/IPrecificacaoRepository';

export class LegacyPrecificacaoRepository
  implements IPrecificacaoRepository
{
  buscarParametros(): Promise<ParametrosPrecificacao> {
    return buscarParametrosPrecificacao();
  }

  salvarParametros(
    salarioDesejado: number,
    horasTrabalhadasMes: number,
    margemLucro: number
  ): Promise<void> {
    return salvarParametrosPrecificacao(
      salarioDesejado,
      horasTrabalhadasMes,
      margemLucro
    );
  }

  listarCustos(
    tipo: TipoCustoPrecificacao,
    incluirInativos = true
  ): Promise<CustoPrecificacao[]> {
    return tipo === 'fixo'
      ? listarCustosFixos(incluirInativos)
      : listarCustosVariaveis(incluirInativos);
  }

  adicionarCusto(
    tipo: TipoCustoPrecificacao,
    nome: string,
    valor: number
  ): Promise<number> {
    return tipo === 'fixo'
      ? adicionarCustoFixo(nome, valor)
      : adicionarCustoVariavel(nome, valor);
  }

  atualizarCusto(
    tipo: TipoCustoPrecificacao,
    id: number,
    nome: string,
    valor: number
  ): Promise<void> {
    return tipo === 'fixo'
      ? atualizarCustoFixo(id, nome, valor)
      : atualizarCustoVariavel(id, nome, valor);
  }

  alterarStatusCusto(
    tipo: TipoCustoPrecificacao,
    id: number,
    ativo: boolean
  ): Promise<void> {
    return tipo === 'fixo'
      ? alterarStatusCustoFixo(id, ativo)
      : alterarStatusCustoVariavel(id, ativo);
  }

  excluirCusto(
    tipo: TipoCustoPrecificacao,
    id: number
  ): Promise<void> {
    return tipo === 'fixo'
      ? excluirCustoFixo(id)
      : excluirCustoVariavel(id);
  }
}
