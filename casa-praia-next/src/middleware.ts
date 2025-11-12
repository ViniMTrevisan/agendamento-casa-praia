import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Force rebuild - version 2
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // DEBUG: Ver TODOS os cookies
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookies = cookies.filter(c => c.includes('next-auth'));

  console.log('[MIDDLEWARE DEBUG]', {
    pathname,
    totalCookies: cookies.length,
    sessionCookies: sessionCookies.length,
    sessionCookieNames: sessionCookies.map(c => c.split('=')[0]),
    hasSecureCookie: cookieHeader.includes('__Secure-next-auth.session-token'),
    hasNormalCookie: cookieHeader.includes('next-auth.session-token'),
  });

  // Pega o token JWT do cookie
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  console.log('[MIDDLEWARE TOKEN]', {
    pathname,
    hasToken: !!token,
    tokenData: token ? { id: token.id, role: token.role, username: token.username } : null,
    secretUsed: (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET)?.substring(0, 10) + '...',
  });

  // Se não tem token, redireciona para login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verifica se é rota de admin e se o usuário NÃO é admin
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    // Redireciona para home (usuário comum tentando acessar área admin)
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Se chegou aqui, está autenticado e pode acessar
  return NextResponse.next();
}

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