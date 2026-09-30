import { RelatorioPdfService } from '../application/RelatorioPdfService';
import { RelatorioService } from '../application/RelatorioService';
import { SQLiteRelatorioRepository } from '../infrastructure/SQLiteRelatorioRepository';

const repository =
  new SQLiteRelatorioRepository();

export const relatorioService =
  new RelatorioService(repository);

export const relatorioPdfService =
  new RelatorioPdfService();
