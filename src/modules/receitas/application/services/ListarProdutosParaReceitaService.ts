import type { IProdutoParaReceitaRepository } from '../../domain/repositories/IProdutoParaReceitaRepository';
export class ListarProdutosParaReceitaService {
  constructor(private readonly repository: IProdutoParaReceitaRepository) {}
  executar() { return this.repository.listarAtivos(); }
}
