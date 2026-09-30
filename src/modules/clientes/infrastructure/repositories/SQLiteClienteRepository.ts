import { getDatabaseConnection } from '../../../../core/database';
import { DatabaseError } from '../../../../core/errors';
import type {
  AtualizarClienteDTO,
  CampoOrdenacaoCliente,
  Cliente,
  CriarClienteDTO,
  FiltroClientes,
} from '../../domain/models/Cliente';
import type { IClienteRepository } from '../../domain/repositories/IClienteRepository';

type ClienteRow = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  total_compras: number;
  ativo: number;
};

const COLUNAS_ORDENACAO: Record<CampoOrdenacaoCliente, string> = {
  id: 'id',
  nome: 'nome COLLATE NOCASE',
  total_compras: 'total_compras',
};

function mapearCliente(row: ClienteRow): Cliente {
  return {
    id: Number(row.id),
    nome: row.nome,
    telefone: row.telefone ?? '',
    endereco: row.endereco ?? '',
    total_compras: Number(row.total_compras ?? 0),
    ativo: Number(row.ativo ?? 1),
  };
}

export class SQLiteClienteRepository implements IClienteRepository {
  async listar(filtros: FiltroClientes = {}): Promise<Cliente[]> {
    try {
      const database = await getDatabaseConnection();
      const termo = filtros.termo?.trim() ?? '';
      const ordenarPor = filtros.ordenarPor ?? 'nome';
      const direcao = filtros.direcao === 'DESC' ? 'DESC' : 'ASC';
      const coluna = COLUNAS_ORDENACAO[ordenarPor] ?? COLUNAS_ORDENACAO.nome;
      const situacao = filtros.situacao === 'INATIVOS' ? 0 : 1;

      if (!termo) {
        const rows = await database.getAllAsync<ClienteRow>(`
          SELECT
            id,
            nome,
            telefone,
            endereco,
            total_compras,
            ativo
          FROM clientes
          WHERE ativo = ${situacao}
          ORDER BY ${coluna} ${direcao}
        `);

        return rows.map(mapearCliente);
      }

      const termoNumerico = Number(termo);

      if (!Number.isNaN(termoNumerico)) {
        const rows = await database.getAllAsync<ClienteRow>(
          `
            SELECT
              id,
              nome,
              telefone,
              endereco,
              total_compras,
              ativo
            FROM clientes
            WHERE ativo = ${situacao}
              AND (id = ? OR nome LIKE ?)
            ORDER BY ${coluna} ${direcao}
          `,
          [termoNumerico, `%${termo}%`]
        );

        return rows.map(mapearCliente);
      }

      const rows = await database.getAllAsync<ClienteRow>(
        `
          SELECT
            id,
            nome,
            telefone,
            endereco,
            total_compras,
            ativo
          FROM clientes
          WHERE ativo = ${situacao}
            AND nome LIKE ?
          ORDER BY ${coluna} ${direcao}
        `,
        [`%${termo}%`]
      );

      return rows.map(mapearCliente);
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível carregar os clientes.',
        error
      );
    }
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    try {
      const database = await getDatabaseConnection();
      const row = await database.getFirstAsync<ClienteRow>(
        `
          SELECT
            id,
            nome,
            telefone,
            endereco,
            total_compras,
            ativo
          FROM clientes
          WHERE id = ?
        `,
        [id]
      );

      return row ? mapearCliente(row) : null;
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível buscar o cliente.',
        error
      );
    }
  }

  async criar(cliente: CriarClienteDTO): Promise<number> {
    try {
      const database = await getDatabaseConnection();
      const resultado = await database.runAsync(
        `
          INSERT INTO clientes (
            nome,
            telefone,
            endereco,
            total_compras
          ) VALUES (?, ?, ?, 0)
        `,
        [
          cliente.nome,
          cliente.telefone ?? '',
          cliente.endereco ?? '',
        ]
      );

      return Number(resultado.lastInsertRowId);
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível salvar o cliente.',
        error
      );
    }
  }

  async atualizar(cliente: AtualizarClienteDTO): Promise<void> {
    try {
      const database = await getDatabaseConnection();
      const resultado = await database.runAsync(
        `
          UPDATE clientes
          SET
            nome = ?,
            telefone = ?,
            endereco = ?
          WHERE id = ?
        `,
        [
          cliente.nome,
          cliente.telefone ?? '',
          cliente.endereco ?? '',
          cliente.id,
        ]
      );

      if (resultado.changes !== 1) {
        throw new Error('Cliente não encontrado.');
      }
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível salvar o cliente.',
        error
      );
    }
  }

  async alterarStatus(id: number, ativo: boolean): Promise<void> {
    try {
      const database = await getDatabaseConnection();
      const resultado = await database.runAsync(
        'UPDATE clientes SET ativo = ? WHERE id = ?',
        [ativo ? 1 : 0, id]
      );

      if (resultado.changes !== 1) {
        throw new Error('Cliente não encontrado.');
      }
    } catch (error) {
      throw new DatabaseError(
        'Não foi possível alterar o status do cliente.',
        error
      );
    }
  }
}
