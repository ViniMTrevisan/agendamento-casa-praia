'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from './Spinner';

type Props = {
  // --- MUDANÇA AQUI ---
  // Trocamos 'selectedDates: Date[]' por 'dateRange: [Date, Date]'
  dateRange: [Date, Date];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
};

export function ReservationModal({
  dateRange, // <-- Mudou aqui
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  // --- MUDANÇA AQUI ---
  // Lógica de formatação simplificada
  const formatRange = () => {
    const [start, end] = dateRange;
    const formatado = (date: Date) =>
      format(date, 'dd/MM/yyyy', { locale: ptBR });

    return formatado(start) === formatado(end)
      ? formatado(start)
      : `${formatado(start)} a ${formatado(end)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Confirmar Reserva
        </h3>
        <div className="p-4 mb-4 bg-gray-100 rounded-md">
          <p className="font-medium text-gray-800">Período Selecionado:</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatRange()}
          </p>
        </div>
        <p className="mb-6 text-gray-600">
          Você confirma a reserva para este período?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 w-40"
          >
            {isLoading ? <Spinner /> : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}