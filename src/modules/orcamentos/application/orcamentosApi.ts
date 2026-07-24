export type { DocumentoComercialDatabase, DocumentoComercialDetalhado, NecessidadeOrcamento } from '../../../core/database/databaseManager';
export { formatarMoeda } from '../../relatorios/infrastructure/database/relatoriosDatabase';
import { orcamentoController } from '../di/orcamentosContainer';
export const listarOrcamentos = (filtro = '', _ordenarPor = 'created_at', _direcao = 'DESC') => orcamentoController.listar(filtro);
export const buscarDocumentoComercialPorId = (id:number) => orcamentoController.buscarPorId(id);
export const calcularNecessidadesOrcamento = (id:number) => orcamentoController.calcularNecessidades(id);
export const excluirDocumentoComercial = (id:number) => orcamentoController.excluir(id);
