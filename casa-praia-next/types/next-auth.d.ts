    import 'next-auth';
import { DefaultSession } from 'next-auth';

// Estende o módulo 'next-auth'
declare module 'next-auth' {
  /**
   * Estende o objeto Session padrão para incluir nossas propriedades
   */
  interface Session {
    user: {
      id: string; // Nosso ID do usuário
      username: string; // Nosso username customizado
    } & DefaultSession['user']; // Mantém name, email, image
  }

  /**
   * Estende o objeto User padrão
   * (Não é estritamente necessário para este erro, mas é uma boa prática)
   */
  interface User {
    id: string;
    username?: string | null;
  }
}

// Estende o tipo JWT
declare module 'next-auth/jwt' {
  /** Estende o token para incluir nossos campos */
  interface JWT {
    id: string;
    username: string;
  }
}