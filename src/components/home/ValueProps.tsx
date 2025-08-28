import React from 'react';
import { motion } from 'framer-motion';

const ValueProps: React.FC = () => {
  const valueProps = [
    {
      icon: '🎵',
      title: 'Unlimited Soundboard',
      description: 'Access thousands of tracks with advanced filtering, search, and organization tools.',
      features: ['Smart categorization', 'Custom playlists', 'Instant search', 'Favorites system']
    },
    {
      icon: '✅',
      title: 'DMCA Safe',
      description: 'All tracks are verified safe for streaming across all major platforms.',
      features: ['Twitch compliant', 'Facebook ready', 'TikTok approved']
    },
    {
      icon: '⚡',
      title: 'Instant Setup',
      description: 'Get started in minutes with no complex configuration or OBS plugins required.',
      features: ['Browser-based', 'No downloads', 'Cross-platform', 'Mobile friendly']
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose Stream Soundboard?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built specifically for content creators who need reliable, safe, and powerful audio management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-stream-darker rounded-3xl p-8 border border-stream-gray/30 hover:border-stream-accent/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-stream-accent/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{prop.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{prop.title}</h3>
                <p className="text-gray-300 leading-relaxed">{prop.description}</p>
              </div>

              <ul className="space-y-3">
                {prop.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: (index * 0.2) + (featureIndex * 0.1) }}
                    viewport={{ once: true }}
                    className="flex items-center text-gray-300"
                  >
                    <span className="text-stream-accent mr-3">✓</span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-stream-accent/10 to-blue-600/10 rounded-3xl p-8 border border-stream-accent/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              🚀 Advanced Features for Power Users
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-gray-300">🎹 Advanced Audio Controls</div>
              <div className="text-gray-300">🎚️ Volume Fading & Crossfades</div>
              <div className="text-gray-300">⌨️ Custom Hotkeys & Macros</div>
              <div className="text-gray-300">📊 Usage Analytics & Insights</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;


