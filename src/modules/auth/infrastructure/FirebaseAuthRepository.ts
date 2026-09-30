import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { mapFirebaseAuthError } from '../../../shared/errors/FirebaseAuthErrorMapper';
import type {
  AuthCredentials,
  AuthUser,
} from '../domain/models/AuthUser';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository';

function mapUser(user: {
  uid: string;
  email: string | null;
}): AuthUser {
  return {
    id: user.uid,
    email: user.email,
  };
}

export class FirebaseAuthRepository
  implements IAuthRepository
{
  async login(
    credentials: AuthCredentials
  ): Promise<AuthUser> {
    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

      return mapUser(result.user);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  async register(
    credentials: AuthCredentials
  ): Promise<AuthUser> {
    try {
      const result =
        await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

      return mapUser(result.user);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  subscribe(
    listener: (user: AuthUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, (user) => {
      listener(user ? mapUser(user) : null);
    });
  }
}
