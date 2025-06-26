'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useReadContracts, useAccount, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_CONFIG, PROPOSAL_STATES } from '@/lib/contracts';
import type { EnhancedProposalData } from '@/components/governance/EnhancedProposalCard';

export function useEnhancedGovernanceData() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<EnhancedProposalData[]>([]);
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

  // Get quorum requirement
  const { data: quorumVotes } = useReadContract({
    address: CONTRACT_CONFIG.dao.address,
    abi: CONTRACT_CONFIG.dao.abi,
    functionName: 'quorum',
    args: currentBlock ? [currentBlock - 1n] : undefined,
    query: {
      enabled: !!currentBlock,
    },
  });

  // Get active proposals from PropertyAcquisition contract (these will be actual proposals)
  const { data: propertyProposalIds, isLoading: propertyProposalsLoading } = useReadContract({
    address: CONTRACT_CONFIG.propertyAcquisition.address,
    abi: CONTRACT_CONFIG.propertyAcquisition.abi,
    functionName: 'getActiveProposals',
    query: {
      refetchInterval: 30000,
    },
  });

  // Create a list of proposal IDs to query (mix of real and demo)
  const proposalIds = useMemo(() => {
    const realIds = propertyProposalIds ? (propertyProposalIds as bigint[]).map(id => Number(id)) : [];
    // Add some demo proposal IDs if no real proposals exist
    const demoIds = realIds.length === 0 ? [1, 2, 3] : [];
    return [...realIds, ...demoIds];
  }, [propertyProposalIds]);

  // Batch read proposal states
  const proposalStateContracts = useMemo(() => {
    return proposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'state',
      args: [BigInt(proposalId)],
    }));
  }, [proposalIds]);

  // Batch read proposal votes
  const proposalVotesContracts = useMemo(() => {
    return proposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalVotes',
      args: [BigInt(proposalId)],
    }));
  }, [proposalIds]);

  // Batch read proposal snapshots and deadlines
  const proposalInfoContracts = useMemo(() => {
    const contracts = [];
    for (const proposalId of proposalIds) {
      contracts.push(
        {
          address: CONTRACT_CONFIG.dao.address,
          abi: CONTRACT_CONFIG.dao.abi,
          functionName: 'proposalSnapshot',
          args: [BigInt(proposalId)],
        },
        {
          address: CONTRACT_CONFIG.dao.address,
          abi: CONTRACT_CONFIG.dao.abi,
          functionName: 'proposalDeadline',
          args: [BigInt(proposalId)],
        },
        {
          address: CONTRACT_CONFIG.dao.address,
          abi: CONTRACT_CONFIG.dao.abi,
          functionName: 'proposalProposer',
          args: [BigInt(proposalId)],
        }
      );
    }
    return contracts;
  }, [proposalIds]);

  // Execute batch reads
  const { data: proposalStates } = useReadContracts({
    contracts: proposalStateContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 15000,
    },
  });

  const { data: proposalVotes } = useReadContracts({
    contracts: proposalVotesContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 15000,
    },
  });

  const { data: proposalInfo } = useReadContracts({
    contracts: proposalInfoContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 30000,
    },
  });

  // Check if user has voted on proposals
  const userVoteContracts = useMemo(() => {
    if (!address) return [];
    return proposalIds.map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'hasVoted',
      args: [BigInt(proposalId), address],
    }));
  }, [proposalIds, address]);

  const { data: userVoteStatus } = useReadContracts({
    contracts: userVoteContracts,
    query: {
      enabled: userVoteContracts.length > 0,
      refetchInterval: 15000,
    },
  });

  // Get property proposal details for real proposals
  const propertyProposalContracts = useMemo(() => {
    const realIds = propertyProposalIds ? (propertyProposalIds as bigint[]).map(id => Number(id)) : [];
    return realIds.map(proposalId => ({
      address: CONTRACT_CONFIG.propertyAcquisition.address,
      abi: CONTRACT_CONFIG.propertyAcquisition.abi,
      functionName: 'getPropertyProposal',
      args: [BigInt(proposalId)],
    }));
  }, [propertyProposalIds]);

  const { data: propertyProposalDetails } = useReadContracts({
    contracts: propertyProposalContracts,
    query: {
      enabled: propertyProposalContracts.length > 0,
      refetchInterval: 30000,
    },
  });

  // Generate mock proposal data for demo purposes
  const generateMockProposal = (proposalId: number): EnhancedProposalData => {
    const mockProposals = [
      {
        title: "Acquire Property: 123 Demo Street, Austin TX",
        description: "High-yield rental property in Austin's growing tech district. Strong rental demand and appreciation potential.",
        proposalType: 'Property Acquisition' as const,
        metadata: JSON.stringify({
          title: "Acquire Property: 123 Demo Street, Austin TX",
          description: "High-yield rental property in Austin's growing tech district. Strong rental demand and appreciation potential.",
          propertyData: {
            address: "123 Demo Street, Austin, TX 78701",
            askingPrice: "450000",
            expectedMonthlyRent: "3200",
            chainlinkOracle: {
              estimatedValue: 445000,
              confidenceScore: 85,
              dataSource: "Chainlink Real Estate Oracle v2.0"
            }
          }
        })
      },
      {
        title: "Treasury Rebalancing: ETH/USDC Portfolio",
        description: "Rebalance treasury holdings to optimize for current market conditions and reduce volatility.",
        proposalType: 'Treasury Management' as const,
        metadata: JSON.stringify({
          title: "Treasury Rebalancing: ETH/USDC Portfolio",
          description: "Rebalance treasury holdings to optimize for current market conditions and reduce volatility.",
          amount: "100000",
          recipient: "0x742d35Cc6634C0532925a3b8D2d7e726b3b2e8a",
          purpose: "Treasury rebalancing"
        })
      },
      {
        title: "Governance: Update Voting Period",
        description: "Extend voting period from 7 to 10 days to allow for more community participation.",
        proposalType: 'Governance' as const,
        metadata: JSON.stringify({
          title: "Governance: Update Voting Period",
          description: "Extend voting period from 7 to 10 days to allow for more community participation.",
          parameter: "votingPeriod",
          currentValue: "7 days",
          proposedValue: "10 days"
        })
      }
    ];

    const mockData = mockProposals[proposalId - 1] || mockProposals[0];
    const baseVotes = 50000 + (proposalId * 10000);
    
    // Ensure all vote calculations result in integers
    const votesFor = baseVotes + (proposalId * 5000);
    const votesAgainst = Math.floor(baseVotes / 3);
    const votesAbstain = Math.floor(baseVotes / 6);
    const totalVotes = votesFor + votesAgainst + votesAbstain;
    
    return {
      id: `proposal_${proposalId}`,
      proposalId: BigInt(proposalId),
      title: mockData.title,
      description: mockData.description,
      proposer: '0x742d35Cc6634C0532925a3b8D2d7e726b3b2e8a8',
      status: proposalId === 1 ? 'Active' : proposalId === 2 ? 'Succeeded' : 'Pending',
      votesFor: BigInt(votesFor),
      votesAgainst: BigInt(votesAgainst),
      votesAbstain: BigInt(votesAbstain),
      totalVotes: BigInt(totalVotes),
      quorumReached: proposalId <= 2,
      startTime: BigInt(Math.floor(Date.now() / 1000) - (proposalId * 86400)),
      endTime: BigInt(Math.floor(Date.now() / 1000) + ((4 - proposalId) * 86400)),
      proposalType: mockData.proposalType,
      requiredQuorum: quorumVotes || BigInt(100000),
      userHasVoted: false,
      metadata: mockData.metadata,
    };
  };

  // Process proposal data
  useEffect(() => {
    const processProposalData = async () => {
      if (!proposalIds.length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const processedProposals: EnhancedProposalData[] = [];
        const realProposalIds = propertyProposalIds ? (propertyProposalIds as bigint[]).map(id => Number(id)) : [];

        for (let i = 0; i < proposalIds.length; i++) {
          const proposalId = proposalIds[i];
          const isRealProposal = realProposalIds.includes(proposalId);

          if (isRealProposal && propertyProposalDetails?.[realProposalIds.indexOf(proposalId)]?.result) {
            // Process real property proposal
            const propertyData = propertyProposalDetails[realProposalIds.indexOf(proposalId)].result as any[];
            const [title, description, propertyAddress, askingPrice, expectedRent, proposer, created, status] = propertyData;

            const stateResult = proposalStates?.[i]?.result as number;
            const votesResult = proposalVotes?.[i]?.result as [bigint, bigint, bigint];
            const userHasVoted = userVoteStatus?.[i]?.result as boolean;

            // Get proposal info (snapshot, deadline, proposer)
            const infoIndex = i * 3;
            const snapshot = proposalInfo?.[infoIndex]?.result as bigint;
            const deadline = proposalInfo?.[infoIndex + 1]?.result as bigint;
            const proposerAddress = proposalInfo?.[infoIndex + 2]?.result as string;

            const proposal: EnhancedProposalData = {
              id: `property_proposal_${proposalId}`,
              proposalId: BigInt(proposalId),
              title: title as string,
              description: description as string,
              proposer: proposerAddress || proposer as string,
              status: getStatusFromState(stateResult),
              votesFor: votesResult ? votesResult[1] : 0n,
              votesAgainst: votesResult ? votesResult[0] : 0n,
              votesAbstain: votesResult ? votesResult[2] : 0n,
              totalVotes: votesResult ? votesResult[0] + votesResult[1] + votesResult[2] : 0n,
              quorumReached: votesResult ? (votesResult[0] + votesResult[1] + votesResult[2]) >= (quorumVotes || 0n) : false,
              startTime: snapshot || BigInt(Math.floor(Date.now() / 1000)),
              endTime: deadline || BigInt(Math.floor(Date.now() / 1000) + 604800),
              proposalType: 'Property Acquisition',
              requiredQuorum: quorumVotes || BigInt(100000),
              userHasVoted: userHasVoted || false,
              metadata: JSON.stringify({
                title: title as string,
                description: description as string,
                propertyData: {
                  address: propertyAddress as string,
                  askingPrice: formatEther(askingPrice as bigint),
                  expectedMonthlyRent: formatEther(expectedRent as bigint),
                },
              }),
            };

            processedProposals.push(proposal);
          } else {
            // Use mock data for demo proposals
            const mockProposal = generateMockProposal(proposalId);
            
            // Update with real contract data if available
            const stateResult = proposalStates?.[i]?.result as number;
            const votesResult = proposalVotes?.[i]?.result as [bigint, bigint, bigint];
            const userHasVoted = userVoteStatus?.[i]?.result as boolean;

            if (stateResult !== undefined) {
              mockProposal.status = getStatusFromState(stateResult);
            }
            if (votesResult) {
              mockProposal.votesFor = votesResult[1];
              mockProposal.votesAgainst = votesResult[0];
              mockProposal.votesAbstain = votesResult[2];
              mockProposal.totalVotes = votesResult[0] + votesResult[1] + votesResult[2];
              mockProposal.quorumReached = mockProposal.totalVotes >= (quorumVotes || 0n);
            }
            if (userHasVoted !== undefined) {
              mockProposal.userHasVoted = userHasVoted;
            }

            processedProposals.push(mockProposal);
          }
        }

        setProposals(processedProposals);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Error processing governance data:', err);
        setError('Failed to load governance data');
        
        // Fallback to mock data
        const mockProposals = proposalIds.map(id => generateMockProposal(id));
        setProposals(mockProposals);
      } finally {
        setIsLoading(false);
      }
    };

    processProposalData();
  }, [
    proposalIds,
    proposalStates,
    proposalVotes,
    proposalInfo,
    userVoteStatus,
    propertyProposalDetails,
    propertyProposalIds,
    quorumVotes
  ]);

  // Helper function to convert state number to status string
  const getStatusFromState = (state: number): EnhancedProposalData['status'] => {
    switch (state) {
      case PROPOSAL_STATES.PENDING:
        return 'Pending';
      case PROPOSAL_STATES.ACTIVE:
        return 'Active';
      case PROPOSAL_STATES.CANCELED:
        return 'Canceled';
      case PROPOSAL_STATES.DEFEATED:
        return 'Defeated';
      case PROPOSAL_STATES.SUCCEEDED:
        return 'Succeeded';
      case PROPOSAL_STATES.QUEUED:
        return 'Queued';
      case PROPOSAL_STATES.EXPIRED:
        return 'Expired';
      case PROPOSAL_STATES.EXECUTED:
        return 'Executed';
      default:
        return 'Pending';
    }
  };

  // Refresh function
  const refreshProposals = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    // The useEffect will trigger when dependencies change
  };

  return {
    proposals,
    isLoading: isLoading || propertyProposalsLoading,
    error,
    lastRefresh,
    refreshProposals,
    
    // Governance parameters
    votingDelay: votingDelay ? Number(votingDelay) : 0,
    votingPeriod: votingPeriod ? Number(votingPeriod) : 50400, // 7 days in blocks
    proposalThreshold: proposalThreshold ? formatEther(proposalThreshold) : '0',
    quorumVotes: quorumVotes ? Number(quorumVotes) : 100000,
    
    // Computed statistics
    totalProposals: proposals.length,
    activeProposals: proposals.filter(p => p.status === 'Active').length,
    succeededProposals: proposals.filter(p => p.status === 'Succeeded').length,
    executedProposals: proposals.filter(p => p.status === 'Executed').length,
  };
}