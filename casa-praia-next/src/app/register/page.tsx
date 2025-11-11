'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast'; // <-- 1. Importar toast
import { Spinner } from '@/components/Spinner'; // <-- 2. Importar Spinner

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  // const [error, setError] = useState(''); // Substituído por toast
  // const [success, setSuccess] = useState(''); // Substituído por toast
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (!username || !password || !nomeCompleto || !email) {
      toast.error('Todos os campos são obrigatórios.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      // --- ETAPA 1: REGISTRAR O USUÁRIO ---
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          nome_completo: nomeCompleto,
          email,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao criar conta.');
      }

      // --- ETAPA 2: FAZER O LOGIN AUTOMÁTICO ---
      toast.success('Conta criada! Fazendo login...');

      const loginResult = await signIn('credentials', {
        redirect: false,
        username: username,
        password: password,
      });

      if (loginResult?.error) {
        throw new Error('Conta criada, mas o login automático falhou.');
      }

      // --- ETAPA 3: SUCESSO TOTAL ---
      toast.success('Login realizado! Redirecionando...');
      router.push('/');
      router.refresh();

    } catch (err: any) {
      // --- MUDANÇA (TROCA DE DIV DE ERRO POR TOAST) ---
      toast.error(err.message || 'Ocorreu um erro de conexão.');
      if (err.message.includes('login automático falhou')) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          🏖️ Criar Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... (Inputs de usuário, nome, email, senha inalterados) ... */}
          
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
            />
          </div>
          <div>
            <label
              htmlFor="nomeCompleto"
              className="block text-sm font-medium text-gray-700"
            >
              Nome Completo:
            </label>
            <input
              id="nomeCompleto"
              type="text"
              required
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha (mín. 6 caracteres):
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* --- MUDANÇA (DIVs de Erro/Sucesso Removidas) --- */}

          {/* --- MUDANÇA (Botão com Spinner) --- */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : 'Criar Conta'}
          </button>
        </form>
        <div className="text-sm text-center text-gray-600">
          <p>
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}