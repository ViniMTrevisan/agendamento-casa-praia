'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';

export function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação do frontend
    if (newPassword.length < 6) {
      toast.error('Nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não coincidem.');
      return;
    }
    
    setIsLoading(true);

    // 2. Chamada de API
    const promise = fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao atualizar');
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: 'Atualizando senha...',
        success: 'Senha atualizada com sucesso!',
        error: (err) => `Erro: ${err.message}`, // ex: "Senha antiga incorreta"
      })
      .then(() => {
        // 3. Limpa os campos em caso de sucesso
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
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
        Alterar Senha
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Senha Antiga
          </label>
          <input
            id="oldPassword"
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Nova Senha
          </label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmar Nova Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="pt-5 mt-5 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || !oldPassword || !newPassword}
          className="flex items-center justify-center w-40 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Alterar Senha'}
        </button>
      </div>
    </form>
  );
}