// Test script to verify Chainlink oracle calls
// Run this in browser console to check if oracle is responding

const ORACLE_ADDRESS = '0x53228D0fBD73fa84F8E48F38C33971e1F682abA2';
const ORACLE_ABI = [
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
  }
];

async function testOracleConnection() {
  console.log('🔗 Testing Chainlink Oracle Connection...');
  console.log('Oracle Address:', ORACLE_ADDRESS);
  
  const testProperties = [
    '123_test_street_austin_tx',
    '456_suburban_drive_dallas_tx', 
    '999_luxury_lane_beverly_hills_ca'
  ];
  
  for (const propertyId of testProperties) {
    console.log(`\n📍 Testing Property: ${propertyId}`);
    
    try {
      // Use ethers if available, otherwise use raw RPC
      if (window.ethers) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);
        
        console.log('⏳ Calling oracle contract...');
        const result = await contract.getPropertyValuation(propertyId);
        
        console.log('✅ Oracle Response:', {
          estimatedValue: ethers.utils.formatEther(result.estimatedValue),
          rentEstimate: ethers.utils.formatEther(result.rentEstimate),
          lastUpdated: new Date(result.lastUpdated.toNumber() * 1000),
          confidenceScore: result.confidenceScore.toString(),
          dataSource: result.dataSource,
          isActive: result.isActive
        });
        
        if (result.estimatedValue.gt(0)) {
          console.log('🎉 SUCCESS: Oracle returned real data!');
        } else {
          console.log('⚠️  Oracle returned zero value - might be empty');
        }
        
      } else {
        console.log('❌ ethers.js not available, using raw call...');
        
        // Encode function call
        const functionSignature = '0x8b7afe2e'; // getPropertyValuation(string)
        const encodedProperty = ethers.utils.defaultAbiCoder.encode(['string'], [propertyId]);
        const calldata = functionSignature + encodedProperty.slice(2);
        
        const result = await window.ethereum.request({
          method: 'eth_call',
          params: [{
            to: ORACLE_ADDRESS,
            data: calldata
          }, 'latest']
        });
        
        console.log('Raw result:', result);
        
        if (result !== '0x') {
          console.log('✅ Oracle responded with data');
        } else {
          console.log('⚠️  Oracle returned empty response');
        }
      }
      
    } catch (error) {
      console.log('❌ Oracle call failed:', error);
      console.log('This means oracle is either:');
      console.log('1. Not deployed at this address');
      console.log('2. Not populated with data');
      console.log('3. Network connection issue');
    }
  }
}

async function checkNetworkAndContract() {
  console.log('\n🌐 Checking Network & Contract Status...');
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Chain ID:', parseInt(chainId, 16));
    
    if (parseInt(chainId, 16) !== 11155111) {
      console.log('⚠️  WARNING: Not on Sepolia testnet (11155111)');
      console.log('Your oracle is deployed on Sepolia');
    } else {
      console.log('✅ Connected to Sepolia testnet');
    }
    
    // Check if contract exists
    const code = await window.ethereum.request({
      method: 'eth_getCode',
      params: [ORACLE_ADDRESS, 'latest']
    });
    
    if (code === '0x') {
      console.log('❌ No contract found at oracle address');
      console.log('Either wrong address or not deployed');
    } else {
      console.log('✅ Contract exists at oracle address');
      console.log('Contract code length:', code.length);
    }
    
  } catch (error) {
    console.log('❌ Network check failed:', error);
  }
}

// Main test function
async function runOracleTests() {
  console.log('🧪 Starting Chainlink Oracle Tests...');
  console.log('='.repeat(50));
  
  await checkNetworkAndContract();
  await testOracleConnection();
  
  console.log('\n📋 Summary:');
  console.log('If you see "Oracle returned real data" above, your frontend IS calling the real Chainlink DON');
  console.log('If you see errors or zero values, the oracle needs to be populated with demo data');
  console.log('\nTo populate oracle with demo data, run this in your smart contract:');
  console.log(`
// Call on your oracle contract (${ORACLE_ADDRESS})
setPropertyValuation(
    "123_test_street_austin_tx",
    580000000000000000000000, // $580k in wei
    4200000000000000000000,    // $4.2k rent in wei  
    block.timestamp,
    85,
    "Chainlink Real Estate Oracle v2.0",
    true
);
  `);
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.runOracleTests = runOracleTests;
  console.log('💡 Run window.runOracleTests() to test your oracle connection');
}