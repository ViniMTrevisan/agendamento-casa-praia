import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // 1. Configurar o Adaptador do Prisma
  adapter: PrismaAdapter(prisma),

  // 2. Configurar Provedores
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user || !user.password_hash) {
          return null;
        }
        const isValidPassword = await compare(
          credentials.password,
          user.password_hash
        );
        if (!isValidPassword) {
          return null;
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],

  // 3. Usar estratégia JWT (stateless)
  session: {
    strategy: 'jwt',
  },

  // 4. Callbacks (AQUI ESTÁ A CORREÇÃO)
  callbacks: {
    // Este callback é chamado QUANDO o token é criado OU atualizado
    async jwt({ token, user, trigger, session }) {
      
      // 1. No login inicial
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        // 'name' e 'email' já são incluídos por padrão
      }

      // 2. QUANDO 'update()' é chamado do cliente
      if (trigger === "update" && session) {
        token.name = session.name;
        // (Se um dia atualizarmos o username, faríamos 'token.username = session.username' aqui)
      }

      return token;
    },
    
    // Este callback é chamado QUANDO a sessão é lida
    async session({ session, token }) {
      // Passa os dados do TOKEN para a SESSÃO (que o cliente vê)
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name; // Garante que o nome atualizado do token passe
      }
      return session;
    },
  },

  // 5. Páginas e Segredo
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};