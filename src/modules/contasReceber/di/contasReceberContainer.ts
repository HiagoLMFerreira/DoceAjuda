import { ContaReceberService } from '../application/services/ContaReceberService';
import { SQLiteContaReceberRepository } from '../infrastructure/repositories/SQLiteContaReceberRepository';
import { ContaReceberController } from '../presentation/controllers/ContaReceberController';

export const contaReceberController = new ContaReceberController(
  new ContaReceberService(new SQLiteContaReceberRepository())
);
