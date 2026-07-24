import { ValidationError } from '../errors';

export function ensureRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new ValidationError(`${fieldName} é obrigatório.`);
  }

  return normalized;
}
