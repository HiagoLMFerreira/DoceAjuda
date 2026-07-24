import type {
  NecessidadeOrcamento,
  Orcamento,
  OrcamentoDetalhado,
} from '../models/Orcamento';

export interface IOrcamentoRepository {
  listar(filtro?: string): Promise<Orcamento[]>;
  buscarPorId(id: number): Promise<OrcamentoDetalhado | null>;
  calcularNecessidades(id: number): Promise<NecessidadeOrcamento[]>;
  excluir(id: number): Promise<void>;
}
