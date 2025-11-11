import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

// 1. Mockar as bibliotecas externas
const mockSignIn = jest.fn();
const mockRouterPush = jest.fn();
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}));

// Mock do Spinner
jest.mock('@/components/Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

describe('<LoginPage />', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    mockSignIn.mockClear();
    mockRouterPush.mockClear();
    mockToastError.mockClear();
    mockToastSuccess.mockClear();
  });

  it('deve fazer login com sucesso e redirecionar', async () => {
    // 2. Configura o cenário de sucesso
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<LoginPage />);

    // 3. Simula a ação do usuário
    fireEvent.change(screen.getByLabelText(/Usuário:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Senha:/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // 4. Verifica os resultados (await é necessário por causa do 'async handleSubmit')
    await waitFor(() => {
      // Verifica se o 'signIn' foi chamado com os dados corretos
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        username: 'testuser',
        password: 'password123',
      });
    });

    // Verifica o feedback de UX
    expect(mockToastSuccess).toHaveBeenCalledWith('Login realizado!');
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  it('deve mostrar um toast de erro se o login falhar', async () => {
    // 2. Configura o cenário de falha
    mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

    render(<LoginPage />);

    // 3. Simula a ação do usuário
    fireEvent.change(screen.getByLabelText(/Usuário:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Senha:/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // 4. Verifica os resultados
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    expect(mockToastError).toHaveBeenCalledWith('Usuário ou senha inválidos.');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('deve mostrar o spinner durante o login', async () => {
    // Configura o 'signIn' para demorar um pouco
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Usuário:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Senha:/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // No momento do clique, o spinner deve aparecer
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Entrar/i })
    ).not.toBeInTheDocument();

    // Espera o processo terminar
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
    });
  });
});