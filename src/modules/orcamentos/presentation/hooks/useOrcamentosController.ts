import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { orcamentoController } from '../../di/orcamentosContainer';
import type {
  NecessidadeOrcamento,
  Orcamento,
  OrcamentoDetalhado,
} from '../../domain/models/Orcamento';

export function useOrcamentosController() {
  const [orcamentos, setOrcamentos] =
    useState<Orcamento[]>([]);
  const [detalhado, setDetalhado] =
    useState<OrcamentoDetalhado | null>(null);
  const [necessidades, setNecessidades] =
    useState<NecessidadeOrcamento[]>([]);
  const [carregando, setCarregando] = useState(false);

  const listar = useCallback(async (filtro = '') => {
    try {
      setCarregando(true);
      setOrcamentos(
        await orcamentoController.listar(filtro)
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarPorId = useCallback(async (id: number) => {
    const resultado =
      await orcamentoController.buscarPorId(id);

    setDetalhado(resultado);
    return resultado;
  }, []);

  const calcularNecessidades = useCallback(
    async (id: number) => {
      const resultado =
        await orcamentoController.calcularNecessidades(id);

      setNecessidades(resultado);
      return resultado;
    },
    []
  );

  const excluir = useCallback(
    (id: number) => orcamentoController.excluir(id),
    []
  );

  return {
    orcamentos,
    detalhado,
    necessidades,
    carregando,
    listar,
    buscarPorId,
    calcularNecessidades,
    excluir,
    validarEdicao:
      orcamentoController.validarEdicao.bind(
        orcamentoController
      ),
    validarConversao:
      orcamentoController.validarConversao.bind(
        orcamentoController
      ),
    validarExclusao:
      orcamentoController.validarExclusao.bind(
        orcamentoController
      ),
    setDetalhado,
    mensagemErro: (
      error: unknown,
      fallback: string
    ) => getErrorMessage(error, fallback),
  };
}
