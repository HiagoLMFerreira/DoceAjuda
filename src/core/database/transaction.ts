import type * as SQLite from 'expo-sqlite';
import { getDatabaseConnection } from './connection';

export type TransactionCallback<T> = (
  database: SQLite.SQLiteDatabase
) => Promise<T>;

/**
 * Centraliza transações SQLite.
 * Regras de negócio não devem chamar withTransactionAsync diretamente;
 * essa responsabilidade pertence aos repositories ou units of work.
 */
export async function runInTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  const database = await getDatabaseConnection();
  let result!: T;

  await database.withTransactionAsync(async () => {
    result = await callback(database);
  });

  return result;
}
