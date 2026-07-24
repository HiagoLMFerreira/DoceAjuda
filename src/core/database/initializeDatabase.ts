import { getDatabaseConnection } from './connection';
import { runMigrations } from './migrations/runMigrations';

/**
 * Inicializador da nova infraestrutura.
 *
 * Não deve ser chamado pelo App.tsx ainda. O database.ts legado continua sendo
 * o inicializador oficial até que suas migrations sejam extraídas.
 */
export async function initializeModularDatabase(): Promise<void> {
  const database = await getDatabaseConnection();
  await runMigrations(database);
}
