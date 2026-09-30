import { AppError } from './AppError';

export class BusinessRuleError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'BUSINESS_RULE_ERROR', cause);
  }
}
