import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pega o token JWT do cookie
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    // Especificar cookieName explícito para edge runtime (necessário para __Secure cookies em produção)
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
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