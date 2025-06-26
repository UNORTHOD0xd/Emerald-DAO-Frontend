'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export interface DemoOracleRequest {
  propertyId: string;
  propertyAddress: string;
  requestType: 'FULL';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestTimestamp: number;
  completionTimestamp?: number;
  mockData?: {
    estimatedValue: number;
    rentEstimate: number;
    confidenceScore: number;
    dataSource: string;
    pricePerSqFt: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
  };
}

export interface DemoProposal {
  proposalId: string;
  title: string;
  description: string;
  propertyAddress: string;
  askingPrice: number;
  expectedRent: number;
  oracleData: DemoOracleRequest['mockData'];
  status: 'CREATED' | 'VOTING' | 'QUEUED' | 'EXECUTED';
  createdAt: number;
  executedAt?: number;
  votingResults?: {
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
    result: 'PASSED' | 'FAILED';
  };
}

export function useProposalDemo() {
  const { address, isConnected } = useAccount();
  const [currentDemo, setCurrentDemo] = useState<{
    oracleRequest: DemoOracleRequest | null;
    proposal: DemoProposal | null;
    currentStep: number;
  }>({
    oracleRequest: null,
    proposal: null,
    currentStep: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract interaction hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Generate deterministic mock oracle data
  const generateMockOracleData = useCallback((propertyAddress: string): DemoOracleRequest['mockData'] => {
    const hash = propertyAddress.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const baseValue = 400000 + (Math.abs(hash) % 600000); // $400k - $1M
    const rentMultiplier = 0.008 + (Math.abs(hash) % 1000) / 100000; // 0.8% - 1.8% of value
    const confidence = 75 + (Math.abs(hash) % 25); // 75-100%

    return {
      estimatedValue: Math.round(baseValue),
      rentEstimate: Math.round(baseValue * rentMultiplier / 12),
      confidenceScore: confidence,
      dataSource: 'Chainlink Real Estate Oracle v2.0',
      pricePerSqFt: Math.round(baseValue / (1200 + (Math.abs(hash) % 2000))),
      bedrooms: 2 + (Math.abs(hash) % 4),
      bathrooms: Math.round((1.5 + (Math.abs(hash) % 25) / 10) * 10) / 10,
      sqft: 1200 + (Math.abs(hash) % 2000),
    };
  }, []);

  // Step 1: Request oracle valuation
  const requestOracleValuation = useCallback(async (propertyAddress: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const propertyId = propertyAddress.replace(/\s+/g, '_').toLowerCase();
      
      const oracleRequest: DemoOracleRequest = {
        propertyId,
        propertyAddress,
        requestType: 'FULL',
        status: 'PENDING',
        requestTimestamp: Date.now(),
      };

      setCurrentDemo(prev => ({
        ...prev,
        oracleRequest,
        currentStep: 1,
      }));

      // Simulate oracle request processing
      setTimeout(() => {
        setCurrentDemo(prev => ({
          ...prev,
          oracleRequest: prev.oracleRequest ? {
            ...prev.oracleRequest,
            status: 'PROCESSING',
          } : null,
        }));
      }, 1000);

      // Complete oracle request with mock data
      setTimeout(() => {
        const mockData = generateMockOracleData(propertyAddress);
        const completedRequest: DemoOracleRequest = {
          ...oracleRequest,
          status: 'COMPLETED',
          completionTimestamp: Date.now(),
          mockData,
        };

        setCurrentDemo(prev => ({
          ...prev,
          oracleRequest: completedRequest,
          currentStep: 2,
        }));
        setIsProcessing(false);
      }, 5000);

      return oracleRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request oracle valuation');
      setIsProcessing(false);
      throw err;
    }
  }, [isConnected, address, generateMockOracleData]);

  // Step 2: Create DAO proposal
  const createDAOProposal = useCallback(async (
    title: string,
    description: string,
    propertyAddress: string,
    askingPrice: number,
    expectedRent: number
  ) => {
    if (!currentDemo.oracleRequest?.mockData) {
      throw new Error('Oracle data required before creating proposal');
    }

    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const proposalId = `prop_${Date.now()}`;
      
      // Create proposal metadata
      const metadata = {
        title,
        description,
        propertyDetails: {
          address: propertyAddress,
          askingPrice,
          expectedRent,
          oracleData: currentDemo.oracleRequest.mockData,
        },
        created: new Date().toISOString(),
        proposer: address,
      };

      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      // Create proposal with real contract interaction
      writeContract({
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'createPropertyProposal',
        args: [
          title,
          description,
          propertyAddress,
          parseEther(askingPrice.toString()),
          parseEther(expectedRent.toString()),
          metadataURI,
        ],
      });

      const proposal: DemoProposal = {
        proposalId,
        title,
        description,
        propertyAddress,
        askingPrice,
        expectedRent,
        oracleData: currentDemo.oracleRequest.mockData,
        status: 'CREATED',
        createdAt: Date.now(),
      };

      setCurrentDemo(prev => ({
        ...prev,
        proposal,
        currentStep: 3,
      }));

      return proposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
      setIsProcessing(false);
      throw err;
    }
  }, [currentDemo.oracleRequest, isConnected, address, writeContract]);

  // Step 3: Simulate DAO voting
  const simulateDAOVoting = useCallback(async () => {
    if (!currentDemo.proposal) {
      throw new Error('No proposal to vote on');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Update proposal status to voting
      setCurrentDemo(prev => ({
        ...prev,
        proposal: prev.proposal ? {
          ...prev.proposal,
          status: 'VOTING',
        } : null,
        currentStep: 4,
      }));

      // Simulate voting period (accelerated for demo)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate realistic voting results
      const totalVotes = 175000; // Total ERLD tokens participating
      const forVotes = Math.floor(totalVotes * 0.72); // 72% approval
      const againstVotes = Math.floor(totalVotes * 0.20); // 20% against
      const abstainVotes = totalVotes - forVotes - againstVotes; // Remainder abstain

      const votingResults = {
        forVotes,
        againstVotes,
        abstainVotes,
        result: 'PASSED' as const,
      };

      setCurrentDemo(prev => ({
        ...prev,
        proposal: prev.proposal ? {
          ...prev.proposal,
          status: 'QUEUED',
          votingResults,
        } : null,
        currentStep: 5,
      }));

      setIsProcessing(false);
      return votingResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate voting');
      setIsProcessing(false);
      throw err;
    }
  }, [currentDemo.proposal]);

  // Step 4: Execute proposal
  const executeProposal = useCallback(async () => {
    if (!currentDemo.proposal) {
      throw new Error('No proposal to execute');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate Chainlink Automation execution
      await new Promise(resolve => setTimeout(resolve, 4000));

      setCurrentDemo(prev => ({
        ...prev,
        proposal: prev.proposal ? {
          ...prev.proposal,
          status: 'EXECUTED',
          executedAt: Date.now(),
        } : null,
        currentStep: 6,
      }));

      setIsProcessing(false);
      return currentDemo.proposal.proposalId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute proposal');
      setIsProcessing(false);
      throw err;
    }
  }, [currentDemo.proposal]);

  // Reset demo state
  const resetDemo = useCallback(() => {
    setCurrentDemo({
      oracleRequest: null,
      proposal: null,
      currentStep: 0,
    });
    setIsProcessing(false);
    setError(null);
  }, []);

  // Get current step information
  const getCurrentStepInfo = useCallback(() => {
    const steps = [
      { id: 'property_selection', title: 'Select Property', description: 'Choose a demo property for acquisition' },
      { id: 'oracle_request', title: 'Request Oracle Valuation', description: 'Chainlink Functions validates property data' },
      { id: 'oracle_completed', title: 'Oracle Data Received', description: 'Property valuation completed successfully' },
      { id: 'proposal_creation', title: 'Create DAO Proposal', description: 'Submit property acquisition proposal' },
      { id: 'dao_voting', title: 'DAO Voting', description: 'Community votes on proposal' },
      { id: 'proposal_queued', title: 'Execution Queue', description: 'Proposal queued in Timelock' },
      { id: 'proposal_executed', title: 'Automated Execution', description: 'Chainlink Automation executes purchase' },
    ];

    return {
      currentStep: currentDemo.currentStep,
      totalSteps: steps.length,
      stepInfo: steps[currentDemo.currentStep],
      allSteps: steps,
    };
  }, [currentDemo.currentStep]);

  return {
    // Current state
    currentDemo,
    isProcessing: isProcessing || isPending || isConfirming,
    error,
    isSuccess,
    
    // Actions
    requestOracleValuation,
    createDAOProposal,
    simulateDAOVoting,
    executeProposal,
    resetDemo,
    
    // Utilities
    getCurrentStepInfo,
    generateMockOracleData,
    
    // Computed values
    canCreateProposal: !!currentDemo.oracleRequest?.mockData && currentDemo.oracleRequest.status === 'COMPLETED',
    canVote: currentDemo.proposal?.status === 'CREATED',
    canExecute: currentDemo.proposal?.status === 'QUEUED',
    isCompleted: currentDemo.proposal?.status === 'EXECUTED',
  };
}