'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  ExternalLink,
  Share2,
  Flag
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardContent, Badge, ProposalStatusBadge } from '@/components/ui';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { useProposalData, useProposalVoting } from '@/hooks/useGovernanceData';

export default function ProposalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;
  
  const { canVote, votingPower } = useEmeraldDAO();
  const { proposal, isLoading } = useProposalData(proposalId);
  const { castVote } = useProposalVoting();
  
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false);

  const handleVote = async () => {
    if (!selectedVote || !proposal) return;

    setIsVoting(true);
    try {
      await castVote(proposal.proposalId, selectedVote);
      setShowVoteConfirmation(false);
      // Refresh proposal data
      window.location.reload();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeRemaining = () => {
    if (!proposal) return '';
    
    const now = new Date();
    const endTime = new Date(proposal.endTime);
    const timeDiff = endTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Voting ended';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
        <p className="text-gray-600 mb-4">The proposal you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/dashboard/governance')}>
          Return to Governance
        </Button>
      </div>
    );
  }

  const isActive = proposal.status === 'Active';
  const hasEnded = new Date(proposal.endTime) < new Date();
  const canUserVote = isActive && !hasEnded && canVote && !proposal.userHasVoted;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm text-gray-500">Proposal #{proposal.proposalId}</span>
              <ProposalStatusBadge status={proposal.status} />
              <Badge variant="info" size="sm">
                {proposal.proposalType}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" leftIcon={<Share2 size={16} />}>
            Share
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Flag size={16} />}>
            Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{proposal.description}</p>
              </div>
              
              {proposal.metadata && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Additional Information</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ExternalLink size={14} />}
                      onClick={() => window.open(proposal.metadata, '_blank')}
                    >
                      View Metadata
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voting Results */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Results</h2>
              
              {/* Vote Distribution */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Total Votes Cast</span>
                  <span className="text-gray-900">{proposal.totalVotes.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="font-medium text-green-600">For</span>
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {proposal.votesFor.toLocaleString()}
                    </div>
                    <div className="text-gray-500">
                      {votePercentageFor.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <XCircle size={16} className="text-red-500" />
                      <span className="font-medium text-red-600">Against</span>
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {proposal.votesAgainst.toLocaleString()}
                    </div>
                    <div className="text-gray-500">
                      {votePercentageAgainst.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <AlertCircle size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-600">Abstain</span>
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {proposal.votesAbstain.toLocaleString()}
                    </div>
                    <div className="text-gray-500">
                      {votePercentageAbstain.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Quorum Progress */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quorum Progress</span>
                  <span className={`text-sm font-medium ${proposal.quorumReached ? 'text-green-600' : 'text-gray-600'}`}>
                    {quorumPercentage.toFixed(1)}% of required
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{proposal.totalVotes.toLocaleString()} votes</span>
                  <span>{proposal.requiredQuorum.toLocaleString()} required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting Actions */}
          {canUserVote && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your voting power: {parseFloat(votingPower).toFixed(2)} ERLD
                </p>
                
                <div className="space-y-3">
                  <Button
                    variant={selectedVote === 'for' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${selectedVote === 'for' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    leftIcon={<CheckCircle size={16} />}
                    onClick={() => {
                      setSelectedVote('for');
                      setShowVoteConfirmation(true);
                    }}
                  >
                    Vote For
                  </Button>
                  
                  <Button
                    variant={selectedVote === 'against' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${selectedVote === 'against' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    leftIcon={<XCircle size={16} />}
                    onClick={() => {
                      setSelectedVote('against');
                      setShowVoteConfirmation(true);
                    }}
                  >
                    Vote Against
                  </Button>
                  
                  <Button
                    variant={selectedVote === 'abstain' ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${selectedVote === 'abstain' ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    leftIcon={<AlertCircle size={16} />}
                    onClick={() => {
                      setSelectedVote('abstain');
                      setShowVoteConfirmation(true);
                    }}
                  >
                    Abstain
                  </Button>
                </div>

                {showVoteConfirmation && selectedVote && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Confirm Your Vote
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      You are about to vote <strong>{selectedVote}</strong> on this proposal.
                      This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleVote}
                        loading={isVoting}
                        disabled={isVoting}
                      >
                        {isVoting ? 'Submitting...' : 'Confirm Vote'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowVoteConfirmation(false);
                          setSelectedVote(null);
                        }}
                        disabled={isVoting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {proposal.userHasVoted && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Vote</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">
                    Voted {proposal.userVote}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {parseFloat(votingPower).toFixed(2)} ERLD
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposal Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Info</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <User size={14} />
                    <span>Proposed by</span>
                  </div>
                  <span className="font-mono text-gray-900">
                    {formatAddress(proposal.proposer)}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span>Started</span>
                  </div>
                  <span className="text-gray-900">
                    {formatDate(proposal.startTime)}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Clock size={14} />
                    <span>Ends</span>
                  </div>
                  <span className="text-gray-900">
                    {formatDate(proposal.endTime)}
                  </span>
                  {isActive && !hasEnded && (
                    <div className="text-blue-600 font-medium mt-1">
                      {getTimeRemaining()}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Users size={14} />
                    <span>Required Quorum</span>
                  </div>
                  <span className="text-gray-900">
                    {proposal.requiredQuorum.toLocaleString()} votes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}