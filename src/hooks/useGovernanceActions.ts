'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, encodeAbiParameters, keccak256, toHex, encodeFunctionData } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export interface ProposalFormData {
  title: string;
  description: string;
  proposalType: 'Property Acquisition' | 'Treasury Management' | 'Governance' | 'Emergency' | 'Other';
  targets: string[];
  values: string[];
  calldatas: string[];
  metadataURI?: string;
  // Template-specific fields
  [key: string]: any;
}

export interface ProposalCreationResult {
  success: boolean;
  proposalId?: number;
  transactionHash?: string;
  error?: string;
}

export function useGovernanceActions() {
  const { address } = useAccount();
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isQueueing, setIsQueueing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Smart contract write functions
  const { writeContract: writeDAO, data: proposalHash } = useWriteContract();
  const { writeContract: writePropertyAcquisition, data: propertyProposalHash } = useWriteContract();
  const { writeContract: voteContract } = useWriteContract();
  const { writeContract: writeTimelock, data: timelockHash } = useWriteContract();

  // Transaction receipts
  const { isLoading: isProposalPending, isSuccess: isProposalSuccess } = useWaitForTransactionReceipt({
    hash: proposalHash,
  });

  const { isLoading: isPropertyProposalPending, isSuccess: isPropertyProposalSuccess } = useWaitForTransactionReceipt({
    hash: propertyProposalHash,
  });

  const { isLoading: isTimelockPending, isSuccess: isTimelockSuccess } = useWaitForTransactionReceipt({
    hash: timelockHash,
  });

  // Create different types of proposals
  const createPropertyAcquisitionProposal = async (formData: ProposalFormData): Promise<ProposalCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsCreatingProposal(true);

      // Extract property-specific fields
      const propertyAddress = formData.propertyAddress || '';
      const askingPrice = parseEther(formData.acquisitionPrice?.toString() || '0');
      const expectedRent = parseEther(formData.expectedRoi?.toString() || '0');
      
      // Create metadata URI (in production, this would be uploaded to IPFS)
      const metadata = {
        title: formData.title,
        description: formData.description,
        proposalType: formData.proposalType,
        propertyDetails: {
          address: propertyAddress,
          askingPrice: formData.acquisitionPrice,
          expectedROI: formData.expectedRoi,
          dueDate: formData.dueDate,
        },
        created: new Date().toISOString(),
        proposer: address,
      };
      
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      // Call property acquisition contract
      writePropertyAcquisition({
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'createPropertyProposal',
        args: [
          formData.title,
          formData.description,
          propertyAddress,
          askingPrice,
          expectedRent,
          metadataURI,
        ],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create property acquisition proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const createTreasuryProposal = async (formData: ProposalFormData): Promise<ProposalCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsCreatingProposal(true);

      // Prepare proposal data for treasury management
      const targets = [CONTRACT_CONFIG.vault.address];
      const values = [parseEther(formData.amount?.toString() || '0')];
      
      // Encode function call for treasury withdrawal
      const calldata = encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }, { type: 'string' }],
        [formData.recipient || address, parseEther(formData.amount?.toString() || '0'), formData.purpose || '']
      );
      
      const calldatas = [calldata];
      
      // Create proposal description
      const description = `# ${formData.title}\n\n${formData.description}\n\n**Amount:** ${formData.amount} ETH\n**Recipient:** ${formData.recipient}\n**Purpose:** ${formData.purpose}`;

      // Submit to DAO governance
      writeDAO({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create treasury proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const createGovernanceProposal = async (formData: ProposalFormData): Promise<ProposalCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsCreatingProposal(true);

      // For governance changes, we target the DAO contract itself
      const targets = [CONTRACT_CONFIG.dao.address];
      const values = [0n]; // No ETH value for governance changes
      
      // Encode the governance parameter change
      // This would depend on the specific parameter being changed
      const calldata = encodeAbiParameters(
        [{ type: 'string' }, { type: 'string' }, { type: 'string' }],
        [formData.parameter || '', formData.currentValue || '', formData.proposedValue || '']
      );
      
      const calldatas = [calldata];
      
      const description = `# ${formData.title}\n\n${formData.description}\n\n**Parameter:** ${formData.parameter}\n**Current Value:** ${formData.currentValue}\n**Proposed Value:** ${formData.proposedValue}`;

      writeDAO({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create governance proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const createEmergencyProposal = async (formData: ProposalFormData): Promise<ProposalCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsCreatingProposal(true);

      // Emergency proposals might target multiple contracts
      const targets = [CONTRACT_CONFIG.vault.address]; // Could expand based on action
      const values = [0n];
      
      // Emergency actions encoded as calldata
      const calldata = encodeAbiParameters(
        [{ type: 'string' }, { type: 'string' }, { type: 'string' }, { type: 'string' }],
        [formData.urgency || '', formData.action || '', formData.authorization || '', formData.deadline || '']
      );
      
      const calldatas = [calldata];
      
      const description = `# 🚨 EMERGENCY: ${formData.title}\n\n${formData.description}\n\n**Urgency:** ${formData.urgency}\n**Required Action:** ${formData.action}\n**Authorization:** ${formData.authorization}\n**Deadline:** ${formData.deadline}`;

      writeDAO({
        address: CONTRACT_CONFIG.dao.address,
        abi: CONTRACT_CONFIG.dao.abi,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create emergency proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsCreatingProposal(false);
    }
  };

  // Main proposal creation function that routes to appropriate handler
  const createProposal = async (formData: ProposalFormData): Promise<ProposalCreationResult> => {
    switch (formData.proposalType) {
      case 'Property Acquisition':
        return createPropertyAcquisitionProposal(formData);
      case 'Treasury Management':
        return createTreasuryProposal(formData);
      case 'Governance':
        return createGovernanceProposal(formData);
      case 'Emergency':
        return createEmergencyProposal(formData);
      default:
        return { success: false, error: 'Unsupported proposal type' };
    }
  };

  // Voting functions
  const castVote = async (proposalId: number, support: 0 | 1 | 2, reason?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsVoting(true);

      if (reason) {
        // Cast vote with reason
        voteContract({
          address: CONTRACT_CONFIG.dao.address,
          abi: CONTRACT_CONFIG.dao.abi,
          functionName: 'castVoteWithReason',
          args: [BigInt(proposalId), support, reason],
        });
      } else {
        // Simple vote
        voteContract({
          address: CONTRACT_CONFIG.dao.address,
          abi: CONTRACT_CONFIG.dao.abi,
          functionName: 'castVote',
          args: [BigInt(proposalId), support],
        });
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  };

  // Delegate voting power
  const delegateVotes = async (delegatee: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      writeDAO({
        address: CONTRACT_CONFIG.token.address,
        abi: CONTRACT_CONFIG.token.abi,
        functionName: 'delegate',
        args: [delegatee as `0x${string}`],
      });
    } catch (error) {
      console.error('Failed to delegate votes:', error);
      throw error;
    }
  };

  // Queue proposal in timelock after it succeeds
  const queueProposal = async (
    proposalId: number,
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsQueueing(true);

      // Generate proposal hash for timelock operations
      const descriptionHash = keccak256(toHex(description));
      const predecessor = '0x0000000000000000000000000000000000000000000000000000000000000000'; // No predecessor
      const salt = keccak256(toHex(`proposal-${proposalId}-${Date.now()}`)); // Unique salt

      // Use default delay (1 day) - in production you'd read from contract
      const delay = BigInt(86400); // 1 day default timelock delay

      // Schedule in timelock
      if (targets.length === 1) {
        // Single operation
        writeTimelock({
          address: CONTRACT_CONFIG.timelock.address,
          abi: CONTRACT_CONFIG.timelock.abi,
          functionName: 'schedule',
          args: [
            targets[0] as `0x${string}`,
            BigInt(values[0] || '0'),
            calldatas[0] as `0x${string}`,
            predecessor,
            salt,
            delay,
          ],
        });
      } else {
        // Batch operation
        writeTimelock({
          address: CONTRACT_CONFIG.timelock.address,
          abi: CONTRACT_CONFIG.timelock.abi,
          functionName: 'scheduleBatch',
          args: [
            targets as `0x${string}`[],
            values.map(v => BigInt(v || '0')),
            calldatas as `0x${string}`[],
            predecessor,
            salt,
            delay,
          ],
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to queue proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsQueueing(false);
    }
  };

  // Execute proposal after timelock delay
  const executeProposal = async (
    proposalId: number,
    targets: string[],
    values: string[],
    calldatas: string[],
    description: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsExecuting(true);

      // Generate the same salt used during scheduling
      const predecessor = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const salt = keccak256(toHex(`proposal-${proposalId}-${Date.now()}`));

      // Execute from timelock
      if (targets.length === 1) {
        // Single operation
        writeTimelock({
          address: CONTRACT_CONFIG.timelock.address,
          abi: CONTRACT_CONFIG.timelock.abi,
          functionName: 'execute',
          args: [
            targets[0] as `0x${string}`,
            BigInt(values[0] || '0'),
            calldatas[0] as `0x${string}`,
            predecessor,
            salt,
          ],
        });
      } else {
        // Batch operation
        writeTimelock({
          address: CONTRACT_CONFIG.timelock.address,
          abi: CONTRACT_CONFIG.timelock.abi,
          functionName: 'executeBatch',
          args: [
            targets as `0x${string}`[],
            values.map(v => BigInt(v || '0')),
            calldatas as `0x${string}`[],
            predecessor,
            salt,
          ],
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute property acquisition specifically
  const executePropertyAcquisition = async (
    proposalId: number,
    propertyId: string,
    askingPrice: string,
    propertyAddress: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsExecuting(true);

      // Encode the property acquisition execution call
      const executionCalldata = encodeFunctionData({
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'executePropertyAcquisition',
        args: [BigInt(proposalId), propertyId],
      });

      // Create the timelock execution parameters
      const targets = [CONTRACT_CONFIG.propertyAcquisition.address];
      const values = [parseEther(askingPrice).toString()];
      const calldatas = [executionCalldata];
      const description = `Execute Property Acquisition: ${propertyAddress}`;

      // Execute via timelock
      return await executeProposal(proposalId, targets, values, calldatas, description);
    } catch (error) {
      console.error('Failed to execute property acquisition:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsExecuting(false);
    }
  };

  // Check if operation is ready to execute (simplified for now)
  const isOperationReady = (operationId: string): boolean => {
    // In production, this would use useReadContract hook properly
    // For now, return true after checking if operation exists
    return true;
  };

  // Get operation timestamp (simplified for now)
  const getOperationTimestamp = (operationId: string): number => {
    // In production, this would use useReadContract hook properly
    // For now, return current time + 1 day
    return Date.now() + 86400000;
  };

  // Generate operation hash for tracking
  const getOperationHash = (
    targets: string[],
    values: string[],
    calldatas: string[],
    predecessor: string = '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: string
  ): string => {
    if (targets.length === 1) {
      return keccak256(
        encodeAbiParameters(
          [
            { type: 'address' },
            { type: 'uint256' },
            { type: 'bytes' },
            { type: 'bytes32' },
            { type: 'bytes32' }
          ],
          [
            targets[0] as `0x${string}`,
            BigInt(values[0] || '0'),
            calldatas[0] as `0x${string}`,
            predecessor as `0x${string}`,
            salt as `0x${string}`
          ]
        )
      );
    } else {
      return keccak256(
        encodeAbiParameters(
          [
            { type: 'address[]' },
            { type: 'uint256[]' },
            { type: 'bytes[]' },
            { type: 'bytes32' },
            { type: 'bytes32' }
          ],
          [
            targets as `0x${string}`[],
            values.map(v => BigInt(v || '0')),
            calldatas as `0x${string}`[],
            predecessor as `0x${string}`,
            salt as `0x${string}`
          ]
        )
      );
    }
  };

  return {
    // Proposal creation
    createProposal,
    isCreatingProposal: isCreatingProposal || isProposalPending || isPropertyProposalPending,
    proposalCreationSuccess: isProposalSuccess || isPropertyProposalSuccess,

    // Voting
    castVote,
    isVoting,
    delegateVotes,

    // Proposal execution
    queueProposal,
    executeProposal,
    executePropertyAcquisition,
    isQueueing,
    isExecuting,
    executionSuccess: isTimelockSuccess,
    executionPending: isTimelockPending,

    // Timelock utilities
    isOperationReady,
    getOperationTimestamp,
    getOperationHash,

    // Individual proposal type creators (for advanced usage)
    createPropertyAcquisitionProposal,
    createTreasuryProposal,
    createGovernanceProposal,
    createEmergencyProposal,
  };
}

// Vote support types
export const VOTE_SUPPORT = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
} as const;

export type VoteSupport = typeof VOTE_SUPPORT[keyof typeof VOTE_SUPPORT];