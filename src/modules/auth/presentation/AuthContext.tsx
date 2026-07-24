import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getErrorMessage } from '../../../core/errors';
import { authService } from '../di/authContainer';
import type { AuthUser } from '../domain/models/AuthUser';

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  register: (
    email: string,
    password: string
  ) => Promise<AuthUser>;
  login: (
    email: string,
    password: string
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const notInitialized = async (): Promise<never> => {
  throw new Error('AuthProvider não inicializado.');
};

export const AuthContext =
  createContext<AuthContextValue>({
    user: null,
    loading: true,
    error: null,
    register: notInitialized,
    login: notInitialized,
    logout: notInitialized,
    resetPassword: notInitialized,
    clearError: () => undefined,
  });

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return authService.subscribe((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const execute = async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      setError(null);
      return await operation();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      throw caughtError;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login: (email, password) =>
        execute(() => authService.login(email, password)),
      register: (email, password) =>
        execute(() =>
          authService.register(email, password)
        ),
      logout: () =>
        execute(() => authService.logout()),
      resetPassword: (email) =>
        execute(() =>
          authService.resetPassword(email)
        ),
      clearError: () => setError(null),
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
