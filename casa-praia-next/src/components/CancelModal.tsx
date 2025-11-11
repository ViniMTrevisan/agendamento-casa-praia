'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from './Spinner'; // <-- Importar o Spinner

type Props = {
  dateToCancel: Date;
  nomeUsuario: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
};

export function CancelModal({
  dateToCancel,
  nomeUsuario,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <h3 className="mb-4 text-xl font-semibold text-red-600">
          Cancelar Reserva
        </h3>
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="font-medium text-gray-800">Data:</p>
          <p className="text-lg font-semibold text-red-700">
            {format(dateToCancel, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Reservado por: {nomeUsuario}
          </p>
        </div>
        <p className="mb-6 text-gray-600">
          Tem certeza que deseja cancelar esta reserva?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Manter Reserva
          </button>
          {/* --- MUDANÇA AQUI --- */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 w-40" // Largura fixa
          >
            {isLoading ? <Spinner /> : 'Sim, Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}