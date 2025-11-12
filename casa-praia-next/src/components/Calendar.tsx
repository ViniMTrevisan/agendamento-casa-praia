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
  isAfter,
  isToday,
  eachDayOfInterval,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReservationModal } from './ReservationModal';
import { CancelModal } from './CancelModal';
import { toast } from 'react-hot-toast'; // Importamos o toast
import { Spinner } from './Spinner';

// O formato da reserva que nossa API (PR #6) retorna
type Reserva = {
  nome_usuario: string;
  usuario_id: string;
  is_owner: boolean;
};
type ReservasMap = Record<string, Reserva>; // Chave: 'YYYY-MM-DD'

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Estado para o intervalo de datas (início e fim)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [reservations, setReservations] = useState<ReservasMap>({});
  const [isLoading, setIsLoading] = useState(false); // Para ações (modais)
  const [isFetching, setIsFetching] = useState(true); // Para o loading inicial

  // Estado dos Modais
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [dateToCancel, setDateToCancel] = useState<Date | null>(null);

  // Hoje (para desabilitar dias passados)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- 1. CARREGAMENTO DE DADOS ---
  const fetchReservations = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/reservas');
      if (!res.ok) {
        throw new Error('Falha ao buscar reservas');
      }
      const data: ReservasMap = await res.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar as reservas.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []); // Carrega na primeira renderização

  // --- 2. LÓGICA DE RENDERIZAÇÃO DO CALENDÁRIO ---
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
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const [start, end] = dateRange; // Pega o início e fim do estado

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayCopy = new Date(day.getTime());
        const reserva = reservations[dateKey];

        // Validações
        const isPast = isBefore(dayCopy, today);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);
        const isDisabled = isPast || isNotCurrentMonth;

        // Lógica de Estilo do Intervalo
        const isStart = start && isSameDay(dayCopy, start);
        const isEnd = end && isSameDay(dayCopy, end);
        const isInRange =
          start &&
          end &&
          isWithinInterval(dayCopy, { start, end }) &&
          !isStart &&
          !isEnd;

        let cellClasses =
          'h-24 p-2 border border-white/10 transition-all duration-200 relative';

        // Lógica de classe (Corrigida)
        if (isDisabled) {
          cellClasses += ' bg-gray-50 text-gray-400 cursor-not-allowed';
        } else if (reserva) {
          cellClasses += reserva.is_owner
            ? ' bg-orange-400 text-white font-semibold cursor-pointer hover:bg-orange-500' // Minha
            : ' bg-gray-400 text-white cursor-not-allowed'; // Outro
        } else if (isStart && isEnd) {
          cellClasses +=
            ' bg-blue-500 rounded-full z-10 text-white font-semibold cursor-pointer';
        } else if (isStart) {
          cellClasses +=
            ' bg-blue-500 rounded-l-full z-10 text-white font-semibold cursor-pointer';
        } else if (isEnd) {
          cellClasses +=
            ' bg-blue-500 rounded-r-full z-10 text-white font-semibold cursor-pointer';
        } else if (isInRange) {
          cellClasses += ' bg-blue-300 text-blue-800 z-0 font-semibold cursor-pointer';
        } else {
          // Disponível (fallback)
          cellClasses +=
            ' bg-green-400 text-white font-semibold cursor-pointer hover:bg-green-500';
        }

        days.push(
          <div
            className={cellClasses}
            key={day.toString()}
            onClick={() => onDateClick(dayCopy)}
          >
            <span className="relative z-20 text-lg">{format(day, 'd')}</span>
            {reserva && (
              <div className="relative z-20 mt-1 text-xs break-words">
                {reserva.nome_usuario}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        // Removido 'gap-2' para o intervalo de seleção funcionar visualmente
        <div className="grid grid-cols-7 gap-0 mb-0" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  // --- 3. LÓGICA DE EVENTOS (Cliques) ---

  const isRangeOccupied = (start: Date, end: Date) => {
    const interval = eachDayOfInterval({ start, end });
    for (const day of interval) {
      const dateKey = format(day, 'yyyy-MM-dd');
      if (reservations[dateKey]) {
        return true;
      }
    }
    return false;
  };

  const onDateClick = (day: Date) => {
    const isPast = isBefore(day, today);
    if (!isSameMonth(day, currentMonth) || isPast) {
      return;
    }

    const dateKey = format(day, 'yyyy-MM-dd');
    const reserva = reservations[dateKey];
    if (reserva) {
      if (reserva.is_owner) {
        setDateToCancel(day);
        setShowCancelModal(true);
      }
      return;
    }

    const [start, end] = dateRange;

    if (!start || (start && end)) {
      setDateRange([day, null]);
      setShowReservationModal(false);
    } else if (start && !end) {
      let newStart = start;
      let newEnd = day;

      if (isAfter(newStart, newEnd)) {
        [newStart, newEnd] = [newEnd, newStart];
      }

      if (isRangeOccupied(newStart, newEnd)) {
        toast.error('Seu intervalo selecionado inclui dias já reservados.');
        setDateRange([null, null]);
      } else {
        setDateRange([newStart, newEnd]);
        // --- AQUI ESTÁ A MUDANÇA (SEU FEEDBACK) ---
        toast.success('Intervalo selecionado! Confirme no rodapé do calendário.', {
          icon: '⬇️',
          duration: 4000,
        });
      }
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
    const [start, end] = dateRange;
    if (!start || !end) return;
    setIsLoading(true);

    const datesInInterval = eachDayOfInterval({ start, end });
    const datas = datesInInterval.map((d) => format(d, 'yyyy-MM-dd'));

    const promise = fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datas }),
    }).then(async (res) => {
      if (!res.ok) {
        // tentar ler JSON de erro; se falhar, tentar texto; fallback genérico
        let body: any = null;
        try {
          body = await res.json();
        } catch (e) {
          try {
            const text = await res.text();
            body = text ? { error: text } : null;
          } catch {
            body = null;
          }
        }
        throw new Error((body && body.error) || 'Falha ao reservar');
      }
      try {
        return await res.json();
      } catch {
        return null;
      }
    });

    toast.promise(promise, {
      loading: 'Reservando...',
      success: () => {
        fetchReservations();
        setShowReservationModal(false);
        setDateRange([null, null]);
        return 'Reserva criada com sucesso!';
      },
      error: (err) => `Erro: ${err.message}`,
    }).finally(() => setIsLoading(false));
  };

  const handleConfirmCancel = async () => {
    if (!dateToCancel) return;
    setIsLoading(true);
    const dateKey = format(dateToCancel, 'yyyy-MM-dd');

    const promise = fetch(`/api/reservas/${dateKey}`, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch {
          try {
            const text = await res.text();
            body = text ? { error: text } : null;
          } catch {
            body = null;
          }
        }
        throw new Error((body && body.error) || 'Falha ao cancelar');
      }
      try {
        return await res.json();
      } catch {
        return null;
      }
    });

    toast.promise(promise, {
      loading: 'Cancelando reserva...',
      success: () => {
        fetchReservations();
        setShowCancelModal(false);
        setDateToCancel(null);
        return 'Reserva cancelada com sucesso!';
      },
      error: (err) => `Erro: ${err.message}`,
    }).finally(() => setIsLoading(false));
  };

  // --- 5. RENDERIZAÇÃO FINAL ---
  const [start, end] = dateRange;
  const isRangeSelected = start && end;

  return (
    // 'relative' para o loading
    <div className="relative p-6 bg-white rounded-lg shadow-lg"> 
      {isFetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
          <Spinner />
        </div>
      )}

      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}

      {/* Legenda (Baseada no styles.css) */}
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
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-300 rounded"></div>
          <span className="text-sm">Intervalo Selecionado</span>
        </div>
      </div>

      {/* --- BARRA DE CONFIRMAÇÃO --- */}
      {isRangeSelected && (
        <div className="flex items-center justify-between p-4 -m-6 mt-6 bg-gray-800 rounded-b-lg">
          <div className="text-white">
            <p className="text-sm">Período selecionado:</p>
            <p className="text-lg font-semibold">
              {format(start, 'dd/MM/yy', { locale: ptBR })} - {format(end, 'dd/MM/yy', { locale: ptBR })}
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setDateRange([null, null])} // Botão Limpar
              className="px-4 py-2 text-sm font-semibold text-gray-300 rounded-md hover:text-white"
            >
              Limpar
            </button>
            <button
              onClick={() => setShowReservationModal(true)} // Abre o modal
              className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Reservar
            </button>
          </div>
        </div>
      )}

      {/* Modais */}
      {showReservationModal && dateRange[0] && dateRange[1] && (
        <ReservationModal
          dateRange={[dateRange[0], dateRange[1]]} // Passa o intervalo
          isLoading={isLoading}
          onClose={() => {
            setShowReservationModal(false);
            // Não reseta o range aqui, caso o usuário queira só fechar o modal
          }}
          onConfirm={handleConfirmReservation}
        />
      )}
      {showCancelModal && dateToCancel && (
        <CancelModal
          dateToCancel={dateToCancel}
          nomeUsuario={
            reservations[format(dateToCancel, 'yyyy-MM-dd')]?.nome_usuario || ''
          }
          isLoading={isLoading}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}