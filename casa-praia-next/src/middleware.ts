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
    '/admin', // A página de admin
    '/admin/:path*', // Sub-páginas de admin
    '/api/admin', // A API de admin
    '/api/admin/:path*', // Sub-rotas da API de admin
    '/api/reservas', // A API de reservas (raiz)
    '/api/reservas/:path*', // Sub-rotas (como delete)
    '/api/profile', // A API de profile
    '/api/profile/:path*',
  ],
};