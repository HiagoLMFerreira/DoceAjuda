export type { DirecaoOrdenacao, DocumentoComercialDatabase, DocumentoComercialDetalhado, OrdenarDocumentoComercialPor } from '../../../core/database/databaseManager';
export { formatarMoeda } from '../../relatorios/infrastructure/database/relatoriosDatabase';
import type { DirecaoOrdenacao, OrdenarVendaPor } from '../domain/models/Venda';
import { vendaController } from '../di/vendasContainer';
export const listarVendas = (filtro = '', ordenarPor:OrdenarVendaPor='created_at', direcao:DirecaoOrdenacao='DESC') => vendaController.listar({termo:filtro, ordenarPor, direcao});
export const buscarDocumentoComercialPorId = (id:number) => vendaController.buscarPorId(id);
export const cancelarVenda = (id:number) => vendaController.cancelar(id);
