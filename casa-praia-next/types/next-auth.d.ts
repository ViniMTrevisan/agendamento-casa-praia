import 'next-auth';
import { DefaultSession } from 'next-auth';
// --- 1. Importar o tipo do Adaptador ---
import { AdapterUser } from 'next-auth/adapters';

// Estende o módulo 'next-auth'
declare module 'next-auth' {
  /**
   * Estende o objeto Session padrão
   */
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
    } & DefaultSession['user'];
  }

  /**
   * Estende o objeto User padrão (usado no authorize)
   */
  interface User {
    id: string;
    username?: string | null;
    role: string;
  }
}

// --- 2. Estender o AdapterUser ---
// (Isso diz ao NextAuth que o usuário do *banco de dados* também tem 'role')
declare module 'next-auth/adapters' {
  interface AdapterUser {
    role: string;
    username?: string | null;
  }
}
// --- FIM DAS MUDANÇAS ---


// Estende o tipo JWT
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}