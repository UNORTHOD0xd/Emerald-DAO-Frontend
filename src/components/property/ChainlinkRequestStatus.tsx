'use client';

import React from 'react';
import { Hash, ExternalLink, Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

interface ChainlinkRequestStatusProps {
  requestHash?: `0x${string}`;
  isRequesting: boolean;
  isConfirmed: boolean;
  error?: string | null;
  onRequestNew?: () => void;
  className?: string;
}

export const ChainlinkRequestStatus: React.FC<ChainlinkRequestStatusProps> = ({
  requestHash,
  isRequesting,
  isConfirmed,
  error,
  onRequestNew,
  className = '',
}) => {
  const getStatusInfo = () => {
    if (isRequesting) {
      return {
        icon: <Activity size={16} className="animate-pulse text-blue-600" />,
        label: 'Submitting Request',
        description: 'Sending transaction to Chainlink DON...',
        variant: 'info' as const,
      };
    }

    if (error) {
      return {
        icon: <AlertCircle size={16} className="text-red-600" />,
        label: 'Request Failed',
        description: error,
        variant: 'error' as const,
      };
    }

    if (requestHash && !isConfirmed) {
      return {
        icon: <Clock size={16} className="text-yellow-600 animate-pulse" />,
        label: 'Awaiting Confirmation',
        description: 'Transaction submitted, waiting for blockchain confirmation...',
        variant: 'warning' as const,
      };
    }

    if (requestHash && isConfirmed) {
      return {
        icon: <CheckCircle2 size={16} className="text-green-600" />,
        label: 'Request Confirmed',
        description: 'Chainlink Functions request successfully submitted!',
        variant: 'success' as const,
      };
    }

    return {
      icon: <Hash size={16} className="text-gray-500" />,
      label: 'Ready to Request',
      description: 'Click below to trigger a new Chainlink Functions request',
      variant: 'neutral' as const,
    };
  };

  const status = getStatusInfo();

  return (
    <Card className={`border-l-4 ${
      status.variant === 'success' ? 'border-l-green-500 bg-green-50' :
      status.variant === 'error' ? 'border-l-red-500 bg-red-50' :
      status.variant === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
      status.variant === 'info' ? 'border-l-blue-500 bg-blue-50' :
      'border-l-gray-500 bg-gray-50'
    } ${className}`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.icon}
              <span className="font-medium text-sm">{status.label}</span>
            </div>
            <Badge variant={status.variant} size="sm">
              {isRequesting ? 'Processing' : 
               isConfirmed ? 'Complete' : 
               error ? 'Failed' : 'Ready'}
            </Badge>
          </div>

          <p className="text-xs text-gray-700">{status.description}</p>

          {requestHash && (
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Transaction Hash:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-xs text-blue-600 font-mono">
                      {requestHash.slice(0, 10)}...{requestHash.slice(-8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${requestHash}`, '_blank')}
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {isConfirmed && (
                <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                  ✓ Your request has been sent to the Chainlink DON. 
                  Oracle data should be available within 1-2 minutes.
                </div>
              )}
            </div>
          )}

          {onRequestNew && !isRequesting && (
            <Button
              onClick={onRequestNew}
              disabled={isRequesting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {requestHash && !error ? 'Request New Valuation' : 'Request Valuation'}
            </Button>
          )}

          {/* Helpful information - Collapsed by default */}
          {!requestHash && (
            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <div className="font-medium mb-1">About Chainlink Functions:</div>
              <div className="text-xs">
                Requests are processed by decentralized oracle nodes and cost LINK tokens.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};