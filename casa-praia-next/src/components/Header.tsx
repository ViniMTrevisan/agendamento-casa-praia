'use client'; 

import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import Link from 'next/link'; 

type HeaderProps = {
  user: Session['user'];
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="w-full p-4 border-b border-white border-opacity-20">
      <div className="container flex items-center justify-between mx-auto">
        
        <Link href="/" className="text-2xl font-bold text-white">
          🏖️ Casa de Praia
        </Link>

        <div className="flex items-center space-x-4">
          
          <Link 
            href="/minhas-reservas" 
            className="hidden px-3 py-1 text-sm font-medium text-white transition-colors duration-200 border border-white rounded-md sm:block hover:bg-white hover:text-indigo-700"
          >
            Minhas Reservas
          </Link>

          <Link 
            href="/perfil" 
            className="hidden px-3 py-1 text-sm font-medium text-white transition-colors duration-200 border border-white rounded-md sm:block hover:bg-white hover:text-indigo-700"
          >
            Meu Perfil
          </Link>
          
          {/* --- MUDANÇA AQUI: Link de Admin Condicional --- */}
          {user.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className="hidden px-3 py-1 text-sm font-medium text-white transition-colors duration-200 border border-white rounded-md sm:block hover:bg-white hover:text-indigo-700"
            >
              Admin
            </Link>
          )}
          {/* --- FIM DA MUDANÇA --- */}
          
          <span className="hidden text-white sm:block">
            Olá, {user.name}
          </span>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}