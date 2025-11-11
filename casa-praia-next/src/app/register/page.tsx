'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // <-- 1. IMPORTE O 'signIn'

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para desabilitar o botão
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validação de frontend (a API fará a validação final)
    if (!username || !password || !nomeCompleto || !email) {
      setError('Todos os campos são obrigatórios.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      // --- ETAPA 1: REGISTRAR O USUÁRIO ---
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          nome_completo: nomeCompleto,
          email: email,
        }),
      });

      // Se o registro falhar (ex: usuário já existe)
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Erro ao criar conta.');
        setIsLoading(false);
        return; // Para o processo aqui
      }

      // --- ETAPA 2: FAZER O LOGIN AUTOMÁTICO ---
      // O registro foi um sucesso (res.ok), agora faça o login
      setSuccess('Conta criada! Fazendo login...');

      const loginResult = await signIn('credentials', {
        redirect: false, // Nós controlamos o redirecionamento
        username: username,
        password: password,
      });

      if (loginResult?.error) {
        // Isso é raro, mas pode acontecer
        setError(
          'Conta criada, mas o login automático falhou. Redirecionando para o login...'
        );
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (loginResult?.ok) {
        // --- ETAPA 3: SUCESSO TOTAL ---
        // Login automático funcionou, vá para a home
        setSuccess('Login realizado! Redirecionando...');
        router.push('/'); // Redireciona para a página principal
        router.refresh(); // Garante que a sessão seja atualizada no servidor (opcional mas bom)
      }
    } catch (err) {
      setError('Ocorreu um erro de conexão.');
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

          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-center text-green-800 bg-green-100 border border-green-300 rounded-md">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading} // Desabilita o botão durante o carregamento
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
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