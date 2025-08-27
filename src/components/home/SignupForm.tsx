import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupFormProps {
  onSignup: (userType: 'streamer' | 'agency', plan: string, email: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, currentStep, setCurrentStep }) => {
  const [userType, setUserType] = useState<'streamer' | 'agency' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const streamerPlans = [
    { id: 'starter', name: 'Starter', price: 9, description: 'Perfect for getting started' },
    { id: 'pro', name: 'Pro', price: 19, description: 'Advanced features for serious creators' }
  ];

  const agencyPlans = [
    { id: 'small-agency', name: 'Small Agency', price: 99, description: 'Up to 10 streamers' },
    { id: 'medium-agency', name: 'Medium Agency', price: 249, description: 'Up to 25 streamers' },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', description: 'Unlimited streamers' }
  ];

  const handleUserTypeSelect = (type: 'streamer' | 'agency') => {
    setUserType(type);
    setSelectedPlan('');
    setCurrentStep(2);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType || !selectedPlan || !email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSignup(userType, selectedPlan, email);
    setIsSubmitting(false);
  };

  const goBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Create Your Account
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started with Stream Soundboard in just a few simple steps.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep
                    ? 'bg-stream-accent text-white'
                    : 'bg-stream-gray text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step < currentStep ? 'bg-stream-accent' : 'bg-stream-gray'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8 text-sm">
            <span className={currentStep >= 1 ? 'text-stream-accent' : 'text-gray-400'}>
              Choose Type
            </span>
            <span className={currentStep >= 2 ? 'text-stream-accent' : 'text-gray-400'}>
              Select Plan
            </span>
            <span className={currentStep >= 3 ? 'text-stream-accent' : 'text-gray-400'}>
              Enter Email
            </span>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="bg-stream-darker rounded-3xl p-8 border border-stream-gray/30">
          <AnimatePresence mode="wait">
            {/* Step 1: User Type Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-8">What type of user are you?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserTypeSelect('streamer')}
                    className="p-8 bg-stream-dark rounded-2xl border-2 border-stream-gray hover:border-stream-accent transition-all duration-300 hover:bg-stream-dark/80"
                  >
                    <div className="text-6xl mb-4">🎮</div>
                    <h4 className="text-xl font-bold text-white mb-2">Streamer</h4>
                    <p className="text-gray-300">Individual content creator</p>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserTypeSelect('agency')}
                    className="p-8 bg-stream-dark rounded-2xl border-2 border-stream-gray hover:border-stream-accent transition-all duration-300 hover:bg-stream-dark/80"
                  >
                    <div className="text-6xl mb-4">🏢</div>
                    <h4 className="text-xl font-bold text-white mb-2">Agency</h4>
                    <p className="text-gray-300">Manage multiple streamers</p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Plan Selection */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={goBack}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <h3 className="text-2xl font-bold text-white">
                    Choose your {userType === 'streamer' ? 'Streamer' : 'Agency'} plan
                  </h3>
                  <div></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(userType === 'streamer' ? streamerPlans : agencyPlans).map((plan) => (
                    <motion.button
                      key={plan.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlanSelect(plan.id)}
                      className="p-6 bg-stream-dark rounded-2xl border-2 border-stream-gray hover:border-stream-accent transition-all duration-300 hover:bg-stream-dark/80 text-center"
                    >
                      <h4 className="text-lg font-bold text-white mb-2">{plan.name}</h4>
                      <div className="text-2xl font-bold text-stream-accent mb-2">
                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        {typeof plan.price === 'number' && <span className="text-sm text-gray-400">/mo</span>}
                      </div>
                      <p className="text-gray-300 text-sm">{plan.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Email Input */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={goBack}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <h3 className="text-2xl font-bold text-white">Almost done!</h3>
                  <div></div>
                </div>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-stream-dark border border-stream-gray rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-stream-accent transition-colors"
                      placeholder="Enter your email address"
                    />
                    {/* Debug display - remove this later */}
                    {email && (
                      <div className="mt-2 text-sm text-gray-400">
                        Typed: "{email}"
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-gray-400 text-sm">
                      You're signing up for: <span className="text-white font-medium">{userType}</span> - <span className="text-white font-medium">{selectedPlan}</span>
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!email || isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-stream-accent to-blue-600 hover:from-stream-accent/90 hover:to-blue-600/90 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;
