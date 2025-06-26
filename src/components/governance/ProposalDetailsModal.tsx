'use client';

import React, { useState } from 'react';
import { 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Calendar,
  FileText,
  Activity,
  MessageSquare,
  PlayCircle,
  Timer,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader,
  ModalFooter,
  Button, 
  Badge,
  Card,
  CardContent,
  CardHeader,
  ProposalStatusBadge
} from '@/components/ui';
import { ProposalData } from './ProposalCard';
import { useGovernanceActions } from '@/hooks/useGovernanceActions';

interface ProposalDetailsModalProps {
  proposal: ProposalData | null;
  isOpen: boolean;
  onClose: () => void;
  onVote?: (proposalId: number, support: 'for' | 'against' | 'abstain') => Promise<void>;
  userCanVote?: boolean;
  userVotingPower?: number;
}

interface VoteRecord {
  voter: string;
  support: 'for' | 'against' | 'abstain';
  votingPower: number;
  timestamp: string;
  reason?: string;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onVote,
  userCanVote = false,
  userVotingPower = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'votes' | 'execution'>('details');
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(null);
  
  const { 
    queueProposal, 
    executeProposal, 
    executePropertyAcquisition,
    isQueueing, 
    isExecuting,
    getOperationHash 
  } = useGovernanceActions();

  if (!proposal) return null;

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

  const isActive = proposal.status === 'Active';
  const hasEnded = new Date(proposal.endTime) < new Date();
  const timeRemaining = isActive && !hasEnded 
    ? Math.max(0, new Date(proposal.endTime).getTime() - new Date().getTime())
    : 0;

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    if (minutes > 0) return `${minutes} minutes`;
    return 'Less than a minute';
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

  // Mock vote records - in real app, this would come from blockchain events
  const voteRecords: VoteRecord[] = [
    {
      voter: '0x1234567890123456789012345678901234567890',
      support: 'for',
      votingPower: 15000,
      timestamp: '2024-01-15T10:30:00Z',
      reason: 'I believe this proposal will significantly benefit the DAO.'
    },
    {
      voter: '0x2345678901234567890123456789012345678901',
      support: 'against',
      votingPower: 8500,
      timestamp: '2024-01-15T11:45:00Z',
      reason: 'I have concerns about the financial implications.'
    },
    {
      voter: '0x3456789012345678901234567890123456789012',
      support: 'for',
      votingPower: 12000,
      timestamp: '2024-01-15T14:20:00Z',
    },
  ];

  const handleVote = async (support: 'for' | 'against' | 'abstain') => {
    if (!onVote || !userCanVote || proposal.userHasVoted) return;

    setIsVoting(true);
    setSelectedVote(support);

    try {
      await onVote(proposal.proposalId, support);
      // Modal will close or update based on parent component logic
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
      setSelectedVote(null);
    }
  };

