import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationModal } from './ReservationModal';

// Mock do Spinner usado dentro do modal
jest.mock('./Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

describe('<ReservationModal />', () => {
  // Use local date constructors (year, monthIndex, day) to avoid timezone
  // shifts that can change the displayed day in a JSDOM environment.
  const start = new Date(2025, 10, 20); // 20 Nov 2025
  const end = new Date(2025, 10, 22); // 22 Nov 2025
  const onClose = jest.fn();
  const onConfirm = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    onClose.mockClear();
    onConfirm.mockClear();
  });

  it('deve mostrar o período formatado corretamente', () => {
    render(
      <ReservationModal
        dateRange={[start, end]}
        isLoading={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

  expect(screen.getByText(/Período Selecionado:/i)).toBeInTheDocument();
  // formato: 'dd/MM/yyyy a dd/MM/yyyy'
  expect(screen.getByText(/20\/11\/2025 a 22\/11\/2025/)).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(
      <ReservationModal
        dateRange={[start, end]}
        isLoading={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onConfirm ao clicar em Confirmar e mostrar spinner quando isLoading=true', async () => {
    const { rerender } = render(
      <ReservationModal
        dateRange={[start, end]}
        isLoading={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reserva/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // Agora re-render com isLoading=true e verificamos se o spinner aparece
    rerender(
      <ReservationModal
        dateRange={[start, end]}
        isLoading={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    // Botões devem estar desabilitados
  expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
  // Ambos os botões devem estar desabilitados quando isLoading=true
  const buttons = screen.getAllByRole('button');
  expect(buttons.length).toBeGreaterThanOrEqual(2);
  expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBeTruthy();
  });
});
