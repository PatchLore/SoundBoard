import React from 'react';
import { motion } from 'framer-motion';

interface PricingTableProps {
  onGetStarted: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ onGetStarted }) => {
  interface Plan {
    name: string;
    price: number | string;
    period: string;
    description: string;
    popular: boolean;
    features: Record<string, string>;
  }

  const plans: Plan[] = [
    {
      name: 'Starter',
      price: 9,
      period: 'month',
      description: 'Perfect for individual streamers getting started',
      popular: false,
      features: {
        'Track Limits': '50 tracks',
        'Hotkeys': 'Basic (1-9 keys)',
        'Advanced Audio': '❌',
        'Client Management': '❌',
        'Analytics': '❌',
        'Storage': 'Local',
        'Support': 'Email'
      }
    },
    {
      name: 'Pro',
      price: 19,
      period: 'month',
      description: 'Advanced features for serious content creators',
      popular: true,
      features: {
        'Track Limits': 'Unlimited',
        'Hotkeys': 'Advanced + Macros',
        'Advanced Audio': '✅ Fade/Crossfade',
        'Client Management': '❌',
        'Analytics': '✅ Basic',
        'Storage': 'Cloud',
        'Support': 'Priority'
      }
    },
    {
      name: 'Agency',
      price: 99,
      period: 'month',
      description: 'Complete solution for managing multiple streamers',
      popular: false,
      features: {
        'Track Limits': 'Unlimited',
        'Hotkeys': 'Advanced + Macros',
        'Advanced Audio': '✅ Fade/Crossfade',
        'Client Management': '✅ Full Suite',
        'Analytics': '✅ Advanced',
        'Storage': 'Enterprise',
        'Support': 'Dedicated'
      }
    }
  ];

  const featureOrder = [
    'Track Limits',
    'Hotkeys', 
    'Advanced Audio',
    'Client Management',
    'Analytics',
    'Storage',
    'Support'
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stream-darker/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
              viewport={{ once: true }}
              className={`relative bg-stream-dark rounded-3xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
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
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {featureOrder.map((feature) => (
                  <li key={feature} className="flex items-center justify-between">
                    <span className="text-gray-300">{feature}</span>
                    <span className={`font-medium ${
                      plan.features[feature] === '❌' 
                        ? 'text-red-400' 
                        : plan.features[feature] === '✅' || plan.features[feature].includes('✅')
                        ? 'text-green-400'
                        : 'text-white'
                    }`}>
                      {plan.features[feature]}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.name === 'Agency' ? (
                <button
                  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 bg-stream-gray hover:bg-stream-accent text-white"
                >
                  Contact Sales
                </button>
              ) : (
                <button
                  onClick={onGetStarted}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-stream-accent hover:bg-stream-accent/90 text-white shadow-lg'
                      : 'bg-stream-gray hover:bg-stream-accent text-white'
                  }`}
                >
                  Start Free Trial
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-stream-dark rounded-3xl border border-stream-gray/30 overflow-hidden"
        >
          <div className="p-8 border-b border-stream-gray/30">
            <h3 className="text-2xl font-bold text-white text-center">
              Detailed Feature Comparison
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stream-gray/20">
                  <th className="text-left p-6 text-white font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center p-6 text-white font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureOrder.map((feature, index) => (
                  <tr key={feature} className="border-t border-stream-gray/30">
                    <td className="p-6 text-gray-300 font-medium">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center p-6">
                        <span className={`font-medium ${
                          plan.features[feature] === '❌' 
                            ? 'text-red-400' 
                            : plan.features[feature] === '✅' || plan.features[feature].includes('✅')
                            ? 'text-green-400'
                            : 'text-white'
                        }`}>
                          {plan.features[feature]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-stream-accent/10 to-blue-600/10 rounded-3xl p-8 border border-stream-accent/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of streamers who trust Stream Soundboard for their audio needs.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-stream-accent to-blue-600 hover:from-stream-accent/90 hover:to-blue-600/90 text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingTable;
