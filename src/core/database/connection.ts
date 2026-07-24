import type * as SQLite from 'expo-sqlite';
import { getDatabase } from './databaseManager';

export async function getDatabaseConnection(): Promise<SQLite.SQLiteDatabase> {
  return getDatabase();
}

export async function closeDatabaseConnection(): Promise<void> {
  const database = await getDatabase();
  await database.closeAsync();
}
