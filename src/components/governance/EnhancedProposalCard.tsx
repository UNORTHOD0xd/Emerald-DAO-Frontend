'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Timer,
  Loader2,
  DollarSign,
  Home,
  Database
} from 'lucide-react';
import { Card, CardContent, CardFooter, Button, Badge } from '@/components/ui';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, VOTE_SUPPORT } from '@/lib/contracts';

export interface EnhancedProposalData {
  id: string;
  proposalId: bigint;
  title: string;
  description: string;
  proposer: string;
  status: 'Active' | 'Pending' | 'Succeeded' | 'Defeated' | 'Executed' | 'Canceled' | 'Expired' | 'Queued';
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  totalVotes: bigint;
  quorumReached: boolean;
  startTime: bigint;
  endTime: bigint;
  executionTime?: bigint;
  metadata?: string;
  proposalType: 'Property Acquisition' | 'Treasury Management' | 'Governance' | 'Emergency' | 'Other';
  requiredQuorum: bigint;
  userHasVoted?: boolean;
  userVote?: 'for' | 'against' | 'abstain';
  targets?: string[];
  values?: bigint[];
  calldatas?: string[];
}

interface EnhancedProposalCardProps {
  proposal: EnhancedProposalData;
  onClick?: () => void;
  showActions?: boolean;
  userCanVote?: boolean;
  onVoteComplete?: () => void;
}

