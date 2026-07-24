import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../core/errors';
import { formatDatabaseDate } from '../../../shared/formatters/dateFormatters';
import {
  relatorioPdfService,
  relatorioService,
} from '../di/relatoriosContainer';
import type {
  PeriodoRelatorio,
  ResultadoRelatorio,
  StatusVisualizacaoRelatorio,
  TipoRelatorio,
} from '../domain/models/Relatorio';

function currentMonthPeriod(): PeriodoRelatorio {
  const today = new Date();
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  return {
    data_inicial: formatDatabaseDate(firstDay),
    data_final: formatDatabaseDate(today),
  };
}

export function useRelatorios() {
  const [tipo, setTipo] =
    useState<TipoRelatorio | null>(null);
  const [periodo, setPeriodo] =
    useState<PeriodoRelatorio>(
      currentMonthPeriod()
    );
  const [formaPagamento, setFormaPagamento] =
    useState('TODAS');
  const [formasPagamento, setFormasPagamento] =
    useState<string[]>([]);
  const [status, setStatus] =
    useState<StatusVisualizacaoRelatorio>(
      'INICIAL'
    );
  const [resultado, setResultado] =
    useState<ResultadoRelatorio | null>(null);
  const [erro, setErro] = useState('');
  const [gerandoPdf, setGerandoPdf] =
    useState(false);

  const usaPeriodo =
    tipo === 'VENDAS' || tipo === 'COMPRAS';

  const usaFormaPagamento = tipo === 'VENDAS';

  const carregarFormasPagamento =
    useCallback(async () => {
      try {
        setFormasPagamento(
          await relatorioService.listarFormasPagamento()
        );
      } catch {
        setFormasPagamento([]);
      }
    }, []);

  const selecionarTipo = useCallback(
    (novoTipo: TipoRelatorio) => {
      setTipo(novoTipo);
      setFormaPagamento('TODAS');
      setResultado(null);
      setErro('');
      setStatus('INICIAL');
    },
    []
  );

  const gerar = useCallback(async () => {
    if (!tipo) {
      throw new Error(
        'Selecione o tipo de relatório.'
      );
    }

    try {
      setStatus('CARREGANDO');
      setResultado(null);
      setErro('');

      const data =
        await relatorioService.gerar({
          tipo,
          data_inicial: periodo.data_inicial,
          data_final: periodo.data_final,
          forma_pagamento: usaFormaPagamento
            ? formaPagamento
            : 'TODAS',
        });

      setResultado(data);
      setStatus(
        data.linhas.length ? 'SUCESSO' : 'VAZIO'
      );

      return data;
    } catch (error) {
      setErro(
        getErrorMessage(
          error,
          'Não foi possível gerar o relatório.'
        )
      );
      setStatus('ERRO');
      throw error;
    }
  }, [
    tipo,
    periodo,
    formaPagamento,
    usaFormaPagamento,
  ]);

  const gerarPdf = useCallback(async () => {
    if (!resultado?.linhas.length) return;

    try {
      setGerandoPdf(true);
      await relatorioPdfService.gerarECompartilhar(
        resultado
      );
    } finally {
      setGerandoPdf(false);
    }
  }, [resultado]);

  return useMemo(
    () => ({
      tipo,
      periodo,
      formaPagamento,
      formasPagamento,
      status,
      resultado,
      erro,
      gerandoPdf,
      usaPeriodo,
      usaFormaPagamento,
      setPeriodo,
      setFormaPagamento,
      selecionarTipo,
      carregarFormasPagamento,
      gerar,
      gerarPdf,
    }),
    [
      tipo,
      periodo,
      formaPagamento,
      formasPagamento,
      status,
      resultado,
      erro,
      gerandoPdf,
      usaPeriodo,
      usaFormaPagamento,
      selecionarTipo,
      carregarFormasPagamento,
      gerar,
      gerarPdf,
    ]
  );
}
