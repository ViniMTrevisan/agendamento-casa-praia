import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Proteger a UI do Admin E a API do Admin
    if (
      (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
      token?.role !== 'ADMIN'
    ) {
      // Se não for admin, retorna "Não autorizado"
      return new NextResponse('Não autorizado', { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// --- MUDANÇA AQUI: Adicionado '/api/admin/:path*' ---
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*', // <-- Protege a nova API de admin
    '/api/reservas/:path*',
    '/api/profile/:path*',
  ],
};