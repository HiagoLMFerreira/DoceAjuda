import { ValidationError } from '../errors';

export function ensurePositiveNumber(
  value: number,
  fieldName: string
): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${fieldName} deve ser maior que zero.`);
  }

  return value;
}

export function ensureNonNegativeNumber(
  value: number,
  fieldName: string
): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError(`${fieldName} não pode ser negativo.`);
  }

  return value;
}
