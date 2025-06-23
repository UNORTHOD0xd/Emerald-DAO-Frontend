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

// Comprehensive EMERALD Token ABI based on your contract
export const EMERALD_TOKEN_ABI = [
  // ERC20 Basic Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // ERC20Votes Functions (Governance)
  'function getVotes(address account) view returns (uint256)',
  'function delegate(address delegatee)',
  'function delegates(address account) view returns (address)',
  'function getPastVotes(address account, uint256 timepoint) view returns (uint256)',
  'function getPastTotalSupply(uint256 timepoint) view returns (uint256)',
  
  // EMERALD Specific Functions
  'function burn(uint256 amount)',
  'function burnFrom(address from, uint256 amount)',
  'function maxSupply() view returns (uint256)',
  'function circulatingSupply() view returns (uint256)',
  'function totalBurned() view returns (uint256)',
  
  // ERC20Permit (Gasless transactions)
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
  'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)',
  'event TokensBurned(address indexed from, uint256 amount)'
] as const;

// EmeraldDAO Governance ABI
export const EMERALD_DAO_ABI = [
  // Governor Core Functions
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
  'function proposeWithMetadata(address[] targets, uint256[] values, bytes[] calldatas, string description, string metadataCID) returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
  
  // Proposal State Functions
  'function state(uint256 proposalId) view returns (uint8)',
  'function proposalSnapshot(uint256 proposalId) view returns (uint256)',
  'function proposalDeadline(uint256 proposalId) view returns (uint256)',
  'function proposalProposer(uint256 proposalId) view returns (address)',
  'function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)',
  'function hasVoted(uint256 proposalId, address account) view returns (bool)',
  'function proposalThreshold() view returns (uint256)',
  'function quorum(uint256 timepoint) view returns (uint256)',
  
  // Enhanced DAO Functions
  'function getProposalInfo(uint256 proposalId) view returns (uint8 state, uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain, string metadata, bool hasExecution, bool canExecute)',
  'function getProposalMetadata(uint256 proposalId) view returns (string)',
  'function getProposalExecution(uint256 proposalId) view returns (address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash)',
  'function hasExecutionData(uint256 proposalId) view returns (bool)',
  'function getProposalCreator(uint256 proposalId) view returns (address)',
  
  // Settings
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  
  // Events
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
  'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
  'event ProposalExecuted(uint256 proposalId)',
  'event ProposalMetadataSet(uint256 indexed proposalId, string metadataCID)'
] as const;

// EmeraldVault Treasury ABI
export const EMERALD_VAULT_ABI = [
  // Balance Functions
  'function getETHBalance() view returns (uint256)',
  'function getERC20Balance(address token) view returns (uint256)',
  
  // Treasury Management
  'function withdrawEther(address payable recipient, uint256 amount, string reason)',
  'function withdrawERC20(address token, address recipient, uint256 amount, string reason)',
  'function withdrawERC721(address token, address recipient, uint256 tokenId, string reason)',
  
  // Health & Limits
  'function getVaultHealthScore() view returns (uint256)',
  'function getRemainingDailyLimit() view returns (uint256)',
  'function getRemainingMonthlyLimit() view returns (uint256)',
  'function getEmergencySpendingToday() view returns (uint256)',
  
  // Security Features
  'function isLargeWithdrawal(address token, uint256 amount) view returns (bool isLarge, uint256 percentage)',
  'function getSecurityMetrics() view returns (uint256 totalEmergencyActivations, uint256 circuitBreakersActive, bool emergencyModeActive, uint256 lastSecurityIncident)',
  
  // Oracle Configuration
  'function configureOracle(address token, address oracle, uint8 decimals)',
  'function getOracleConfig(address token) view returns (tuple)',
  'function getETHEquivalent(address token, uint256 amount) view returns (uint256)',
  
  // Emergency Functions
  'function emergencyMode() view returns (bool)',
  'function emergencyActivatedAt() view returns (uint256)',
  
  // Events
  'event EtherReceived(address indexed sender, uint256 amount)',
  'event EtherWithdrawn(address indexed recipient, uint256 amount, string reason)',
  'event EmergencyActivated(address indexed activator, string reason)',
  'event CircuitBreakerTriggered(address indexed token, uint256 oldPrice, uint256 newPrice, uint256 deviation)'
] as const;

// PropertyFactory ABI
export const PROPERTY_FACTORY_ABI = [
  // Minting Functions
  'function mintProperty(string propertyIdentifier, string metadataURI) returns (uint256)',
  'function mintPropertiesBatch(string[] propertyIdentifiers, string[] metadataURIs) returns (uint256[])',
  
  // Property Management
  'function updatePropertyMetadata(uint256 tokenId, string newMetadataURI)',
  'function burnProperty(uint256 tokenId)',
  
  // View Functions
  'function totalSupply() view returns (uint256)',
  'function maxSupply() view returns (uint256)',
  'function getRemainingSupply() view returns (uint256)',
  'function getNextTokenId() view returns (uint256)',
  'function getPropertyInfo(uint256 tokenId) view returns (string propertyId, string metadataURI, bytes32 dataHash, address owner)',
  'function isPropertyIdentifierUsed(string propertyIdentifier) view returns (bool)',
  'function getTokenIdByPropertyIdentifier(string propertyIdentifier) view returns (uint256)',
  
  // Treasury Integration
  'function treasury() view returns (address)',
  
  // Events
  'event PropertyMinted(uint256 indexed tokenId, string indexed propertyIdentifier, string metadataURI, address indexed minter, uint256 timestamp)',
  'event PropertyBurned(uint256 indexed tokenId, string propertyIdentifier, address indexed burner)',
  'event PropertyMetadataUpdated(uint256 indexed tokenId, string oldMetadataURI, string newMetadataURI, address indexed updater)'
] as const;

