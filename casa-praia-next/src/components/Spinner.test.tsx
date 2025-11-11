import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('<Spinner />', () => {
  it('deve renderizar o elemento SVG do spinner', () => {
    const { container } = render(<Spinner />);
    // O Spinner é um SVG; verificamos se existe um elemento <svg>
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
