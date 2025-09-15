export const useAuth = jest.fn(() => ({
  user: { id: 'test-user', role: 'agency', email: 'test@example.com' },
  isAgency: true,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  verifyToken: jest.fn()
}));
