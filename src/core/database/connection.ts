import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'doceajuda.db';

let database: SQLite.SQLiteDatabase | null = null;
let openingDatabase: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Nova porta de acesso ao SQLite.
 *
 * Durante a migração, o database.ts legado continua funcionando normalmente.
 * Os módulos novos deverão depender desta função, e não abrir conexões próprias.
 */
export async function getDatabaseConnection(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  if (!openingDatabase) {
    openingDatabase = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  try {
    database = await openingDatabase;

    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    return database;
  } finally {
    openingDatabase = null;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (!database) {
    return;
  }

  await database.closeAsync();
  database = null;
}
