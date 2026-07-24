import { getDatabase } from './databaseManager';

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}
