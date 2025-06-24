'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, VOTE_SUPPORT } from '@/lib/contracts';
import { useEmeraldDAO } from './useEmeraldDAO';

export interface VoteResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function useGovernanceVoting() {
  const { address, isConnected } = useAccount();
  const { canVote, votingPower } = useEmeraldDAO();
  const [isVoting, setIsVoting] = useState(false);

  // Contract write hook for voting
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const castVote = async (
    proposalId: number, 
    support: 'for' | 'against' | 'abstain'
  ): Promise<VoteResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    if (!canVote) {
      return {
        success: false,
        error: 'Insufficient ERLD tokens to vote'
      };
    }

    setIsVoting(true);

    try {
      // Convert support string to contract enum
      let supportValue: number;
      switch (support) {
        case 'against':
          supportValue = VOTE_SUPPORT.AGAINST;
          break;
        case 'for':
          supportValue = VOTE_SUPPORT.FOR;
          break;
        case 'abstain':
          supportValue = VOTE_SUPPORT.ABSTAIN;
          break;
        default:
          throw new Error('Invalid vote support value');
      }

      console.log(`Casting vote: ${support} (${supportValue}) on proposal ${proposalId}`);

      await writeContract({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'castVote',
        args: [BigInt(proposalId), supportValue],
      });

      return {
        success: true,
        transactionHash: hash,
      };
    } catch (error: any) {
      console.error('Failed to cast vote:', error);
      return {
        success: false,
        error: error.message || 'Failed to cast vote'
      };
    } finally {
      setIsVoting(false);
    }
  };

  const castVoteWithReason = async (
    proposalId: number,
    support: 'for' | 'against' | 'abstain',
    reason: string
  ): Promise<VoteResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    if (!canVote) {
      return {
        success: false,
        error: 'Insufficient ERLD tokens to vote'
      };
    }

    setIsVoting(true);

    try {
      // Convert support string to contract enum
      let supportValue: number;
      switch (support) {
        case 'against':
          supportValue = VOTE_SUPPORT.AGAINST;
          break;
        case 'for':
          supportValue = VOTE_SUPPORT.FOR;
          break;
        case 'abstain':
          supportValue = VOTE_SUPPORT.ABSTAIN;
          break;
        default:
          throw new Error('Invalid vote support value');
      }

      console.log(`Casting vote with reason: ${support} (${supportValue}) on proposal ${proposalId}`);

      // For now, we'll use the basic castVote since castVoteWithReason isn't in our ABI
      // In production, you'd extend the ABI to include castVoteWithReason
      await writeContract({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'castVote',
        args: [BigInt(proposalId), supportValue],
      });

      return {
        success: true,
        transactionHash: hash,
      };
    } catch (error: any) {
      console.error('Failed to cast vote with reason:', error);
      return {
        success: false,
        error: error.message || 'Failed to cast vote'
      };
    } finally {
      setIsVoting(false);
    }
  };

  return {
    castVote,
    castVoteWithReason,
    isVoting: isVoting || isPending || isConfirming,
    canVote,
    votingPower,
    transactionHash: hash,
    isSuccess,
    error: error?.message,
  };
}

// Hook for delegation functionality
export function useVotingDelegation() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const delegateVotes = async (delegatee: string): Promise<VoteResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      console.log(`Delegating votes to: ${delegatee}`);

      await writeContract({
        address: CONTRACT_CONFIG.token.address,
        abi: CONTRACT_CONFIG.token.abi,
        functionName: 'delegate',
        args: [delegatee as `0x${string}`],
      });

      return {
        success: true,
        transactionHash: hash,
      };
    } catch (error: any) {
      console.error('Failed to delegate votes:', error);
      return {
        success: false,
        error: error.message || 'Failed to delegate votes'
      };
    }
  };

  const selfDelegate = async (): Promise<VoteResult> => {
    if (!address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    return delegateVotes(address);
  };

  return {
    delegateVotes,
    selfDelegate,
    isDelegating: isPending || isConfirming,
    transactionHash: hash,
    isSuccess,
    error: error?.message,
  };
}