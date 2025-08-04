// src/__tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/Auth/LoginForm';
import { AuthProvider } from '@/contexts/AuthContext';

const MockedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: null,
    token: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
  };

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

describe('LoginForm', () => {
  it('renders login form elements', () => {
    render(
      <MockedAuthProvider>
        <LoginForm />
      </MockedAuthProvider>
    );

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    render(
      <MockedAuthProvider>
        <LoginForm />
      </MockedAuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    
    render(
      <MockedAuthProvider>
        <LoginForm />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email address');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });
});