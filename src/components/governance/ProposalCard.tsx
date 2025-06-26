'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Calendar,
  FileText,
  PlayCircle,
  Timer,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardFooter, Button, Badge, ProposalStatusBadge } from '@/components/ui';
import { useGovernanceActions, VOTE_SUPPORT } from '@/hooks/useGovernanceActions';

export interface ProposalData {
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
}

interface ProposalCardProps {
  proposal: ProposalData;
  onClick?: () => void;
  onVote?: (proposalId: number, support: 'for' | 'against' | 'abstain') => void;
  showActions?: boolean;
  userCanVote?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onClick,
  onVote,
  showActions = true,
  userCanVote = false,
}) => {
  const { 
    castVote, 
    isVoting, 
    queueProposal, 
    executeProposal, 
    executePropertyAcquisition,
    isQueueing, 
    isExecuting 
  } = useGovernanceActions();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        return 'text-blue-600';
      case 'Succeeded':
      case 'Executed':
        return 'text-green-600';
      case 'Defeated':
      case 'Canceled':
      case 'Expired':
        return 'text-red-600';
      case 'Queued':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Property Acquisition':
        return 'emerald';
      case 'Treasury Management':
        return 'blue';
      case 'Governance':
        return 'info';
      case 'Emergency':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const isActive = proposal.status === 'Active';
  const hasEnded = new Date(proposal.endTime) < new Date();
  const timeRemaining = isActive && !hasEnded 
    ? Math.max(0, new Date(proposal.endTime).getTime() - new Date().getTime())
    : 0;

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon';
  };

  const votePercentageFor = proposal.totalVotes > 0 
    ? (proposal.votesFor / proposal.totalVotes) * 100 
    : 0;
  const votePercentageAgainst = proposal.totalVotes > 0 
    ? (proposal.votesAgainst / proposal.totalVotes) * 100 
    : 0;
  const votePercentageAbstain = proposal.totalVotes > 0 
    ? (proposal.votesAbstain / proposal.totalVotes) * 100 
    : 0;

  const quorumPercentage = proposal.requiredQuorum > 0 
    ? (proposal.totalVotes / proposal.requiredQuorum) * 100 
    : 0;

  // Handle proposal queueing
  const handleQueueProposal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // In a real implementation, you'd extract these from the proposal metadata
      const targets = ['0x0000000000000000000000000000000000000000']; // placeholder
      const values = ['0'];
      const calldatas = ['0x'];
      const description = proposal.description;
      
      await queueProposal(proposal.proposalId, targets, values, calldatas, description);
    } catch (error) {
      console.error('Failed to queue proposal:', error);
    }
  };

  // Handle proposal execution
  const handleExecuteProposal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (proposal.proposalType === 'Property Acquisition') {
        // Extract property details from metadata
        const propertyId = `property_${proposal.proposalId}`;
        const askingPrice = '500000'; // Extract from metadata
        const propertyAddress = proposal.title; // Extract from metadata
        
        await executePropertyAcquisition(proposal.proposalId, propertyId, askingPrice, propertyAddress);
      } else {
        // Generic proposal execution
        const targets = ['0x0000000000000000000000000000000000000000']; // placeholder
        const values = ['0'];
        const calldatas = ['0x'];
        const description = proposal.description;
        
        await executeProposal(proposal.proposalId, targets, values, calldatas, description);
      }
    } catch (error) {
      console.error('Failed to execute proposal:', error);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full cursor-pointer"
        onClick={onClick}
        hoverable
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <ProposalStatusBadge status={proposal.status} />
                <Badge variant={getTypeVariant(proposal.proposalType)} size="sm">
                  {proposal.proposalType}
                </Badge>
                {proposal.userHasVoted && (
                  <Badge variant="info" size="sm">
                    Voted {proposal.userVote}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* Proposal Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Proposed by</p>
              <p className="font-medium">{formatAddress(proposal.proposer)}</p>
            </div>
            <div>
              <p className="text-gray-500">Proposal ID</p>
              <p className="font-medium">#{proposal.proposalId}</p>
            </div>
          </div>

          {/* Voting Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Voting Progress</span>
              <span className="text-sm text-gray-500">
                {proposal.totalVotes.toLocaleString()} votes
              </span>
            </div>
            
            {/* Vote Distribution Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div className="h-full flex">
                <div 
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${votePercentageFor}%` }}
                />
                <div 
                  className="bg-red-500 transition-all duration-300"
                  style={{ width: `${votePercentageAgainst}%` }}
                />
                <div 
                  className="bg-gray-400 transition-all duration-300"
                  style={{ width: `${votePercentageAbstain}%` }}
                />
              </div>
            </div>

            {/* Vote Breakdown */}
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle size={12} className="text-green-500" />
                <span>For: {proposal.votesFor.toLocaleString()} ({votePercentageFor.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <XCircle size={12} className="text-red-500" />
                <span>Against: {proposal.votesAgainst.toLocaleString()} ({votePercentageAgainst.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle size={12} className="text-gray-400" />
                <span>Abstain: {proposal.votesAbstain.toLocaleString()} ({votePercentageAbstain.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Quorum Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Quorum</span>
              <span className={`text-sm ${proposal.quorumReached ? 'text-green-600' : 'text-gray-500'}`}>
                {quorumPercentage.toFixed(1)}% 
                {proposal.quorumReached && <span className="ml-1">✓</span>}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  proposal.quorumReached ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, quorumPercentage)}%` }}
              />
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>
                {isActive && !hasEnded 
                  ? formatTimeRemaining(timeRemaining)
                  : `Ended ${formatDate(proposal.endTime)}`
                }
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>Started {formatDate(proposal.startTime)}</span>
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<FileText size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View Details
              </Button>

              <div className="flex items-center space-x-2">
                {/* Voting Buttons - Active proposals */}
                {isActive && !hasEnded && userCanVote && !proposal.userHasVoted && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await castVote(proposal.proposalId, VOTE_SUPPORT.AGAINST);
                          onVote?.(proposal.proposalId, 'against');
                        } catch (error) {
                          console.error('Failed to vote:', error);
                        }
                      }}
                      disabled={isVoting}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {isVoting ? 'Voting...' : 'Against'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await castVote(proposal.proposalId, VOTE_SUPPORT.ABSTAIN);
                          onVote?.(proposal.proposalId, 'abstain');
                        } catch (error) {
                          console.error('Failed to vote:', error);
                        }
                      }}
                      disabled={isVoting}
                      className="text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      {isVoting ? 'Voting...' : 'Abstain'}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await castVote(proposal.proposalId, VOTE_SUPPORT.FOR);
                          onVote?.(proposal.proposalId, 'for');
                        } catch (error) {
                          console.error('Failed to vote:', error);
                        }
                      }}
                      disabled={isVoting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isVoting ? 'Voting...' : 'Vote For'}
                    </Button>
                  </>
                )}

                {/* Queue Button - Succeeded proposals */}
                {proposal.status === 'Succeeded' && (
                  <Button 
                    size="sm"
                    onClick={handleQueueProposal}
                    disabled={isQueueing}
                    leftIcon={isQueueing ? <Loader2 size={16} className="animate-spin" /> : <Timer size={16} />}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isQueueing ? 'Queueing...' : 'Queue for Execution'}
                  </Button>
                )}

                {/* Execute Button - Queued proposals ready for execution */}
                {proposal.status === 'Queued' && (
                  <Button 
                    size="sm"
                    onClick={handleExecuteProposal}
                    disabled={isExecuting}
                    leftIcon={isExecuting ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isExecuting ? 'Executing...' : proposal.proposalType === 'Property Acquisition' ? 'Execute Acquisition' : 'Execute Proposal'}
                  </Button>
                )}

                {/* Status Badges */}
                {proposal.userHasVoted && (
                  <Badge variant="info">
                    You voted {proposal.userVote}
                  </Badge>
                )}

                {proposal.status === 'Executed' && (
                  <Badge variant="success">
                    Executed
                  </Badge>
                )}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};