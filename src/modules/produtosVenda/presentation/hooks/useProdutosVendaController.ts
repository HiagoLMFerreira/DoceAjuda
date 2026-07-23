import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { produtoVendaController } from '../../di/produtosVendaContainer';
import type {
  ProdutoVenda,
  ProdutoVendaDetalhado,
  SalvarProdutoVendaDTO,
} from '../../domain/models/ProdutoVenda';

export function useProdutosVendaController() {
  const [produtos, setProdutos] = useState<ProdutoVenda[]>([]);
  const [detalhado, setDetalhado] =
    useState<ProdutoVendaDetalhado | null>(null);
  const [carregando, setCarregando] = useState(false);

  const listar = useCallback(async (filtro = '') => {
    try {
      setCarregando(true);
      setProdutos(await produtoVendaController.listar(filtro));
    } finally {
      setCarregando(false);
    }
  }, []);

  const abrirDetalhes = useCallback(async (id: number) => {
    const produto =
      await produtoVendaController.buscarDetalhado(id);
    setDetalhado(produto);
    return produto;
  }, []);

  const salvar = useCallback(
    (input: SalvarProdutoVendaDTO, id?: number) =>
      produtoVendaController.salvar(input, id),
    []
  );

  const excluir = useCallback(
    (id: number) => produtoVendaController.excluir(id),
    []
  );

  return {
    produtos,
    detalhado,
    carregando,
    listar,
    abrirDetalhes,
    salvar,
    excluir,
    setDetalhado,
    mensagemErro: (error: unknown, fallback: string) =>
      getErrorMessage(error, fallback),
  };
}
