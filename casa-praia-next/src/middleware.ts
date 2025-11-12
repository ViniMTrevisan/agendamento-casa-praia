import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // DEBUG: Log temporário para diagnosticar problema na Vercel
    console.log('[MIDDLEWARE DEBUG]', {
      pathname,
      hasToken: !!token,
      tokenData: token ? { id: token.id, role: token.role, username: token.username } : null,
    });

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
      authorized: ({ token, req }) => {
        // DEBUG: Log temporário para diagnosticar problema na Vercel
        const cookieHeader = req.headers.get('cookie') || '';
        const hasSessionCookie = cookieHeader.includes('next-auth.session-token') || 
                                 cookieHeader.includes('__Secure-next-auth.session-token');
        
        console.log('[MIDDLEWARE AUTH]', {
          hasToken: !!token,
          hasSessionCookie,
          secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
          authSecret: process.env.AUTH_SECRET ? 'SET' : 'MISSING',
          url: req.url,
        });
        
        // Se tem token válido, está autorizado a continuar
        return !!token;
      },
    },
    // CRÍTICO: Adicionar o secret explicitamente para o middleware
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
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