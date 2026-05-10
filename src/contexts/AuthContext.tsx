import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import React, { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { auth } from '../config/firebase'; // caminho ajustado

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Valor padrão do contexto (evita undefined e ajuda o TypeScript)
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  register: async () => { throw new Error('AuthProvider não inicializado'); },
  login: async () => { throw new Error('AuthProvider não inicializado'); },
  logout: async () => { throw new Error('AuthProvider não inicializado'); },
  resetPassword: async () => { throw new Error('AuthProvider não inicializado'); },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 [AUTH] Configurando listener...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔵 [AUTH] Usuário:', currentUser?.email ?? 'deslogado');
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};