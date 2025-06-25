'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ProposalData } from '@/components/governance/ProposalCard';

// Sample proposal data for demo purposes
const SAMPLE_PROPOSALS: ProposalData[] = [
  {
    id: '1',
    proposalId: 1,
    title: 'Acquire Downtown Austin Commercial Property',
    description: `Proposal to purchase a 15,000 sq ft commercial building in downtown Austin, Texas. The property is currently generating $45,000/month in rental income with high-quality tenants including tech companies and professional services.

**Chainlink Oracle Validation:**
- Oracle Estimated Value: $2,850,000
- Asking Price: $2,700,000  
- Price Analysis: 5.3% Underpriced - Excellent Deal!
- Oracle Confidence Score: 94%
- Validated: ${new Date().toLocaleDateString()}

**Investment Highlights:**
- Prime downtown location with high foot traffic
- Stable tenant base with long-term leases
- Projected 8.5% annual ROI based on current rental income
- Oracle valuation confirms asking price is below market value`,
    proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e1234',
    status: 'Active',
    votesFor: 125000,
    votesAgainst: 23000,
    votesAbstain: 8000,
    totalVotes: 156000,
    quorumReached: true,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    proposalType: 'Property Acquisition',
    requiredQuorum: 100000,
    userHasVoted: false,
  },
  {
    id: '2',
    proposalId: 2,
    title: 'Treasury Diversification into USDC',
    description: 'Convert 30% of treasury ETH holdings into USDC to reduce volatility risk and provide stable funding for upcoming property acquisitions. This will help maintain treasury stability during market downturns.',
    proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e5678',
    status: 'Active',
    votesFor: 89000,
    votesAgainst: 67000,
    votesAbstain: 12000,
    totalVotes: 168000,
    quorumReached: true,
    startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    proposalType: 'Treasury Management',
    requiredQuorum: 100000,
    userHasVoted: true,
    userVote: 'for',
  },
  {
    id: '3',
    proposalId: 3,
    title: 'Update Governance Quorum Requirements',
    description: 'Reduce minimum quorum from 10% to 7.5% of total token supply to improve governance participation while maintaining security. This change will make it easier to pass proposals while requiring significant community engagement.',
    proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e9abc',
    status: 'Succeeded',
    votesFor: 134000,
    votesAgainst: 45000,
    votesAbstain: 21000,
    totalVotes: 200000,
    quorumReached: true,
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    proposalType: 'Governance',
    requiredQuorum: 100000,
    userHasVoted: true,
    userVote: 'for',
  },
  {
    id: '4',
    proposalId: 4,
    title: 'Emergency Fund Allocation for Market Opportunities',
    description: 'Establish a $2M emergency fund for rapid property acquisition opportunities. This fund would allow the DAO to move quickly on undervalued properties that require fast closing times.',
    proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6edef0',
    status: 'Pending',
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    totalVotes: 0,
    quorumReached: false,
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
    proposalType: 'Treasury Management',
    requiredQuorum: 100000,
    userHasVoted: false,
  },
  {
    id: '5',
    proposalId: 5,
    title: 'Residential Property Portfolio Expansion - Miami',
    description: `Acquire 5 residential rental properties in Miami, FL market. Total investment of $3.2M expected to generate $18,000/month rental income. Properties have been pre-screened and include single-family homes and condos in high-growth areas.

**Chainlink Oracle Analysis:**
- Combined Oracle Valuation: $2,890,000
- Asking Price: $3,200,000
- Price Analysis: 10.7% Overpriced - Poor Deal
- Average Confidence Score: 87%

**Community Concerns:**
- Oracle data suggests properties are overvalued by market standards
- High asking price relative to rental income potential
- Miami market showing signs of cooling
- Better opportunities available in other markets`,
    proposer: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e1111',
    status: 'Defeated',
    votesFor: 67000,
    votesAgainst: 145000,
    votesAbstain: 18000,
    totalVotes: 230000,
    quorumReached: true,
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    endTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    proposalType: 'Property Acquisition',
    requiredQuorum: 100000,
    userHasVoted: true,
    userVote: 'against',
  },
];

export function useGovernanceData() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, we'll use sample data. In production, this would fetch from the smart contract
  useEffect(() => {
    const loadProposals = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, you would fetch from the smart contract here
        // const proposalCount = await readContract({...});
        // const proposals = await Promise.all([...]);
        
        setProposals(SAMPLE_PROPOSALS);
      } catch (error) {
        console.error('Failed to load proposals:', error);
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [address]);

  const activeProposals = proposals.filter(p => p.status === 'Active');
  const userProposals = proposals.filter(p => p.proposer.toLowerCase() === address?.toLowerCase());

  return {
    proposals,
    activeProposals,
    userProposals,
    isLoading,
    refetch: () => {
      // Re-fetch proposals
      setIsLoading(true);
      setTimeout(() => {
        setProposals([...SAMPLE_PROPOSALS]);
        setIsLoading(false);
      }, 500);
    }
  };
}

// Hook for individual proposal data
export function useProposalData(proposalId: string | number) {
  const { proposals, isLoading } = useGovernanceData();
  
  const proposal = proposals.find(p => 
    p.id === proposalId.toString() || p.proposalId === Number(proposalId)
  );

  return {
    proposal,
    isLoading,
    exists: !!proposal,
  };
}

// Hook for proposal voting - now uses real contract integration
export function useProposalVoting() {
  // This hook is deprecated - use useGovernanceVoting instead
  console.warn('useProposalVoting is deprecated. Use useGovernanceVoting from useGovernanceVoting.ts instead');
  
  const { address } = useAccount();

  const castVote = async (proposalId: number, support: 'for' | 'against' | 'abstain') => {
    console.warn('This voting function is deprecated. Use useGovernanceVoting hook instead.');
    throw new Error('Please use the new useGovernanceVoting hook for voting functionality');
  };

  return {
    castVote,
  };
}