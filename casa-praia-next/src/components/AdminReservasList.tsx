'use client';

import { useState } from 'react';
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { CancelModal } from './CancelModal';
import { useSession } from 'next-auth/react';

type Props = {
  initialReservas: any[];
};

export function AdminReservasList({ initialReservas }: Props) {
  const { data: session } = useSession();
  const loggedInUserId = session?.user?.id;

  const [reservas, setReservas] = useState(initialReservas);
  const [isLoading, setIsLoading] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<any | null>(null);

  // (useEffect foi removido - confiamos na página de servidor com revalidate=0)

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCancelClick = (reserva: any) => {
    setReservaToCancel(reserva);
  };

  const handleConfirmCancel = async () => {
    if (!reservaToCancel) return;
    setIsLoading(true);

    // --- A CORREÇÃO ESTÁ AQUI ---
    // 'reservaToCancel.data' é um objeto Date, não uma string.
    // Precisamos chamar .toISOString() nele, assim como fazemos no Calendário.
    const dateKey = reservaToCancel.data.toISOString().split('T')[0];
    // --- FIM DA CORREÇÃO ---
    
    const reservaId = reservaToCancel.id;
    const isOurOwnReservation = reservaToCancel.usuario_id === loggedInUserId;

    const apiUrl = isOurOwnReservation
      ? `/api/reservas/${dateKey}`
      : `/api/admin/reservas/${dateKey}`;

    const promise = fetch(apiUrl, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Erro: ${res.status}`);
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Cancelando reserva...',
      success: (data) => {
        setReservas((prev) => prev.filter((r) => r.id !== reservaId));
        setReservaToCancel(null);
        setIsLoading(false);
        return 'Reserva cancelada com sucesso!';
      },
      error: (err) => {
        setReservaToCancel(null);
        setIsLoading(false);
        return `Erro: ${err.message}`;
      },
    });
  };
  
  if (reservas.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700">
          Nenhuma reserva encontrada.
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {reservas.map((reserva: any) => {
            // Quando os dados vêm do servidor, 'reserva.data' pode ser string
            // Então, convertemos para Date aqui para exibição
            const reservaDate = new Date(reserva.data); 
            const isPast = isBefore(reservaDate, today);
            const isOurOwn = reserva.usuario_id === loggedInUserId;

            return (
              <li key={reserva.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-blue-600 truncate">
                      {format(reservaDate, 'EEEE, dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </p>
                    <p className={`text-sm ${isOurOwn ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                      Usuário: {reserva.usuario.name} ({reserva.usuario.email})
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isPast ? 'text-gray-500' : 'text-green-600'
                      }`}
                    >
                      {isPast ? 'Reserva Concluída' : 'Próxima Reserva'}
                    </p>
                  </div>
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

      {reservaToCancel && (
        <CancelModal
          dateToCancel={new Date(reservaToCancel.data)}
          nomeUsuario={reservaToCancel.nome_usuario}
          isLoading={isLoading}
          onClose={() => setReservaToCancel(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </>
  );
}