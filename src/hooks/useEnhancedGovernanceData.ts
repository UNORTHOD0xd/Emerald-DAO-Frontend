'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Get current block number for time calculations (reduced frequency)
  const { data: currentBlock } = useBlockNumber({
    watch: false, // Disable auto-watching to prevent constant refreshes
    query: {
      refetchInterval: 60000, // Only update every minute instead of every block
    },
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
    args: currentBlock ? [currentBlock - BigInt(1)] : undefined,
    query: {
      enabled: !!currentBlock,
    },
  });

  // Get all proposals from PropertyAcquisition contract (these will be actual proposals)
  const { data: propertyProposalIds, isLoading: propertyProposalsLoading, refetch: refetchPropertyProposals } = useReadContract({
    address: CONTRACT_CONFIG.propertyAcquisition.address,
    abi: CONTRACT_CONFIG.propertyAcquisition.abi,
    functionName: 'getAllProposals',
    query: {
      refetchInterval: 120000, // Reduced from 30s to 2 minutes
    },
  });

  // Create a list of proposal IDs to query (real proposals + 3 demo proposals)
  const proposalIds = useMemo(() => {
    const realIds = propertyProposalIds ? (propertyProposalIds as bigint[]).map(id => Number(id)) : [];
    // Always include 3 demo proposals (using negative IDs to avoid conflicts)
    const demoIds = [-1, -2, -3];
    return [...realIds, ...demoIds];
  }, [propertyProposalIds]);

  // Batch read proposal states (only for real proposals)
  const proposalStateContracts = useMemo(() => {
    return proposalIds.filter(id => id > 0).map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'state',
      args: [BigInt(proposalId)],
    }));
  }, [proposalIds]);

  // Batch read proposal votes (only for real proposals)
  const proposalVotesContracts = useMemo(() => {
    return proposalIds.filter(id => id > 0).map(proposalId => ({
      address: CONTRACT_CONFIG.dao.address,
      abi: CONTRACT_CONFIG.dao.abi,
      functionName: 'proposalVotes',
      args: [BigInt(proposalId)],
    }));
  }, [proposalIds]);

  // Batch read proposal snapshots and deadlines (only for real proposals)
  const proposalInfoContracts = useMemo(() => {
    const contracts = [];
    const realProposalIds = proposalIds.filter(id => id > 0);
    for (const proposalId of realProposalIds) {
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
  const { data: proposalStates, refetch: refetchProposalStates } = useReadContracts({
    contracts: proposalStateContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 90000, // Reduced from 15s to 90s for proposal states
    },
  });

  const { data: proposalVotes } = useReadContracts({
    contracts: proposalVotesContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 90000, // Reduced from 15s to 90s for proposal votes
    },
  });

  const { data: proposalInfo } = useReadContracts({
    contracts: proposalInfoContracts,
    query: {
      enabled: proposalIds.length > 0,
      refetchInterval: 120000, // Reduced from 30s to 2 minutes for proposal info
    },
  });

  // Check if user has voted on proposals (only for real proposals)
  const userVoteContracts = useMemo(() => {
    if (!address) return [];
    return proposalIds.filter(id => id > 0).map(proposalId => ({
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
      refetchInterval: 120000, // Reduced from 15s to 2 minutes for user vote status
    },
  });

  // Get property proposal details for real proposals
  const propertyProposalContracts = useMemo(() => {
    const realIds = propertyProposalIds ? (propertyProposalIds as bigint[]).map(id => Number(id)) : [];
    return realIds.map(proposalId => ({
      address: CONTRACT_CONFIG.propertyAcquisition.address,
      abi: CONTRACT_CONFIG.propertyAcquisition.abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    }));
  }, [propertyProposalIds]);

  const { data: propertyProposalDetails } = useReadContracts({
    contracts: propertyProposalContracts,
    query: {
      enabled: propertyProposalContracts.length > 0,
      refetchInterval: 180000, // Reduced from 30s to 3 minutes for property details
    },
  });

  // Generate mock proposal data for demo purposes
  const generateMockProposal = useCallback((proposalId: number): EnhancedProposalData => {
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
  }, [quorumVotes]);

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
          const isRealProposal = proposalId > 0 && realProposalIds.includes(proposalId);
          const isDemoProposal = proposalId < 0;

          if (isRealProposal && propertyProposalDetails?.[realProposalIds.indexOf(proposalId)]?.result) {
            // Find the index in the contract data arrays (only real proposals)
            const realProposalOnlyIds = proposalIds.filter(id => id > 0);
            const contractDataIndex = realProposalOnlyIds.indexOf(proposalId);
            // Process real property proposal
            const rawResult = propertyProposalDetails[realProposalIds.indexOf(proposalId)].result;
            if (!rawResult || Array.isArray(rawResult)) {
              continue; // Skip if no valid result
            }
            const propertyData = rawResult as unknown as {
              proposer: string;
              propertyAddress: string;
              metadataURI: string;
              proposedPrice: bigint;
              oracleValuation: bigint;
              proposalBond: bigint;
              createdAt: bigint;
              daoProposalId: bigint;
              oracleComplete: boolean;
              daoProposalCreated: boolean;
            };
            // Destructure the proposal tuple based on the ABI structure
            const {
              proposer,
              propertyAddress,
              metadataURI,
              proposedPrice,
              oracleValuation,
              proposalBond,
              createdAt,
              daoProposalId,
              oracleComplete,
              daoProposalCreated,
            } = propertyData;

            // For property proposals with DAO proposals, use the DAO proposal ID for voting data
            const daoId = daoProposalCreated ? Number(daoProposalId) : proposalId;
            const daoContractIndex = realProposalOnlyIds.indexOf(daoId);
            
            const stateResult = daoContractIndex >= 0 && proposalStates?.[daoContractIndex]?.result !== undefined 
              ? Number(proposalStates[daoContractIndex].result) : undefined;
            const votesResult = daoContractIndex >= 0 && proposalVotes?.[daoContractIndex]?.result 
              ? proposalVotes[daoContractIndex].result as [bigint, bigint, bigint] : undefined;
            const userHasVoted = daoContractIndex >= 0 && userVoteStatus?.[daoContractIndex]?.result !== undefined
              ? Boolean(userVoteStatus[daoContractIndex].result) : false;

            // Get proposal info (snapshot, deadline, proposer)
            const infoIndex = daoContractIndex >= 0 ? daoContractIndex * 3 : contractDataIndex * 3;
            const snapshot = proposalInfo?.[infoIndex]?.result ? BigInt(String(proposalInfo[infoIndex].result)) : undefined;
            const deadline = proposalInfo?.[infoIndex + 1]?.result ? BigInt(String(proposalInfo[infoIndex + 1].result)) : undefined;
            const proposerAddress = proposalInfo?.[infoIndex + 2]?.result ? String(proposalInfo[infoIndex + 2].result) : undefined;

            // Create title and description from the property data
            const title = `Property Acquisition: ${propertyAddress}`;
            const description = `Proposal to acquire property at ${propertyAddress} for ${formatEther(proposedPrice)} ETH. ${oracleComplete ? `Oracle valuation: ${formatEther(oracleValuation)} ETH` : 'Oracle valuation pending.'}`;

            const proposal: EnhancedProposalData = {
              id: `property_proposal_${proposalId}`,
              proposalId: daoProposalCreated ? BigInt(daoProposalId) : BigInt(proposalId),
              title,
              description,
              proposer: proposerAddress || proposer,
              status: daoProposalCreated ? (stateResult !== undefined ? getStatusFromState(stateResult) : 'Pending') : 'Pending',
              votesFor: votesResult ? votesResult[1] : BigInt(0),
              votesAgainst: votesResult ? votesResult[0] : BigInt(0),
              votesAbstain: votesResult ? votesResult[2] : BigInt(0),
              totalVotes: votesResult ? votesResult[0] + votesResult[1] + votesResult[2] : BigInt(0),
              quorumReached: votesResult ? (votesResult[0] + votesResult[1] + votesResult[2]) >= (quorumVotes || BigInt(0)) : false,
              startTime: snapshot || BigInt(createdAt) || BigInt(Math.floor(Date.now() / 1000)),
              endTime: deadline || BigInt(Math.floor(Date.now() / 1000) + 604800),
              proposalType: 'Property Acquisition',
              requiredQuorum: quorumVotes || BigInt(100000),
              userHasVoted: userHasVoted,
              metadata: JSON.stringify({
                title,
                description,
                propertyData: {
                  address: propertyAddress,
                  askingPrice: formatEther(proposedPrice),
                  oracleValuation: oracleComplete ? formatEther(oracleValuation) : null,
                  metadataURI,
                  oracleComplete,
                  daoProposalCreated,
                  proposalBond: formatEther(proposalBond),
                  chainlinkOracle: oracleComplete ? {
                    estimatedValue: Number(formatEther(oracleValuation)),
                    confidenceScore: 95, // Default confidence score
                    dataSource: "Chainlink Real Estate Oracle v2.0"
                  } : null
                },
              }),
            };

            processedProposals.push(proposal);
          } else if (isDemoProposal) {
            // Use mock data for demo proposals (convert negative ID to positive for demo generation)
            const demoId = Math.abs(proposalId);
            const mockProposal = generateMockProposal(demoId);
            
            // Demo proposals don't have real contract data - they use the generated mock data
            processedProposals.push(mockProposal);
          }
        }

        setProposals(processedProposals);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Error processing governance data:', err);
        setError('Failed to load governance data');
        
        // Fallback to mock data (only for demo proposals)
        const mockProposals = [-1, -2, -3].map(id => generateMockProposal(Math.abs(id)));
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

  // Manual refresh function
  const refreshProposals = useCallback(async () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    
    try {
      // Trigger manual refetch of all data
      await Promise.all([
        refetchPropertyProposals(),
        refetchProposalStates(),
      ]);
    } catch (error) {
      console.error('Failed to refresh governance data:', error);
      setError('Failed to refresh data');
    }
  }, [refetchPropertyProposals, refetchProposalStates]);

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