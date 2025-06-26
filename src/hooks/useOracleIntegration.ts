'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';

// Define Request Types enum to match contract
export const REQUEST_TYPES = {
  FULL: 0,
  PRICE_ONLY: 1,
  RENT_ONLY: 2,
  MARKET_ANALYSIS: 3,
} as const;

export interface OracleValuationData {
  estimatedValue: bigint;
  rentEstimate: bigint;
  lastUpdated: bigint;
  confidenceScore: bigint;
  dataSource: string;
  isActive: boolean;
}

export interface OracleRequest {
  requestId: string;
  propertyIdentifier: string;
  requestType: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  transactionHash?: string;
}

export function useOracleIntegration() {
  const { address, isConnected } = useAccount();
  const [currentRequest, setCurrentRequest] = useState<OracleRequest | null>(null);
  const [valuationData, setValuationData] = useState<OracleValuationData | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract write hook for oracle requests
  const { writeContract, data: requestHash, isPending: isWritePending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isRequestConfirmed } = useWaitForTransactionReceipt({
    hash: requestHash,
  });

  // Function to generate mock valuation data (simulating the Chainlink Functions response)
  const generateMockValuation = useCallback((propertyIdentifier: string): OracleValuationData => {
    // Create deterministic hash from property identifier
    const hash = propertyIdentifier.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Generate realistic property values based on hash
    const baseValue = 400000 + (Math.abs(hash) % 600000); // $400k - $1M
    const rentMultiplier = 0.008 + (Math.abs(hash) % 1000) / 100000; // 0.8% - 1.8% of value monthly
    const confidence = 75 + (Math.abs(hash) % 25); // 75-100%
    
    return {
      estimatedValue: parseEther(baseValue.toString()),
      rentEstimate: parseEther((baseValue * rentMultiplier / 12).toString()), // Monthly rent
      lastUpdated: BigInt(Math.floor(Date.now() / 1000)),
      confidenceScore: BigInt(confidence),
      dataSource: 'Chainlink Real Estate Oracle v2.0',
      isActive: true,
    };
  }, []);

  // Read existing valuation data from contract
  const { data: existingValuation, refetch: refetchValuation } = useReadContract({
    address: CONTRACT_CONFIG.oracle.address,
    abi: CONTRACT_CONFIG.oracle.abi,
    functionName: 'getPropertyValuation',
    args: currentRequest?.propertyIdentifier ? [currentRequest.propertyIdentifier] : undefined,
    query: {
      enabled: !!currentRequest?.propertyIdentifier,
    },
  });

  // Request property valuation from the oracle
  const requestValuation = useCallback(async (
    propertyIdentifier: string, 
    requestType: keyof typeof REQUEST_TYPES = 'FULL'
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsRequesting(true);
    setError(null);

    try {
      console.log(`Requesting valuation for property: ${propertyIdentifier}`);
      
      const request: OracleRequest = {
        requestId: `temp_${Date.now()}`,
        propertyIdentifier,
        requestType: REQUEST_TYPES[requestType],
        status: 'PENDING',
        timestamp: Date.now(),
      };

      setCurrentRequest(request);

      // Make the actual contract call
      writeContract({
        address: CONTRACT_CONFIG.oracle.address,
        abi: CONTRACT_CONFIG.oracle.abi,
        functionName: 'requestPropertyValuation',
        args: [propertyIdentifier, REQUEST_TYPES[requestType]],
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request valuation');
      setIsRequesting(false);
      throw err;
    }
  }, [isConnected, address, writeContract]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isRequestConfirmed && requestHash && currentRequest) {
      console.log(`Oracle request confirmed: ${requestHash}`);
      
      // Capture the property identifier to avoid stale closure
      const propertyIdentifier = currentRequest.propertyIdentifier;
      
      setCurrentRequest(prev => prev ? {
        ...prev,
        status: 'PROCESSING',
        transactionHash: requestHash,
      } : null);

      // Simulate oracle processing time and response
      // In production, this would be handled by Chainlink Functions
      setTimeout(() => {
        console.log('Generating oracle response for:', propertyIdentifier);
        const mockData = generateMockValuation(propertyIdentifier);
        setValuationData(mockData);
        
        setCurrentRequest(prev => prev ? {
          ...prev,
          status: 'COMPLETED',
        } : null);
        
        console.log('Mock oracle response generated:', mockData);
        setIsRequesting(false);
      }, 5000); // 5 second delay to simulate oracle processing
    }
  }, [isRequestConfirmed, requestHash, generateMockValuation]);

  // Handle errors
  useEffect(() => {
    if (requestHash && !isRequestConfirmed && !isConfirming && !isWritePending) {
      // If we have a hash but transaction failed
      setTimeout(() => {
        if (currentRequest?.status === 'PENDING') {
          setCurrentRequest(prev => prev ? { ...prev, status: 'FAILED' } : null);
          setError('Oracle request transaction failed');
          setIsRequesting(false);
        }
      }, 30000); // 30 second timeout
    }
  }, [requestHash, isRequestConfirmed, isConfirming, isWritePending, currentRequest]);

  // Check for existing valuation data
  useEffect(() => {
    if (existingValuation && Array.isArray(existingValuation) && existingValuation.length >= 6) {
      const [estimatedValue, rentEstimate, lastUpdated, confidenceScore, dataSource, isActive] = existingValuation;
      
      setValuationData({
        estimatedValue: estimatedValue as bigint,
        rentEstimate: rentEstimate as bigint,
        lastUpdated: lastUpdated as bigint,
        confidenceScore: confidenceScore as bigint,
        dataSource: dataSource as string,
        isActive: isActive as boolean,
      });
    }
  }, [existingValuation]);

  // Get formatted valuation data for UI display
  const getFormattedValuation = useCallback(() => {
    if (!valuationData) return null;

    return {
      estimatedValueUSD: Number(valuationData.estimatedValue) / 1e18,
      monthlyRentUSD: Number(valuationData.rentEstimate) / 1e18,
      confidenceScore: Number(valuationData.confidenceScore),
      dataSource: valuationData.dataSource,
      lastUpdated: new Date(Number(valuationData.lastUpdated) * 1000),
      isActive: valuationData.isActive,
    };
  }, [valuationData]);

  // Reset function
  const reset = useCallback(() => {
    setCurrentRequest(null);
    setValuationData(null);
    setIsRequesting(false);
    setError(null);
  }, []);

  return {
    // State
    currentRequest,
    valuationData,
    isRequesting: isRequesting || isWritePending || isConfirming,
    error,
    
    // Actions
    requestValuation,
    reset,
    refetchValuation,
    
    // Computed values
    hasValuation: !!valuationData,
    isProcessing: currentRequest?.status === 'PROCESSING',
    isCompleted: currentRequest?.status === 'COMPLETED',
    isFailed: currentRequest?.status === 'FAILED',
    requestHash,
    
    // Formatted data
    formattedValuation: getFormattedValuation(),
    
    // Helper functions
    generateMockValuation,
  };
}