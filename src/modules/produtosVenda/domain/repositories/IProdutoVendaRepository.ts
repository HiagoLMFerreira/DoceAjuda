import type {
  ProdutoVenda,
  ProdutoVendaDetalhado,
  SalvarProdutoVendaDTO,
} from '../models/ProdutoVenda';

export interface IProdutoVendaRepository {
  listar(filtro?: string): Promise<ProdutoVenda[]>;
  buscarDetalhado(id: number): Promise<ProdutoVendaDetalhado | null>;
  criar(input: SalvarProdutoVendaDTO): Promise<number>;
  atualizar(id: number, input: SalvarProdutoVendaDTO): Promise<void>;
  possuiDocumentosVinculados(id: number): Promise<boolean>;
  excluir(id: number): Promise<void>;
}
