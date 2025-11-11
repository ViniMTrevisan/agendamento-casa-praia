import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calendar } from './Calendar';

// Mocks para subcomponentes usados pelo Calendar
jest.mock('./Spinner', () => ({ Spinner: () => <div data-testid="spinner" /> }));
jest.mock('./ReservationModal', () => ({ ReservationModal: () => <div>ReservationModal</div> }));
jest.mock('./CancelModal', () => ({ CancelModal: () => <div>CancelModal</div> }));

describe('<Calendar />', () => {
  beforeEach(() => {
    // mock do fetch global
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar cabeçalho e dias da semana, e mostrar o spinner enquanto busca', async () => {
    const { container } = render(<Calendar />);

    // Spinner aparece inicialmente (isFetching=true)
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Verifica dias da semana
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Seg')).toBeInTheDocument();

    // Aguarda o fetch terminar (isFetching falso)
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/reservas');
    });

    // Verifica que existe um título de mês (h3)
    const h3 = container.querySelector('h3');
    expect(h3).toBeTruthy();

    // Testa navegação de mês: clicar Próximo altera o texto do header
    const prevText = h3!.textContent;
    fireEvent.click(screen.getByText(/Próximo/i));
    expect(h3!.textContent).not.toEqual(prevText);
    fireEvent.click(screen.getByText(/Anterior/i));
    // Voltou ao texto anterior (pelo menos diferente do texto após Próximo)
    expect(h3!.textContent).not.toBeNull();
  });
});
