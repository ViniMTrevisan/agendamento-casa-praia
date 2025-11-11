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
    // --- MUDANÇA AQUI ---
    // Removido 'bg-white' e 'shadow-md'.
    // Adicionado 'border-b' e 'border-white/20' para uma separação sutil.
    <header className="w-full p-4 border-b border-white border-opacity-20">
      <div className="container flex items-center justify-between mx-auto">
        {/* --- MUDANÇA AQUI --- */}
        {/* Título (removido o gradiente, aplicado 'text-white') */}
        <div className="text-2xl font-bold text-white">
          🏖️ Casa de Praia
        </div>

        {/* Informações do Usuário e Logout */}
        <div className="flex items-center space-x-4">
          {/* --- MUDANÇA AQUI --- */}
          {/* Texto do usuário agora é branco */}
          <span className="hidden text-white sm:block">
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