import type {
  FiltrosVenda,
  Venda,
  VendaDetalhada,
} from '../models/Venda';

export interface IVendaRepository {
  listar(filtros?: FiltrosVenda): Promise<Venda[]>;
  buscarPorId(id: number): Promise<VendaDetalhada | null>;
  cancelar(id: number): Promise<void>;
}
