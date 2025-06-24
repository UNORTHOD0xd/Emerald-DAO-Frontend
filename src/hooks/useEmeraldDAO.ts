'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { formatEther } from 'viem';

export function useEmeraldDAO() {
  const { address, isConnected, chain } = useAccount();
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('useEmeraldDAO Debug:', {
      address,
      isConnected,
      chain: chain?.name,
      chainId: chain?.id,
      tokenAddress: CONTRACT_CONFIG.token.address,
    });
  }

  // User token balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // User voting power
  const { data: votingPower, isLoading: votingPowerLoading } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // Check if user has delegated their votes
  const { data: delegatedTo } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Treasury balance
  const { data: treasuryBalance, isLoading: treasuryLoading } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getETHBalance',
    query: {
      refetchInterval: 60000,
    },
  });

  // Vault health score
  const { data: healthScore, isLoading: healthLoading } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getVaultHealthScore',
    query: {
      refetchInterval: 60000,
    },
  });

  // Total properties owned by DAO
  const { data: totalProperties } = useReadContract({
    address: CONTRACT_CONFIG.propertyFactory.address,
    abi: CONTRACT_CONFIG.propertyFactory.abi,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 120000,
    },
  });

  // Token total supply
  const { data: tokenTotalSupply } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 120000,
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

  // Format values for display with proper type checking
  const formattedBalance = balance && typeof balance === 'bigint' ? formatEther(balance) : '0';
  const formattedVotingPower = votingPower && typeof votingPower === 'bigint' ? formatEther(votingPower) : '0';
  const formattedTreasuryBalance = treasuryBalance && typeof treasuryBalance === 'bigint' ? formatEther(treasuryBalance) : '0';
  const formattedTokenTotalSupply = tokenTotalSupply && typeof tokenTotalSupply === 'bigint' ? formatEther(tokenTotalSupply) : '0';

  // Calculate additional metrics
  const balanceNumber = parseFloat(formattedBalance);
  const votingPowerNumber = parseFloat(formattedVotingPower);
  const treasuryBalanceNumber = parseFloat(formattedTreasuryBalance);
  const totalSupplyNumber = parseFloat(formattedTokenTotalSupply);

  // User's percentage of total supply
  const userOwnershipPercentage = totalSupplyNumber > 0 
    ? (balanceNumber / totalSupplyNumber) * 100 
    : 0;

  // Check if user has self-delegated (common pattern)
  const isSelfDelegated = delegatedTo === address;
  const hasVotingPower = votingPowerNumber > 0;

  // Determine user status
  const isDAOMember = balanceNumber > 0;
  const canVote = hasVotingPower;

  // Overall loading state
  const isLoading = balanceLoading || votingPowerLoading || treasuryLoading || healthLoading;

  return {
    // User wallet data
    address,
    isConnected,
    isDAOMember,
    canVote,

    // User token holdings
    balance: formattedBalance,
    balanceRaw: balance,
    balanceNumber,
    userOwnershipPercentage,

    // User voting data
    votingPower: formattedVotingPower,
    votingPowerRaw: votingPower,
    votingPowerNumber,
    delegatedTo,
    isSelfDelegated,
    hasVotingPower,

    // DAO treasury data
    treasuryBalance: formattedTreasuryBalance,
    treasuryBalanceRaw: treasuryBalance,
    treasuryBalanceNumber,

    // DAO health & security
    healthScore: healthScore ? Number(healthScore) : 0,
    emergencyMode: emergencyMode || false,

    // DAO assets & properties
    totalProperties: totalProperties ? Number(totalProperties) : 0,

    // Token economics
    tokenTotalSupply: formattedTokenTotalSupply,
    tokenTotalSupplyRaw: tokenTotalSupply,
    totalSupplyNumber,

    // Loading states
    isLoading,
    balanceLoading,
    votingPowerLoading,
    treasuryLoading,
    healthLoading,

    // Computed metrics for UI
    stats: {
      memberCount: '20K+',
      totalValueLocked: `${treasuryBalanceNumber.toFixed(2)} ETH`,
      avgHealthScore: healthScore ? Number(healthScore) : 0,
      totalAssets: totalProperties ? Number(totalProperties) : 0,
    },
  };
}

// Simplified additional hooks
export function useUserGovernance() {
  const { address } = useAccount();
  
  const { data: votingPower } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: delegatedTo } = useReadContract({
    address: CONTRACT_CONFIG.token.address,
    abi: CONTRACT_CONFIG.token.abi,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    votingPower: votingPower && typeof votingPower === 'bigint' ? formatEther(votingPower) : '0',
    votingPowerRaw: votingPower,
    delegatedTo,
    canVote: votingPower && typeof votingPower === 'bigint' ? votingPower > BigInt(0) : false,
    isSelfDelegated: delegatedTo === address,
  };
}

export function useTreasuryMetrics() {
  const { data: ethBalance } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getETHBalance',
  });

  const { data: healthScore } = useReadContract({
    address: CONTRACT_CONFIG.vault.address,
    abi: CONTRACT_CONFIG.vault.abi,
    functionName: 'getVaultHealthScore',
  });

  return {
    ethBalance: ethBalance && typeof ethBalance === 'bigint' ? formatEther(ethBalance) : '0',
    ethBalanceRaw: ethBalance,
    healthScore: healthScore ? Number(healthScore) : 0,
  };
}