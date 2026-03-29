import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pwa panel badge', () => {
  render(<App />);
  expect(screen.getByText(/PWA доступно|PWA установлено/i)).toBeInTheDocument();
});
