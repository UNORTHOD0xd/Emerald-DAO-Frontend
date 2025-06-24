'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Badge, 
  HealthScoreBadge,
  Button 
} from '@/components/ui';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RealTreasuryData } from '@/hooks/useRealTreasuryData';

interface TreasuryOverviewProps {
  treasuryData: RealTreasuryData;
  loading?: boolean;
  onRefresh?: () => void;
  hasRealData?: boolean;
  isRefreshing?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const TreasuryOverview: React.FC<TreasuryOverviewProps> = ({
  treasuryData,
  loading = false,
  onRefresh,
  hasRealData = false,
  isRefreshing = false,
}) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatETH = (amount: number) => {
    return `${(amount || 0).toFixed(2)} ETH`;
  };

  // Prepare data for charts - using real asset allocation percentages with safe defaults
  const assetAllocation = [
    { 
      name: 'ETH', 
      value: treasuryData?.ethValueUSD || 0, 
      percentage: treasuryData?.assetAllocation?.eth || 0,
      color: '#10b981' 
    },
    ...(treasuryData?.erc20Holdings || [])
      .filter(token => (token?.valueUSD || 0) > 0)
      .map((token, index) => ({
        name: token?.symbol || 'Unknown',
        value: token?.valueUSD || 0,
        percentage: treasuryData?.totalValue ? ((token?.valueUSD || 0) / treasuryData.totalValue) * 100 : 0,
        color: COLORS[index + 1] || '#6b7280',
        change24h: token?.change24h || 0,
        isStablecoin: token?.isStablecoin || false
      }))
  ];

