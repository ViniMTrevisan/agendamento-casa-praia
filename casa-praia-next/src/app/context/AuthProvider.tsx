'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

type Props = {
  children?: React.ReactNode;
};

// Este é um Client Component que provê a sessão
// para o restante da aplicação.
export default function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}