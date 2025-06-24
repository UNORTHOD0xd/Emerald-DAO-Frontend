// Contract addresses organized by network
export const CONTRACT_ADDRESSES = {
  SEPOLIA: {
    token: "0x719fCA9aED8D93b4dbE03afBD1983191C684c33d",
    timelock: "0xDae1e3289CBe74b19aAb0451C6088757e5d3bad1",
    dao: "0xb2dAE5da3A26551eB7DeD98815E3f3d11C974b0e",
    vault: "0x170de1581BAE61377278A17b9D24c656Ff181a91",
    propertyFactory: "0x81Ca034B25c8F96e7496814a30CCAbA767631ED5",
    oracle: "0x53228D0fBD73fa84F8E48F38C33971e1F682abA2",
    propertyAcquisition: "0x29C8a67c91cB13b715Ea4aFDF8A51ff4a40d1b05",
    keeper: "0xE60AD360d138FE7F33e2A373b0D7234496Ab6327"
  }
} as const;

// Get current network addresses (defaulting to Sepolia for development)
export const CONTRACTS = CONTRACT_ADDRESSES.SEPOLIA;

// Comprehensive EMERALD Token ABI based on contract
export const EMERALD_TOKEN_ABI = [
  // ERC20 Basic Functions
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC20Votes Functions (Governance)
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "getVotes",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "delegatee", "type": "address"}],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "delegates",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}, {"name": "timepoint", "type": "uint256"}],
    "name": "getPastVotes",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "timepoint", "type": "uint256"}],
    "name": "getPastTotalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // EMERALD Specific Functions
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "from", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "circulatingSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBurned",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC20Permit (Gasless transactions)
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"},
      {"name": "value", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "v", "type": "uint8"},
      {"name": "r", "type": "bytes32"},
      {"name": "s", "type": "bytes32"}
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "nonces",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "delegator", "type": "address"},
      {"indexed": true, "name": "fromDelegate", "type": "address"},
      {"indexed": true, "name": "toDelegate", "type": "address"}
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "delegate", "type": "address"},
      {"indexed": false, "name": "previousBalance", "type": "uint256"},
      {"indexed": false, "name": "newBalance", "type": "uint256"}
    ],
    "name": "DelegateVotesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensBurned",
    "type": "event"
  }
] as const;

// Simplified DAO Governance ABI
export const EMERALD_DAO_ABI = [
  // Basic governance functions
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "state",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}, {"name": "support", "type": "uint8"}],
    "name": "castVote",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingDelay",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingPeriod",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// EmeraldVault Treasury ABI
