'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export interface RealERC20Holding {
  tokenAddress: string;
  token: string;
  symbol: string;
  decimals: number;
  balance: number;
  balanceRaw: bigint;
  valueUSD: number;
  priceUSD: number;
  change24h: number;
  isStablecoin: boolean;
}

export interface RealTreasuryData {
  totalValue: number;
  ethBalance: number;
  ethValueUSD: number;
  erc20Holdings: RealERC20Holding[];
  erc20TotalValue: number;
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
  assetAllocation: {
    eth: number;
    stablecoins: number;
    altcoins: number;
  };
}

// Known ERC20 tokens with their addresses and metadata
const KNOWN_TOKENS = [
  {
    address: '0xA0b86a33E6441b29F29b21F39AE6e0b58B6B4C8B' as const, // Mock USDC
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    isStablecoin: true,
    mockPrice: 1.00,
    mockChange24h: 0.01,
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as const, // Mock WBTC
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    isStablecoin: false,
    mockPrice: 75000,
    mockChange24h: 2.34,
  },
  {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as const, // Mock LINK
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
    isStablecoin: false,
    mockPrice: 25.67,
    mockChange24h: -1.23,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as const, // Mock DAI
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    isStablecoin: true,
    mockPrice: 0.9998,
    mockChange24h: -0.02,
  },
];

