import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { compraController } from '../../di/comprasContainer';
import type {
  Compra,
  CompraDetalhada,
  FiltrosCompra,
  NovaCompra,
} from '../../domain/models/Compra';
import type { ProdutoCompra } from '../../domain/models/ProdutoCompra';

export function useComprasController() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [produtos, setProdutos] =
    useState<ProdutoCompra[]>([]);
  const [detalhes, setDetalhes] =
    useState<CompraDetalhada | null>(null);
  const [carregando, setCarregando] = useState(false);

  const listar = useCallback(
    async (filtros: FiltrosCompra = {}) => {
      try {
        setCarregando(true);
        setCompras(await compraController.listar(filtros));
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  const listarProdutos = useCallback(async () => {
    const resultado =
      await compraController.listarProdutos();
    setProdutos(resultado);
    return resultado;
  }, []);

  const buscarDetalhes = useCallback(async (id: number) => {
    const resultado =
      await compraController.buscarPorId(id);
    setDetalhes(resultado);
    return resultado;
  }, []);

  const cadastrar = useCallback(
    (input: NovaCompra) =>
      compraController.cadastrar(input),
    []
  );

  const cancelar = useCallback(
    (id: number) => compraController.cancelar(id),
    []
  );

  const excluir = useCallback(
    (id: number) => compraController.excluir(id),
    []
  );

  return {
    compras,
    produtos,
    detalhes,
    carregando,
    listar,
    listarProdutos,
    buscarDetalhes,
    cadastrar,
    cancelar,
    excluir,
    setDetalhes,
    calcularTotal:
      compraController.calculadora.calcularTotal.bind(
        compraController.calculadora
      ),
    mensagemErro: (
      error: unknown,
      fallback: string
    ) => getErrorMessage(error, fallback),
  };
}
