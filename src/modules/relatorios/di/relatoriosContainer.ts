import { RelatorioPdfService } from '../application/RelatorioPdfService';
import { RelatorioService } from '../application/RelatorioService';
import { LegacyRelatorioRepository } from '../infrastructure/LegacyRelatorioRepository';

const repository =
  new LegacyRelatorioRepository();

export const relatorioService =
  new RelatorioService(repository);

export const relatorioPdfService =
  new RelatorioPdfService();
