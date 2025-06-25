'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { EnrichedPropertyData, PropertyMetadata, PropertyValuation } from '@/types';

export interface PropertyData {
  id: string;
  tokenId: number;
  address: string;
  city: string;
  state: string;
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Mixed-Use';
  estimatedValue: number;
  monthlyRent: number;
  acquisitionPrice: number;
  acquisitionDate: string;
  imageUrl?: string;
  metadataURI: string;
  confidenceScore: number;
  lastValuationUpdate: string;
  roiPercentage: number;
  status: 'Active' | 'Pending' | 'Under Review';
  floorplanUrl?: string;
  galleryImages?: string[];
}

// Mock property data for development
const MOCK_PROPERTIES: PropertyData[] = [
  {
    id: 'prop-1',
    tokenId: 1,
    address: '123 Maple Street',
    city: 'Austin',
    state: 'TX',
    propertyType: 'Residential',
    estimatedValue: 650000,
    monthlyRent: 3200,
    acquisitionPrice: 580000,
    acquisitionDate: '2024-01-15',
    imageUrl: '/images/Austin_TX.webp',
    galleryImages: ['/images/Austin_TX.webp'],
    metadataURI: 'https://api.emeralddao.com/metadata/1',
    confidenceScore: 92,
    lastValuationUpdate: '2024-06-20',
    roiPercentage: 12.07,
    status: 'Active'
  },
  {
    id: 'prop-2',
    tokenId: 2,
    address: '456 Oak Avenue',
    city: 'Denver',
    state: 'CO',
    propertyType: 'Commercial',
    estimatedValue: 1200000,
    monthlyRent: 8500,
    acquisitionPrice: 1050000,
    acquisitionDate: '2024-02-10',
    imageUrl: '/images/Denver.webp',
    metadataURI: 'https://api.emeralddao.com/metadata/2',
    confidenceScore: 89,
    lastValuationUpdate: '2024-06-18',
    roiPercentage: 14.29,
    status: 'Active'
  },
  {
    id: 'prop-3',
    tokenId: 3,
    address: '789 Pine Road',
    city: 'Nashville',
    state: 'TN',
    propertyType: 'Residential',
    estimatedValue: 485000,
    monthlyRent: 2400,
    acquisitionPrice: 450000,
    acquisitionDate: '2024-03-05',
    imageUrl: '/images/Nashville.webp',
    floorplanUrl: '/images/Nashville_floorplan.png',
    galleryImages: ['/images/Nashville.webp'],
    metadataURI: 'https://api.emeralddao.com/metadata/3',
    confidenceScore: 85,
    lastValuationUpdate: '2024-06-22',
    roiPercentage: 7.78,
    status: 'Active'
  },
  {
    id: 'prop-4',
    tokenId: 4,
    address: '321 Cedar Lane',
    city: 'Portland',
    state: 'OR',
    propertyType: 'Mixed-Use',
    estimatedValue: 850000,
    monthlyRent: 5200,
    acquisitionPrice: 780000,
    acquisitionDate: '2024-04-12',
    imageUrl: '/images/Portland.webp',
    metadataURI: 'https://api.emeralddao.com/metadata/4',
    confidenceScore: 78,
    lastValuationUpdate: '2024-06-19',
    roiPercentage: 8.97,
    status: 'Under Review'
  },
  {
    id: 'prop-5',
    tokenId: 5,
    address: '654 Elm Street',
    city: 'Seattle',
    state: 'WA',
    propertyType: 'Industrial',
    estimatedValue: 2100000,
    monthlyRent: 15000,
    acquisitionPrice: 1900000,
    acquisitionDate: '2024-05-20',
    imageUrl: '/images/Seattle.webp',
    metadataURI: 'https://api.emeralddao.com/metadata/5',
    confidenceScore: 94,
    lastValuationUpdate: '2024-06-21',
    roiPercentage: 10.53,
    status: 'Pending'
  },
  {
    id: 'prop-6',
    tokenId: 6,
    address: '987 Birch Boulevard',
    city: 'Miami',
    state: 'FL',
    propertyType: 'Residential',
    estimatedValue: 750000,
    monthlyRent: 4100,
    acquisitionPrice: 680000,
    acquisitionDate: '2024-06-01',
    imageUrl: '/images/Miami.webp',
    galleryImages: ['/images/Miami.webp'],
    metadataURI: 'https://api.emeralddao.com/metadata/6',
    confidenceScore: 91,
    lastValuationUpdate: '2024-06-23',
    roiPercentage: 10.29,
    status: 'Active'
  }
];

