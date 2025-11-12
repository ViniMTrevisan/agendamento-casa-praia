import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // O 'lib' está dentro de 'src', então este path está correto
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // 1. Configurar o Adaptador do Prisma
  adapter: PrismaAdapter(prisma),

  // 2. Configurar Provedores (só temos 1: Login/Senha)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // 3. Lógica de Autorização
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // Verificar se o usuário existe e se tem senha
        if (!user || !user.password_hash) {
          return null;
        }

        // 4. Comparar a senha
        const isValidPassword = await compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) {
          return null;
        }

        // 5. Sucesso! Retornar o usuário para o NextAuth
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],

  // 6. Usar estratégia JWT (stateless)
  session: {
    strategy: 'jwt',
  },

  // 7. Callbacks para customizar o token e a sessão
  callbacks: {
    // Adiciona 'username' e 'id' ao token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    // Adiciona 'username' e 'id' ao objeto 'session' (acessível no frontend)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  // 8. Páginas customizadas
  pages: {
    signIn: '/login',
  },

  // 9. Segredo
  secret: process.env.AUTH_SECRET,
};