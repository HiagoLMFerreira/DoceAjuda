import { AppError } from '../../core/errors';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'O e-mail informado é inválido.',
  'auth/invalid-credential': 'Login ou senha inválidos.',
  'auth/user-disabled': 'Esta conta está desativada.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/wrong-password': 'Login ou senha inválidos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve possuir pelo menos 6 caracteres.',
  'auth/too-many-requests':
    'Muitas tentativas foram realizadas. Aguarde e tente novamente.',
  'auth/network-request-failed':
    'Não foi possível conectar ao serviço de autenticação.',
};

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

export function mapFirebaseAuthError(error: unknown): AppError {
  const firebaseError = error as FirebaseErrorLike;
  const message =
    (firebaseError.code && AUTH_MESSAGES[firebaseError.code]) ||
    firebaseError.message ||
    'Não foi possível concluir a autenticação.';

  return new AppError(message, 'AUTHENTICATION_ERROR', error);
}
