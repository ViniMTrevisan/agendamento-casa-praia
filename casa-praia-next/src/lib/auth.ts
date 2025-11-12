import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        
        // --- MUDANÇA: Buscar o 'role' junto com o usuário ---
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
        
        // Retorna o 'role' para o callback 'jwt'
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role, // <-- Passa a 'role' do banco
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // --- MUDANÇA: Adicionar 'role' ao token ---
    async jwt({ token, user, trigger, session }) {
      
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = user.role; // <-- Adiciona a 'role' ao token no login
      }

      if (trigger === "update" && session) {
        token.name = session.name;
      }

      return token;
    },
    
    // --- MUDANÇA: Adicionar 'role' à sessão ---
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name;
        session.user.role = token.role; // <-- Passa a 'role' do token para a sessão
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};