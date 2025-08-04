// jest.setup.js
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// src/__tests__/components/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

// Mock API client
jest.mock('@/lib/api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock socket hook
jest.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  }),
}));

const mockStats = {
  totalDevices: 3,
  activeDevices: 2,
  totalEvents: 150,
  objectTypeCounts: { person: 80, vehicle: 50, bicycle: 20 },
  eventTypeCounts: { detection: 100, entry: 30, exit: 20 },
  recentEvents: [],
};

const mockDevices = [
  {
    id: '1',
    deviceId: 'jetson-001',
    name: 'Entrance Camera',
    location: 'Main Entrance',
    status: 'online',
    isActive: true,
  },
];

const MockedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    },
    token: 'mock-token',
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

describe('Dashboard', () => {
  beforeEach(() => {
    mockedApiClient.get.mockImplementation((url) => {
      if (url === '/analytics/dashboard') {
        return Promise.resolve({ data: mockStats });
      }
      if (url === '/devices') {
        return Promise.resolve({ data: mockDevices });
      }
      if (url === '/analytics/hourly') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <MockedAuthProvider>
        <Dashboard />
      </MockedAuthProvider>
    );

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    render(
      <MockedAuthProvider>
        <Dashboard />
      </MockedAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Edge AI Tracking Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Devices')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Active Devices')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});