// Chainlink Oracle ABI
export const CHAINLINK_ORACLE_ABI = [
  // Oracle Functions
  'function requestPropertyValuation(string propertyIdentifier, uint8 requestType) returns (bytes32)',
  'function getPropertyValuation(string propertyIdentifier) view returns (tuple)',
  'function isValuationCurrent(string propertyIdentifier) view returns (bool)',
  'function getPropertyValuationInEth(string propertyIdentifier, uint256 ethUsdPrice) view returns (uint256 valueInEth, uint256 rentInEth)',
  
  // Oracle Configuration
  'function setSubscriptionConfig(uint64 subscriptionId, uint32 gasLimit, bytes32 donId)',
  'function updateSourceCode(string source)',
  'function setEncryptedSecrets(bytes encryptedSecretsUrls)',
  
  // Statistics
  'function getOracleStats() view returns (uint256 totalProperties, uint256 totalFulfilled, uint256 totalFailed, uint256 successRate)',
  'function getSourceCodeHash() view returns (bytes32)',
  
  // Events
  'event ValuationRequested(bytes32 indexed requestId, string indexed propertyIdentifier, address indexed requester, uint8 requestType, uint256 timestamp)',
  'event ValuationFulfilled(bytes32 indexed requestId, string indexed propertyIdentifier, uint256 estimatedValue, uint256 rentEstimate, uint256 confidenceScore, string dataSource)',
  'event ValuationFailed(bytes32 indexed requestId, string indexed propertyIdentifier, string reason)'
] as const;

// Property Acquisition ABI
export const PROPERTY_ACQUISITION_ABI = [
  // Proposal Functions
  'function createPropertyProposal(string propertyAddress, string metadataURI, uint256 proposedPrice) payable returns (uint256)',
  'function requestOracleValuation(uint256 proposalId) returns (bytes32)',
  'function completeOracleValuation(uint256 proposalId)',
  'function createDAOProposal(uint256 proposalId, string description) returns (uint256)',
  'function executePropertyAcquisition(uint256 proposalId) payable',
  
  // View Functions
  'function getProposal(uint256 proposalId) view returns (tuple)',
  'function getAllProposals() view returns (uint256[])',
  'function getProposalsByState(uint8 state, uint256 offset, uint256 limit) view returns (uint256[])',
  'function getProposalCount() view returns (uint256)',
  'function hasActiveProposal(string propertyAddress) view returns (bool hasProposal, uint256 proposalId, uint8 state)',
  'function isProposalExpired(uint256 proposalId) view returns (bool expired, string reason)',
  
  // Events
  'event PropertyProposalCreated(uint256 indexed proposalId, address indexed proposer, string propertyAddress, uint256 proposedPrice, string metadataURI, uint256 bondAmount)',
  'event OracleValuationRequested(uint256 indexed proposalId, bytes32 indexed requestId, string propertyAddress, address indexed requestor)',
  'event OracleValuationCompleted(uint256 indexed proposalId, uint256 oracleValuation, bool priceValid, uint256 variance, address indexed validator)',
  'event PropertyAcquired(uint256 indexed proposalId, uint256 indexed tokenId, uint256 acquisitionPrice, address indexed executor)'
] as const;

// Keeper ABI
export const KEEPER_ABI = [
  // Automation Functions
  'function checkUpkeep(bytes calldata) view returns (bool upkeepNeeded, bytes performData)',
  'function performUpkeep(bytes calldata performData)',
  'function addProposalToQueue(uint256 proposalId) returns (bool)',
  'function isValidKeeper() view returns (bool)',
  
  // Queue Management
  'function getQueuedProposalsCount() view returns (uint256)',
  'function getQueuedProposals() view returns (uint256[] proposalIds, uint8[] priorities, uint256[] queuedTimes, uint256[] attemptCounts)',
  'function isInQueue(uint256 proposalId) view returns (bool)',
  'function getProposalQueuePosition(uint256 proposalId) view returns (uint256 position)',
  
  // Health Monitoring
  'function getKeeperHealth() view returns (bool isHealthy, uint256 queueLength, uint256 successRate, uint256 avgGasUsage, uint256 consecutiveFailures, uint256 lastExecutionTime, bool isPaused)',
  'function getExecutionMetrics() view returns (tuple)',
  'function getProposalFailureInfo(uint256 proposalId) view returns (uint256 failureCount, uint256 lastFailure, bool inCooldown, uint256 cooldownEnds)',
  
  // Configuration
  'function gasConfig() view returns (tuple)',
  'function emergencyPaused() view returns (bool)',
  
  // Events
  'event ProposalAddedToQueue(uint256 indexed proposalId, uint8 priority, uint256 queuePosition, uint256 queueLength)',
  'event ProposalExecuted(uint256 indexed proposalId, uint256 queueLength, uint256 gasUsed, uint256 attemptCount)',
  'event ProposalExecutionFailed(uint256 indexed proposalId, string reason, uint256 attemptCount, bool willRetry)'
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