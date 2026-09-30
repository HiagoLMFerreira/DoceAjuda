import { AppError } from './AppError';

export class DatabaseError extends AppError {
  constructor(
    message = 'Não foi possível concluir a operação no banco de dados.',
    cause?: unknown
  ) {
    super(message, 'DATABASE_ERROR', cause);
  }
}
