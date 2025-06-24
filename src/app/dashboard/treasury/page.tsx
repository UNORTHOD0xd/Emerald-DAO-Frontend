'use client';

import React from 'react';
import { Wallet, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';

export default function TreasuryPage() {
  const { 
    treasuryBalance, 
    treasuryBalanceNumber,
    healthScore, 
    emergencyMode
  } = useEmeraldDAO();

  const healthColor = healthScore >= 80 ? 'text-green-600' : 
                     healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treasury</h1>
          <p className="text-gray-600">
            DAO financial management and health monitoring
          </p>
        </div>
        
        {emergencyMode && (
          <Badge variant="error">
            Emergency Mode Active
          </Badge>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <h3 className="font-medium text-gray-900">Total Balance</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {treasuryBalance} ETH
            </p>
            <p className="text-sm text-gray-600">
              ~${(treasuryBalanceNumber * 2500).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${healthColor}`} />
              <h3 className="font-medium text-gray-900">Health Score</h3>
            </div>
            <p className={`text-2xl font-bold mt-2 ${healthColor}`}>
              {healthScore}/100
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  healthScore >= 80 ? 'bg-green-500' : 
                  healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Monthly Growth</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">+8.3%</p>
            <p className="text-sm text-gray-600">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-gray-900">Risk Level</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-2">Low</p>
            <p className="text-sm text-gray-600">
              Diversified portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Treasury Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Daily Limit</span>
                  <span className="text-gray-900">5.0 ETH remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Monthly Limit</span>
                  <span className="text-gray-900">45.2 ETH remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Multi-sig Active</span>
                <Badge variant="success">✓ Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emergency Mode</span>
                <Badge variant={emergencyMode ? "error" : "success"}>
                  {emergencyMode ? "⚠ Active" : "✓ Normal"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Oracle Updates</span>
                <Badge variant="success">✓ Current</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-8">
        <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Treasury Features Coming Soon</h3>
        <p className="text-gray-600">
          Detailed analytics, withdrawal proposals, and advanced financial controls are being developed.
        </p>
      </div>
    </div>
  );
}