export const EnhancedProposalCard: React.FC<EnhancedProposalCardProps> = ({
  proposal,
  onClick,
  showActions = true,
  userCanVote = false,
  onVoteComplete,
}) => {
  const { address, isConnected } = useAccount();
  const [isVoting, setIsVoting] = useState(false);
  const [votingFor, setVotingFor] = useState<'for' | 'against' | 'abstain' | null>(null);

  // Contract write hook for voting
  const { writeContract, data: voteHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: voteHash,
  });

  // Parse metadata if available
  const parsedMetadata = React.useMemo(() => {
    if (!proposal.metadata) return null;
    try {
      if (proposal.metadata.startsWith('data:application/json;base64,')) {
        const base64Data = proposal.metadata.split(',')[1];
        return JSON.parse(atob(base64Data));
      }
      return JSON.parse(proposal.metadata);
    } catch {
      return null;
    }
  }, [proposal.metadata]);

  // Handle successful vote
  React.useEffect(() => {
    if (isSuccess && voteHash) {
      setIsVoting(false);
      setVotingFor(null);
      onVoteComplete?.();
    }
  }, [isSuccess, voteHash, onVoteComplete]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Succeeded':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Executed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Defeated':
      case 'Canceled':
      case 'Expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Queued':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Property Acquisition':
        return <Home size={16} className="text-emerald-600" />;
      case 'Treasury Management':
        return <DollarSign size={16} className="text-blue-600" />;
      case 'Governance':
        return <Vote size={16} className="text-purple-600" />;
      case 'Emergency':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const calculateVotePercentages = () => {
    const total = Number(proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain);
    if (total === 0) return { for: 0, against: 0, abstain: 0 };

    return {
      for: (Number(proposal.votesFor) / total) * 100,
      against: (Number(proposal.votesAgainst) / total) * 100,
      abstain: (Number(proposal.votesAbstain) / total) * 100,
    };
  };

  const handleVote = async (support: 'for' | 'against' | 'abstain') => {
    if (!isConnected || !address || !userCanVote) return;

    setIsVoting(true);
    setVotingFor(support);

    try {
      const supportValue = support === 'for' ? VOTE_SUPPORT.FOR : 
                          support === 'against' ? VOTE_SUPPORT.AGAINST : 
                          VOTE_SUPPORT.ABSTAIN;

      writeContract({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'castVote',
        args: [proposal.proposalId, supportValue],
      });
    } catch (error) {
      console.error('Failed to vote:', error);
      setIsVoting(false);
      setVotingFor(null);
    }
  };

  const votePercentages = calculateVotePercentages();
  const isActive = proposal.status === 'Active';
  const canVote = isActive && userCanVote && !proposal.userHasVoted && isConnected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getTypeIcon(proposal.proposalType)}
              <Badge variant="outline" size="sm">
                {proposal.proposalType}
              </Badge>
            </div>
            <Badge 
              className={getStatusColor(proposal.status)}
              variant="outline"
            >
              {proposal.status}
            </Badge>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {proposal.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {proposal.description}
            </p>
          </div>

          {/* Property Details for Property Acquisition */}
          {proposal.proposalType === 'Property Acquisition' && parsedMetadata?.propertyData && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <Home size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Property Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-emerald-700">Address:</span>
                  <div className="font-medium text-emerald-800 truncate">
                    {parsedMetadata.propertyData.address}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700">Asking Price:</span>
                  <div className="font-medium text-emerald-800">
                    ${parseInt(parsedMetadata.propertyData.askingPrice || '0').toLocaleString()}
                  </div>
                </div>
                {parsedMetadata.propertyData.chainlinkOracle && (
                  <>
                    <div>
                      <span className="text-emerald-700">Oracle Value:</span>
                      <div className="font-medium text-emerald-800">
                        ${Math.round(parsedMetadata.propertyData.chainlinkOracle.estimatedValue).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Database size={12} className="text-emerald-600" />
                      <span className="text-emerald-700">Confidence:</span>
                      <div className="font-medium text-emerald-800">
                        {parsedMetadata.propertyData.chainlinkOracle.confidenceScore}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Voting Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Voting Progress</span>
              </div>
              <span className="text-xs text-gray-500">
                {Number(proposal.totalVotes).toLocaleString()} votes
              </span>
            </div>
            
            {/* Vote Bars */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-green-600 font-medium">For</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votePercentages.for}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">
                  {votePercentages.for.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-red-600 font-medium">Against</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votePercentages.against}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">
                  {votePercentages.against.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-600 font-medium">Abstain</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votePercentages.abstain}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">
                  {votePercentages.abstain.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Quorum Status */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                {proposal.quorumReached ? (
                  <CheckCircle size={12} className="text-green-600" />
                ) : (
                  <Clock size={12} className="text-gray-600" />
                )}
                <span className={proposal.quorumReached ? 'text-green-600' : 'text-gray-600'}>
                  Quorum {proposal.quorumReached ? 'reached' : 'pending'}
                </span>
              </div>
              <span className="text-gray-500">
                Required: {Number(proposal.requiredQuorum).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-4 text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>Start: {formatDate(proposal.startTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Timer size={12} />
                <span>End: {formatDate(proposal.endTime)}</span>
              </div>
            </div>
            <div className="mt-1 flex items-center space-x-1">
              <span>Proposer: {formatAddress(proposal.proposer)}</span>
            </div>
          </div>

          {/* User Vote Status */}
          {proposal.userHasVoted && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  You voted: <span className="font-medium capitalize">{proposal.userVote}</span>
                </span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Actions */}
        {showActions && (
          <CardFooter className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={onClick}
              >
                View Details
              </Button>

              {canVote && (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote('against')}
                    disabled={isVoting || isPending || isConfirming}
                    leftIcon={
                      (isVoting && votingFor === 'against') || isPending || isConfirming ? 
                      <Loader2 size={14} className="animate-spin" /> : 
                      <XCircle size={14} />
                    }
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Against
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote('abstain')}
                    disabled={isVoting || isPending || isConfirming}
                    leftIcon={
                      (isVoting && votingFor === 'abstain') || isPending || isConfirming ? 
                      <Loader2 size={14} className="animate-spin" /> : 
                      <AlertCircle size={14} />
                    }
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Abstain
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleVote('for')}
                    disabled={isVoting || isPending || isConfirming}
                    leftIcon={
                      (isVoting && votingFor === 'for') || isPending || isConfirming ? 
                      <Loader2 size={14} className="animate-spin" /> : 
                      <CheckCircle size={14} />
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    For
                  </Button>
                </div>
              )}

              {!canVote && isActive && (
                <div className="text-xs text-gray-500">
                  {!userCanVote ? 'Need ERLD tokens to vote' : 
                   proposal.userHasVoted ? 'Already voted' : 
                   !isConnected ? 'Connect wallet to vote' : 'Cannot vote'}
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};