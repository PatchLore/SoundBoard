import React, { useState } from 'react';
import { motion } from 'framer-motion';
import authService, { User } from '../services/authService';

interface AuthFlowProps {
  onAuthSuccess: (user: User) => void;
  onShowPricing: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess, onShowPricing }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'streamer' | 'agency'>('streamer');
  const [plan, setPlan] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    let selectedPlan = plan;
    if (!selectedPlan) {
      // Set default plans if none selected
      if (userType === 'streamer') {
        selectedPlan = 'pro';
      } else {
        selectedPlan = 'small-agency';
      }
    }

    const user = authService.createUser(email, userType, selectedPlan);
    onAuthSuccess(user);
  };

  const handleDemoLogin = () => {
    const demoUser = authService.loginDemo();
    onAuthSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stream-dark via-stream-darker to-stream-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-stream-darker rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* User Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('streamer')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                userType === 'streamer'
                  ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                  : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
              }`}
            >
              <div className="text-2xl mb-2">🎮</div>
              <div className="font-medium">Streamer</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('agency')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                userType === 'agency'
                  ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                  : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
              }`}
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-medium">Agency</div>
            </button>
          </div>
        </div>

        {/* Plan Selection (only for signup) */}
        {!isLogin && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose your plan
            </label>
            <div className="space-y-3">
              {userType === 'streamer' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPlan('starter')}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      plan === 'starter'
                        ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                        : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Starter</span>
                      <span className="text-lg font-bold">$9/mo</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan('pro')}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      plan === 'pro'
                        ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                        : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pro</span>
                      <span className="text-lg font-bold">$19/mo</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPlan('small-agency')}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      plan === 'small-agency'
                        ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                        : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Small Agency</span>
                      <span className="text-lg font-bold">$99/mo</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan('medium-agency')}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      plan === 'medium-agency'
                        ? 'border-stream-accent bg-stream-accent/10 text-stream-accent'
                        : 'border-stream-gray text-gray-400 hover:border-stream-accent/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Medium Agency</span>
                      <span className="text-lg font-bold">$249/mo</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stream-gray border border-stream-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stream-accent focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Login */}
        <div className="mt-6 text-center">
          <button
            onClick={handleDemoLogin}
            className="text-stream-accent hover:text-stream-accent/80 font-medium transition-colors"
          >
            Try Demo Account
          </button>
        </div>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Pricing Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onShowPricing}
            className="text-stream-accent hover:text-stream-accent/80 font-medium transition-colors"
          >
            View All Plans & Features
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthFlow;

