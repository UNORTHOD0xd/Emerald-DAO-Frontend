// Test utilities for demonstration purposes
// These functions help simulate different proposal states for testing

export const createTestProposal = (overrides: Partial<any> = {}) => {
  const baseProposal = {
    id: 'test-proposal-1',
    proposalId: 1,
    title: 'Acquire Property: 123 Test Street, Austin, TX',
    description: 'This property represents an excellent investment opportunity in Austin with strong rental demand and Chainlink oracle validation.',
    proposer: '0x1234567890123456789012345678901234567890',
    status: 'Active' as const,
    votesFor: 75000,
    votesAgainst: 25000,
    votesAbstain: 10000,
    totalVotes: 110000,
    quorumReached: true,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    proposalType: 'Property Acquisition' as const,
    requiredQuorum: 100000,
    userHasVoted: false,
    metadata: JSON.stringify({
      propertyDetails: {
        address: '123 Test Street, Austin, TX',
        askingPrice: 650000,
        expectedRent: 4200,
        sqft: 2000,
        bedrooms: 3,
        bathrooms: 2,
        chainlinkOracle: {
          estimatedValue: 580000,
          confidenceScore: 85,
          priceAnalysis: 'slightly_overpriced'
        }
      }
    })
  };

  return { ...baseProposal, ...overrides };
};

export const proposalStateTemplates = {
  active: (proposalId: number) => createTestProposal({
    proposalId,
    status: 'Active',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  }),

  succeeded: (proposalId: number) => createTestProposal({
    proposalId,
    status: 'Succeeded',
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ended yesterday
    votesFor: 150000,
    votesAgainst: 30000,
    totalVotes: 180000,
  }),

  queued: (proposalId: number) => createTestProposal({
    proposalId,
    status: 'Queued',
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Ended 2 days ago
    votesFor: 150000,
    votesAgainst: 30000,
    totalVotes: 180000,
  }),

  executed: (proposalId: number) => createTestProposal({
    proposalId,
    status: 'Executed',
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Ended 3 days ago
    executionTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Executed yesterday
    votesFor: 150000,
    votesAgainst: 30000,
    totalVotes: 180000,
  }),
};

// Test different property types for oracle variation
export const testProperties = {
  luxury: {
    address: '999 Luxury Lane',
    city: 'Beverly Hills',
    state: 'CA',
    askingPrice: 1200000,
    expectedValue: 950000, // Oracle will generate deterministic value
  },
  
  suburban: {
    address: '456 Suburban Drive',
    city: 'Dallas',
    state: 'TX', 
    askingPrice: 550000,
    expectedValue: 520000,
  },
  
  starter: {
    address: '789 Starter Home Street',
    city: 'Houston',
    state: 'TX',
    askingPrice: 380000,
    expectedValue: 420000, // Underpriced
  },
  
  nashville: {
    address: '101 Music Row',
    city: 'Nashville',
    state: 'TN',
    askingPrice: 675000,
    expectedValue: 650000,
  }
};

// Helper to generate property ID for oracle
export const generatePropertyId = (address: string, city: string, state: string) => {
  return `${address}_${city}_${state}`.replace(/\s+/g, '_').toLowerCase();
};

// Helper to simulate oracle data for testing
export const getExpectedOracleData = (propertyId: string) => {
  const seed = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const baseValue = 400000 + random(seed) * 600000;
  const confidenceScore = 70 + random(seed + 1) * 30;
  
  return {
    estimatedValue: Math.floor(baseValue),
    confidenceScore: Math.floor(confidenceScore),
    dataSource: 'Chainlink Real Estate Oracle v2.0',
    lastUpdated: new Date(),
  };
};

// Browser console helpers (add to window for easy testing)
if (typeof window !== 'undefined') {
  (window as any).emeraldTestHelpers = {
    proposalStateTemplates,
    testProperties,
    generatePropertyId,
    getExpectedOracleData,
    createTestProposal,
  };
}