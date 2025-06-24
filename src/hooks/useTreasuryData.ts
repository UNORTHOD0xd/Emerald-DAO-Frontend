'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export interface TreasuryData {
  totalValue: number;
  ethBalance: number;
  erc20Holdings: Array<{
    token: string;
    symbol: string;
    balance: number;
    valueUSD: number;
  }>;
  monthlyIncome: number;
  monthlyExpenses: number;
  healthScore: number;
  emergencyMode: boolean;
  riskMetrics: {
    dailyLimit: number;
    monthlyLimit: number;
    emergencySpendingToday: number;
    circuitBreakersActive: number;
  };
  spendingLimits: {
    daily: number;
    monthly: number;
    remaining: number;
  };
  historicalData: Array<{
    date: string;
    totalValue: number;
    income: number;
    expenses: number;
    healthScore: number;
  }>;
}

export function useTreasuryData() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Real-time treasury balance from smart contract
  const { data: ethBalance, isLoading: ethLoading } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getETHBalance',
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Treasury health score
  const { data: healthScore, isLoading: healthLoading } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getVaultHealthScore',
    query: {
      refetchInterval: 60000, // Refresh every minute
    },
  });

  // Emergency mode status
  const { data: emergencyMode } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'emergencyMode',
    query: {
      refetchInterval: 30000,
    },
  });

  // Daily spending limit remaining
  const { data: dailyLimitRemaining } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getRemainingDailyLimit',
    query: {
      refetchInterval: 300000, // 5 minutes
    },
  });

  // Monthly spending limit remaining
  const { data: monthlyLimitRemaining } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getRemainingMonthlyLimit',
    query: {
      refetchInterval: 300000,
    },
  });

  // Emergency spending today
  const { data: emergencySpendingToday } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getEmergencySpendingToday',
    query: {
      refetchInterval: 300000,
    },
  });

  // Mock ERC20 holdings data (in production, this would query multiple token contracts)
  const mockERC20Holdings = [
    {
      token: 'USD Coin',
      symbol: 'USDC',
      balance: 50000,
      valueUSD: 50000,
    },
    {
      token: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      balance: 2.5,
      valueUSD: 187500, // Mock BTC price of $75,000
    },
    {
      token: 'Chainlink',
      symbol: 'LINK',
      balance: 1000,
      valueUSD: 25000, // Mock LINK price of $25
    }
  ];

  // Generate historical data for charts (in production, this would come from indexed events or API)
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic-looking treasury data with some trends
      const baseValue = 2500000; // $2.5M base
      const trend = (30 - i) * 1000; // Gradual increase
      const noise = (Math.random() - 0.5) * 50000; // Some volatility
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalValue: baseValue + trend + noise,
        income: 25000 + (Math.random() * 10000), // $25k-35k monthly income
        expenses: 15000 + (Math.random() * 5000), // $15k-20k monthly expenses
        healthScore: Math.max(70, Math.min(98, 85 + (Math.random() - 0.5) * 20)), // Health score 70-98
      });
    }
    
    return data;
  };

  // Calculate treasury metrics
  const treasuryData = useMemo(() => {
    const ethBalanceNumber = ethBalance ? parseFloat(formatEther(ethBalance)) : 0;
    const ethValueUSD = ethBalanceNumber * 3500; // Mock ETH price of $3,500
    const erc20TotalValue = mockERC20Holdings.reduce((sum, token) => sum + token.valueUSD, 0);
    const totalValue = ethValueUSD + erc20TotalValue;
    
    const historicalData = generateHistoricalData();
    const recentData = historicalData.slice(-7); // Last 7 days
    const avgIncome = recentData.reduce((sum, day) => sum + day.income, 0) / recentData.length;
    const avgExpenses = recentData.reduce((sum, day) => sum + day.expenses, 0) / recentData.length;
    
    // Calculate spending limits (mock values based on contract data)
    const dailyLimit = dailyLimitRemaining ? parseFloat(formatEther(dailyLimitRemaining)) * 3500 + 50000 : 50000;
    const monthlyLimit = monthlyLimitRemaining ? parseFloat(formatEther(monthlyLimitRemaining)) * 3500 + 500000 : 500000;
    const emergencySpent = emergencySpendingToday ? parseFloat(formatEther(emergencySpendingToday)) * 3500 : 0;

    return {
      totalValue,
      ethBalance: ethBalanceNumber,
      erc20Holdings: mockERC20Holdings,
      monthlyIncome: avgIncome,
      monthlyExpenses: avgExpenses,
      healthScore: healthScore ? Number(healthScore) : 85,
      emergencyMode: emergencyMode || false,
      riskMetrics: {
        dailyLimit,
        monthlyLimit,
        emergencySpendingToday: emergencySpent,
        circuitBreakersActive: emergencyMode ? 1 : 0,
      },
      spendingLimits: {
        daily: dailyLimit,
        monthly: monthlyLimit,
        remaining: dailyLimitRemaining ? parseFloat(formatEther(dailyLimitRemaining)) * 3500 : dailyLimit,
      },
      historicalData,
    };
  }, [ethBalance, healthScore, emergencyMode, dailyLimitRemaining, monthlyLimitRemaining, emergencySpendingToday]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLastRefresh(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [ethBalance, healthScore]);

  // Refresh function
  const refreshTreasuryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this would trigger refetch of all contract data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to refresh treasury data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const netCashFlow = treasuryData.monthlyIncome - treasuryData.monthlyExpenses;
    const burnRate = treasuryData.monthlyExpenses > 0 
      ? treasuryData.totalValue / treasuryData.monthlyExpenses 
      : Infinity;
    
    const utilizationRate = treasuryData.riskMetrics.emergencySpendingToday / treasuryData.riskMetrics.dailyLimit;
    
    // Risk assessment
    const riskLevel = treasuryData.healthScore < 70 ? 'high' :
                     treasuryData.healthScore < 85 ? 'medium' : 'low';
    
    return {
      netCashFlow,
      burnRate,
      utilizationRate,
      riskLevel,
      isHealthy: treasuryData.healthScore >= 80 && !treasuryData.emergencyMode,
      needsAttention: treasuryData.healthScore < 70 || treasuryData.emergencyMode,
    };
  }, [treasuryData]);

  return {
    // Data
    treasuryData,
    derivedMetrics,
    
    // Loading states
    isLoading: isLoading || ethLoading || healthLoading,
    error,
    lastRefresh,
    
    // Actions
    refreshTreasuryData,
    
    // Computed values
    hasData: !isLoading && !error,
    isEmergencyMode: treasuryData.emergencyMode,
    healthStatus: treasuryData.healthScore >= 80 ? 'excellent' :
                  treasuryData.healthScore >= 60 ? 'good' : 'poor',
  };
}

// Hook for treasury withdrawal proposals
export function useTreasuryProposals() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for treasury proposals
    const mockProposals = [
      {
        id: 1,
        title: 'Emergency Fund Allocation',
        amount: 100000,
        status: 'active',
        votesFor: 15,
        votesAgainst: 3,
        createdAt: '2024-06-20',
      },
      {
        id: 2,
        title: 'Property Maintenance Budget',
        amount: 25000,
        status: 'pending',
        votesFor: 8,
        votesAgainst: 1,
        createdAt: '2024-06-22',
      }
    ];

    setTimeout(() => {
      setProposals(mockProposals);
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    proposals,
    isLoading,
  };
}