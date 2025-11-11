import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';

const mockSignIn = jest.fn();
const mockRouterPush = jest.fn();
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, refresh: jest.fn() }),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}));

jest.mock('@/components/Spinner', () => ({ Spinner: () => <div data-testid="spinner" /> }));

describe('<RegisterPage />', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
    mockRouterPush.mockClear();
    mockToastError.mockClear();
    mockToastSuccess.mockClear();
    (global as any).fetch = jest.fn();
  });

  it('deve criar conta e fazer login automaticamente', async () => {
    // Mock do registro OK
    (global as any).fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // Mock do signIn bem-sucedido
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Usuário:/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Nome Completo:/i), { target: { value: 'Vini Teste' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'vini@exemplo.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
    });

    expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({ username: 'newuser', password: 'password123', redirect: false }));
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });

  it('deve mostrar erro se campos obrigatórios estiverem vazios', async () => {
    const { container } = render(<RegisterPage />);

    // Disparamos o submit diretamente no form para evitar validação HTML5 que
    // pode impedir o onSubmit de ser executado no ambiente de teste.
    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Todos os campos são obrigatórios.');
    });
  });
});
