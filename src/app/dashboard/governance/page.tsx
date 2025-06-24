'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Vote, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProposalCard } from '@/components/governance';
import { PropertyAcquisitionForm } from '@/components/property';
import { Button, Input } from '@/components/ui';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { useGovernanceData } from '@/hooks/useGovernanceData';

export default function GovernancePage() {
  const router = useRouter();
  const { canVote, isDAOMember } = useEmeraldDAO();
  const { proposals, isLoading } = useGovernanceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVote = async (proposalId: number, support: 'for' | 'against' | 'abstain') => {
    try {
      // TODO: Implement actual voting logic
      console.log(`Voting ${support} on proposal ${proposalId}`);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCreateProposal = () => {
    router.push('/dashboard/governance/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governance</h1>
          <p className="text-gray-600">
            Participate in DAO decisions and vote on proposals
          </p>
        </div>
        
        {isDAOMember && (
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowPropertyForm(true)}
              leftIcon={<Home size={20} />}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Propose Property
            </Button>
            <Button
              onClick={handleCreateProposal}
              leftIcon={<Plus size={20} />}
              variant="outline"
            >
              Other Proposal
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <Vote className="h-5 w-5 text-emerald-600" />
            <h3 className="font-medium text-gray-900">Total Proposals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{proposals.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <Vote className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Active Proposals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {proposals.filter(p => p.status === 'Active').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <Vote className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Your Voting Power</h3>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {canVote ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={20} />}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="defeated">Defeated</option>
            <option value="executed">Executed</option>
          </select>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          <Vote size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a proposal!'
            }
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              userCanVote={canVote}
              onClick={() => {
                router.push(`/dashboard/governance/${proposal.id}`);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Property Acquisition Form Modal */}
      <PropertyAcquisitionForm
        isOpen={showPropertyForm}
        onClose={() => setShowPropertyForm(false)}
        onSuccess={(proposalId) => {
          console.log('Property proposal created:', proposalId);
          setShowPropertyForm(false);
          // Optionally refresh proposals or show success message
        }}
      />
    </div>
  );
}