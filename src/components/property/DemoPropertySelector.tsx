'use client';

import React from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  DollarSign, 
  Home, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  Button, 
  Badge 
} from '@/components/ui';
import { demoProperties, calculatePropertyROI, getPriceAnalysis, type DemoProperty } from '@/data/demoProperties';

interface DemoPropertySelectorProps {
  onSelectProperty: (property: DemoProperty) => void;
  onClose: () => void;
}

export const DemoPropertySelector: React.FC<DemoPropertySelectorProps> = ({
  onSelectProperty,
  onClose,
}) => {
  const handlePropertySelect = (property: DemoProperty) => {
    onSelectProperty(property);
  };

  const renderPriceAnalysisBadge = (property: DemoProperty) => {
    const analysis = getPriceAnalysis(property.askingPrice, property.estimatedValue);
    
    if (!analysis) return null;
    
    if (analysis.isOverpriced) {
      return (
        <Badge variant="error" size="sm" className="flex items-center space-x-1">
          <AlertTriangle size={12} />
          <span>{analysis.difference}% Over</span>
        </Badge>
      );
    } else if (analysis.isUnderpriced) {
      return (
        <Badge variant="success" size="sm" className="flex items-center space-x-1">
          <TrendingUp size={12} />
          <span>{Math.abs(parseFloat(analysis.difference))}% Under</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="info" size="sm" className="flex items-center space-x-1">
          <CheckCircle2 size={12} />
          <span>Fair Price</span>
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select a Demo Property
        </h3>
        <p className="text-gray-600">
          Choose from our curated demo properties with pre-populated data and mock oracle validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {demoProperties.map((property) => {
          const roi = calculatePropertyROI(property.askingPrice, property.expectedMonthlyRent);
          
          return (
            <Card 
              key={property.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300"
              onClick={() => handlePropertySelect(property)}
            >
              <div className="relative h-32 w-full">
                <Image
                  src={property.imageUrl}
                  alt={`${property.city} property`}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="emerald" size="sm">
                    Demo
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                      <MapPin size={14} />
                      <span>{property.city}, {property.state}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 truncate">
                      {property.address}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Home size={14} className="text-gray-500" />
                      <span>{property.bedrooms}BR / {property.bathrooms}BA</span>
                    </div>
                    <span className="text-gray-600">{property.sqft.toLocaleString()} sqft</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Asking Price:</span>
                      <span className="font-semibold">${parseInt(property.askingPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Rent:</span>
                      <span className="font-semibold">${parseInt(property.expectedMonthlyRent).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={14} className="text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-600">
                        {roi}% ROI
                      </span>
                    </div>
                    {renderPriceAnalysisBadge(property)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Oracle: {property.dataSource}</span>
                    <span>{property.confidenceScore}% confidence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          All properties include mock oracle validation and sample documents
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};