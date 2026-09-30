import { AuthService } from '../application/AuthService';
import { FirebaseAuthRepository } from '../infrastructure/FirebaseAuthRepository';

const authRepository = new FirebaseAuthRepository();

export const authService = new AuthService(
  authRepository
);
