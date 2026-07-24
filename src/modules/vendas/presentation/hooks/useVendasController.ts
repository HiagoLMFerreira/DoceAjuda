import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { vendaController } from '../../di/vendasContainer';
import type {
  FiltrosVenda,
  Venda,
  VendaDetalhada,
} from '../../domain/models/Venda';

export function useVendasController() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [detalhada, setDetalhada] =
    useState<VendaDetalhada | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const listar = useCallback(
    async (filtros: FiltrosVenda = {}) => {
      try {
        setCarregando(true);
        setVendas(await vendaController.listar(filtros));
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  const buscarPorId = useCallback(async (id: number) => {
    const resultado =
      await vendaController.buscarPorId(id);

    setDetalhada(resultado);
    return resultado;
  }, []);

  const cancelar = useCallback(async (id: number) => {
    try {
      setCancelando(true);
      await vendaController.cancelar(id);
      const atualizada =
        await vendaController.buscarPorId(id);
      setDetalhada(atualizada);
      return atualizada;
    } finally {
      setCancelando(false);
    }
  }, []);

  return {
    vendas,
    detalhada,
    carregando,
    cancelando,
    listar,
    buscarPorId,
    cancelar,
    validarCancelamento:
      vendaController.validarCancelamento.bind(
        vendaController
      ),
    setDetalhada,
    mensagemErro: (
      error: unknown,
      fallback: string
    ) => getErrorMessage(error, fallback),
  };
}
