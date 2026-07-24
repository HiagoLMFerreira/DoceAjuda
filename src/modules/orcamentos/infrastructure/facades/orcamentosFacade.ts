export type {
  DocumentoComercialDatabase,
  DocumentoComercialDetalhado,
  NecessidadeOrcamento,
} from '../../../../database/database';

export { formatarMoeda } from '../../../../database/database';

import { orcamentoController } from '../../di/orcamentosContainer';

export const listarOrcamentos = (
  filtro = '',
  _ordenarPor = 'created_at',
  _direcao = 'DESC'
) => orcamentoController.listar(filtro);

export const buscarDocumentoComercialPorId = (
  id: number
) => orcamentoController.buscarPorId(id);

export const calcularNecessidadesOrcamento = (
  id: number
) => orcamentoController.calcularNecessidades(id);

export const excluirDocumentoComercial = (
  id: number
) => orcamentoController.excluir(id);
