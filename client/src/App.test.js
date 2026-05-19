import { render, screen } from '@testing-library/react';
import LandingPage from './pages/LandingPage';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  '@lottiefiles/dotlottie-react',
  () => ({
    DotLottieReact: () => <div data-testid="mock-lottie" />,
  }),
  { virtual: true }
);

test('renders Lanzo landing page', () => {
  render(<LandingPage />);
  expect(
    screen.getByRole('button', { name: /get started free/i })
  ).toBeInTheDocument();
});