export function usePropertyData() {
  const { address } = useAccount();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Get total properties from smart contract
  const { data: totalProperties, isLoading: totalLoading } = useReadContract({
    address: CONTRACT_CONFIG.propertyFactory.address,
    abi: CONTRACT_CONFIG.propertyFactory.abi,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 60000, // Refetch every minute
    },
  });

  // Get max supply for context
  const { data: maxSupply } = useReadContract({
    address: CONTRACT_CONFIG.propertyFactory.address,
    abi: CONTRACT_CONFIG.propertyFactory.abi,
    functionName: 'maxSupply',
    query: {
      refetchInterval: 300000, // Refetch every 5 minutes
    },
  });

  // Simulate loading real property data
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In production, this would fetch from:
        // 1. Smart contract for tokenIds and ownership
        // 2. IPFS/API for metadata
        // 3. Chainlink Oracle for current valuations
        
        // For now, use mock data with some randomization
        const enrichedProperties = MOCK_PROPERTIES.map(prop => ({
          ...prop,
          // Add some realistic variation to values
          estimatedValue: Math.floor(prop.estimatedValue * (0.95 + Math.random() * 0.1)),
          monthlyRent: Math.floor(prop.monthlyRent * (0.95 + Math.random() * 0.1)),
          confidenceScore: Math.floor(prop.confidenceScore * (0.9 + Math.random() * 0.1)),
          // Randomize recent update times
          lastValuationUpdate: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString().split('T')[0]
        }));

        // Recalculate ROI based on current values
        const propertiesWithROI = enrichedProperties.map(prop => ({
          ...prop,
          roiPercentage: ((prop.estimatedValue - prop.acquisitionPrice) / prop.acquisitionPrice) * 100
        }));

        setProperties(propertiesWithROI);
        setLastRefresh(new Date());
      } catch (err) {
        setError('Failed to load property data. Please try again.');
        console.error('Property data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [address, totalProperties]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (properties.length === 0) {
      return {
        totalValue: 0,
        totalAcquisitionCost: 0,
        totalMonthlyRent: 0,
        averageROI: 0,
        totalAppreciation: 0,
        averageConfidenceScore: 0,
        propertyTypeDistribution: {},
        statusDistribution: {},
      };
    }

    const totalValue = properties.reduce((sum, prop) => sum + prop.estimatedValue, 0);
    const totalAcquisitionCost = properties.reduce((sum, prop) => sum + prop.acquisitionPrice, 0);
    const totalMonthlyRent = properties.reduce((sum, prop) => sum + prop.monthlyRent, 0);
    const averageROI = properties.reduce((sum, prop) => sum + prop.roiPercentage, 0) / properties.length;
    const totalAppreciation = totalValue - totalAcquisitionCost;
    const averageConfidenceScore = properties.reduce((sum, prop) => sum + prop.confidenceScore, 0) / properties.length;

    // Property type distribution
    const propertyTypeDistribution = properties.reduce((acc, prop) => {
      acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = properties.reduce((acc, prop) => {
      acc[prop.status] = (acc[prop.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValue,
      totalAcquisitionCost,
      totalMonthlyRent,
      averageROI,
      totalAppreciation,
      averageConfidenceScore,
      propertyTypeDistribution,
      statusDistribution,
    };
  }, [properties]);

  // Refresh function
  const refreshProperties = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this would trigger a refetch from contracts and APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last refresh time
      setLastRefresh(new Date());
      
      // Trigger a re-render with updated data
      const event = new CustomEvent('refreshProperties');
      window.dispatchEvent(event);
    } catch (err) {
      setError('Failed to refresh property data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get property by ID
  const getProperty = (id: string) => {
    return properties.find(prop => prop.id === id);
  };

  // Get properties by status
  const getPropertiesByStatus = (status: PropertyData['status']) => {
    return properties.filter(prop => prop.status === status);
  };

  // Get properties by type
  const getPropertiesByType = (type: PropertyData['propertyType']) => {
    return properties.filter(prop => prop.propertyType === type);
  };

  return {
    // Data
    properties,
    portfolioMetrics,
    
    // Contract data
    totalProperties: totalProperties ? Number(totalProperties) : 0,
    maxSupply: maxSupply ? Number(maxSupply) : 0,
    
    // Loading states
    isLoading: isLoading || totalLoading,
    error,
    lastRefresh,
    
    // Actions
    refreshProperties,
    getProperty,
    getPropertiesByStatus,
    getPropertiesByType,
    
    // Computed values
    hasProperties: properties.length > 0,
    activeProperties: getPropertiesByStatus('Active').length,
    pendingProperties: getPropertiesByStatus('Pending').length,
    underReviewProperties: getPropertiesByStatus('Under Review').length,
  };
}

// Hook for individual property valuation
export function usePropertyValuation(propertyId: string | undefined) {
  const { data: valuation, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.oracle.address,
    abi: CONTRACT_CONFIG.oracle.abi,
    functionName: 'getPropertyValuation',
    args: propertyId ? [propertyId] : undefined,
    query: {
      enabled: !!propertyId,
      refetchInterval: 300000, // 5 minutes
    },
  });

  return {
    valuation,
    isLoading,
    refetch,
  };
}

// Hook for property acquisition proposals
export function usePropertyProposals() {
  const { data: activeProposalIds, isLoading } = useReadContract({
    address: CONTRACT_CONFIG.propertyAcquisition.address,
    abi: CONTRACT_CONFIG.propertyAcquisition.abi,
    functionName: 'getActiveProposals',
    query: {
      refetchInterval: 30000, // 30 seconds
    },
  });

  return {
    activeProposalIds: activeProposalIds || [],
    isLoading,
  };
}