  const TabButton: React.FC<{ tab: string; label: string; isActive: boolean }> = ({ 
    tab, 
    label, 
    isActive 
  }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      title={`Proposal #${proposal.proposalId}`}
    >
      <ModalContent>
        {/* Proposal Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{proposal.title}</h2>
              <div className="flex items-center space-x-3 mb-3">
                <ProposalStatusBadge status={proposal.status} />
                <Badge variant="info">{proposal.proposalType}</Badge>
                {proposal.userHasVoted && (
                  <Badge variant="emerald">Voted {proposal.userVote}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">Votes For</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {proposal.votesFor.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600">{votePercentageFor.toFixed(1)}%</p>
                </div>
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Votes Against</p>
                  <p className="text-lg font-bold text-red-900">
                    {proposal.votesAgainst.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600">{votePercentageAgainst.toFixed(1)}%</p>
                </div>
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Abstain</p>
                  <p className="text-lg font-bold text-gray-900">
                    {proposal.votesAbstain.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{votePercentageAbstain.toFixed(1)}%</p>
                </div>
                <AlertCircle className="text-gray-600" size={24} />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Quorum</p>
                  <p className="text-lg font-bold text-blue-900">
                    {quorumPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600">
                    {proposal.quorumReached ? 'Reached' : 'Not reached'}
                  </p>
                </div>
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vote Distribution</span>
                <span>{proposal.totalVotes.toLocaleString()} total votes</span>
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
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quorum Progress</span>
                <span className={proposal.quorumReached ? 'text-green-600' : 'text-gray-600'}>
                  {proposal.totalVotes.toLocaleString()} / {proposal.requiredQuorum.toLocaleString()}
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <TabButton 
            tab="details" 
            label="Details" 
            isActive={activeTab === 'details'} 
          />
          <TabButton 
            tab="votes" 
            label={`Votes (${voteRecords.length})`}
            isActive={activeTab === 'votes'} 
          />
          <TabButton 
            tab="execution" 
            label="Execution" 
            isActive={activeTab === 'execution'} 
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Proposal Information" />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Proposed by:</span>
                          <p className="font-medium">{formatAddress(proposal.proposer)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Proposal Type:</span>
                          <p className="font-medium">{proposal.proposalType}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Status:</span>
                          <p className="font-medium">{proposal.status}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Start Time:</span>
                          <p className="font-medium">{formatDate(proposal.startTime)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">End Time:</span>
                          <p className="font-medium">{formatDate(proposal.endTime)}</p>
                        </div>
                        {isActive && !hasEnded && (
                          <div>
                            <span className="text-sm text-gray-500">Time Remaining:</span>
                            <p className="font-medium text-blue-600">
                              {formatTimeRemaining(timeRemaining)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {proposal.metadata && (
                      <div>
                        <span className="text-sm text-gray-500">Additional Documentation:</span>
                        <div className="mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            rightIcon={<ExternalLink size={16} />}
                            onClick={() => window.open(proposal.metadata, '_blank')}
                          >
                            View Metadata
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'votes' && (
            <div className="space-y-4">
              {voteRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No votes recorded yet</p>
                </div>
              ) : (
                voteRecords.map((vote, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            vote.support === 'for' ? 'bg-green-500' :
                            vote.support === 'against' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{formatAddress(vote.voter)}</span>
                              <Badge 
                                variant={
                                  vote.support === 'for' ? 'success' :
                                  vote.support === 'against' ? 'error' : 'neutral'
                                }
                                size="sm"
                              >
                                {vote.support}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {vote.votingPower.toLocaleString()} voting power • {formatDate(vote.timestamp)}
                            </p>
                            {vote.reason && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                "{vote.reason}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-6">
              {/* Execution Status */}
              <Card>
                <CardHeader title="Execution Status" />
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <ProposalStatusBadge status={proposal.status} />
                      {proposal.status === 'Executed' && proposal.executionTime && (
                        <span className="text-sm text-gray-600">
                          Executed on {formatDate(proposal.executionTime)}
                        </span>
                      )}
                    </div>

                    {/* Execution Workflow */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Execution Workflow</h4>
                      <div className="space-y-3">
                        {/* Step 1: Voting */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            hasEnded ? 'bg-green-100 text-green-600' : proposal.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {hasEnded ? <CheckCircle2 size={16} /> : <Vote size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Governance Vote</span>
                              {hasEnded ? (
                                <Badge variant="success" size="sm">Completed</Badge>
                              ) : proposal.status === 'Active' ? (
                                <Badge variant="info" size="sm">In Progress</Badge>
                              ) : (
                                <Badge variant="neutral" size="sm">Pending</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {hasEnded 
                                ? `Voting ended ${formatDate(proposal.endTime)}`
                                : proposal.status === 'Active'
                                ? `${formatTimeRemaining(timeRemaining)} remaining`
                                : 'Voting has not started'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        {hasEnded && (
                          <div className="flex justify-center">
                            <ArrowRight size={16} className="text-gray-400" />
                          </div>
                        )}

                        {/* Step 2: Queue */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            proposal.status === 'Queued' || proposal.status === 'Executed' ? 'bg-green-100 text-green-600' : 
                            proposal.status === 'Succeeded' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {proposal.status === 'Queued' || proposal.status === 'Executed' ? <CheckCircle2 size={16} /> : <Timer size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Timelock Queue</span>
                              {proposal.status === 'Queued' || proposal.status === 'Executed' ? (
                                <Badge variant="success" size="sm">Queued</Badge>
                              ) : proposal.status === 'Succeeded' ? (
                                <Badge variant="warning" size="sm">Ready to Queue</Badge>
                              ) : (
                                <Badge variant="neutral" size="sm">Waiting</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {proposal.status === 'Succeeded' 
                                ? 'Proposal passed and ready to be queued in timelock'
                                : proposal.status === 'Queued'
                                ? 'Queued in timelock with 24-hour delay'
                                : 'Waiting for successful vote completion'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        {(proposal.status === 'Queued' || proposal.status === 'Executed') && (
                          <div className="flex justify-center">
                            <ArrowRight size={16} className="text-gray-400" />
                          </div>
                        )}

                        {/* Step 3: Execute */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            proposal.status === 'Executed' ? 'bg-green-100 text-green-600' : 
                            proposal.status === 'Queued' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {proposal.status === 'Executed' ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Execute Proposal</span>
                              {proposal.status === 'Executed' ? (
                                <Badge variant="success" size="sm">Executed</Badge>
                              ) : proposal.status === 'Queued' ? (
                                <Badge variant="emerald" size="sm">Ready to Execute</Badge>
                              ) : (
                                <Badge variant="neutral" size="sm">Pending</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {proposal.status === 'Executed' 
                                ? `Executed on ${formatDate(proposal.executionTime || '')}`
                                : proposal.status === 'Queued'
                                ? proposal.proposalType === 'Property Acquisition'
                                  ? 'Execute property acquisition and mint NFT'
                                  : 'Execute proposal actions'
                                : 'Waiting for timelock queue'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Execution Requirements */}
              <Card>
                <CardHeader title="Execution Requirements" />
                <CardContent>
                  <ul className="space-y-3">
                    <li className={`flex items-center space-x-3 ${proposal.quorumReached ? 'text-green-600' : ''}`}>
                      {proposal.quorumReached ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>Quorum reached ({quorumPercentage.toFixed(1)}% of {proposal.requiredQuorum.toLocaleString()} required)</span>
                    </li>
                    <li className={`flex items-center space-x-3 ${votePercentageFor > votePercentageAgainst ? 'text-green-600' : 'text-red-600'}`}>
                      {votePercentageFor > votePercentageAgainst ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>Majority support ({votePercentageFor.toFixed(1)}% for, {votePercentageAgainst.toFixed(1)}% against)</span>
                    </li>
                    <li className={`flex items-center space-x-3 ${hasEnded ? 'text-green-600' : 'text-gray-600'}`}>
                      {hasEnded ? <CheckCircle size={16} /> : <Clock size={16} />}
                      <span>Voting period {hasEnded ? 'completed' : 'in progress'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {proposal.status === 'Succeeded' && (
                <Card>
                  <CardHeader title="Available Actions" />
                  <CardContent>
                    <div className="flex flex-col space-y-3">
                      <Button 
                        onClick={async () => {
                          try {
                            const targets = ['0x0000000000000000000000000000000000000000'];
                            const values = ['0'];
                            const calldatas = ['0x'];
                            await queueProposal(proposal.proposalId, targets, values, calldatas, proposal.description);
                          } catch (error) {
                            console.error('Failed to queue proposal:', error);
                          }
                        }}
                        disabled={isQueueing}
                        leftIcon={isQueueing ? <Loader2 size={16} className="animate-spin" /> : <Timer size={16} />}
                        className="w-full"
                      >
                        {isQueueing ? 'Queueing in Timelock...' : 'Queue Proposal for Execution'}
                      </Button>
                      <p className="text-sm text-gray-600">
                        This will queue the proposal in the timelock contract with a 24-hour delay before execution is possible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {proposal.status === 'Queued' && (
                <Card>
                  <CardHeader title="Execute Proposal" />
                  <CardContent>
                    <div className="flex flex-col space-y-3">
                      <Button 
                        onClick={async () => {
                          try {
                            if (proposal.proposalType === 'Property Acquisition') {
                              const propertyId = `property_${proposal.proposalId}`;
                              const askingPrice = '500000';
                              await executePropertyAcquisition(proposal.proposalId, propertyId, askingPrice, proposal.title);
                            } else {
                              const targets = ['0x0000000000000000000000000000000000000000'];
                              const values = ['0'];
                              const calldatas = ['0x'];
                              await executeProposal(proposal.proposalId, targets, values, calldatas, proposal.description);
                            }
                          } catch (error) {
                            console.error('Failed to execute proposal:', error);
                          }
                        }}
                        disabled={isExecuting}
                        leftIcon={isExecuting ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isExecuting ? 'Executing...' : 
                         proposal.proposalType === 'Property Acquisition' ? 'Execute Property Acquisition' : 'Execute Proposal'}
                      </Button>
                      <p className="text-sm text-gray-600">
                        {proposal.proposalType === 'Property Acquisition' 
                          ? 'This will execute the property acquisition, transfer funds, and mint the property NFT.'
                          : 'This will execute the proposal actions through the timelock contract.'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chainlink Integration Info for Property Proposals */}
              {proposal.proposalType === 'Property Acquisition' && (
                <Card>
                  <CardHeader title="Chainlink Oracle Integration" />
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Activity size={16} className="text-blue-600" />
                        <span className="font-medium">Real Estate Valuation Oracle</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        This property acquisition proposal includes Chainlink oracle validation for accurate property valuation and market analysis.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          Upon execution, the oracle data will be used to verify the final acquisition price and update the property NFT metadata with verified valuation information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {isActive && !hasEnded && userCanVote && !proposal.userHasVoted && onVote && (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleVote('against')}
                disabled={isVoting}
                loading={isVoting && selectedVote === 'against'}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Vote Against
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleVote('abstain')}
                disabled={isVoting}
                loading={isVoting && selectedVote === 'abstain'}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Abstain
              </Button>
              <Button 
                onClick={() => handleVote('for')}
                disabled={isVoting}
                loading={isVoting && selectedVote === 'for'}
                className="bg-green-600 hover:bg-green-700"
              >
                Vote For
              </Button>
            </div>
          )}

          {proposal.userHasVoted && (
            <Badge variant="emerald">
              You voted {proposal.userVote} with {userVotingPower.toLocaleString()} voting power
            </Badge>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
};