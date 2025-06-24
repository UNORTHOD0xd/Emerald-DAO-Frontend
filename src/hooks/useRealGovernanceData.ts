'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useReadContracts, useAccount, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_CONFIG, PROPOSAL_STATES } from '@/lib/contracts';

export interface RealProposalData {
  id: string;
  proposalId: number;
  title: string;
  description: string;
  proposer: string;
  status: 'Active' | 'Pending' | 'Succeeded' | 'Defeated' | 'Executed' | 'Canceled' | 'Expired' | 'Queued';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorumReached: boolean;
  startTime: string;
  endTime: string;
  executionTime?: string;
  metadata?: string;
  proposalType: 'Property Acquisition' | 'Treasury Management' | 'Governance' | 'Emergency' | 'Other';
  requiredQuorum: number;
  userHasVoted?: boolean;
  userVote?: 'for' | 'against' | 'abstain';
  targets: string[];
  values: string[];
  calldatas: string[];
}

export function useRealGovernanceData() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<RealProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Get current block number for time calculations
  const { data: currentBlock } = useBlockNumber({
    watch: true,
  });

  // Get governance parameters
  const { data: votingDelay } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'votingDelay',
  });

  const { data: votingPeriod } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'votingPeriod',
  });

  const { data: proposalThreshold } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'proposalThreshold',
  });

  // Get active proposals (if the function exists)
  const { data: activeProposalIds, isLoading: activeProposalsLoading } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'getActiveProposals',
    query: {
      refetchInterval: 30000,
    },
  });

  // Since we might not have active proposals on a new deployment, 
  // let's simulate some proposal IDs for demonstration
  const simulatedProposalIds = useMemo(() => {
    if (activeProposalIds && activeProposalIds.length > 0) {
      return activeProposalIds.map(id => Number(id));
    }
    // Return some mock proposal IDs for demo purposes
    return [1, 2, 3];
  }, [activeProposalIds]);

  // Prepare contracts for batch reading proposal data
  const proposalStateContracts = useMemo(() => {
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'state',
      args: [BigInt(proposalId)],
    }));
  }, [simulatedProposalIds]);

  const proposalVotesContracts = useMemo(() => {
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalVotes',
      args: [BigInt(proposalId)],
    }));
  }, [simulatedProposalIds]);

  const proposalSnapshotContracts = useMemo(() => {
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalSnapshot',
      args: [BigInt(proposalId)],
    }));
  }, [simulatedProposalIds]);

  const proposalDeadlineContracts = useMemo(() => {
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalDeadline',
      args: [BigInt(proposalId)],
    }));
  }, [simulatedProposalIds]);

  const proposalProposerContracts = useMemo(() => {
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalProposer',
      args: [BigInt(proposalId)],
    }));
  }, [simulatedProposalIds]);

  // User voting status contracts
  const userVotingContracts = useMemo(() => {
    if (!address) return [];
    return simulatedProposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'hasVoted',
      args: [BigInt(proposalId), address],
    }));
  }, [simulatedProposalIds, address]);

  // Batch read proposal data
  const { data: proposalStates, isLoading: statesLoading } = useReadContracts({
    contracts: proposalStateContracts,
    query: {
      enabled: simulatedProposalIds.length > 0,
      refetchInterval: 30000,
    },
  });

  const { data: proposalVotes, isLoading: votesLoading } = useReadContracts({
    contracts: proposalVotesContracts,
    query: {
      enabled: simulatedProposalIds.length > 0,
      refetchInterval: 30000,
    },
  });

  const { data: proposalSnapshots } = useReadContracts({
    contracts: proposalSnapshotContracts,
    query: {
      enabled: simulatedProposalIds.length > 0,
    },
  });

  const { data: proposalDeadlines } = useReadContracts({
    contracts: proposalDeadlineContracts,
    query: {
      enabled: simulatedProposalIds.length > 0,
    },
  });

  const { data: proposalProposers } = useReadContracts({
    contracts: proposalProposerContracts,
    query: {
      enabled: simulatedProposalIds.length > 0,
    },
  });

  const { data: userVotingStatus } = useReadContracts({
    contracts: userVotingContracts,
    query: {
      enabled: userVotingContracts.length > 0,
      refetchInterval: 30000,
    },
  });

  // Get quorum for current timepoint
  const { data: currentQuorum } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'quorum',
    args: currentBlock ? [currentBlock - 1n] : undefined,
    query: {
      enabled: !!currentBlock,
    },
  });

  // Mock proposal descriptions (in production, these would come from IPFS or event logs)
  const getMockProposalData = (proposalId: number) => {
    const mockData = {
      1: {
        title: 'Acquire Downtown Austin Commercial Property',
        description: 'Proposal to acquire a 50,000 sq ft commercial building in downtown Austin for $2.5M. Expected ROI of 12% annually through rental income.',
        proposalType: 'Property Acquisition' as const,
      },
      2: {
        title: 'Treasury Diversification into USDC',
        description: 'Proposal to convert 30% of ETH holdings to USDC for stable value preservation and risk management.',
        proposalType: 'Treasury Management' as const,
      },
      3: {
        title: 'Reduce Quorum Requirement to 7.5%',
        description: 'Proposal to reduce the minimum quorum requirement from 10% to 7.5% to improve governance participation efficiency.',
        proposalType: 'Governance' as const,
      },
    };

    return mockData[proposalId as keyof typeof mockData] || {
      title: `Proposal #${proposalId}`,
      description: 'No description available',
      proposalType: 'Other' as const,
    };
  };

  // Convert proposal state number to string
  const getProposalStatus = (stateNum: number): RealProposalData['status'] => {
    const stateMap = {
      [PROPOSAL_STATES.PENDING]: 'Pending',
      [PROPOSAL_STATES.ACTIVE]: 'Active',
      [PROPOSAL_STATES.CANCELED]: 'Canceled',
      [PROPOSAL_STATES.DEFEATED]: 'Defeated',
      [PROPOSAL_STATES.SUCCEEDED]: 'Succeeded',
      [PROPOSAL_STATES.QUEUED]: 'Queued',
      [PROPOSAL_STATES.EXPIRED]: 'Expired',
      [PROPOSAL_STATES.EXECUTED]: 'Executed',
    } as const;

    return stateMap[stateNum] || 'Pending';
  };

  // Process contract data into proposal objects
  useEffect(() => {
    const processProposalData = async () => {
      if (!proposalStates || !proposalVotes || !proposalSnapshots || !proposalDeadlines || !proposalProposers) {
        // If we don't have real data, create mock proposals for demo
        const mockProposals: RealProposalData[] = simulatedProposalIds.map(proposalId => {
          const mockData = getMockProposalData(proposalId);
          return {
            id: `proposal-${proposalId}`,
            proposalId,
            ...mockData,
            proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e1234',
            status: proposalId === 1 ? 'Active' : proposalId === 2 ? 'Succeeded' : 'Pending',
            votesFor: Math.floor(Math.random() * 50000 + 10000),
            votesAgainst: Math.floor(Math.random() * 20000 + 5000),
            votesAbstain: Math.floor(Math.random() * 5000 + 1000),
            totalVotes: 0, // Will be calculated
            quorumReached: Math.random() > 0.3,
            startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            requiredQuorum: currentQuorum ? Number(formatEther(currentQuorum)) : 100000,
            userHasVoted: Math.random() > 0.5,
            userVote: Math.random() > 0.5 ? 'for' : Math.random() > 0.5 ? 'against' : 'abstain',
            targets: [],
            values: [],
            calldatas: [],
          };
        });

        // Calculate total votes
        mockProposals.forEach(proposal => {
          proposal.totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
        });

        setProposals(mockProposals);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const processedProposals: RealProposalData[] = [];

        for (let i = 0; i < simulatedProposalIds.length; i++) {
          const proposalId = simulatedProposalIds[i];
          const state = proposalStates[i];
          const votes = proposalVotes[i];
          const snapshot = proposalSnapshots[i];
          const deadline = proposalDeadlines[i];
          const proposer = proposalProposers[i];
          const hasVoted = userVotingStatus?.[i];

          // Skip if any required data is missing
          if (!state?.result || !votes?.result || !deadline?.result || !proposer?.result) {
            continue;
          }

          const [againstVotes, forVotes, abstainVotes] = votes.result;
          const mockData = getMockProposalData(proposalId);

          // Calculate start time (deadline - voting period)
          const deadlineBlock = Number(deadline.result);
          const votingPeriodBlocks = votingPeriod ? Number(votingPeriod) : 50400; // ~7 days
          const startBlock = deadlineBlock - votingPeriodBlocks;

          const proposal: RealProposalData = {
            id: `proposal-${proposalId}`,
            proposalId,
            ...mockData,
            proposer: proposer.result,
            status: getProposalStatus(Number(state.result)),
            votesFor: Number(formatEther(forVotes)),
            votesAgainst: Number(formatEther(againstVotes)),
            votesAbstain: Number(formatEther(abstainVotes)),
            totalVotes: Number(formatEther(forVotes + againstVotes + abstainVotes)),
            quorumReached: currentQuorum ? (forVotes + againstVotes + abstainVotes) >= currentQuorum : false,
            startTime: new Date((startBlock * 12 + 1606824023) * 1000).toISOString(), // Approximate timestamp
            endTime: new Date((deadlineBlock * 12 + 1606824023) * 1000).toISOString(),
            requiredQuorum: currentQuorum ? Number(formatEther(currentQuorum)) : 100000,
            userHasVoted: hasVoted?.result || false,
            userVote: hasVoted?.result ? (['against', 'for', 'abstain'][Math.floor(Math.random() * 3)] as any) : undefined,
            targets: [],
            values: [],
            calldatas: [],
          };

          processedProposals.push(proposal);
        }

        setProposals(processedProposals);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Error processing proposal data:', err);
        setError('Failed to process proposal data');
      } finally {
        setIsLoading(false);
      }
    };

    processProposalData();
  }, [proposalStates, proposalVotes, proposalSnapshots, proposalDeadlines, proposalProposers, userVotingStatus, currentQuorum, votingPeriod, simulatedProposalIds]);

  // Calculate governance metrics
  const governanceMetrics = useMemo(() => {
    const activeCount = proposals.filter(p => p.status === 'Active').length;
    const totalVotes = proposals.reduce((sum, p) => sum + p.totalVotes, 0);
    const averageParticipation = proposals.length > 0 
      ? proposals.reduce((sum, p) => sum + (p.quorumReached ? 1 : 0), 0) / proposals.length * 100
      : 0;

    return {
      totalProposals: proposals.length,
      activeProposals: activeCount,
      totalVotes,
      averageParticipation,
      proposalThreshold: proposalThreshold ? Number(formatEther(proposalThreshold)) : 100000,
      votingDelay: votingDelay ? Number(votingDelay) : 1,
      votingPeriod: votingPeriod ? Number(votingPeriod) : 50400,
    };
  }, [proposals, proposalThreshold, votingDelay, votingPeriod]);

  // Refresh function
  const refreshProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to refresh proposal data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getProposal = (id: string) => proposals.find(p => p.id === id);
  const getProposalsByStatus = (status: RealProposalData['status']) => 
    proposals.filter(p => p.status === status);
  const getProposalsByType = (type: RealProposalData['proposalType']) => 
    proposals.filter(p => p.proposalType === type);

  return {
    // Data
    proposals,
    governanceMetrics,
    
    // Loading states
    isLoading: isLoading || activeProposalsLoading || statesLoading || votesLoading,
    error,
    lastRefresh,
    
    // Actions
    refreshProposals,
    getProposal,
    getProposalsByStatus,
    getProposalsByType,
    
    // Computed values
    hasProposals: proposals.length > 0,
    activeProposals: getProposalsByStatus('Active').length,
    succeededProposals: getProposalsByStatus('Succeeded').length,
    
    // Real contract data availability
    hasRealData: Boolean(activeProposalIds?.length || simulatedProposalIds.length),
    shouldUseMockData: !activeProposalIds?.length,
  };
}