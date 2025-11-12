import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (
      (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
      token?.role !== 'ADMIN'
    ) {
      return new NextResponse('Não autorizado', { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// --- CORREÇÃO AQUI: O matcher precisa das rotas raiz ---
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/perfil',
    '/minhas-reservas',
  ],
};