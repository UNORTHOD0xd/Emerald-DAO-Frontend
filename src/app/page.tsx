'use client';

import React from 'react';
import { motion } from 'framer-motion';

// TypeScript interfaces
interface EmeraldLogoProps {
  className?: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  imagePlaceholder: string;
  reverse?: boolean;
}

// Emerald Diamond Logo Component
const EmeraldLogo: React.FC<EmeraldLogoProps> = ({ className = "w-8 h-8" }) => (
  <div className={`${className} relative`}>
    <img 
      src="/EmeraldDAO.png" 
      alt="Emerald DAO Logo" 
      className="w-full h-full object-contain"
    />
  </div>
);

// Header Component
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center space-x-3">
          <EmeraldLogo className="w-10 h-10" />
          <span className="text-xl font-semibold text-gray-900 hidden sm:block">
            Emerald DAO
          </span>
        </div>
        <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium">
          Connect Wallet
        </button>
      </div>
    </div>
  </header>
);

// Hero Section
const HeroSection = () => (
  <section className="pt-32 pb-20 px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
          Real estate. On-chain.
        </h1>
        <p className="text-xl lg:text-2xl text-gray-500 mb-12 font-light leading-relaxed">
          Fractionalize property ownership via Emerald DAO.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium">
            Enter the DAO
          </button>
          <button className="text-black border border-gray-300 px-8 py-3 rounded-full hover:border-gray-400 transition-colors font-medium">
            Connect Wallet
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

// Feature Section Component
const FeatureSection: React.FC<FeatureSectionProps> = ({ title, description, imagePlaceholder, reverse = false }) => (
  <section className="py-24 px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={reverse ? 'lg:order-2' : ''}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light">
            {description}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: reverse ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className={reverse ? 'lg:order-1' : ''}
        >
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <div className="text-gray-400 text-lg font-medium">
              {imagePlaceholder}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Stats Section
const StatsSection = () => (
  <section className="py-24 px-6 lg:px-8 bg-gray-50">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12"
      >
        <div>
          <div className="text-5xl lg:text-6xl font-bold text-black mb-2">
            20K+
          </div>
          <div className="text-lg text-gray-500 font-light">
            DAO Members
          </div>
        </div>
        
        <div>
          <div className="text-5xl lg:text-6xl font-bold text-black mb-2">
            100+
          </div>
          <div className="text-lg text-gray-500 font-light">
            Properties Tokenized
          </div>
        </div>
        
        <div>
          <div className="text-5xl lg:text-6xl font-bold text-black mb-2">
            $50M+
          </div>
          <div className="text-lg text-gray-500 font-light">
            Value Secured
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="py-24 px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
          Join Emerald DAO today.
        </h2>
        <p className="text-lg text-gray-600 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
          Shape the future of real estate—mint your badge and vote in our treasury.
        </p>
        
        <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium">
          Mint DAO Badge
        </button>
      </motion.div>
    </div>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="py-16 px-6 lg:px-8 border-t border-gray-200">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Tokenomics</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Governance</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Docs</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Support</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Social</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Twitter</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Medium</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Report a Bug</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const EmeraldDAOLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <HeroSection />
        
        <FeatureSection
          title="Effortless access."
          description="Own fractions of premium buildings as digital tokens—finally, real estate for everyone."
          imagePlaceholder="Property Visualization"
        />
        
        <FeatureSection
          title="Tokenize assets."
          description="Transform property into tradeable tokens through a secure, on-chain process."
          imagePlaceholder="Tokenization Process"
          reverse
        />
        
        <FeatureSection
          title="Stake & govern."
          description="Use DAO tokens to participate, stake, and unlock treasury benefits."
          imagePlaceholder="Governance Interface"
        />
        
        <StatsSection />
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default EmeraldDAOLanding;