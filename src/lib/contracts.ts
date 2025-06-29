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

// Enhanced DAO Governance ABI
export const EMERALD_DAO_ABI = [
  // Proposal creation and management
  {
    "inputs": [
      {"name": "targets", "type": "address[]"},
      {"name": "values", "type": "uint256[]"},
      {"name": "calldatas", "type": "bytes[]"},
      {"name": "description", "type": "string"}
    ],
    "name": "propose",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "state",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "proposalVotes",
    "outputs": [
      {"name": "againstVotes", "type": "uint256"},
      {"name": "forVotes", "type": "uint256"},
      {"name": "abstainVotes", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "proposalSnapshot",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "proposalDeadline",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "proposalProposer",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Voting functions
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}, {"name": "support", "type": "uint8"}],
    "name": "castVote",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "proposalId", "type": "uint256"}, 
      {"name": "support", "type": "uint8"}, 
      {"name": "reason", "type": "string"}
    ],
    "name": "castVoteWithReason",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}, {"name": "account", "type": "address"}],
    "name": "hasVoted",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Governance parameters
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
  },
  {
    "inputs": [],
    "name": "proposalThreshold",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "timepoint", "type": "uint256"}],
    "name": "quorum",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Proposal counting and querying
  {
    "inputs": [],
    "name": "getActiveProposals",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "getProposalsByAccount",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "proposer", "type": "address"},
      {"indexed": false, "name": "targets", "type": "address[]"},
      {"indexed": false, "name": "values", "type": "uint256[]"},
      {"indexed": false, "name": "signatures", "type": "string[]"},
      {"indexed": false, "name": "calldatas", "type": "bytes[]"},
      {"indexed": false, "name": "startBlock", "type": "uint256"},
      {"indexed": false, "name": "endBlock", "type": "uint256"},
      {"indexed": false, "name": "description", "type": "string"}
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "voter", "type": "address"},
      {"indexed": false, "name": "proposalId", "type": "uint256"},
      {"indexed": false, "name": "support", "type": "uint8"},
      {"indexed": false, "name": "weight", "type": "uint256"},
      {"indexed": false, "name": "reason", "type": "string"}
    ],
    "name": "VoteCast",
    "type": "event"
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

// PropertyFactory ABI (Enhanced for NFT functionality)
export const PROPERTY_FACTORY_ABI = [
  // ERC721 Standard Functions
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
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "index", "type": "uint256"}],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "tokenByIndex",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Property-specific functions
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "getPropertyDetails",
    "outputs": [
      {"name": "acquisitionPrice", "type": "uint256"},
      {"name": "acquisitionDate", "type": "uint256"},
      {"name": "propertyType", "type": "string"},
      {"name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "getPropertyMetadata",
    "outputs": [
      {"name": "propertyAddress", "type": "string"},
      {"name": "city", "type": "string"},
      {"name": "state", "type": "string"},
      {"name": "zipCode", "type": "string"},
      {"name": "bedrooms", "type": "uint8"},
      {"name": "bathrooms", "type": "uint8"},
      {"name": "sqft", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": true, "name": "tokenId", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": false, "name": "propertyAddress", "type": "string"},
      {"indexed": false, "name": "acquisitionPrice", "type": "uint256"}
    ],
    "name": "PropertyMinted",
    "type": "event"
  }
] as const;

