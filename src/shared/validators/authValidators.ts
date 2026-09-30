import { ValidationError } from '../../core/errors';

export function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    throw new ValidationError('Informe o e-mail.');
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(normalized)) {
    throw new ValidationError('Informe um e-mail válido.');
  }

  return normalized;
}

export function validatePassword(password: string): string {
  if (!password.trim()) {
    throw new ValidationError('Informe a senha.');
  }

  return password;
}

export function validateRegistrationPassword(
  password: string
): string {
  validatePassword(password);

  if (password.length < 6) {
    throw new ValidationError(
      'A senha deve possuir pelo menos 6 caracteres.'
    );
  }

  return password;
}
