import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './context/AuthProvider'; // <-- Importar

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
      <body className={inter.className}>
        {/* Envolva o children com o AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}