import type * as SQLite from 'expo-sqlite';

export interface Migration {
  readonly version: number;
  readonly name: string;
  up(database: SQLite.SQLiteDatabase): Promise<void>;
}
