import type {
  AuthCredentials,
  AuthUser,
} from '../models/AuthUser';

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<AuthUser>;
  register(credentials: AuthCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  subscribe(
    listener: (user: AuthUser | null) => void
  ): () => void;
}
