'use client';

import React, { useState } from 'react';
import { Building2, Plus, Activity } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { ChainlinkPriceDisplay, PropertyGrid } from '@/components/property';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { PropertyData } from '@/hooks/usePropertyData';

export default function PropertiesPage() {
  const { totalProperties, isDAOMember } = useEmeraldDAO();
  const [, setSelectedProperty] = useState<PropertyData | null>(null);
  
  const handlePropertySelect = (property: PropertyData) => {
    setSelectedProperty(property);
    // Future: Could open a detailed modal or navigate to property details
    console.log('Selected property:', property);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">
            Real estate portfolio managed by the DAO
          </p>
        </div>
        
        {isDAOMember && (
          <Button
            leftIcon={<Plus size={20} />}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Propose Property
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h3 className="font-medium text-gray-900">Total Properties</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalProperties}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Portfolio Value</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">$12.5M</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Monthly Income</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">$65,000</p>
          </CardContent>
        </Card>
      </div>

      {/* Chainlink Oracle Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Activity size={24} className="text-blue-600" />
          <span>Live Property Valuation Demo</span>
        </h2>
        <p className="text-gray-600">
          See how Chainlink oracles provide real-time property valuations for DAO investment decisions.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChainlinkPriceDisplay 
            propertyAddress="123 Main St, Austin, TX"
            propertyId="property_001"
            className="h-fit"
          />
          <ChainlinkPriceDisplay 
            propertyAddress="456 Oak Ave, Miami, FL"
            propertyId="property_002"
            className="h-fit"
          />
        </div>
      </div>

      {/* Property Portfolio */}
      <PropertyGrid 
        showPortfolioMetrics={true}
        onPropertySelect={handlePropertySelect}
      />
    </div>
  );
}