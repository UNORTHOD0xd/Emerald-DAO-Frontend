import { useState, useCallback, useMemo } from 'react';
import { demoProperties, type DemoProperty } from '@/data/demoProperties';

interface MockValuationData {
  estimatedValue: bigint;
  rentEstimate: bigint;
  confidenceScore: bigint;
  dataSource: string;
  pricePerSqFt: bigint;
  bedrooms: bigint;
  bathrooms: bigint;
  sqft: bigint;
  lastUpdated: bigint;
}

export const useDemoPropertyData = () => {
  const [selectedProperty, setSelectedProperty] = useState<DemoProperty | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert demo property data to match the oracle data format
  const getMockValuationData = useCallback((property: DemoProperty): MockValuationData => {
    return {
      estimatedValue: BigInt(Math.round(parseFloat(property.estimatedValue) * 100)), // Convert to cents
      rentEstimate: BigInt(Math.round(parseFloat(property.expectedMonthlyRent) * 100)), // Convert to cents
      confidenceScore: BigInt(property.confidenceScore),
      dataSource: property.dataSource,
      pricePerSqFt: BigInt(property.pricePerSqFt * 100), // Convert to cents per sqft
      bedrooms: BigInt(property.bedrooms),
      bathrooms: BigInt(Math.round(property.bathrooms * 10)), // One decimal place
      sqft: BigInt(property.sqft),
      lastUpdated: BigInt(Math.floor(Date.now() / 1000)) // Current timestamp
    };
  }, []);

  // Simulate oracle data fetching with delay
  const fetchMockValuation = useCallback(async (propertyId: string): Promise<MockValuationData | null> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const property = demoProperties.find(p => p.id === propertyId);
    
    setIsLoading(false);
    
    if (property) {
      return getMockValuationData(property);
    }
    
    return null;
  }, [getMockValuationData]);

  // Get property by ID
  const getPropertyById = useCallback((id: string): DemoProperty | null => {
    return demoProperties.find(p => p.id === id) || null;
  }, []);

  // Get property by address components
  const getPropertyByAddress = useCallback((address: string, city: string, state: string): DemoProperty | null => {
    return demoProperties.find(p => 
      p.address.toLowerCase().includes(address.toLowerCase()) &&
      p.city.toLowerCase() === city.toLowerCase() &&
      p.state.toLowerCase() === state.toLowerCase()
    ) || null;
  }, []);

  // Generate a property ID from address components (matching PropertyAcquisitionForm logic)
  const generatePropertyId = useCallback((address: string, city: string, state: string): string => {
    return `${address}_${city}_${state}`.replace(/\s+/g, '_').toLowerCase();
  }, []);

  // Check if a property ID corresponds to a demo property
  const isDemoProperty = useCallback((propertyId: string): boolean => {
    return demoProperties.some(p => p.id === propertyId || 
      generatePropertyId(p.address, p.city, p.state) === propertyId);
  }, [generatePropertyId]);

  // Get all available demo properties
  const availableProperties = useMemo(() => demoProperties, []);

  // Get demo property form data for pre-population
  const getDemoFormData = useCallback((property: DemoProperty) => ({
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    askingPrice: property.askingPrice,
    expectedMonthlyRent: property.expectedMonthlyRent,
    description: property.description,
    deedUrl: property.deedUrl,
    inspectionUrl: property.inspectionUrl,
    appraisalUrl: property.appraisalUrl,
    photoUrls: property.photoUrls,
    oracleValidation: true, // Demo properties are pre-validated
    estimatedValue: property.estimatedValue,
    priceConfidence: property.confidenceScore,
  }), []);

  return {
    selectedProperty,
    setSelectedProperty,
    isLoading,
    availableProperties,
    fetchMockValuation,
    getMockValuationData,
    getPropertyById,
    getPropertyByAddress,
    generatePropertyId,
    isDemoProperty,
    getDemoFormData,
  };
};