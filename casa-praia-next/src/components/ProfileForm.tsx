'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // <-- 1. Importar useSession

type Props = {
  user: Session['user'];
};

export function ProfileForm({ user }: Props) {
  const [name, setName] = useState(user.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // --- 2. Obter a função 'update' ---
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const promise = fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao atualizar');
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: 'Atualizando nome...',
        success: 'Nome atualizado com sucesso!',
        error: (err) => `Erro: ${err.message}`,
      })
      .then(async () => {
        // --- 3. ATUALIZAR A SESSÃO (O NOVO TOKEN) ---
        // Isso força o NextAuth a emitir um novo JWT com o 'name' atualizado
        await update({ name: name });
        
        // O router.refresh() agora vai funcionar, pois
        // o getServerSession (na página) lerá o NOVO token.
        router.refresh(); 
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow-lg"
    >
      <h3 className="mb-4 text-xl font-semibold text-gray-800">
        Informações Pessoais
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email (somente leitura)
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={user.email || ''}
            className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username (somente leitura)
          </label>
          <input
            id="username"
            type="text"
            disabled
            value={user.username || ''}
            className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="pt-5 mt-5 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || name === user.name}
          className="flex items-center justify-center w-32 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Salvar'}
        </button>
      </div>
    </form>
  );
}