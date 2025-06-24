'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { TokenGate, LoadingState } from '@/components/ui';

interface TokenProtectedRouteProps {
  children: React.ReactNode;
  minimumBalance?: number;
  redirectTo?: string;
}

export const TokenProtectedRoute: React.FC<TokenProtectedRouteProps> = ({
  children,
  minimumBalance = 0.0001,
  redirectTo = '/',
}) => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isDAOMember, balance, balanceNumber, isLoading } = useEmeraldDAO();

  const hasRequiredTokens = isConnected && isDAOMember && balanceNumber >= minimumBalance;

  useEffect(() => {
    // If wallet gets disconnected while on protected route, redirect
    if (!isConnected && !isLoading) {
      router.push(redirectTo);
    }
  }, [isConnected, isLoading, router, redirectTo]);

  // Show loading while checking token balance
  if (isLoading) {
    return (
      <LoadingState loading={true}>
        <div></div>
      </LoadingState>
    );
  }

  // If user doesn't have required tokens, show token gate
  if (!hasRequiredTokens) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <TokenGate
            isConnected={isConnected}
            hasTokens={isDAOMember}
            tokenBalance={balance}
            minimumBalance={minimumBalance}
            onConnectWallet={() => router.push(redirectTo)}
            onProceed={() => {
              // This should not be called if user doesn't have tokens
              // but handle it gracefully
              window.location.reload();
            }}
            loading={isLoading}
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(redirectTo)}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              ← Return to landing page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has required tokens, render protected content
  return <>{children}</>;
};