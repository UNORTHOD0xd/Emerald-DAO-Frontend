'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  FileText,
  ExternalLink,
  Clock,
  AlertCircle,
  Building,
  Users,
  BarChart3
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader,
  ModalFooter,
  Button, 
  Badge,
  Card,
  CardContent,
  CardHeader
} from '@/components/ui';
import { PropertyData } from './PropertyCard';

interface PropertyDetailsModalProps {
  property: PropertyData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PropertyMetrics {
  occupancyRate: number;
  avgRentPerSqFt: number;
  totalSquareFootage: number;
  yearBuilt: number;
  lastRenovation?: string;
  propertyTax: number;
  insuranceCost: number;
  maintenanceCosts: number;
}

interface ValuationHistory {
  date: string;
  value: number;
  source: string;
  confidenceScore: number;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'history'>('overview');

  if (!property) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Mock data - in real app, this would come from API/blockchain
  const metrics: PropertyMetrics = {
    occupancyRate: 95,
    avgRentPerSqFt: 2.5,
    totalSquareFootage: 2400,
    yearBuilt: 1995,
    lastRenovation: '2020-03-15',
    propertyTax: 12000,
    insuranceCost: 3600,
    maintenanceCosts: 8400,
  };

  const valuationHistory: ValuationHistory[] = [
    {
      date: '2024-01-15',
      value: property.estimatedValue,
      source: 'Chainlink Oracle',
      confidenceScore: property.confidenceScore,
    },
    {
      date: '2023-10-20',
      value: property.estimatedValue * 0.95,
      source: 'Chainlink Oracle',
      confidenceScore: 88,
    },
    {
      date: '2023-07-12',
      value: property.estimatedValue * 0.92,
      source: 'Chainlink Oracle',
      confidenceScore: 91,
    },
  ];

  const monthlyIncome = property.monthlyRent;
  const monthlyExpenses = (metrics.propertyTax + metrics.insuranceCost + metrics.maintenanceCosts) / 12;
  const netMonthlyIncome = monthlyIncome - monthlyExpenses;
  const annualROI = (netMonthlyIncome * 12) / property.acquisitionPrice * 100;

  const TabButton: React.FC<{ tab: string; label: string; isActive: boolean }> = ({ 
    tab, 
    label, 
    isActive 
  }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      title={property.address}
    >
      <ModalContent>
        {/* Property Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.address}</h2>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin size={16} className="mr-1" />
                {property.city}, {property.state}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="success">
                {property.status}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                Token ID: #{property.tokenId}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Current Value</p>
                <p className="text-lg font-bold text-emerald-900">
                  {formatCurrency(property.estimatedValue)}
                </p>
              </div>
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Monthly Rent</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(property.monthlyRent)}
                </p>
              </div>
              <Building className="text-blue-600" size={24} />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Annual ROI</p>
                <p className="text-lg font-bold text-purple-900">
                  {annualROI.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Confidence</p>
                <p className="text-lg font-bold text-orange-900">
                  {property.confidenceScore}%
                </p>
              </div>
              <BarChart3 className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <TabButton 
            tab="overview" 
            label="Overview" 
            isActive={activeTab === 'overview'} 
          />
          <TabButton 
            tab="financials" 
            label="Financials" 
            isActive={activeTab === 'financials'} 
          />
          <TabButton 
            tab="history" 
            label="Valuation History" 
            isActive={activeTab === 'history'} 
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Property Details" />
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Square Footage:</span>
                      <span className="font-medium">{metrics.totalSquareFootage.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="font-medium">{metrics.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Renovation:</span>
                      <span className="font-medium">
                        {metrics.lastRenovation ? formatDate(metrics.lastRenovation) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupancy Rate:</span>
                      <span className="font-medium">{metrics.occupancyRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Acquisition Info" />
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-medium">{formatCurrency(property.acquisitionPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acquisition Date:</span>
                      <span className="font-medium">{formatDate(property.acquisitionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value Appreciation:</span>
                      <span className={`font-medium ${
                        property.estimatedValue > property.acquisitionPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(property.estimatedValue - property.acquisitionPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appreciation %:</span>
                      <span className={`font-medium ${
                        property.estimatedValue > property.acquisitionPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(((property.estimatedValue - property.acquisitionPrice) / property.acquisitionPrice) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Monthly Cash Flow" />
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-green-600">Monthly Income:</span>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(monthlyIncome)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-red-600">
                        <span>Property Tax (monthly):</span>
                        <span>-{formatCurrency(metrics.propertyTax / 12)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Insurance (monthly):</span>
                        <span>-{formatCurrency(metrics.insuranceCost / 12)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Maintenance (monthly):</span>
                        <span>-{formatCurrency(metrics.maintenanceCosts / 12)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Net Monthly Income:</span>
                        <span className={netMonthlyIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {netMonthlyIncome >= 0 ? '+' : ''}{formatCurrency(netMonthlyIncome)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader title="Annual Expenses" />
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property Tax:</span>
                        <span className="font-medium">{formatCurrency(metrics.propertyTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance:</span>
                        <span className="font-medium">{formatCurrency(metrics.insuranceCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maintenance:</span>
                        <span className="font-medium">{formatCurrency(metrics.maintenanceCosts)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Annual Expenses:</span>
                          <span>{formatCurrency(monthlyExpenses * 12)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Performance Metrics" />
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rent per Sq Ft:</span>
                        <span className="font-medium">${metrics.avgRentPerSqFt.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cap Rate:</span>
                        <span className="font-medium">
                          {((netMonthlyIncome * 12) / property.estimatedValue * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual ROI:</span>
                        <span className="font-medium">{annualROI.toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <Card>
              <CardHeader title="Valuation History" />
              <CardContent>
                <div className="space-y-4">
                  {valuationHistory.map((valuation, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Calendar size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formatDate(valuation.date)}</p>
                          <p className="text-sm text-gray-600">
                            Source: {valuation.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrency(valuation.value)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="info" size="sm">
                            {valuation.confidenceScore}% confidence
                          </Badge>
                          {index === 0 && (
                            <Badge variant="success" size="sm">
                              Latest
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button 
          leftIcon={<ExternalLink size={16} />}
          onClick={() => window.open(property.metadataURI, '_blank')}
        >
          View Metadata
        </Button>
      </ModalFooter>
    </Modal>
  );
};