'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Database,
  Info,
  Link,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { CONTRACT_CONFIG } from '@/lib/contracts';

interface MockOracleRequest {
  propertyId: string;
  address: string;
  requestType: 'FULL' | 'PRICE' | 'RENT' | 'MARKET';
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

interface MockOracleDemoProps {
  propertyAddress: string;
  onComplete: (data: MockOracleRequest['mockData']) => void;
  autoStart?: boolean;
}

export const MockOracleDemo: React.FC<MockOracleDemoProps> = ({
  propertyAddress,
  onComplete,
  autoStart = false,
}) => {
  const [request, setRequest] = useState<MockOracleRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate deterministic mock data based on property address
  const generateMockValuation = (address: string): MockOracleRequest['mockData'] => {
    // Create a hash from the address for consistent results
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const baseValue = 300000 + (Math.abs(hash) % 500000); // $300k - $800k
    const rentMultiplier = 0.008 + (Math.abs(hash) % 1000) / 100000; // 0.8% - 1.8% of value
    const confidence = 70 + (Math.abs(hash) % 30); // 70-100%

    return {
      estimatedValue: Math.round(baseValue),
      rentEstimate: Math.round(baseValue * rentMultiplier / 12), // Monthly rent
      confidenceScore: confidence,
      dataSource: 'Chainlink Real Estate Oracle v2.0',
      pricePerSqFt: Math.round(baseValue / (1200 + (Math.abs(hash) % 2000))),
      bedrooms: 2 + (Math.abs(hash) % 4), // 2-5 bedrooms
      bathrooms: Math.round((1.5 + (Math.abs(hash) % 25) / 10) * 10) / 10, // 1.5-4.0 bathrooms
      sqft: 1200 + (Math.abs(hash) % 2000), // 1200-3200 sqft
    };
  };

  // Start the mock oracle request process
  const startOracleRequest = useCallback(async () => {
    const propertyId = propertyAddress.replace(/\s+/g, '_').toLowerCase();
    
    const newRequest: MockOracleRequest = {
      propertyId,
      address: propertyAddress,
      requestType: 'FULL',
      status: 'PENDING',
      requestTimestamp: Date.now(),
    };

    setRequest(newRequest);
    setIsProcessing(true);
    setProgress(0);

    // Simulate the oracle request process with realistic timing
    const steps = [
      { progress: 20, status: 'PROCESSING', delay: 1000, message: 'Connecting to Chainlink DON...' },
      { progress: 40, status: 'PROCESSING', delay: 1500, message: 'Executing Chainlink Functions...' },
      { progress: 60, status: 'PROCESSING', delay: 2000, message: 'Fetching property data APIs...' },
      { progress: 80, status: 'PROCESSING', delay: 1500, message: 'Processing valuation algorithm...' },
      { progress: 100, status: 'COMPLETED', delay: 1000, message: 'Oracle response received!' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setProgress(step.progress);
      
      if (step.status === 'COMPLETED') {
        const mockData = generateMockValuation(propertyAddress);
        const completedRequest: MockOracleRequest = {
          ...newRequest,
          status: 'COMPLETED',
          completionTimestamp: Date.now(),
          mockData,
        };
        
        setRequest(completedRequest);
        setIsProcessing(false);
        onComplete(mockData);
      }
    }
  }, [propertyAddress, onComplete]);

  // Auto-start the request if specified
  useEffect(() => {
    if (autoStart && propertyAddress && !request) {
      startOracleRequest();
    }
  }, [autoStart, propertyAddress, request, startOracleRequest]);

  const getStatusColor = (status: MockOracleRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: MockOracleRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} className="text-yellow-600" />;
      case 'PROCESSING':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'FAILED':
        return <Activity size={16} className="text-red-600" />;
      default:
        return <Database size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Oracle Request Status */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Database size={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-800">Chainlink Oracle Request</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Link size={14} className="text-blue-600" />
              <span className="text-xs text-blue-600 font-mono">
                {CONTRACT_CONFIG.oracle.address.slice(0, 8)}...
              </span>
            </div>
          </div>

          {request ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <Badge variant="info" size="sm">
                  Property ID: {request.propertyId}
                </Badge>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-blue-700">Request Type:</span>
                  <div className="font-semibold text-blue-800">FULL_VALUATION</div>
                </div>
                <div>
                  <span className="text-blue-700">Requested:</span>
                  <div className="font-semibold text-blue-800">
                    {new Date(request.requestTimestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Completion Details */}
              {request.status === 'COMPLETED' && request.completionTimestamp && (
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Completed in {Math.round((request.completionTimestamp - request.requestTimestamp) / 1000)}s
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-blue-700 mb-3">Ready to request property valuation</p>
              <Button
                onClick={startOracleRequest}
                disabled={isProcessing}
                size="sm"
                leftIcon={<Database size={16} />}
              >
                Request Valuation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oracle Response Data */}
      {request?.mockData && request.status === 'COMPLETED' && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 size={20} className="text-green-600" />
              <h3 className="font-semibold text-green-800">Oracle Valuation Data</h3>
              <Badge variant="success" size="sm">
                {request.mockData.confidenceScore}% Confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Estimated Value:</span>
                  <span className="font-semibold text-green-800">
                    ${request.mockData.estimatedValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Monthly Rent:</span>
                  <span className="font-semibold text-green-800">
                    ${request.mockData.rentEstimate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Price/sqft:</span>
                  <span className="font-semibold text-green-800">
                    ${request.mockData.pricePerSqFt}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Bedrooms:</span>
                  <span className="font-semibold text-green-800">{request.mockData.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Bathrooms:</span>
                  <span className="font-semibold text-green-800">{request.mockData.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">Square Feet:</span>
                  <span className="font-semibold text-green-800">
                    {request.mockData.sqft.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center space-x-2">
                <Info size={14} className="text-green-600" />
                <span className="text-xs text-green-700">
                  Data Source: {request.mockData.dataSource}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Information */}
      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <Info size={16} className="text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Demo Oracle Workflow:</p>
              <ul className="space-y-1 text-xs">
                <li>• Simulates real Chainlink Functions request</li>
                <li>• Uses deterministic mock data for consistency</li>
                <li>• Demonstrates complete oracle integration</li>
                <li>• Ready for production oracle replacement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};