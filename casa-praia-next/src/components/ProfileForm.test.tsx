import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock Spinner
jest.mock('./Spinner', () => ({ Spinner: () => <div data-testid="spinner" /> }));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    promise: (p: Promise<any>) => p,
  },
}));

// Mock next-auth useSession to provide an 'update' function
const mockUpdate = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => ({ update: mockUpdate }),
}));

// Mock next/navigation useRouter
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

import { ProfileForm } from './ProfileForm';

describe('<ProfileForm />', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
    mockRefresh.mockClear();
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  });

  const user = {
    name: 'Vini Teste',
    email: 'vini@example.com',
    username: 'vini',
  };

  it('mostra campos e botão desabilitado quando nome não mudou', () => {
    render(<ProfileForm user={user as any} />);

    expect(screen.getByDisplayValue('vini@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('vini')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vini Teste')).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    expect(saveBtn).toBeDisabled();
  });

  it('permite editar nome e chama API, update e refresh', async () => {
    render(<ProfileForm user={user as any} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    fireEvent.change(nameInput, { target: { value: 'Novo Nome' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      // @ts-ignore
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }));
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Novo Nome' });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
