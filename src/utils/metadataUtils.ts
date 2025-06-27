/**
 * Metadata utilities for property proposal workflow
 * 
 * This module provides utilities for generating and validating metadata URIs
 * for property proposals, ensuring they stay within smart contract limits.
 * 
 * IMPORTANT: This is a temporary solution for mock metadata URIs.
 * When IPFS integration is implemented, these functions should be replaced
 * with actual IPFS upload functionality.
 */

// Smart contract enforces 200 character limit for metadata URIs
export const MAX_METADATA_URI_LENGTH = 200;

/**
 * Generate a short, deterministic metadata URI that stays well under the 200 character limit
 * 
 * @param prefix - Prefix to identify the type of proposal (e.g., 'prop', 'gov')
 * @returns A short metadata URI in the format `ipfs://{prefix}-{shortId}`
 * 
 * TODO: Replace with actual IPFS upload function when IPFS integration is implemented
 * TODO: The returned URI should be the actual IPFS hash of uploaded metadata
 */
export function generateMetadataUri(prefix: string = 'prop'): string {
  // Generate a short random ID (6 characters max)
  const shortId = Math.random().toString(36).substring(2, 8);
  
  // Create URI with format: ipfs://{prefix}-{shortId}
  // Example: ipfs://prop-a1b2c3 (~17 characters total)
  const metadataUri = `ipfs://${prefix}-${shortId}`;
  
  // Defensive validation
  if (metadataUri.length > MAX_METADATA_URI_LENGTH) {
    throw new Error(`Generated metadata URI exceeds limit: ${metadataUri.length}/${MAX_METADATA_URI_LENGTH} characters`);
  }
  
  return metadataUri;
}

/**
 * Validate a metadata URI against smart contract requirements
 * 
 * @param metadataUri - The metadata URI to validate
 * @throws Error if the URI is invalid or too long
 */
export function validateMetadataUri(metadataUri: string): void {
  if (!metadataUri || metadataUri.length === 0) {
    throw new Error('Metadata URI cannot be empty');
  }
  
  if (metadataUri.length > MAX_METADATA_URI_LENGTH) {
    throw new Error(`Metadata URI too long: ${metadataUri.length}/${MAX_METADATA_URI_LENGTH} characters`);
  }
  
  // Basic format validation (should start with ipfs://)
  if (!metadataUri.startsWith('ipfs://')) {
    console.warn('Metadata URI should start with "ipfs://" for IPFS compatibility');
  }
}

/**
 * Create metadata object for property proposals
 * 
 * @param propertyData - Property information
 * @param proposer - Address of the proposer
 * @returns Metadata object ready for IPFS upload
 * 
 * TODO: When IPFS integration is implemented, this function should:
 * 1. Create the metadata object
 * 2. Upload it to IPFS
 * 3. Return the actual IPFS hash
 */
export function createPropertyMetadata(
  propertyData: {
    address: string;
    price: string;
    roi: string;
    type: string;
    beds: number;
    baths: number;
    sqft: number;
    description?: string;
  },
  proposer: string
) {
  return {
    // Basic proposal information
    proposalType: 'Property Acquisition',
    created: new Date().toISOString(),
    proposer,
    
    // Property details
    property: {
      address: propertyData.address,
      askingPrice: propertyData.price,
      estimatedROI: propertyData.roi,
      type: propertyData.type,
      bedrooms: propertyData.beds,
      bathrooms: propertyData.baths,
      squareFeet: propertyData.sqft,
      description: propertyData.description || '',
    },
    
    // Metadata format version for future compatibility
    version: '1.0.0',
    
    // Schema identifier for IPFS indexing
    schema: 'emerald-dao-property-proposal',
  };
}

/**
 * Generate a unique proposal identifier for tracking
 * 
 * @param propertyAddress - The property address
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns A unique identifier for the proposal
 */
export function generateProposalId(propertyAddress: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  const hash = Math.random().toString(36).substring(2, 8);
  return `prop-${ts}-${hash}`;
}

// Export types for TypeScript support
export type PropertyMetadata = ReturnType<typeof createPropertyMetadata>;

// Constants for different proposal types
export const METADATA_PREFIXES = {
  PROPERTY: 'prop',
  GOVERNANCE: 'gov',
  TREASURY: 'treas',
  EMERGENCY: 'emerg',
} as const;

export type MetadataPrefix = typeof METADATA_PREFIXES[keyof typeof METADATA_PREFIXES];