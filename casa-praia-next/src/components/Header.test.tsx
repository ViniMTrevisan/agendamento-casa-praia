import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { Session } from 'next-auth';

// 1. Mock do 'next-auth/react'
// O Jest precisa "fingir" que esta biblioteca existe.
const mockSignOut = jest.fn();
jest.mock('next-auth/react', () => ({
  signOut: () => mockSignOut({ callbackUrl: '/login' }),
}));

describe('<Header />', () => {
  // Prepara um usuário falso para os testes
  const mockUser: Session['user'] = {
    id: '123',
    name: 'Vini Trevisan',
    email: 'vini@teste.com',
    username: 'vinitrevisan',
    role: 'user'
  };

  beforeEach(() => {
    // Limpa o mock antes de cada teste
    mockSignOut.mockClear();
  });

  it('deve renderizar o nome do usuário e o botão de Sair', () => {
    // 2. Renderiza o componente
    render(<Header user={mockUser} />);

    // 3. Verifica (Asserts)
    // Verifica se "Olá, Vini Trevisan" está na tela
    expect(screen.getByText('Olá, Vini Trevisan')).toBeInTheDocument();

    // Verifica se o botão "Sair" está na tela
    const logoutButton = screen.getByRole('button', { name: /Sair/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('deve chamar signOut ao clicar no botão Sair', () => {
    render(<Header user={mockUser} />);

    // Simula o clique
    const logoutButton = screen.getByRole('button', { name: /Sair/i });
    fireEvent.click(logoutButton);

    // Verifica se o mock (signOut) foi chamado
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });
});