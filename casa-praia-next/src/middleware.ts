import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Verifica se é rota de admin e se o usuário NÃO é admin
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      // Redireciona para home (usuário comum tentando acessar área admin)
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Se chegou aqui, tem token válido e pode acessar
    return NextResponse.next();
  },
  {
    callbacks: {
      // Este callback decide se o middleware deixa a requisição passar
      // Se retornar true = middleware processa a requisição
      // Se retornar false = NextAuth redireciona para /api/auth/signin
      authorized: ({ token }) => {
        // Se tem token válido, está autorizado a continuar
        return !!token;
      },
    },
  }
);

// Protege apenas as PÁGINAS (não APIs)
// APIs fazem sua própria validação com getAuthenticatedUser()
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/perfil',
    '/minhas-reservas',
  ],
};