export const EMERALD_VAULT_ABI = [
  // Balance Functions
  {
    "inputs": [],
    "name": "getETHBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "token", "type": "address"}],
    "name": "getERC20Balance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Health & Limits
  {
    "inputs": [],
    "name": "getVaultHealthScore",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingDailyLimit",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingMonthlyLimit",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmergencySpendingToday",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Emergency Functions
  {
    "inputs": [],
    "name": "emergencyMode",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyActivatedAt",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// PropertyFactory ABI
export const PROPERTY_FACTORY_ABI = [
  // View Functions
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Chainlink Oracle ABI for property valuations
export const CHAINLINK_ORACLE_ABI = [
  {
    "inputs": [{"name": "propertyId", "type": "string"}],
    "name": "getPropertyValuation",
    "outputs": [
      {"name": "estimatedValue", "type": "uint256"},
      {"name": "rentEstimate", "type": "uint256"},
      {"name": "lastUpdated", "type": "uint256"},
      {"name": "confidenceScore", "type": "uint256"},
      {"name": "dataSource", "type": "string"},
      {"name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "propertyId", "type": "string"}],
    "name": "requestPropertyValuation",
    "outputs": [{"name": "requestId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "propertyId", "type": "string"}],
    "name": "getValuationHistory",
    "outputs": [
      {"name": "timestamps", "type": "uint256[]"},
      {"name": "values", "type": "uint256[]"},
      {"name": "confidenceScores", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Property Acquisition ABI for proposal creation and management
export const PROPERTY_ACQUISITION_ABI = [
  {
    "inputs": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "propertyAddress", "type": "string"},
      {"name": "askingPrice", "type": "uint256"},
      {"name": "expectedRent", "type": "uint256"},
      {"name": "metadataUri", "type": "string"}
    ],
    "name": "createPropertyProposal",
    "outputs": [{"name": "proposalId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "getPropertyProposal",
    "outputs": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "propertyAddress", "type": "string"},
      {"name": "askingPrice", "type": "uint256"},
      {"name": "expectedRent", "type": "uint256"},
      {"name": "proposer", "type": "address"},
      {"name": "created", "type": "uint256"},
      {"name": "status", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveProposals",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "propertyId", "type": "string"}
    ],
    "name": "executePropertyAcquisition",
    "outputs": [{"name": "success", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "proposer", "type": "address"},
      {"indexed": false, "name": "propertyAddress", "type": "string"},
      {"indexed": false, "name": "askingPrice", "type": "uint256"}
    ],
    "name": "PropertyProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": false, "name": "propertyId", "type": "string"},
      {"indexed": false, "name": "finalPrice", "type": "uint256"}
    ],
    "name": "PropertyAcquired",
    "type": "event"
  }
] as const;

// Keeper Automation ABI
export const KEEPER_ABI = [
  {
    "inputs": [],
    "name": "checkUpkeep",
    "outputs": [
      {"name": "upkeepNeeded", "type": "bool"},
      {"name": "performData", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "performData", "type": "bytes"}],
    "name": "performUpkeep",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Helper function to get contract address by name
export function getContractAddress(contractName: keyof typeof CONTRACTS): `0x${string}` {
  return CONTRACTS[contractName] as `0x${string}`;
}

// Helper function to get ABI by contract name
export function getContractABI(contractName: string) {
  switch (contractName) {
    case 'token':
      return EMERALD_TOKEN_ABI;
    case 'dao':
      return EMERALD_DAO_ABI;
    case 'vault':
      return EMERALD_VAULT_ABI;
    case 'propertyFactory':
      return PROPERTY_FACTORY_ABI;
    case 'oracle':
      return CHAINLINK_ORACLE_ABI;
    case 'propertyAcquisition':
      return PROPERTY_ACQUISITION_ABI;
    case 'keeper':
      return KEEPER_ABI;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}

// Contract configuration object for easy access
export const CONTRACT_CONFIG = {
  token: {
    address: getContractAddress('token'),
    abi: EMERALD_TOKEN_ABI,
  },
  dao: {
    address: getContractAddress('dao'),
    abi: EMERALD_DAO_ABI,
  },
  vault: {
    address: getContractAddress('vault'),
    abi: EMERALD_VAULT_ABI,
  },
  propertyFactory: {
    address: getContractAddress('propertyFactory'),
    abi: PROPERTY_FACTORY_ABI,
  },
  oracle: {
    address: getContractAddress('oracle'),
    abi: CHAINLINK_ORACLE_ABI,
  },
  propertyAcquisition: {
    address: getContractAddress('propertyAcquisition'),
    abi: PROPERTY_ACQUISITION_ABI,
  },
  keeper: {
    address: getContractAddress('keeper'),
    abi: KEEPER_ABI,
  },
} as const;

// TypeScript types for better type safety
export type ContractName = keyof typeof CONTRACTS;
export type ContractConfig = typeof CONTRACT_CONFIG;

// Constants for proposal states (matching your smart contract)
export const PROPOSAL_STATES = {
  PENDING: 0,
  ACTIVE: 1,
  CANCELED: 2,
  DEFEATED: 3,
  SUCCEEDED: 4,
  QUEUED: 5,
  EXPIRED: 6,
  EXECUTED: 7,
} as const;

// Constants for vote support
export const VOTE_SUPPORT = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
} as const;