// Chainlink Oracle ABI for property valuations - Updated to match deployed contract
export const CHAINLINK_ORACLE_ABI = [
  {
    "inputs": [{"name": "propertyIdentifier", "type": "string"}],
    "name": "getPropertyValuation",
    "outputs": [
      {"name": "valuation", "type": "tuple", "components": [
        {"name": "estimatedValue", "type": "uint256"},
        {"name": "rentEstimate", "type": "uint256"},
        {"name": "lastUpdated", "type": "uint256"},
        {"name": "confidenceScore", "type": "uint256"},
        {"name": "dataSource", "type": "string"},
        {"name": "isActive", "type": "bool"},
        {"name": "pricePerSqFt", "type": "uint256"},
        {"name": "bedrooms", "type": "uint256"},
        {"name": "bathrooms", "type": "uint256"},
        {"name": "sqft", "type": "uint256"},
        {"name": "lastUpdatedBy", "type": "address"}
      ]}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "propertyIdentifier", "type": "string"},
      {"name": "requestType", "type": "uint8"}
    ],
    "name": "requestPropertyValuation",
    "outputs": [{"name": "requestId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "propertyIdentifier", "type": "string"}],
    "name": "isValuationCurrent",
    "outputs": [{"name": "isCurrent", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOracleStats",
    "outputs": [
      {"name": "totalProperties", "type": "uint256"},
      {"name": "totalFulfilled", "type": "uint256"},
      {"name": "totalFailed", "type": "uint256"},
      {"name": "successRate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSourceCodeHash",
    "outputs": [{"name": "sourceHash", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "subscriptionId",
    "outputs": [{"name": "", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "bytes32"},
      {"indexed": true, "name": "propertyIdentifier", "type": "string"},
      {"indexed": true, "name": "requester", "type": "address"},
      {"indexed": false, "name": "requestType", "type": "uint8"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "ValuationRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "bytes32"},
      {"indexed": true, "name": "propertyIdentifier", "type": "string"},
      {"indexed": false, "name": "estimatedValue", "type": "uint256"},
      {"indexed": false, "name": "rentEstimate", "type": "uint256"},
      {"indexed": false, "name": "confidenceScore", "type": "uint256"},
      {"indexed": false, "name": "dataSource", "type": "string"}
    ],
    "name": "ValuationFulfilled",
    "type": "event"
  }
] as const;

// Property Acquisition ABI for proposal creation and management (matches deployed contract)
export const PROPERTY_ACQUISITION_ABI = [
  {
    "inputs": [
      {"name": "propertyAddress", "type": "string"},
      {"name": "metadataURI", "type": "string"},
      {"name": "proposedPrice", "type": "uint256"}
    ],
    "name": "createPropertyProposal",
    "outputs": [{"name": "proposalId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"name": "proposal", "type": "tuple", "components": [
        {"name": "id", "type": "uint256"},
        {"name": "proposer", "type": "address"},
        {"name": "propertyAddress", "type": "string"},
        {"name": "metadataURI", "type": "string"},
        {"name": "proposedPrice", "type": "uint256"},
        {"name": "oracleValuation", "type": "uint256"},
        {"name": "proposalBond", "type": "uint256"},
        {"name": "createdAt", "type": "uint256"},
        {"name": "daoProposalId", "type": "uint256"},
        {"name": "state", "type": "uint8"},
        {"name": "oracleRequestId", "type": "bytes32"},
        {"name": "oracleComplete", "type": "bool"},
        {"name": "daoProposalCreated", "type": "bool"},
        {"name": "rejectionReason", "type": "string"},
        {"name": "oracleCompletedAt", "type": "uint256"},
        {"name": "oracleOperator", "type": "address"}
      ]}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProposals",
    "outputs": [{"name": "proposalIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{"name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "requestOracleValuation",
    "outputs": [{"name": "requestId", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "completeOracleValuation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "description", "type": "string"}
    ],
    "name": "createDAOProposal",
    "outputs": [{"name": "daoProposalId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "executePropertyAcquisition",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "propertyAddress", "type": "string"}],
    "name": "hasActiveProposal",
    "outputs": [
      {"name": "hasProposal", "type": "bool"},
      {"name": "proposalId", "type": "uint256"},
      {"name": "state", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "proposer", "type": "address"},
      {"indexed": false, "name": "propertyAddress", "type": "string"},
      {"indexed": false, "name": "proposedPrice", "type": "uint256"},
      {"indexed": false, "name": "metadataURI", "type": "string"},
      {"indexed": false, "name": "bondAmount", "type": "uint256"}
    ],
    "name": "PropertyProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": false, "name": "acquisitionPrice", "type": "uint256"},
      {"indexed": true, "name": "executor", "type": "address"}
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

// EmeraldTimelock ABI for proposal execution
export const EMERALD_TIMELOCK_ABI = [
  // Scheduling functions
  {
    "inputs": [
      {"name": "target", "type": "address"},
      {"name": "value", "type": "uint256"},
      {"name": "data", "type": "bytes"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"},
      {"name": "delay", "type": "uint256"}
    ],
    "name": "schedule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "targets", "type": "address[]"},
      {"name": "values", "type": "uint256[]"},
      {"name": "payloads", "type": "bytes[]"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"},
      {"name": "delay", "type": "uint256"}
    ],
    "name": "scheduleBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Execution functions
  {
    "inputs": [
      {"name": "target", "type": "address"},
      {"name": "value", "type": "uint256"},
      {"name": "payload", "type": "bytes"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"}
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "targets", "type": "address[]"},
      {"name": "values", "type": "uint256[]"},
      {"name": "payloads", "type": "bytes[]"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"}
    ],
    "name": "executeBatch",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Management functions
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Query functions
  {
    "inputs": [
      {"name": "target", "type": "address"},
      {"name": "value", "type": "uint256"},
      {"name": "data", "type": "bytes"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"}
    ],
    "name": "hashOperation",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "targets", "type": "address[]"},
      {"name": "values", "type": "uint256[]"},
      {"name": "payloads", "type": "bytes[]"},
      {"name": "predecessor", "type": "bytes32"},
      {"name": "salt", "type": "bytes32"}
    ],
    "name": "hashOperationBatch",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "isOperation",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "isOperationPending",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "isOperationReady",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "isOperationDone",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "getTimestamp",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinDelay",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "id", "type": "bytes32"}],
    "name": "getOperationState",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "bytes32"},
      {"indexed": true, "name": "index", "type": "uint256"},
      {"indexed": false, "name": "target", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"},
      {"indexed": false, "name": "data", "type": "bytes"},
      {"indexed": false, "name": "predecessor", "type": "bytes32"},
      {"indexed": false, "name": "delay", "type": "uint256"}
    ],
    "name": "CallScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "bytes32"},
      {"indexed": true, "name": "index", "type": "uint256"},
      {"indexed": false, "name": "target", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"},
      {"indexed": false, "name": "data", "type": "bytes"}
    ],
    "name": "CallExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "bytes32"}
    ],
    "name": "Cancelled",
    "type": "event"
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
    case 'timelock':
      return EMERALD_TIMELOCK_ABI;
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
  timelock: {
    address: getContractAddress('timelock'),
    abi: EMERALD_TIMELOCK_ABI,
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