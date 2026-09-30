import { getDatabaseConnection } from '../../../../core/database';
import { DatabaseError } from '../../../../core/errors';
import type {
  AtualizarProdutoEstoqueDTO,
  CriarProdutoEstoqueDTO,
  FiltrosProdutoEstoque,
  OrdenarProdutoEstoquePor,
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import type {
  IProdutoEstoqueRepository,
  VinculosProdutoEstoque,
} from '../../domain/repositories/IProdutoEstoqueRepository';

const COLUNAS: Record<OrdenarProdutoEstoquePor, string> = {
  id: 'id',
  nome: 'nome COLLATE NOCASE',
  codigo_barras: 'codigo_barras',
  preco_ultima_entrada: 'preco_ultima_entrada',
  preco_medio: 'preco_medio',
  quantidade: 'quantidade',
  unidade_medida: 'unidade_medida COLLATE NOCASE',
};

const SELECT_PRODUTO = `
  SELECT
    id,
    descricao,
    nome,
    codigo_barras,
    preco_ultima_entrada,
    preco_medio,
    quantidade,
    quantidade_minima,
    quantidade_embalagem,
    unidade_medida,
    ativo,
    preco
  FROM produtos
`;

export class SQLiteProdutoEstoqueRepository
  implements IProdutoEstoqueRepository
{
  async listar(
    filtros: FiltrosProdutoEstoque = {}
  ): Promise<ProdutoEstoque[]> {
    try {
      const database = await getDatabaseConnection();
      const termo = filtros.termo?.trim() ?? '';
      const coluna =
        COLUNAS[filtros.ordenarPor ?? 'nome'] ?? COLUNAS.nome;
      const direcao =
        filtros.direcao === 'DESC' ? 'DESC' : 'ASC';
      const situacao = filtros.situacao === 'INATIVOS' ? 0 : 1;

      if (!termo) {
        return database.getAllAsync<ProdutoEstoque>(`
          ${SELECT_PRODUTO}
          WHERE ativo = ${situacao}
          ORDER BY ${coluna} ${direcao}
        `);
      }

      const numero = Number(termo);

      if (!Number.isNaN(numero)) {
        return database.getAllAsync<ProdutoEstoque>(
          `
            ${SELECT_PRODUTO}
            WHERE ativo = ${situacao}
              AND (
                id = ?
                OR nome LIKE ?
                OR descricao LIKE ?
                OR codigo_barras LIKE ?
              )
            ORDER BY ${coluna} ${direcao}
          `,
          [numero, `%${termo}%`, `%${termo}%`, `%${termo}%`]
        );
      }

      return database.getAllAsync<ProdutoEstoque>(
        `
          ${SELECT_PRODUTO}
          WHERE ativo = ${situacao}
            AND (
              nome LIKE ?
              OR descricao LIKE ?
              OR codigo_barras LIKE ?
            )
          ORDER BY ${coluna} ${direcao}
        `,
        [`%${termo}%`, `%${termo}%`, `%${termo}%`]
      );
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível carregar os produtos.',
        error
      );
    }
  }

  async buscarPorId(id: number): Promise<ProdutoEstoque | null> {
    try {
      const database = await getDatabaseConnection();
      return (
        (await database.getFirstAsync<ProdutoEstoque>(
          `${SELECT_PRODUTO} WHERE id = ?`,
          [id]
        )) ?? null
      );
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível buscar o produto.',
        error
      );
    }
  }

  async criar(
    produto: CriarProdutoEstoqueDTO
  ): Promise<number> {
    try {
      const database = await getDatabaseConnection();
      const result = await database.runAsync(
        `
          INSERT INTO produtos (
            descricao,
            nome,
            codigo_barras,
            preco_ultima_entrada,
            preco_medio,
            quantidade,
            quantidade_minima,
            quantidade_embalagem,
            unidade_medida,
            ativo,
            preco
          ) VALUES (?, ?, ?, 0, 0, 0, ?, 1, ?, 1, 0)
        `,
        [
          produto.nome,
          produto.nome,
          produto.codigo_barras ?? '',
          produto.quantidade_minima ?? 0,
          produto.unidade_medida,
        ]
      );

      return Number(result.lastInsertRowId);
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível salvar o produto.',
        error
      );
    }
  }

  async atualizar(
    produto: AtualizarProdutoEstoqueDTO
  ): Promise<void> {
    try {
      const database = await getDatabaseConnection();
      const result = await database.runAsync(
        `
          UPDATE produtos
          SET
            descricao = ?,
            nome = ?,
            codigo_barras = ?,
            unidade_medida = ?,
            quantidade_minima = ?
          WHERE id = ?
        `,
        [
          produto.nome,
          produto.nome,
          produto.codigo_barras ?? '',
          produto.unidade_medida,
          produto.quantidade_minima ?? 0,
          produto.id,
        ]
      );

      if (result.changes !== 1) {
        throw new Error('Produto não encontrado.');
      }
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível salvar o produto.',
        error
      );
    }
  }

  async buscarVinculos(
    id: number
  ): Promise<VinculosProdutoEstoque> {
    try {
      const database = await getDatabaseConnection();

      const [compras, produtosVenda, historicoVendas] =
        await Promise.all([
          database.getFirstAsync<{ total: number }>(
            'SELECT COUNT(*) AS total FROM compra_itens WHERE produto_id = ?',
            [id]
          ),
          database.getFirstAsync<{ total: number }>(
            'SELECT COUNT(*) AS total FROM produto_venda_itens WHERE produto_estoque_id = ?',
            [id]
          ),
          database.getFirstAsync<{ total: number }>(
            'SELECT COUNT(*) AS total FROM venda_estoque_itens WHERE produto_id = ?',
            [id]
          ),
        ]);

      return {
        compras: Number(compras?.total ?? 0),
        produtosVenda: Number(produtosVenda?.total ?? 0),
        historicoVendas: Number(historicoVendas?.total ?? 0),
      };
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível verificar os vínculos do produto.',
        error
      );
    }
  }

  async alterarStatus(id: number, ativo: boolean): Promise<void> {
    try {
      const database = await getDatabaseConnection();
      const result = await database.runAsync(
        'UPDATE produtos SET ativo = ? WHERE id = ?',
        [ativo ? 1 : 0, id]
      );

      if (result.changes !== 1) {
        throw new Error('Produto não encontrado.');
      }
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível alterar o status do produto.',
        error
      );
    }
  }
}
