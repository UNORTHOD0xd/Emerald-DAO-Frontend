'use client';

import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';

interface OracleStatusIndicatorProps {
  hasRealData: boolean;
  isLoading: boolean;
  error?: string | null;
  contractAddress: string;
  className?: string;
}

export const OracleStatusIndicator: React.FC<OracleStatusIndicatorProps> = ({
  hasRealData,
  isLoading,
  error,
  contractAddress,
  className = '',
}) => {
  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: <Loader2 size={16} className="animate-spin text-blue-600" />,
        label: 'Calling Chainlink DON...',
        variant: 'info' as const,
        description: 'Fetching data from decentralized oracle network'
      };
    }
    
    if (error) {
      return {
        icon: <AlertCircle size={16} className="text-red-600" />,
        label: 'Oracle Call Failed',
        variant: 'error' as const,
        description: 'Falling back to demo data'
      };
    }
    
    if (hasRealData) {
      return {
        icon: <CheckCircle2 size={16} className="text-green-600" />,
        label: 'Live Chainlink Data',
        variant: 'success' as const,
        description: 'Data served by Chainlink DON'
      };
    }
    
    return {
      icon: <Activity size={16} className="text-orange-600" />,
      label: 'Demo Simulation',
      variant: 'warning' as const,
      description: 'Using simulated oracle data'
    };
  };

  const status = getStatusInfo();

  return (
    <Card className={`border-l-4 ${
      status.variant === 'success' ? 'border-l-green-500' :
      status.variant === 'error' ? 'border-l-red-500' :
      status.variant === 'warning' ? 'border-l-orange-500' :
      'border-l-blue-500'
    } ${className}`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.icon}
              <span className="font-medium text-sm">{status.label}</span>
            </div>
            <Badge variant={status.variant} size="sm">
              {hasRealData ? 'Real' : 'Demo'}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600">{status.description}</p>
          
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Oracle Contract:</span>
              <code className="bg-gray-100 px-1 rounded text-xs">
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </code>
            </div>
            
            {hasRealData && (
              <div className="mt-1 text-green-600 font-medium">
                ✓ Successfully connected to Chainlink DON
              </div>
            )}
            
            {!hasRealData && !isLoading && (
              <div className="mt-1 text-orange-600">
                ⚠ No oracle data found - using simulation
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};