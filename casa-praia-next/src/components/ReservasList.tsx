'use client';

import { useState } from 'react';
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { CancelModal } from './CancelModal';

type Props = {
  initialReservas: any[]; // <-- MUDANÇA AQUI
};

export function ReservasList({ initialReservas }: Props) {
  const [reservas, setReservas] = useState<any[]>(initialReservas);
  const [isLoading, setIsLoading] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<any | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCancelClick = (reserva: any) => { 
    setReservaToCancel(reserva);
  };

  const handleConfirmCancel = async () => {
    if (!reservaToCancel) return;
    setIsLoading(true);

    const dateKey = format(reservaToCancel.data, 'yyyy-MM-dd');
    const reservaId = reservaToCancel.id; 

    const promise = fetch(`/api/reservas/${dateKey}`, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao cancelar');
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: 'Cancelando reserva...',
        success: 'Reserva cancelada com sucesso!',
        error: (err) => `Erro: ${err.message}`,
      })
      .then(() => {
        // Sucesso: remove a reserva do estado local
        setReservas((prev) => prev.filter((r) => r.id !== reservaId));
        setReservaToCancel(null);
      })
      .catch(() => {
        setReservaToCancel(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (reservas.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700">
          Você ainda não tem reservas.
        </h2>
        <p className="mt-2 text-gray-500">
          Volte ao calendário para agendar sua visita.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {reservas.map((reserva: any) => { // <-- MUDANÇA AQUI
            const isPast = isBefore(reserva.data, today);
            return (
              <li key={reserva.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between space-x-4">
                  {/* Informações da Data */}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-blue-600 truncate">
                      {format(reserva.data, 'EEEE, dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isPast ? 'text-gray-500' : 'text-green-600'
                      }`}
                    >
                      {isPast ? 'Reserva Concluída' : 'Próxima Reserva'}
                    </p>
                  </div>
                  {/* Botão de Cancelar */}
                  {!isPast && (
                    <button
                      onClick={() => handleCancelClick(reserva)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal de Cancelamento (Reutilizado) */}
      {reservaToCancel && (
        <CancelModal
          dateToCancel={reservaToCancel.data}
          nomeUsuario={reservaToCancel.nome_usuario}
          isLoading={isLoading}
          onClose={() => setReservaToCancel(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </>
  );
}