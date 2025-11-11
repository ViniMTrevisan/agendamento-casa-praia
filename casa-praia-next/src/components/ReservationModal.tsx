'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from './Spinner'; // <-- Importar o Spinner

type Props = {
  selectedDates: Date[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
};

export function ReservationModal({
  selectedDates,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  if (selectedDates.length === 0) return null;

  const formatRange = () => {
    // ... (lógica inalterada)
    const sorted = selectedDates.sort((a, b) => a.getTime() - b.getTime());
    const start = format(sorted[0], 'dd/MM/yyyy', { locale: ptBR });
    const end = format(sorted[sorted.length - 1], 'dd/MM/yyyy', {
      locale: ptBR,
    });
    return start === end ? start : `${start} a ${end}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Confirmar Reserva
        </h3>
        <div className="p-4 mb-4 bg-gray-100 rounded-md">
          <p className="font-medium text-gray-800">Datas Selecionadas:</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatRange()}
          </p>
        </div>
        <p className="mb-6 text-gray-600">
          Você confirma a reserva para estas datas?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          {/* --- MUDANÇA AQUI --- */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 w-40" // Largura fixa
          >
            {isLoading ? <Spinner /> : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}