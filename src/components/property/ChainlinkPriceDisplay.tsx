'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardContent, Button, Badge, LoadingSpinner } from '@/components/ui';
import { CONTRACT_CONFIG } from '@/lib/contracts';

interface PropertyValuation {
  estimatedValue: bigint;
  rentEstimate: bigint;
  lastUpdated: bigint;
  confidenceScore: bigint;
  dataSource: string;
  isActive: boolean;
  pricePerSqFt: bigint;
  bedrooms: bigint;
  bathrooms: bigint;
  sqft: bigint;
  lastUpdatedBy: string;
}

interface ChainlinkPriceDisplayProps {
  propertyAddress?: string;
  propertyId?: string;
  showDetails?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const ChainlinkPriceDisplay: React.FC<ChainlinkPriceDisplayProps> = ({
  propertyAddress,
  propertyId,
  showDetails = true,
  onRefresh,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Mock data for demonstration - in production, this would query the Chainlink oracle
  const mockValuation: PropertyValuation = {
    estimatedValue: BigInt(Math.floor(Math.random() * 1000000 + 400000) * 1e18), // Random value between 400k-1.4M
    rentEstimate: BigInt(Math.floor(Math.random() * 3000 + 2000) * 1e18), // Random rent 2k-5k
    lastUpdated: BigInt(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
    confidenceScore: BigInt(Math.floor(Math.random() * 30 + 70)), // 70-100% confidence
    dataSource: 'Chainlink Real Estate Oracle',
    isActive: true,
    pricePerSqFt: BigInt(Math.floor(Math.random() * 200 + 300) * 1e18), // $300-500 per sqft
    bedrooms: BigInt(Math.floor(Math.random() * 4 + 2)), // 2-5 bedrooms
    bathrooms: BigInt(Math.floor(Math.random() * 3 + 2)), // 2-4 bathrooms
    sqft: BigInt(Math.floor(Math.random() * 1500 + 1200)), // 1200-2700 sqft
    lastUpdatedBy: '0x742d35Cc6634C0532925a3b8D4e4F7c38f6e1234',
  };

  // In production, this would be a real contract read
  const { data: valuation, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.oracle.address,
    abi: CONTRACT_CONFIG.oracle.abi,
    functionName: 'getPropertyValuation',
    args: propertyId ? [propertyId] : undefined,
    query: {
      enabled: !!propertyId,
      refetchInterval: 300000, // Refetch every 5 minutes
    },
  });

  // Use mock data for now
  const currentValuation = valuation || mockValuation;

  const formatCurrency = (amount: bigint) => {
    try {
      const formatted = formatEther(amount);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(parseFloat(formatted));
    } catch {
      return '$0';
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceVariant = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefreshTime(new Date());
    
    try {
      await refetch();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh valuation:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const confidenceScore = Number(currentValuation.confidenceScore);
  const isHighConfidence = confidenceScore >= 85;
  const timeSinceUpdate = Date.now() - Number(currentValuation.lastUpdated) * 1000;
  const isRecentUpdate = timeSinceUpdate < 24 * 60 * 60 * 1000; // Within 24 hours

  const calculateYield = () => {
    const monthlyRent = parseFloat(formatEther(currentValuation.rentEstimate));
    const propertyValue = parseFloat(formatEther(currentValuation.estimatedValue));
    const annualRent = monthlyRent * 12;
    
    if (propertyValue > 0) {
      return ((annualRent / propertyValue) * 100).toFixed(2);
    }
    return '0.00';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span className="text-sm text-gray-600">Loading property valuation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Chainlink Valuation</h3>
            <Badge 
              variant={isRecentUpdate ? 'success' : 'warning'}
              size="sm"
            >
              {isRecentUpdate ? 'Recent' : 'Needs Update'}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw 
                size={16} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            }
          >
            Refresh
          </Button>
        </div>

        {/* Main Valuation Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 mb-1">Estimated Property Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentValuation.estimatedValue)}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
              <Shield size={14} className="text-blue-600" />
              <span className="text-sm text-gray-600">Oracle Powered</span>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 mb-1">Monthly Rent Estimate</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(currentValuation.rentEstimate)}
            </p>
            <div className="flex items-center justify-center md:justify-end space-x-1 mt-1">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {calculateYield()}% Annual Yield
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            {isHighConfidence ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <AlertCircle size={16} className="text-yellow-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              Confidence Score
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getConfidenceVariant(confidenceScore)}>
              {confidenceScore}%
            </Badge>
            <span className={`text-sm font-medium ${getConfidenceColor(confidenceScore)}`}>
              {isHighConfidence ? 'High Confidence' : 'Medium Confidence'}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3">
            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Price per Sq Ft</p>
                <p className="font-medium">
                  {formatCurrency(currentValuation.pricePerSqFt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Property Size</p>
                <p className="font-medium">
                  {Number(currentValuation.sqft).toLocaleString()} sq ft
                </p>
              </div>
              <div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="font-medium">{Number(currentValuation.bedrooms)}</p>
              </div>
              <div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="font-medium">{Number(currentValuation.bathrooms)}</p>
              </div>
            </div>

            {/* Update Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>
                  Last updated: {formatDate(currentValuation.lastUpdated)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Source: {currentValuation.dataSource}</span>
              </div>
            </div>
          </div>
        )}

        {/* Oracle Status Indicator */}
        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-xs text-blue-700">
              {currentValuation.isActive ? 'Oracle Active' : 'Oracle Inactive'}
            </span>
            <span className="text-xs text-blue-600">
              • Updated {Math.floor(timeSinceUpdate / (1000 * 60 * 60))}h ago
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};