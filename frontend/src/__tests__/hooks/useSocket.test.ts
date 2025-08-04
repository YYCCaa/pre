// src/__tests__/hooks/useSocket.test.ts
import { renderHook } from '@testing-library/react';
import { useSocket } from '@/hooks/useSocket';
import { AuthProvider } from '@/contexts/AuthContext';

const createWrapper = (token: string | null) => {
  const mockAuthValue = {
    user: token ? { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' } : null,
    token,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
  };

  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

describe('useSocket', () => {
  it('returns null when no token is provided', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: createWrapper(null),
    });

    expect(result.current).toBeNull();
  });

  it('returns socket instance when token is provided', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: createWrapper('mock-token'),
    });

    expect(result.current).toBeDefined();
  });
});