import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock CancelModal to expose the confirm/close callbacks easily
jest.mock('./CancelModal', () => ({
  CancelModal: ({ dateToCancel, nomeUsuario, isLoading, onClose, onConfirm }: any) => (
    <div data-testid="mock-cancel-modal">
      <div>{dateToCancel}</div>
      <div>{nomeUsuario}</div>
      <button onClick={onClose}>Manter Reserva</button>
      <button onClick={onConfirm} disabled={isLoading}>Sim, Cancelar</button>
    </div>
  ),
}));

// Mock react-hot-toast so it just returns the passed promise
jest.mock('react-hot-toast', () => ({
  toast: {
    promise: (p: Promise<any>) => p,
  },
}));

import { ReservasList } from './ReservasList';

describe('<ReservasList />', () => {
  beforeEach(() => {
    // Reset fetch mock
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );
  });

  it('deve mostrar mensagem quando não há reservas', () => {
    render(<ReservasList initialReservas={[]} />);

    expect(
      screen.getByText('Você ainda não tem reservas.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Volte ao calendário para agendar sua visita.')
    ).toBeInTheDocument();
  });

  it('deve listar reservas futuras e permitir cancelar', async () => {
    const mockDateFormatted = 'Segunda-feira, 25/11/2025';
    const mockDateRaw = '2025-11-25';

    const initial = [
      {
        id: 1,
        data_formatada: mockDateFormatted,
        data_raw: mockDateRaw,
        nome_usuario: 'Vini Teste',
        isPast: false,
      },
    ];

    render(<ReservasList initialReservas={initial} />);

    // Verifica se a reserva aparece e o botão de cancelar existe
    expect(screen.getByText(mockDateFormatted)).toBeInTheDocument();
    expect(screen.getByText('Próxima Reserva')).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    expect(cancelBtn).toBeInTheDocument();

    // Clicar para abrir o modal (mock)
    fireEvent.click(cancelBtn);

    // O modal mock deve aparecer
    expect(screen.getByTestId('mock-cancel-modal')).toBeInTheDocument();

    // Clicar em confirmar no modal (mock) — isso aciona a chamada fetch
    const confirmBtn = screen.getByRole('button', { name: /Sim, Cancelar/i });
    fireEvent.click(confirmBtn);

    // Aguarda o fetch ser chamado e a reserva removida da lista
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.queryByText(mockDateFormatted)).not.toBeInTheDocument();
    });
  });
});
