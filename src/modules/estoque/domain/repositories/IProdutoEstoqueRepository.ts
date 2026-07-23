import type {
  AtualizarProdutoEstoqueDTO,
  CriarProdutoEstoqueDTO,
  FiltrosProdutoEstoque,
  ProdutoEstoque,
} from '../models/ProdutoEstoque';

export type VinculosProdutoEstoque = {
  compras: number;
  produtosVenda: number;
  historicoVendas: number;
};

export interface IProdutoEstoqueRepository {
  listar(filtros?: FiltrosProdutoEstoque): Promise<ProdutoEstoque[]>;
  buscarPorId(id: number): Promise<ProdutoEstoque | null>;
  criar(produto: CriarProdutoEstoqueDTO): Promise<number>;
  atualizar(produto: AtualizarProdutoEstoqueDTO): Promise<void>;
  buscarVinculos(id: number): Promise<VinculosProdutoEstoque>;
  excluir(id: number): Promise<void>;
}
