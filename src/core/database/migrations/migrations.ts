import type { Migration } from './Migration';

/**
 * As migrations existentes ainda permanecem no database.ts legado.
 *
 * Ao migrar o banco definitivamente, cada alteração será movida para esta lista
 * em ordem crescente de versão. A lista fica vazia nesta etapa para impedir
 * que o schema atual seja executado duas vezes.
 */
export const migrations: Migration[] = [];
