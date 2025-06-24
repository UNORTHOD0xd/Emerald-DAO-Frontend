'use client';

import React, { useState } from 'react';
import { formatEther } from 'viem';
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
import { Card, CardContent, Button, Badge, LoadingSpinner } from '@/components/ui';
import { useRealChainlinkData } from '@/hooks/useRealChainlinkData';

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
  propertyId,
  showDetails = true,
  onRefresh,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use real Chainlink data hook
  const {
    valuationData,
    metrics,
    isLoading,
    refreshData,
    requestValuation,
    hasData,
    hasRealData,
    formatCurrency,
    lastRefresh,
  } = useRealChainlinkData(propertyId);

  // If no data available, show loading or error state
  if (!hasData && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Activity size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-sm">No valuation data available</p>
            {propertyId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => requestValuation()}
              >
                Request Valuation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentValuation = valuationData;

  // Helper functions for this component
  const formatCurrencyBigInt = (amount: bigint) => formatCurrency(parseFloat(formatEther(amount)));


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
    
    try {
      await refreshData();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh valuation:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const confidenceScore = Number(currentValuation?.confidenceScore || 0);
  const isHighConfidence = metrics.isHighConfidence;
  const isRecentUpdate = metrics.isRecentUpdate;

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
              variant={hasRealData ? 'success' : 'info'}
              size="sm"
            >
              {hasRealData ? '🔗 Live Oracle' : '📋 Demo Data'}
            </Badge>
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
              {formatCurrency(metrics.currentValueUSD)}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
              <Shield size={14} className="text-blue-600" />
              <span className="text-sm text-gray-600">Oracle Powered</span>
              {metrics.priceChange24h !== 0 && (
                <Badge 
                  variant={metrics.priceChange24h > 0 ? 'success' : 'error'} 
                  size="sm"
                >
                  {metrics.priceChange24h > 0 ? '+' : ''}{metrics.priceChange24h.toFixed(2)}% 24h
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 mb-1">Monthly Rent Estimate</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(metrics.monthlyRentUSD)}
            </p>
            <div className="flex items-center justify-center md:justify-end space-x-1 mt-1">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {metrics.annualYield.toFixed(2)}% Annual Yield
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
                  {currentValuation?.pricePerSqFt 
                    ? formatCurrencyBigInt(currentValuation.pricePerSqFt)
                    : '$350'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Property Size</p>
                <p className="font-medium">
                  {currentValuation?.sqft 
                    ? Number(currentValuation.sqft).toLocaleString()
                    : '2,100'
                  } sq ft
                </p>
              </div>
              <div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="font-medium">
                  {currentValuation?.bedrooms ? Number(currentValuation.bedrooms) : 3}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="font-medium">
                  {currentValuation?.bathrooms ? Number(currentValuation.bathrooms) : 2}
                </p>
              </div>
            </div>

            {/* Update Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>
                  Last updated: {lastRefresh.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Source: {currentValuation?.dataSource || 'Chainlink Oracle'}</span>
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
              • Updated {metrics.lastUpdateHours.toFixed(0)}h ago
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};