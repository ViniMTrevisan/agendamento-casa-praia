'use client';

import { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  isToday,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReservationModal } from './ReservationModal';
import { CancelModal } from './CancelModal';
import { toast } from 'react-hot-toast'; // <-- 1. Importar o toast

// ... (definição dos types ReservasMap)
type Reserva = {
  nome_usuario: string;
  usuario_id: string;
  is_owner: boolean;
};
type ReservasMap = Record<string, Reserva>;

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reservations, setReservations] = useState<ReservasMap>({});
  const [isLoading, setIsLoading] = useState(false); // Para os modais
  
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [dateToCancel, setDateToCancel] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- 1. CARREGAMENTO DE DADOS ---
  const fetchReservations = async () => {
    setIsLoading(true); // Feedback de loading inicial
    try {
      const res = await fetch('/api/reservas');
      if (!res.ok) {
        throw new Error('Falha ao buscar reservas');
      }
      const data: ReservasMap = await res.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
      // --- MUDANÇA (TROCA DE ALERT POR TOAST) ---
      toast.error('Não foi possível carregar as reservas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // --- 2. LÓGICA DE RENDERIZAÇÃO (Headers, Dias, etc.) ---
  // (Nenhuma mudança no renderHeader, renderDaysOfWeek)
  // ... (funções renderHeader e renderDaysOfWeek inalteradas) ...

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-4 mb-4 bg-gray-50 rounded-t-lg">
        <button
          onClick={prevMonth}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          &lt; Anterior
        </button>
        <h3 className="text-2xl font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button
          onClick={nextMonth}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Próximo &gt;
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map((day) => (
          <div key={day} className="py-2 font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    // ... (lógica inalterada)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let dateKey = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        dateKey = format(day, 'yyyy-MM-dd'); // Chave da API
        const dayCopy = new Date(day.getTime());
        const reserva = reservations[dateKey];
        const isPast = isBefore(dayCopy, today);
        
        let cellClasses = 'h-24 p-2 border rounded-lg transition-all duration-200';
        
        if (!isSameMonth(day, monthStart)) {
          cellClasses += ' bg-gray-50 text-gray-400 cursor-not-allowed';
        } else if (isPast) {
          cellClasses += ' bg-gray-100 text-gray-500 cursor-not-allowed';
        } else if (reserva) {
          if (reserva.is_owner) {
            cellClasses += ' bg-orange-400 text-white font-semibold cursor-pointer hover:bg-orange-500';
          } else {
            cellClasses += ' bg-gray-400 text-white cursor-not-allowed';
          }
        } else {
          cellClasses += ' bg-green-400 text-white font-semibold cursor-pointer hover:bg-green-500';
        }
        
        if (isSameDay(day, today) && !isPast) {
          cellClasses += ' ring-2 ring-blue-500';
        }

        days.push(
          <div
            className={cellClasses}
            key={day.toString()}
            onClick={() => onDateClick(dayCopy)}
          >
            <span className="text-lg">{format(day, 'd')}</span>
            {reserva && (
              <div className="mt-1 text-xs break-words">
                {reserva.nome_usuario}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  // --- 3. LÓGICA DE EVENTOS (Cliques) ---
  // (Nenhuma mudança em onDateClick, nextMonth, prevMonth)
  // ... (funções onDateClick, nextMonth, prevMonth inalteradas) ...

    const onDateClick = (day: Date) => {
    // Não permite clique fora do mês ou no passado
    if (!isSameMonth(day, currentMonth) || isBefore(day, today)) {
      return;
    }

    const dateKey = format(day, 'yyyy-MM-dd');
    const reserva = reservations[dateKey];

    if (reserva) {
      // Se é o dono, abre modal de cancelamento
      if (reserva.is_owner) {
        setDateToCancel(day);
        setShowCancelModal(true);
      }
      // Se não é o dono, não faz nada
    } else {
      // Dia disponível, abre modal de reserva
      // (Replicando o `script.js` que só permitia 1 dia por vez)
      setSelectedDates([day]);
      setShowReservationModal(true);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };


  // --- 4. AÇÕES DA API (Modais) ---
  const handleConfirmReservation = async () => {
    setIsLoading(true);
    const datas = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
    
    // Usamos o toast.promise para feedback automático
    // --- MUDANÇA (TROCA DE ALERT POR TOAST) ---
    const promise = fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datas }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao reservar');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Reservando...',
      success: () => {
        fetchReservations(); // Recarrega os dados
        setShowReservationModal(false);
        setSelectedDates([]);
        return 'Reserva criada com sucesso!';
      },
      error: (err) => `Erro: ${err.message}`,
    }).finally(() => setIsLoading(false));
  };

  const handleConfirmCancel = async () => {
    if (!dateToCancel) return;
    setIsLoading(true);
    const dateKey = format(dateToCancel, 'yyyy-MM-dd');

    // --- MUDANÇA (TROCA DE ALERT POR TOAST) ---
    const promise = fetch(`/api/reservas/${dateKey}`, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Falha ao cancelar');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Cancelando reserva...',
      success: () => {
        fetchReservations(); // Recarrega os dados
        setShowCancelModal(false);
        setDateToCancel(null);
        return 'Reserva cancelada com sucesso!';
      },
      error: (err) => `Erro: ${err.message}`,
    }).finally(() => setIsLoading(false));
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Indicador de Loading Principal */}
      {isLoading && reservations.length === 0 && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-50">
           <Spinner />
         </div>
      )}

      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      
      {/* ... (Legenda inalterada) ... */}
            <div className="flex flex-wrap justify-center gap-4 p-4 mt-6 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-green-400 rounded"></div>
          <span className="text-sm">Disponível</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-orange-400 rounded"></div>
          <span className="text-sm">Minha Reserva (clicável)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-400 rounded"></div>
          <span className="text-sm">Reserva de Outro</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-100 border rounded"></div>
          <span className="text-sm">Passado/Indisponível</span>
        </div>
      </div>

      {/* Modais */}
      {showReservationModal && (
        <ReservationModal
          selectedDates={selectedDates}
          isLoading={isLoading}
          onClose={() => setShowReservationModal(false)}
          onConfirm={handleConfirmReservation}
        />
      )}
      {showCancelModal && dateToCancel && (
        <CancelModal
          dateToCancel={dateToCancel}
          nomeUsuario={reservations[format(dateToCancel, 'yyyy-MM-dd')]?.nome_usuario || ''}
          isLoading={isLoading}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}