  // Diversification data for enhanced visualization with safe defaults
  const diversificationData = [
    { name: 'ETH', value: treasuryData?.assetAllocation?.eth || 0, color: '#10b981' },
    { name: 'Stablecoins', value: treasuryData?.assetAllocation?.stablecoins || 0, color: '#3b82f6' },
    { name: 'Altcoins', value: treasuryData?.assetAllocation?.altcoins || 0, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const monthlyFlowData = [
    {
      name: 'Income',
      value: treasuryData?.monthlyIncome || 0,
      fill: '#10b981'
    },
    {
      name: 'Expenses',
      value: treasuryData?.monthlyExpenses || 0,
      fill: '#ef4444'
    }
  ];

  const netCashFlow = (treasuryData?.monthlyIncome || 0) - (treasuryData?.monthlyExpenses || 0);
  const burnRate = (treasuryData?.monthlyExpenses || 0) > 0 
    ? (treasuryData?.totalValue || 0) / (treasuryData?.monthlyExpenses || 1) 
    : Infinity;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Badge variant={hasRealData ? 'success' : 'info'} size="sm">
            {hasRealData ? '🔗 Live Contract Data' : '📋 Demo Data'}
          </Badge>
          {(treasuryData?.erc20Holdings?.length || 0) > 0 && (
            <span className="text-xs text-gray-500">
              Tracking {treasuryData?.erc20Holdings?.length || 0} ERC20 tokens
            </span>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw 
                size={16} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            }
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </div>
      {/* Emergency Alert */}
      {treasuryData?.emergencyMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-800">Emergency Mode Active</h3>
              <p className="text-sm text-red-700">
                Treasury is in emergency mode. All non-essential operations are suspended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(treasuryData?.totalValue || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatETH(treasuryData?.ethBalance || 0)} ETH • {treasuryData?.erc20Holdings?.length || 0} tokens
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cash Flow</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Income: {formatCurrency(treasuryData?.monthlyIncome || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {netCashFlow >= 0 ? (
                  <TrendingUp className="text-green-600" size={24} />
                ) : (
                  <TrendingDown className="text-red-600" size={24} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {treasuryData?.healthScore || 0}
                  </p>
                  <HealthScoreBadge score={treasuryData?.healthScore || 0} />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {(treasuryData?.healthScore || 0) >= 80 ? 'Excellent' :
                   (treasuryData?.healthScore || 0) >= 60 ? 'Good' : 'Needs attention'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                (treasuryData?.healthScore || 0) >= 80 ? 'bg-green-100' :
                (treasuryData?.healthScore || 0) >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={
                  (treasuryData?.healthScore || 0) >= 80 ? 'text-green-600' :
                  (treasuryData?.healthScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                } size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Burn Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {burnRate === Infinity ? '∞' : `${burnRate.toFixed(1)}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {burnRate === Infinity ? 'No expenses' : 'months runway'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <Card>
          <CardHeader title="Asset Allocation" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={diversificationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {diversificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {/* Diversification Summary */}
              <div className="grid grid-cols-3 gap-4 text-center text-sm border-t pt-3">
                <div>
                  <p className="text-gray-600">ETH</p>
                  <p className="font-semibold">{(treasuryData?.assetAllocation?.eth || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Stablecoins</p>
                  <p className="font-semibold">{(treasuryData?.assetAllocation?.stablecoins || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Altcoins</p>
                  <p className="font-semibold">{(treasuryData?.assetAllocation?.altcoins || 0).toFixed(1)}%</p>
                </div>
              </div>
              {/* Individual Assets */}
              {assetAllocation.map((asset, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span>{asset.name}</span>
                    {asset.isStablecoin && (
                      <Badge variant="info" size="sm">Stable</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(asset.value)}</span>
                    {asset.change24h !== undefined && (
                      <div className={`text-xs ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}% 24h
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cash Flow */}
        <Card>
          <CardHeader title="Monthly Cash Flow" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-green-600 font-medium">Monthly Income</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(treasuryData?.monthlyIncome || 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-red-600 font-medium">Monthly Expenses</p>
                <p className="text-lg font-bold text-red-900">
                  {formatCurrency(treasuryData?.monthlyExpenses || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card>
        <CardHeader title="Risk & Security Metrics" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Daily Spending Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(treasuryData?.riskMetrics?.dailyLimit || 0)}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((treasuryData?.riskMetrics?.emergencySpendingToday || 0) / (treasuryData?.riskMetrics?.dailyLimit || 1)) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(treasuryData?.riskMetrics?.emergencySpendingToday || 0)} used today
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Monthly Spending Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(treasuryData?.riskMetrics?.monthlyLimit || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Resets monthly
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Circuit Breakers</p>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-lg font-semibold text-gray-900">
                  {treasuryData?.riskMetrics?.circuitBreakersActive || 0}
                </p>
                <Badge variant={(treasuryData?.riskMetrics?.circuitBreakersActive || 0) > 0 ? 'warning' : 'success'}>
                  {(treasuryData?.riskMetrics?.circuitBreakersActive || 0) > 0 ? 'Active' : 'Normal'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Automatic protection systems
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Security Status</p>
              <div className="flex items-center justify-center space-x-2">
                <Shield className={`${treasuryData?.emergencyMode ? 'text-red-600' : 'text-green-600'}`} size={20} />
                <Badge variant={treasuryData?.emergencyMode ? 'error' : 'success'}>
                  {treasuryData?.emergencyMode ? 'Emergency' : 'Secure'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Overall security status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Breakdown */}
      <Card>
        <CardHeader title="Token Holdings" />
        <CardContent>
          <div className="space-y-4">
            {/* ETH */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">ETH</span>
                </div>
                <div>
                  <p className="font-medium">Ethereum</p>
                  <p className="text-sm text-gray-600">ETH</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatETH(treasuryData?.ethBalance || 0)}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(treasuryData?.ethValueUSD || 0)}
                </p>
              </div>
            </div>

            {/* ERC20 Tokens */}
            {(treasuryData?.erc20Holdings || []).map((token, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{token.symbol}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{token.token}</p>
                      {token.isStablecoin && (
                        <Badge variant="info" size="sm">Stable</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{token.symbol} • ${(token.priceUSD || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(token.balance || 0).toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{formatCurrency(token.valueUSD || 0)}</p>
                    <span className={`text-xs ${(token.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(token.change24h || 0) >= 0 ? '+' : ''}{(token.change24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};