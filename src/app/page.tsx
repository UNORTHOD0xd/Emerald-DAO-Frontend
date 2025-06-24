'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { TokenGate } from '@/components/ui';

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

// Custom Connect Button Component using RainbowKit
const CustomConnectButton: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-medium"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openAccountModal}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

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

// Header Component with Web3 Integration
const Header: React.FC = () => {
  const { isConnected } = useAccount();
  const { isDAOMember, balanceNumber } = useEmeraldDAO();
  const router = useRouter();

  const handleDashboardAccess = () => {
    if (isConnected && isDAOMember && balanceNumber > 0) {
      router.push('/dashboard');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <EmeraldLogo className="w-10 h-10" />
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">
              Emerald DAO
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected && isDAOMember && balanceNumber > 0 && (
              <button 
                onClick={handleDashboardAccess}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </button>
            )}
            <CustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section with Token Gating
const HeroSection: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isDAOMember, balance, balanceNumber, isLoading } = useEmeraldDAO();
  const [showTokenGate, setShowTokenGate] = useState(false);
  
  const handleEnterDAO = () => {
    if (isConnected && isDAOMember && balanceNumber >= 0.0001) {
      router.push('/dashboard');
    } else {
      setShowTokenGate(true);
    }
  };

  const handleConnectWallet = () => {
    // This will be handled by the CustomConnectButton component
  };

  const handleTokenGateClose = () => {
    setShowTokenGate(false);
  };

  return (
    <section className="pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {!showTokenGate ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Real estate. On-chain.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-500 mb-8 font-light leading-relaxed">
              Fractionalize property ownership via Emerald DAO.
            </p>
            
            {/* Connection Status Display */}
            {isConnected && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 font-medium">
                  {isDAOMember && balanceNumber >= 0.0001 ? 
                    `Welcome back! You hold ${balance} ERLD tokens` : 
                    'Connected! Acquire ERLD tokens to join the DAO'
                  }
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleEnterDAO}
                className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                {isConnected ? 
                  (isDAOMember && balanceNumber >= 0.0001 ? 'Enter the DAO' : 'Check Token Requirements') : 
                  'Connect & Enter DAO'
                }
              </button>
              {!isConnected && <CustomConnectButton />}
            </div>
          </motion.div>
        ) : (
          <div className="py-12">
            <TokenGate
              isConnected={isConnected}
              hasTokens={isDAOMember}
              tokenBalance={balance}
              minimumBalance={0.0001}
              onConnectWallet={() => {
                setShowTokenGate(false);
                handleConnectWallet();
              }}
              onProceed={() => {
                setShowTokenGate(false);
                router.push('/dashboard');
              }}
              loading={isLoading}
            />
            
            <div className="mt-6">
              <button
                onClick={handleTokenGateClose}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back to landing page
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

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

// Stats Section with Real Data
const StatsSection: React.FC = () => {
  const { treasuryBalance, totalProperties, stats } = useEmeraldDAO();
  
  return (
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
              {stats.memberCount}
            </div>
            <div className="text-lg text-gray-500 font-light">
              DAO Members
            </div>
          </div>
          
          <div>
            <div className="text-5xl lg:text-6xl font-bold text-black mb-2">
              {totalProperties}+
            </div>
            <div className="text-lg text-gray-500 font-light">
              Properties Tokenized
            </div>
          </div>
          
          <div>
            <div className="text-5xl lg:text-6xl font-bold text-black mb-2">
              {parseFloat(treasuryBalance).toFixed(1)} ETH
            </div>
            <div className="text-lg text-gray-500 font-light">
              Value Secured
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section with Token Gating
const CTASection: React.FC = () => {
  const { isConnected } = useAccount();
  const { isDAOMember, balanceNumber, balance, isLoading } = useEmeraldDAO();
  const router = useRouter();
  const [showTokenGate, setShowTokenGate] = useState(false);

  const handleCTAClick = () => {
    if (isConnected && isDAOMember && balanceNumber >= 0.0001) {
      router.push('/dashboard');
    } else {
      setShowTokenGate(true);
    }
  };

  const getCtaText = () => {
    if (isConnected && isDAOMember && balanceNumber >= 0.0001) {
      return 'Access Your Dashboard';
    } else if (isConnected) {
      return 'Check Token Requirements';
    } else {
      return 'Connect Wallet Above';
    }
  };

  const getDescriptionText = () => {
    if (isConnected && isDAOMember && balanceNumber >= 0.0001) {
      return 'Access your personalized DAO dashboard and participate in governance decisions.';
    } else if (isConnected) {
      return 'Acquire ERLD tokens to become a member and participate in real estate governance.';
    } else {
      return 'Connect your wallet using the buttons above to join our community and access the DAO.';
    }
  };

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {!showTokenGate ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              {isConnected && isDAOMember && balanceNumber >= 0.0001 ? 
                'Welcome back, DAO member.' : 
                'Join Emerald DAO today.'
              }
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              {getDescriptionText()}
            </p>
            
            {isConnected ? (
              <button 
                onClick={handleCTAClick}
                className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                {getCtaText()}
              </button>
            ) : (
              <div className="space-y-4">
                <CustomConnectButton />
                <p className="text-sm text-gray-500">
                  Connect your wallet to get started
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="py-12">
            <TokenGate
              isConnected={isConnected}
              hasTokens={isDAOMember}
              tokenBalance={balance}
              minimumBalance={0.0001}
              onConnectWallet={() => setShowTokenGate(false)}
              onProceed={() => {
                setShowTokenGate(false);
                router.push('/dashboard');
              }}
              loading={isLoading}
            />
            
            <div className="mt-6">
              <button
                onClick={() => setShowTokenGate(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back to landing page
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => (
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
const EmeraldDAOLanding: React.FC = () => {
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