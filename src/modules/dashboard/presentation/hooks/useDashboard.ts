import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../core/errors/getErrorMessage';
import { carregarDashboardService } from '../../di/dashboardContainer';
import type { DashboardData } from '../../domain/models/Dashboard';

export function useDashboard() {
  const [dados, setDados] =
    useState<DashboardData | null>(null);
  const [carregando, setCarregando] =
    useState(true);
  const [atualizando, setAtualizando] =
    useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(
    async (modoAtualizacao = false) => {
      try {
        setErro('');

        if (modoAtualizacao) {
          setAtualizando(true);
        } else {
          setCarregando(true);
        }

        const resultado =
          await carregarDashboardService.executar();

        setDados(resultado);
      } catch (error) {
        setErro(getErrorMessage(error));
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    []
  );

  return {
    dados,
    carregando,
    atualizando,
    erro,
    carregar,
  };
}
