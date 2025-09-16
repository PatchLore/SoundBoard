import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('authToken'),
    isLoading: false,
    error: null
  });

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null
    });
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: userData.user,
          token,
          error: null
        }));
      } else {
        // Token invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  }, [logout]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      verifyToken(token);
    }
  }, [verifyToken]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Temporary local authentication for testing
      if (email === 'dnbmashup1@gmail.com' && password === 'DnB2024!Secure') {
        const user = { email, role: 'agency' };
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', token);
        setAuthState({
          user,
          token,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid credentials'
        }));
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed'
      }));
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const isAuthenticated = !!authState.user && !!authState.token;
  const isAgency = authState.user?.role === 'agency';
  const isStreamer = authState.user?.role === 'streamer';

  return {
    ...authState,
    login,
    logout,
    isAuthenticated,
    isAgency,
    isStreamer,
    verifyToken
  };
}