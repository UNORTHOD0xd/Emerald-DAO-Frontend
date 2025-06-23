// src/types/index.ts
export interface PropertyMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    address: string;
    parcel_id: string;
  };
  documents: {
    deed: string;
    inspection: string;
    appraisal: string;
    photos: string[];
  };
  financial: {
    acquisition_price: string;
    estimated_rental_yield: string;
    property_taxes_annual: string;
    hoa_fees_monthly: string;
  };
}

export interface PropertyValuation {
  estimatedValue: bigint;
  rentEstimate: bigint;
  lastUpdated: bigint;
  confidenceScore: bigint;
  dataSource: string;
  isActive: boolean;
  pricePerSqFt: bigint;
  bedrooms: bigint;
  bathrooms: bigint;
  sqft: bigint;
  lastUpdatedBy: string;
}

export interface EnrichedPropertyData {
  tokenId: number;
  propertyId: string;
  metadata: PropertyMetadata;
  valuation: PropertyValuation | null;
  images: string[];
  isValuationCurrent: boolean;
  acquisitionPrice: bigint;
  currentValueUSD: string;
  appreciationPercent: number;
  status: 'acquired' | 'pending' | 'proposed';
  lastUpdated: Date;
}

export interface ProposalData {
  id: number;
  title: string;
  description: string;
  state: 'pending' | 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed';
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  startTime: bigint;
  endTime: bigint;
  creator: string;
}

export interface TreasuryData {
  ethBalance: bigint;
  totalValue: string;
  spendingLimits: {
    daily: bigint;
    monthly: bigint;
    remaining: bigint;
  };
  emergencyMode: boolean;
}