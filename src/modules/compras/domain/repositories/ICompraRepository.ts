import type {
  Compra,
  CompraDetalhada,
  FiltrosCompra,
  NovaCompra,
} from '../models/Compra';

export interface ICompraRepository {
  listar(filtros?: FiltrosCompra): Promise<Compra[]>;
  buscarPorId(id: number): Promise<CompraDetalhada | null>;
  cadastrar(input: NovaCompra): Promise<number>;
  cancelar(id: number): Promise<void>;
  excluir(id: number): Promise<void>;
}
