import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './context/AuthProvider';
import { Toaster } from 'react-hot-toast'; // <-- 1. Importar

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Agendamento Casa de Praia',
  description: 'Sistema de Agendamento Familiar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-r from-blue-500 to-purple-600`}
      >
        {/* 2. Adicionar o <Toaster /> AQUI */}
        <Toaster position="top-right" reverseOrder={false} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}