'use client'; // Esta é uma página interativa (Client Component)

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Hook do NextAuth para login
import { useRouter } from 'next/navigation'; // Hook do Next.js para navegação
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Tenta fazer o login
      const result = await signIn('credentials', {
        redirect: false, // Não queremos que o NextAuth redirecione
        username: username,
        password: password,
      });

      // 2. Verifica o resultado
      if (result?.error) {
        // Erro (ex: senha errada)
        setError('Usuário ou senha inválidos.');
      } else if (result?.ok) {
        // 3. Sucesso! Redireciona para a página principal
        router.push('/');
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
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

          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Entrar
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