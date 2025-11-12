import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock Spinner to avoid rendering SVG
jest.mock('./Spinner', () => ({ Spinner: () => <div data-testid="spinner" /> }));

// Mock react-hot-toast: capture error calls and return the promise for promise calls
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  toast: {
    promise: (p: Promise<any>) => p,
    error: (msg: string) => mockToastError(msg),
  },
}));

import { PasswordForm } from './PasswordForm';

describe('<PasswordForm />', () => {
  beforeEach(() => {
    mockToastError.mockClear();
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );
  });

  it('valida tamanho mínimo da nova senha', async () => {
    render(<PasswordForm />);

    fireEvent.change(screen.getByLabelText('Nova Senha'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), {
      target: { value: '123' },
    });
    // O botão de submit exige que oldPassword e newPassword existam
    fireEvent.change(screen.getByLabelText('Senha Antiga'), {
      target: { value: 'oldpass' },
    });

    const submitBtn = screen.getByRole('button', { name: /Alterar Senha/i });
    fireEvent.click(submitBtn);

    // A validação é síncrona e deve chamar toast.error
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Nova senha deve ter no mínimo 6 caracteres.');
    });
  });

  it('valida se as senhas coincidem', async () => {
    render(<PasswordForm />);

    fireEvent.change(screen.getByLabelText('Nova Senha'), {
      target: { value: 'abcdef' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), {
      target: { value: 'abcdeg' },
    });
    fireEvent.change(screen.getByLabelText('Senha Antiga'), {
      target: { value: 'oldpass' },
    });

    const submitBtn = screen.getByRole('button', { name: /Alterar Senha/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('As novas senhas não coincidem.');
    });
  });

  it('chama API e limpa campos em caso de sucesso', async () => {
    render(<PasswordForm />);

    fireEvent.change(screen.getByLabelText('Senha Antiga'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText('Nova Senha'), {
      target: { value: 'newpassword' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), {
      target: { value: 'newpassword' },
    });

    const submitBtn = screen.getByRole('button', { name: /Alterar Senha/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // fetch deve ter sido chamado
      // @ts-ignore
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }));
    });

    // Após sucesso os campos são limpos
    await waitFor(() => {
      expect((screen.getByLabelText('Senha Antiga') as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText('Nova Senha') as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText('Confirmar Nova Senha') as HTMLInputElement).value).toBe('');
    });
  });
});
