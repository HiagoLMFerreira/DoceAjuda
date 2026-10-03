export type StatusContaReceber = 'NAO_DEFINIDO' | 'A_RECEBER' | 'ATRASADO' | 'FINALIZADO';
export type ContaReceber = {
  id: number;
  venda_id: number;
  cliente_nome: string;
  descricao: string;
  valor_original: number;
  valor_sinal: number;
  valor_pendente: number;
  data_vencimento: string;
  forma_pagamento: string;
  data_pagamento: string;
  status: 'PENDENTE' | 'PAGO';
};

export const ROTULOS_STATUS: Record<StatusContaReceber, string> = {
  NAO_DEFINIDO: 'NÃO DEFINIDO', A_RECEBER: 'A RECEBER',
  ATRASADO: 'ATRASADO', FINALIZADO: 'FINALIZADO',
};

export function obterStatusConta(conta: ContaReceber, hoje: string): StatusContaReceber {
  if (conta.status === 'PAGO') return 'FINALIZADO';
  if (!conta.data_vencimento) return 'NAO_DEFINIDO';
  return conta.data_vencimento < hoje ? 'ATRASADO' : 'A_RECEBER';
}

export function filtrarContas(contas: ContaReceber[], statuses: StatusContaReceber[], incluirFinalizados: boolean, hoje: string, busca = '') {
  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  return contas.filter(conta => {
    const status = obterStatusConta(conta, hoje);
    const incluido = status === 'FINALIZADO' ? incluirFinalizados : !statuses.length || statuses.includes(status);
    return incluido && (!termo || `${conta.cliente_nome} ${conta.venda_id} ${conta.descricao}`.toLocaleLowerCase('pt-BR').includes(termo));
  });
}

export type DefinirContaDTO = { id: number; dataVencimento: string; formaPagamento: string };
export type BaixarContaDTO = DefinirContaDTO & { dataPagamento: string };
