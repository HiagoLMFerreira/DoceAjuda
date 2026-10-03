import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { formatDateForDatabase } from '../../../../core/formatters/date';
import { contaReceberController } from '../../di/contasReceberContainer';
import { filtrarContas, obterStatusConta, type ContaReceber, type StatusContaReceber } from '../../domain/models/ContaReceber';

export function useContasReceber() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [statuses, setStatuses] = useState<StatusContaReceber[]>([]);
  const [incluirFinalizados, setIncluirFinalizados] = useState(true);
  const [busca, setBusca] = useState('');
  const [hoje, setHoje] = useState(formatDateForDatabase(new Date()));
  const versao = useRef(0);
  const carregar = useCallback(async () => {
    const atual = ++versao.current;
    setCarregando(true);
    setErro('');
    setHoje(formatDateForDatabase(new Date()));
    try {
      const dados = await contaReceberController.listar();
      if (atual === versao.current) setContas(dados);
    } catch (e) {
      if (atual === versao.current) setErro(e instanceof Error ? e.message : 'Não foi possível carregar as contas.');
    } finally {
      if (atual === versao.current) setCarregando(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    void carregar();
    // Atualiza vencimentos também quando a tela permanece aberta à meia-noite.
    const timer = setInterval(() => setHoje(formatDateForDatabase(new Date())), 30000);
    return () => { clearInterval(timer); versao.current++; };
  }, [carregar]));
  const totais = useMemo(() => {
    const valores: Record<StatusContaReceber, number> = { NAO_DEFINIDO: 0, A_RECEBER: 0, ATRASADO: 0, FINALIZADO: 0 };
    contas.forEach(conta => { valores[obterStatusConta(conta, hoje)] += conta.valor_pendente; });
    return valores;
  }, [contas, hoje]);
  const filtradas = useMemo(() => filtrarContas(contas, statuses, incluirFinalizados, hoje, busca), [contas, statuses, incluirFinalizados, hoje, busca]);
  const alternarStatus = (status: StatusContaReceber) => setStatuses(atuais => atuais.includes(status) ? atuais.filter(item => item !== status) : [...atuais, status]);
  return { carregando, erro, carregar, filtradas, totais, statuses, alternarStatus, incluirFinalizados, setIncluirFinalizados, busca, setBusca, hoje };
}
