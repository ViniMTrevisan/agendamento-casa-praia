import { render } from '@testing-library/react';
import AuthProvider from './AuthProvider';
import React from 'react';

describe('<AuthProvider />', () => {
  it('deve renderizar children sem erros', () => {
    const { getByText } = render(
      <AuthProvider>
        <div>Conteúdo</div>
      </AuthProvider>
    );

    expect(getByText('Conteúdo')).toBeInTheDocument();
  });
});