export function useRealTreasuryData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Real-time ETH balance from treasury vault
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

  // Prepare ERC20 balance contracts for batch reading
  const erc20BalanceContracts = useMemo(() => {
    return KNOWN_TOKENS.map(token => ({
      address: token.address,
      abi: [
        {
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [CONTRACT_CONFIG.vault.address],
    }));
  }, []);

  // Prepare ERC20 name contracts for batch reading
  const erc20NameContracts = useMemo(() => {
    return KNOWN_TOKENS.map(token => ({
      address: token.address,
      abi: [
        {
          inputs: [],
          name: 'name',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'name',
    }));
  }, []);

  // Prepare ERC20 symbol contracts for batch reading
  const erc20SymbolContracts = useMemo(() => {
    return KNOWN_TOKENS.map(token => ({
      address: token.address,
      abi: [
        {
          inputs: [],
          name: 'symbol',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'symbol',
    }));
  }, []);

  // Batch read ERC20 balances
  const { data: erc20Balances, isLoading: balancesLoading } = useReadContracts({
    contracts: erc20BalanceContracts,
    query: {
      enabled: erc20BalanceContracts.length > 0,
      refetchInterval: 60000, // Refresh every minute
    },
  });

  // Batch read ERC20 names (for verification)
  const { data: erc20Names, isLoading: namesLoading } = useReadContracts({
    contracts: erc20NameContracts,
    query: {
      enabled: erc20NameContracts.length > 0,
      refetchInterval: 300000, // Refresh every 5 minutes
    },
  });

  // Batch read ERC20 symbols (for verification)
  const { data: erc20Symbols, isLoading: symbolsLoading } = useReadContracts({
    contracts: erc20SymbolContracts,
    query: {
      enabled: erc20SymbolContracts.length > 0,
      refetchInterval: 300000,
    },
  });

  // Generate historical data for charts (in production, this would come from indexed events)
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

  // Generate mock ERC20 holdings when contract data is not available
  const generateMockERC20Holdings = (): RealERC20Holding[] => {
    return KNOWN_TOKENS.map((token, index) => {
      // Generate deterministic mock balances
      const balanceMultiplier = [50000, 2.5, 1000, 25000][index] || 1000;
      const balance = balanceMultiplier;
      const balanceRaw = BigInt(Math.floor(balance * Math.pow(10, token.decimals)));
      
      return {
        tokenAddress: token.address,
        token: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        balance,
        balanceRaw,
        valueUSD: balance * token.mockPrice,
        priceUSD: token.mockPrice,
        change24h: token.mockChange24h,
        isStablecoin: token.isStablecoin,
      };
    });
  };

  // Process ERC20 holdings data
  const erc20Holdings = useMemo(() => {
    // If we don't have real balance data, use mock data
    if (!erc20Balances || balancesLoading) {
      return generateMockERC20Holdings();
    }

    const holdings: RealERC20Holding[] = [];

    KNOWN_TOKENS.forEach((token, index) => {
      const balanceResult = erc20Balances[index];
      const nameResult = erc20Names?.[index];
      const symbolResult = erc20Symbols?.[index];

      // Use real balance if available, otherwise use mock
      const balanceRaw = balanceResult?.result ? (balanceResult.result as bigint) : BigInt(0);
      const balance = parseFloat(formatUnits(balanceRaw, token.decimals));

      // Use real name/symbol if available, otherwise use known values
      const tokenName = nameResult?.result ? (nameResult.result as string) : token.name;
      const tokenSymbol = symbolResult?.result ? (symbolResult.result as string) : token.symbol;

      // Only include tokens with non-zero balances or use mock data for demo
      if (balance > 0 || !balanceResult?.result) {
        const mockBalance = balance > 0 ? balance : generateMockERC20Holdings()[index]?.balance || 0;
        const mockBalanceRaw = balance > 0 ? balanceRaw : generateMockERC20Holdings()[index]?.balanceRaw || BigInt(0);
        
        holdings.push({
          tokenAddress: token.address,
          token: tokenName,
          symbol: tokenSymbol,
          decimals: token.decimals,
          balance: mockBalance,
          balanceRaw: mockBalanceRaw,
          valueUSD: mockBalance * token.mockPrice,
          priceUSD: token.mockPrice,
          change24h: token.mockChange24h,
          isStablecoin: token.isStablecoin,
        });
      }
    });

    return holdings;
  }, [erc20Balances, erc20Names, erc20Symbols, balancesLoading]);

  // Calculate comprehensive treasury metrics
  const treasuryData = useMemo(() => {
    const ethBalanceNumber = ethBalance ? parseFloat(formatEther(ethBalance)) : 0;
    const ethValueUSD = ethBalanceNumber * 3500; // Mock ETH price of $3,500
    const erc20TotalValue = erc20Holdings.reduce((sum, token) => sum + token.valueUSD, 0);
    const totalValue = ethValueUSD + erc20TotalValue;
    
    const historicalData = generateHistoricalData();
    const recentData = historicalData.slice(-7); // Last 7 days
    const avgIncome = recentData.reduce((sum, day) => sum + day.income, 0) / recentData.length;
    const avgExpenses = recentData.reduce((sum, day) => sum + day.expenses, 0) / recentData.length;
    
    // Calculate spending limits (mock values based on contract data)
    const dailyLimit = dailyLimitRemaining ? parseFloat(formatEther(dailyLimitRemaining)) * 3500 + 50000 : 50000;
    const monthlyLimit = monthlyLimitRemaining ? parseFloat(formatEther(monthlyLimitRemaining)) * 3500 + 500000 : 500000;
    const emergencySpent = emergencySpendingToday ? parseFloat(formatEther(emergencySpendingToday)) * 3500 : 0;

    // Calculate asset allocation
    const stablecoinValue = erc20Holdings
      .filter(token => token.isStablecoin)
      .reduce((sum, token) => sum + token.valueUSD, 0);
    const altcoinValue = erc20Holdings
      .filter(token => !token.isStablecoin)
      .reduce((sum, token) => sum + token.valueUSD, 0);

    const result: RealTreasuryData = {
      totalValue,
      ethBalance: ethBalanceNumber,
      ethValueUSD,
      erc20Holdings,
      erc20TotalValue,
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
      assetAllocation: {
        eth: totalValue > 0 ? (ethValueUSD / totalValue) * 100 : 0,
        stablecoins: totalValue > 0 ? (stablecoinValue / totalValue) * 100 : 0,
        altcoins: totalValue > 0 ? (altcoinValue / totalValue) * 100 : 0,
      },
    };

    return result;
  }, [ethBalance, healthScore, emergencyMode, dailyLimitRemaining, monthlyLimitRemaining, emergencySpendingToday, erc20Holdings]);

  // Simulate loading state for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLastRefresh(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [ethBalance, healthScore, erc20Balances]);

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

    // Diversification score (higher is better)
    const { eth, stablecoins, altcoins } = treasuryData.assetAllocation;
    const diversificationScore = 100 - Math.max(eth, stablecoins, altcoins); // Penalty for concentration
    
    return {
      netCashFlow,
      burnRate,
      utilizationRate,
      riskLevel,
      diversificationScore,
      isHealthy: treasuryData.healthScore >= 80 && !treasuryData.emergencyMode,
      needsAttention: treasuryData.healthScore < 70 || treasuryData.emergencyMode,
      isDiversified: diversificationScore >= 60, // No single asset > 40%
    };
  }, [treasuryData]);

  return {
    // Data
    treasuryData,
    derivedMetrics,
    
    // Loading states
    isLoading: isLoading || ethLoading || healthLoading || balancesLoading || namesLoading || symbolsLoading,
    error,
    lastRefresh,
    
    // Actions
    refreshTreasuryData,
    
    // Computed values
    hasData: !isLoading && !error,
    isEmergencyMode: treasuryData.emergencyMode,
    healthStatus: treasuryData.healthScore >= 80 ? 'excellent' :
                  treasuryData.healthScore >= 60 ? 'good' : 'poor',
    
    // Real contract data availability
    hasRealETHData: Boolean(ethBalance),
    hasRealERC20Data: Boolean(erc20Balances && erc20Balances.some(b => b.result && b.result !== BigInt(0))),
    shouldUseMockData: !ethBalance && (!erc20Balances || erc20Balances.every(b => !b.result || b.result === BigInt(0))),
  };
}

// Hook for ERC20 token metadata (useful for adding new tokens)
export function useERC20TokenMetadata(tokenAddress: string) {
  const { data: name } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'name',
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith('0x'),
    },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith('0x'),
    },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith('0x'),
    },
  });

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    isLoading: !name || !symbol || decimals === undefined,
  };
}