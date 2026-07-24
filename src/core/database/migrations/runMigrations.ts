import type * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

const MIGRATIONS_TABLE = 'app_migrations';

type MigrationRow = {
  version: number;
};

async function ensureMigrationsTable(
  database: SQLite.SQLiteDatabase
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

export async function runMigrations(
  database: SQLite.SQLiteDatabase
): Promise<void> {
  await ensureMigrationsTable(database);

  const executed = await database.getAllAsync<MigrationRow>(
    `SELECT version FROM ${MIGRATIONS_TABLE}`
  );

  const executedVersions = new Set(executed.map((item) => item.version));
  const pending = [...migrations]
    .filter((migration) => !executedVersions.has(migration.version))
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await database.withTransactionAsync(async () => {
      await migration.up(database);
      await database.runAsync(
        `INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES (?, ?)`,
        [migration.version, migration.name]
      );
    });
  }
}
