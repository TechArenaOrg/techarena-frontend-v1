import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '../login-form';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  SessionProvider: ({ children }: any) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockPush = jest.fn();
const mockGet = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

(useSearchParams as jest.Mock).mockReturnValue({
  get: mockGet,
});

const createWrapper = ({ session = null } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue('/dashboard');
  });

  it('renders login form correctly', () => {
    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const { signIn } = require('next-auth/react');
    signIn.mockResolvedValueOnce({ ok: true });

    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message for failed login', async () => {
    const { signIn } = require('next-auth/react');
    signIn.mockResolvedValueOnce({ error: 'Invalid credentials' });

    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('handles Google sign in', async () => {
    const { signIn } = require('next-auth/react');
    signIn.mockResolvedValueOnce({ ok: true });

    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const googleButton = screen.getByRole('button', { name: /google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
    });
  });

  it('disables form during submission', async () => {
    const { signIn } = require('next-auth/react');
    signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('has links to register and forgot password', () => {
    const wrapper = createWrapper();
    render(<LoginForm />, { wrapper });

    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth/register');
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute('href', '/auth/forgot-password');
  });
});