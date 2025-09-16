import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../services/authService';

interface AuthLoginProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthLogin({ onAuthSuccess }: AuthLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout, user, isAuthenticated, isLoading, error } = useAuth();

  // Call onAuthSuccess when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Convert useAuth user to User type
      const appUser: User = {
        id: user.email,
        email: user.email,
        userType: user.role === 'agency' ? 'agency' : 'streamer',
        plan: user.role === 'agency' ? 'enterprise' : 'free',
        isAuthenticated: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      onAuthSuccess(appUser);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (isAuthenticated) {
    return (
      <div className="bg-stream-darker rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Logged in as: {user?.email}</p>
            <p className="text-gray-400 text-sm">Role: {user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stream-darker rounded-lg p-4 mb-6">
      <h3 className="text-white font-medium mb-3">Login to Access Upload Features</h3>
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-stream-dark text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-stream-dark text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-3 text-xs text-gray-400">
        <p>Demo credentials:</p>
        <p>Email: dnbmashup1@gmail.com</p>
        <p>Password: DnB2024!Secure</p>
      </div>
    </div>
  );
}
