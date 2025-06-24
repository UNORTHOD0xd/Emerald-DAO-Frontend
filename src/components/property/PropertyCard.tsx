'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Info,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardFooter, Button, Badge } from '@/components/ui';

interface PropertyData {
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
}

interface PropertyCardProps {
  property: PropertyData;
  onClick?: () => void;
  showActions?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  showActions = true,
}) => {
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Under Review':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const roiColor = property.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full cursor-pointer overflow-hidden"
        onClick={onClick}
        hoverable
      >
        {/* Property Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
          {property.imageUrl ? (
            <img 
              src={property.imageUrl} 
              alt={property.address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <MapPin size={32} className="mx-auto mb-2" />
                <p className="text-sm">Property Image</p>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={getStatusVariant(property.status)}>
              {property.status}
            </Badge>
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="neutral" className="bg-black/75 text-white border-transparent">
              {property.propertyType}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Property Address */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {property.address}
            </h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin size={14} className="mr-1" />
              {property.city}, {property.state}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Value</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(property.estimatedValue)}
              </p>
              <p className="text-xs text-gray-500">
                Confidence: {property.confidenceScore}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(property.monthlyRent)}
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {formatDate(property.lastValuationUpdate)}
              </p>
            </div>
          </div>

          {/* ROI and Performance */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className={roiColor} />
              <span className={`font-medium ${roiColor}`}>
                {property.roiPercentage >= 0 ? '+' : ''}{property.roiPercentage.toFixed(2)}%
              </span>
              <span className="text-xs text-gray-500">ROI</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Acquired</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(property.acquisitionDate)}
              </p>
            </div>
          </div>

          {/* Acquisition Price vs Current Value */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Acquisition Price:</span>
              <span className="font-medium">{formatCurrency(property.acquisitionPrice)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-medium">{formatCurrency(property.estimatedValue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1 pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-medium">Value Change:</span>
              <span className={`font-semibold ${
                property.estimatedValue >= property.acquisitionPrice ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(property.estimatedValue - property.acquisitionPrice)}
              </span>
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="p-4 pt-0">
            <div className="flex space-x-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Info size={16} />}
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle view details
                }}
              >
                Details
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<ExternalLink size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle external link to property data
                  window.open(property.metadataURI, '_blank');
                }}
              >
                Data
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};