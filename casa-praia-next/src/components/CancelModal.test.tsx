import { render, screen, fireEvent } from '@testing-library/react';
import { CancelModal } from './CancelModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock do Spinner
jest.mock('./Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

describe('<CancelModal />', () => {
  const mockDate = new Date('2025-11-25T12:00:00Z');
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('deve renderizar os dados da reserva corretamente', () => {
    render(
      <CancelModal
        dateToCancel={mockDate}
        nomeUsuario="Vini Teste"
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Formata a data exatamente como o componente faz
    const formattedDate = format(mockDate, 'dd/MM/yyyy', { locale: ptBR });

    // Verifica se os textos estão na tela
    expect(screen.getByText('Cancelar Reserva')).toBeInTheDocument();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText('Reservado por: Vini Teste')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em "Manter Reserva"', () => {
    render(
      <CancelModal
        dateToCancel={mockDate}
        nomeUsuario="Vini Teste"
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Manter Reserva/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('deve chamar onConfirm ao clicar em "Sim, Cancelar"', () => {
    render(
      <CancelModal
        dateToCancel={mockDate}
        nomeUsuario="Vini Teste"
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Sim, Cancelar/i }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('deve mostrar o spinner e desabilitar botões quando isLoading é true', () => {
    render(
      <CancelModal
        dateToCancel={mockDate}
        nomeUsuario="Vini Teste"
        isLoading={true} // <-- Estado de loading
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Verifica se o spinner apareceu
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Verifica se o texto do botão sumiu
    expect(
      screen.queryByRole('button', { name: /Sim, Cancelar/i })
    ).not.toBeInTheDocument();

    // Verifica se os botões estão desabilitados
    expect(screen.getByRole('button', { name: /Manter Reserva/i })).toBeDisabled();
    // O botão de confirmar ainda existe, mas agora contém o spinner
    expect(screen.getByRole('button', { name: '' })).toBeDisabled();
  });
});