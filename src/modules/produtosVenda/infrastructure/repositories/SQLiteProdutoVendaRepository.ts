import { atualizarProdutoVendaCompleto, buscarProdutoVendaDetalhado, excluirProdutoVenda, listarProdutosVenda, salvarProdutoVendaCompleto } from "../database/produtosVendaDatabase";
import { getDatabaseConnection } from '../../../../core/database';
import type {
  ProdutoVenda,
  ProdutoVendaDetalhado,
  SalvarProdutoVendaDTO,
} from '../../domain/models/ProdutoVenda';
import type { IProdutoVendaRepository } from '../../domain/repositories/IProdutoVendaRepository';

export class SQLiteProdutoVendaRepository
  implements IProdutoVendaRepository
{
  listar(filtro = ''): Promise<ProdutoVenda[]> {
    return listarProdutosVenda(filtro) as Promise<ProdutoVenda[]>;
  }

  buscarDetalhado(
    id: number
  ): Promise<ProdutoVendaDetalhado | null> {
    return buscarProdutoVendaDetalhado(id) as Promise<ProdutoVendaDetalhado | null>;
  }

  criar(input: SalvarProdutoVendaDTO): Promise<number> {
    return salvarProdutoVendaCompleto(input);
  }

  atualizar(
    id: number,
    input: SalvarProdutoVendaDTO
  ): Promise<void> {
    return atualizarProdutoVendaCompleto(id, input);
  }

  async possuiDocumentosVinculados(id: number): Promise<boolean> {
    const database = await getDatabaseConnection();
    const resultado = await database.getFirstAsync<{ total: number }>(
      `
        SELECT COUNT(*) AS total
        FROM documentos_comerciais_itens
        WHERE produto_venda_id = ?
      `,
      [id]
    );

    return Number(resultado?.total ?? 0) > 0;
  }

  excluir(id: number): Promise<void> {
    return excluirProdutoVenda(id);
  }
}
