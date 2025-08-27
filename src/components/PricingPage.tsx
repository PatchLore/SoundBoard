import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PricingPageProps {
  onSelectPlan: (userType: 'streamer' | 'agency', plan: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const [selectedUserType, setSelectedUserType] = useState<'streamer' | 'agency'>('streamer');

  const streamerPlans = [
    {
      name: 'Starter',
      price: 9,
      period: 'month',
      features: [
        'Basic Soundboard (up to 50 tracks)',
        'Manual Track Upload (10 tracks/month)',
        'Basic Hotkeys',
        'Local Storage',
        'Email Support'
      ],
      popular: false,
      limits: {
        tracks: '50',
        manualUploads: '10/month',
        storage: 'Local',
        support: 'Email'
      }
    },
    {
      name: 'Pro',
      price: 19,
      period: 'month',
      features: [
        'Advanced Soundboard (unlimited tracks)',
        'Manual Track Upload (unlimited)',
        'Advanced Hotkeys & Macros',
        'Cloud Storage',
        'OBS Integration',
        'Discord Bot Integration',
        'Priority Support',
        'Analytics Dashboard'
      ],
      popular: true,
      limits: {
        tracks: 'Unlimited',
        manualUploads: 'Unlimited',
        storage: 'Cloud',
        support: 'Priority'
      }
    }
  ];

  const agencyPlans = [
    {
      name: 'Small Agency',
      price: 99,
      period: 'month',
      features: [
        'Up to 10 Streamers',
        'Client Management Dashboard',
        'Branding Customization',
        'Bulk Operations',
        'Usage Analytics',
        'Team Collaboration',
        'Priority Support'
      ],
      popular: false,
      limits: {
        streamers: '10',
        clients: 'Unlimited',
        storage: 'Cloud',
        support: 'Priority'
      }
    },
    {
      name: 'Medium Agency',
      price: 249,
      period: 'month',
      features: [
        'Up to 25 Streamers',
        'Advanced Client Management',
        'Custom Branding & Themes',
        'Advanced Analytics',
        'API Access',
        'White-label Options',
        'Dedicated Account Manager'
      ],
      popular: true,
      limits: {
        streamers: '25',
        clients: 'Unlimited',
        storage: 'Cloud',
        support: 'Dedicated'
      }
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'month',
      features: [
        'Unlimited Streamers',
        'Custom Integrations',
        'Advanced Security',
        'SLA Guarantees',
        'On-premise Options',
        'Custom Development',
        '24/7 Support'
      ],
      popular: false,
      limits: {
        streamers: 'Unlimited',
        clients: 'Unlimited',
        storage: 'Enterprise',
        support: '24/7'
      }
    }
  ];

  const streamerComparisonFeatures = [
    { feature: 'Soundboard Tracks', starter: '50', pro: 'Unlimited' },
          { feature: 'Manual Track Upload', starter: '10/month', pro: 'Unlimited' },
    { feature: 'Storage', starter: 'Local', pro: 'Cloud' },
    { feature: 'Hotkeys', starter: 'Basic', pro: 'Advanced + Macros' },
    { feature: 'OBS Integration', starter: '❌', pro: '✅' },
    { feature: 'Discord Bot', starter: '❌', pro: '✅' },
    { feature: 'Analytics Dashboard', starter: '❌', pro: '✅' },
    { feature: 'Support', starter: 'Email', pro: 'Priority' }
  ];

  const agencyComparisonFeatures = [
    { feature: 'Streamers', small: '10', medium: '25', enterprise: 'Unlimited' },
    { feature: 'Client Management', small: 'Basic', medium: 'Advanced', enterprise: 'Custom' },
    { feature: 'Branding', small: 'Basic', medium: 'Custom Themes', enterprise: 'White-label' },
    { feature: 'Analytics', small: 'Basic', medium: 'Advanced', enterprise: 'Custom' },
    { feature: 'API Access', small: '❌', medium: '✅', enterprise: '✅' },
    { feature: 'Account Manager', small: '❌', medium: '✅', enterprise: '✅' },
    { feature: 'Support', small: 'Priority', medium: 'Dedicated', enterprise: '24/7' },
    { feature: 'SLA Guarantees', small: '❌', medium: '❌', enterprise: '✅' }
  ];

  // const comparisonFeatures = selectedUserType === 'streamer' ? streamerComparisonFeatures : agencyComparisonFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stream-dark via-stream-darker to-stream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Built for both individual streamers and growing agencies
          </p>
          
          {/* User Type Selector */}
          <div className="inline-flex bg-stream-gray rounded-2xl p-2 mb-8">
            <button
              onClick={() => setSelectedUserType('streamer')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedUserType === 'streamer'
                  ? 'bg-stream-accent text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🎮 For Streamers
            </button>
            <button
              onClick={() => setSelectedUserType('agency')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedUserType === 'agency'
                  ? 'bg-stream-accent text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🏢 For Agencies
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-8 lg:grid-cols-3 mb-16"
        >
          {selectedUserType === 'streamer' ? (
            streamerPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-stream-darker rounded-3xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-stream-accent shadow-2xl shadow-stream-accent/20'
                    : 'border-stream-gray hover:border-stream-accent/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-stream-accent text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-stream-accent mr-3 mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan('streamer', plan.name.toLowerCase())}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-stream-accent hover:bg-stream-accent/90 text-white shadow-lg'
                      : 'bg-stream-gray hover:bg-stream-accent text-white'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))
          ) : (
            agencyPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-stream-darker rounded-3xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-stream-accent shadow-2xl shadow-stream-accent/20'
                    : 'border-stream-gray hover:border-stream-accent/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-stream-accent text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                    </span>
                    {typeof plan.price === 'number' && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-stream-accent mr-3 mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan('agency', plan.name.toLowerCase().replace(' ', '-'))}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-stream-accent hover:bg-stream-accent/90 text-white shadow-lg'
                      : 'bg-stream-gray hover:bg-stream-accent text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Plan Comparison</h2>
          <div className="bg-stream-darker rounded-2xl border border-stream-gray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stream-gray/50">
                    <th className="text-left p-6 text-white font-semibold">Feature</th>
                    {selectedUserType === 'streamer' ? (
                      <>
                        <th className="text-center p-6 text-white font-semibold">Starter</th>
                        <th className="text-center p-6 text-white font-semibold">Pro</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center p-6 text-white font-semibold">Small Agency</th>
                        <th className="text-center p-6 text-white font-semibold">Medium Agency</th>
                        <th className="text-center p-6 text-white font-semibold">Enterprise</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedUserType === 'streamer' ? (
                    streamerComparisonFeatures.map((row, index) => (
                      <tr key={index} className="border-t border-stream-gray/30">
                        <td className="p-6 text-gray-300 font-medium">{row.feature}</td>
                        <td className="text-center p-6 text-gray-400">{row.starter}</td>
                        <td className="text-center p-6 text-white font-medium">{row.pro}</td>
                      </tr>
                    ))
                  ) : (
                    agencyComparisonFeatures.map((row, index) => (
                      <tr key={index} className="border-t border-stream-gray/30">
                        <td className="p-6 text-gray-300 font-medium">{row.feature}</td>
                        <td className="text-center p-6 text-gray-400">{row.small}</td>
                        <td className="text-center p-6 text-white font-medium">{row.medium}</td>
                        <td className="text-center p-6 text-stream-accent font-semibold">{row.enterprise}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Can I change plans later?</h3>
              <p className="text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Is there a free trial?</h3>
              <p className="text-gray-300">We offer a 7-day free trial for all plans. No credit card required to start.</p>
            </div>
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-300">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
            </div>
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Is my data secure?</h3>
              <p className="text-gray-300">Yes, we use enterprise-grade encryption and security measures to protect your data.</p>
            </div>
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h3>
              <p className="text-gray-300">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div className="bg-stream-darker p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-300">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;

