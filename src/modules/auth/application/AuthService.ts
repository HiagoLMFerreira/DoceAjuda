import {
  validateEmail,
  validatePassword,
  validateRegistrationPassword,
} from '../../../shared/validators/authValidators';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository';

export class AuthService {
  constructor(
    private readonly repository: IAuthRepository
  ) {}

  login(email: string, password: string) {
    return this.repository.login({
      email: validateEmail(email),
      password: validatePassword(password),
    });
  }

  register(email: string, password: string) {
    return this.repository.register({
      email: validateEmail(email),
      password: validateRegistrationPassword(password),
    });
  }

  logout() {
    return this.repository.logout();
  }

  resetPassword(email: string) {
    return this.repository.resetPassword(
      validateEmail(email)
    );
  }

  subscribe(
    listener: Parameters<IAuthRepository['subscribe']>[0]
  ) {
    return this.repository.subscribe(listener);
  }
}
