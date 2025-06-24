'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Coins, ExternalLink } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';

interface TokenGateProps {
  isConnected: boolean;
  hasTokens: boolean;
  tokenBalance: string;
  minimumBalance?: number;
  onConnectWallet: () => void;
  onProceed: () => void;
  loading?: boolean;
}

interface TokenRequirementDisplayProps {
  hasTokens: boolean;
  tokenBalance: string;
  minimumBalance: number;
}

const TokenRequirementDisplay: React.FC<TokenRequirementDisplayProps> = ({
  hasTokens,
  tokenBalance,
  minimumBalance,
}) => {
  const balanceNumber = parseFloat(tokenBalance);
  const meetsRequirement = balanceNumber >= minimumBalance;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Shield className={`${meetsRequirement ? 'text-green-600' : 'text-red-600'}`} size={24} />
        <h3 className="text-lg font-semibold text-gray-900">
          Token Requirement Check
        </h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Required ERLD Tokens:</span>
          <Badge variant="info" size="sm">
            {minimumBalance.toLocaleString()} ERLD minimum
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Your ERLD Balance:</span>
          <div className="flex items-center space-x-2">
            <span className={`font-bold ${meetsRequirement ? 'text-green-600' : 'text-red-600'}`}>
              {balanceNumber.toLocaleString()} ERLD
            </span>
            {meetsRequirement ? (
              <Badge variant="success" size="sm">✓ Qualified</Badge>
            ) : (
              <Badge variant="error" size="sm">✗ Insufficient</Badge>
            )}
          </div>
        </div>

        {meetsRequirement && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800 text-center">
              🎉 You meet the token requirement! Welcome to Emerald DAO.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TokenGate: React.FC<TokenGateProps> = ({
  isConnected,
  hasTokens,
  tokenBalance,
  minimumBalance = 0.0001, // Minimum ERLD tokens required
  onConnectWallet,
  onProceed,
  loading = false,
}) => {
  const balanceNumber = parseFloat(tokenBalance);
  const meetsRequirement = balanceNumber >= minimumBalance;

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Connect your wallet to verify ERLD token ownership and access the DAO dashboard.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Coins className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-1">Token Requirement</h4>
                  <p className="text-sm text-blue-800">
                    You need at least {minimumBalance.toLocaleString()} ERLD tokens to access the dashboard.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onConnectWallet}
              className="w-full"
              size="lg"
              disabled={loading}
              loading={loading}
            >
              Connect Wallet
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              Don't have ERLD tokens? Learn how to acquire them below.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Token Balance...
            </h2>
            <p className="text-gray-600">
              Verifying your ERLD token holdings on the blockchain.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!hasTokens || !meetsRequirement) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Insufficient ERLD Tokens
              </h2>
              <p className="text-gray-600 mb-6">
                You need ERLD tokens to access the Emerald DAO dashboard and participate in governance.
              </p>
            </div>

            <TokenRequirementDisplay
              hasTokens={hasTokens}
              tokenBalance={tokenBalance}
              minimumBalance={minimumBalance}
            />

            <div className="mt-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">How to Get ERLD Tokens</h4>
                <ul className="text-sm text-yellow-800 space-y-1 text-left">
                  <li>• Purchase ERLD tokens on supported DEXes</li>
                  <li>• Participate in DAO governance rewards</li>
                  <li>• Earn through property investment returns</li>
                  <li>• Join community incentive programs</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  leftIcon={<ExternalLink size={16} />}
                  onClick={() => window.open('https://app.uniswap.org/', '_blank')}
                  className="flex-1"
                >
                  Buy ERLD
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Balance
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Balance updates may take a few minutes after token acquisition.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // User has sufficient tokens - show success and allow access
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card className="text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, DAO Member!
            </h2>
            <p className="text-gray-600 mb-6">
              You have sufficient ERLD tokens to access the Emerald DAO dashboard.
            </p>
          </div>

          <TokenRequirementDisplay
            hasTokens={hasTokens}
            tokenBalance={tokenBalance}
            minimumBalance={minimumBalance}
          />

          <div className="mt-6">
            <Button 
              onClick={onProceed}
              className="w-full"
              size="lg"
            >
              Enter DAO Dashboard
            </Button>
          </div>

          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-900 mb-2">Your DAO Benefits</h4>
            <ul className="text-sm text-emerald-800 space-y-1 text-left">
              <li>• Vote on property acquisitions and governance proposals</li>
              <li>• Earn returns from DAO property investments</li>
              <li>• Access exclusive real estate opportunities</li>
              <li>• Participate in treasury management decisions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};