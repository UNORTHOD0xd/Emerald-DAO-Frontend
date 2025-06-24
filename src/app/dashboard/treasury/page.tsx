'use client';

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { TreasuryOverview, WithdrawalProposalModal } from '@/components/treasury';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { useTreasuryData } from '@/hooks/useTreasuryData';
import { useRealTreasuryData } from '@/hooks/useRealTreasuryData';

export default function TreasuryPage() {
  const { isDAOMember, canVote } = useEmeraldDAO();
  
  // Try to use real contract data first, fallback to mock data
  const realTreasuryData = useRealTreasuryData();
  const mockTreasuryData = useTreasuryData();
  
  // Use real data if available, otherwise use mock data
  const useRealData = realTreasuryData.hasRealETHData || realTreasuryData.hasRealERC20Data;
  
  const {
    treasuryData,
    isLoading,
    error,
    refreshTreasuryData,
    lastRefresh,
    isEmergencyMode,
    hasRealETHData,
    hasRealERC20Data
  } = useRealData ? {
    ...realTreasuryData,
    isEmergencyMode: realTreasuryData.isEmergencyMode,
  } : {
    ...mockTreasuryData,
    isEmergencyMode: mockTreasuryData.isEmergencyMode,
    hasRealETHData: false,
    hasRealERC20Data: false,
  };
  
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTreasuryData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Treasury Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treasury</h1>
          <p className="text-gray-600">
            DAO financial management and health monitoring
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={useRealData ? 'success' : 'info'} size="sm">
              {useRealData ? '🔗 Live Contract Data' : '📋 Demo Data'}
            </Badge>
            {useRealData && (
              <span className="text-xs text-gray-500">
                {hasRealETHData ? 'ETH' : ''}
                {hasRealETHData && hasRealERC20Data ? ' • ' : ''}
                {hasRealERC20Data ? 'ERC20' : ''} contracts connected
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEmergencyMode && (
            <Badge variant="error">
              Emergency Mode Active
            </Badge>
          )}
          
          {isDAOMember && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawalModalOpen(true)}
              leftIcon={<Plus size={16} />}
              disabled={isEmergencyMode}
            >
              Withdrawal Proposal
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw 
                size={16} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            }
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Treasury Overview Dashboard */}
      <TreasuryOverview 
        treasuryData={treasuryData}
        loading={isLoading}
        onRefresh={handleRefresh}
        hasRealData={useRealData}
        isRefreshing={isRefreshing}
      />

      {/* Withdrawal Proposal Modal */}
      <WithdrawalProposalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={async (proposalData) => {
          console.log('Creating withdrawal proposal:', proposalData);
          // TODO: Implement withdrawal proposal creation
          setIsWithdrawalModalOpen(false);
        }}
        treasuryBalance={treasuryData?.ethBalance || 0}
        dailyLimit={treasuryData?.riskMetrics?.dailyLimit || 0}
        monthlyLimit={treasuryData?.riskMetrics?.monthlyLimit || 0}
        spentToday={treasuryData?.riskMetrics?.emergencySpendingToday || 0}
        spentThisMonth={0}
      />
    </div>
  );
}