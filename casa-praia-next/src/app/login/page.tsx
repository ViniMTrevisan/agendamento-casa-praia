'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // <-- 1. Importar toast
import { Spinner } from '@/components/Spinner'; // <-- 2. Importar Spinner

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- 3. Adicionar isLoading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.error) {
        // --- MUDANÇA (TROCA DE DIV DE ERRO POR TOAST) ---
        toast.error('Usuário ou senha inválidos.');
      } else if (result?.ok) {
        toast.success('Login realizado!');
        router.push('/');
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false); // <-- 4. Parar o loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          🏖️ Casa de Praia
        </h1>
        <p className="text-center text-gray-600">Sistema de Agendamento</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (Inputs de usuário e senha inalterados) ... */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Usuário:
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu usuário"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha:
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite sua senha"
            />
          </div>
          
          {/* --- MUDANÇA (DIV de Erro Removida) --- */}

          {/* --- MUDANÇA (Botão com Spinner) --- */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : 'Entrar'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600">
          <p>
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}