'use client'; // Botão de logout exige 'use client'

import { signOut } from 'next-auth/react';
import { Session } from 'next-auth'; // Importe o tipo Session

// Definimos o tipo para as props do Header
type HeaderProps = {
  // O tipo 'user' vem da nossa sessão customizada
  user: Session['user'];
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="w-full p-4 bg-white shadow-md">
      <div className="container flex items-center justify-between mx-auto">
        {/* Título */}
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          🏖️ Casa de Praia
        </div>

        {/* Informações do Usuário e Logout */}
        <div className="flex items-center space-x-4">
          <span className="hidden text-gray-700 sm:block">
            {/* Usamos 'name' (nome_completo) que definimos na sessão */}
            Olá, {user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })} // Faz logout e redireciona
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}