import React, { PropsWithChildren } from 'react';
import { AuthProvider } from '../../modules/auth/presentation/AuthContext';

export default function AppProviders({
  children,
}: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
