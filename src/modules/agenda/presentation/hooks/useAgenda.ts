import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../core/errors';
import { agendaController } from '../../di/agendaContainer';
import type { AgendaEncomenda } from '../../domain/models/Agenda';

export function useAgenda() {
  const [encomendas, setEncomendas] = useState<AgendaEncomenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      setEncomendas(await agendaController.listar());
    } catch (error) {
      setErro(getErrorMessage(error, 'Não foi possível carregar a agenda.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarDetalhes = useCallback((id: number) => {
    return agendaController.buscarDetalhes(id);
  }, []);

  const calcularNecessidadesEncomenda = useCallback((id: number) => {
    return agendaController.calcularNecessidadesEncomenda(id);
  }, []);

  const calcularNecessidadesDia = useCallback((data: string) => {
    return agendaController.calcularNecessidadesDia(data);
  }, []);

  return {
    encomendas,
    carregando,
    erro,
    carregar,
    buscarDetalhes,
    calcularNecessidadesEncomenda,
    calcularNecessidadesDia,
  };
}
