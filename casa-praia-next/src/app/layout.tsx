import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './context/AuthProvider';

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
      {/* APLICANDO O GRADIENTE E O ESTILO BASE AQUI */}
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-r from-blue-500 to-purple-600`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}