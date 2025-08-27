import React, { useState, useRef } from 'react';
import HeroSection from './home/HeroSection';
import ValueProps from './home/ValueProps';
import PricingTable from './home/PricingTable';
import SignupForm from './home/SignupForm';
import Footer from './home/Footer';

interface HomePageProps {
  onSignup: (userType: 'streamer' | 'agency', plan: string, email: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSignup }) => {
  const signupFormRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const scrollToSignup = () => {
    signupFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignup = (userType: 'streamer' | 'agency', plan: string, email: string) => {
    onSignup(userType, plan, email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stream-dark via-stream-darker to-stream-dark">
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToSignup} />

      {/* Value Props Section */}
      <ValueProps />

      {/* Pricing Table Section */}
      <PricingTable onGetStarted={scrollToSignup} />

      {/* Signup Form Section */}
      <div ref={signupFormRef}>
        <SignupForm 
          onSignup={handleSignup}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
