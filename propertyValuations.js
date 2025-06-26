
// Property Valuation Function for Chainlink Functions
// Fetches real estate data from multiple APIs and returns standardized valuation

// Input arguments from smart contract
const propertyIdentifier = args[0]; // Property address or identifier
const requestType = args[1]; // "full", "price", "rent", "market"

// API configuration (secrets stored in Chainlink Functions)
const ZILLOW_API_KEY = secrets.ZILLOW_API_KEY;
const RENTSPREE_API_KEY = secrets.RENTSPREE_API_KEY;
const REALTY_MOLE_API_KEY = secrets.REALTY_MOLE_API_KEY;

// Helper function to make HTTP requests
async function makeRequest(url, headers = {}) {
    try {
        const response = await Functions.makeHttpRequest({
            url: url,
            method: "GET",
            headers: headers,
            timeout: 9000
        });
        
        if (response.error) {
            console.error(`HTTP Error: ${response.error}`);
            return null;
        }
        
        return response.data;
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        return null;
    }
}

// Function to get property data from Zillow API
async function getZillowData(address) {
    try {
        // Zillow API endpoint (using RapidAPI or direct API)
        const url = `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(address)}`;
        
        const headers = {
            'X-RapidAPI-Key': ZILLOW_API_KEY,
            'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        };
        
        const data = await makeRequest(url, headers);
        
        if (!data || !data.props || data.props.length === 0) {
            return null;
        }
        
        const property = data.props[0];
        
        return {
            estimatedValue: Math.round((property.price || 0) * 100), // Convert to cents
            rentEstimate: Math.round((property.rentZestimate || 0) * 100), // Convert to cents
            bedrooms: property.bedrooms || 0,
            bathrooms: Math.round((property.bathrooms || 0) * 10), // One decimal place
            sqft: property.livingArea || 0,
            pricePerSqFt: property.livingArea > 0 ? Math.round((property.price / property.livingArea) * 100) : 0,
            source: "Zillow",
            confidence: 85
        };
    } catch (error) {
        console.error(`Zillow API error: ${error.message}`);
        return null;
    }
}

// Function to get property data from RentSpree API
async function getRentSpreeData(address) {
    try {
        const url = `https://rentspree.p.rapidapi.com/properties/search?location=${encodeURIComponent(address)}`;
        
        const headers = {
            'X-RapidAPI-Key': RENTSPREE_API_KEY,
            'X-RapidAPI-Host': 'rentspree.p.rapidapi.com'
        };
        
        const data = await makeRequest(url, headers);
        
        if (!data || !data.results || data.results.length === 0) {
            return null;
        }
        
        const property = data.results[0];
        
        return {
            estimatedValue: Math.round((property.estimated_value || 0) * 100),
            rentEstimate: Math.round((property.rent || 0) * 100),
            bedrooms: property.bedrooms || 0,
            bathrooms: Math.round((property.bathrooms || 0) * 10),
            sqft: property.square_feet || 0,
            pricePerSqFt: property.square_feet > 0 ? Math.round((property.estimated_value / property.square_feet) * 100) : 0,
            source: "RentSpree",
            confidence: 80
        };
    } catch (error) {
        console.error(`RentSpree API error: ${error.message}`);
        return null;
    }
}

// Function to get property data from Realty Mole API
async function getRealtyMoleData(address) {
    try {
        const url = `https://realty-mole-property-api.p.rapidapi.com/properties?address=${encodeURIComponent(address)}`;
        
        const headers = {
            'X-RapidAPI-Key': REALTY_MOLE_API_KEY,
            'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
        };
        
        const data = await makeRequest(url, headers);
        
        if (!data || data.length === 0) {
            return null;
        }
        
        const property = data[0];
        
        return {
            estimatedValue: Math.round((property.estimatedValue || 0) * 100),
            rentEstimate: Math.round((property.rentEstimate || 0) * 100),
            bedrooms: property.bedrooms || 0,
            bathrooms: Math.round((property.bathrooms || 0) * 10),
            sqft: property.squareFootage || 0,
            pricePerSqFt: property.squareFootage > 0 ? Math.round((property.estimatedValue / property.squareFootage) * 100) : 0,
            source: "RealtyMole",
            confidence: 75
        };
    } catch (error) {
        console.error(`RealtyMole API error: ${error.message}`);
        return null;
    }
}

// Mock property data for demo/testing when APIs are unavailable
function getMockData(address) {
    // Generate consistent mock data based on address hash
    const hash = address.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const baseValue = 300000 + (Math.abs(hash) % 500000); // $300k - $800k
    const rentMultiplier = 0.008 + (Math.abs(hash) % 1000) / 100000; // 0.8% - 1.8% of value
    
    return {
        estimatedValue: Math.round(baseValue * 100), // Convert to cents
        rentEstimate: Math.round(baseValue * rentMultiplier / 12 * 100), // Monthly rent in cents
        bedrooms: 2 + (Math.abs(hash) % 4), // 2-5 bedrooms
        bathrooms: Math.round((1.5 + (Math.abs(hash) % 25) / 10) * 10), // 1.5-4.0 bathrooms
        sqft: 1200 + (Math.abs(hash) % 2000), // 1200-3200 sqft
        pricePerSqFt: Math.round((baseValue / (1200 + (Math.abs(hash) % 2000))) * 100),
        source: "MockData",
        confidence: 60
    };
}

// Main execution function
async function getPropertyValuation() {
    console.log(`Fetching ${requestType} valuation for: ${propertyIdentifier}`);
    
    const results = [];
    
    // Fetch data from multiple sources based on request type
    if (requestType === "full" || requestType === "price") {
        // Try Zillow first (most comprehensive)
        if (ZILLOW_API_KEY) {
            const zillowData = await getZillowData(propertyIdentifier);
            if (zillowData) results.push(zillowData);
        }
        
        // Try RentSpree
        if (RENTSPREE_API_KEY && results.length < 2) {
            const rentSpreeData = await getRentSpreeData(propertyIdentifier);
            if (rentSpreeData) results.push(rentSpreeData);
        }
        
        // Try RealtyMole
        if (REALTY_MOLE_API_KEY && results.length < 2) {
            const realtyMoleData = await getRealtyMoleData(propertyIdentifier);
            if (realtyMoleData) results.push(realtyMoleData);
        }
    }
    
    // If no real data available, use mock data for demo
    if (results.length === 0) {
        console.log("No API data available, using mock data for demo");
        results.push(getMockData(propertyIdentifier));
    }
    
    // Aggregate results (weighted average based on confidence)
    let totalWeight = 0;
    let weightedValue = 0;
    let weightedRent = 0;
    let weightedPricePerSqFt = 0;
    let maxConfidence = 0;
    let bestSource = "";
    let avgBedrooms = 0;
    let avgBathrooms = 0;
    let avgSqft = 0;
    
    results.forEach(result => {
        const weight = result.confidence / 100;
        totalWeight += weight;
        weightedValue += result.estimatedValue * weight;
        weightedRent += result.rentEstimate * weight;
        weightedPricePerSqFt += result.pricePerSqFt * weight;
        
        if (result.confidence > maxConfidence) {
            maxConfidence = result.confidence;
            bestSource = result.source;
            avgBedrooms = result.bedrooms;
            avgBathrooms = result.bathrooms;
            avgSqft = result.sqft;
        }
    });
    
    // Calculate final weighted averages
    const finalEstimatedValue = Math.round(weightedValue / totalWeight);
    const finalRentEstimate = Math.round(weightedRent / totalWeight);
    const finalPricePerSqFt = Math.round(weightedPricePerSqFt / totalWeight);
    const finalConfidence = Math.min(maxConfidence, 95); // Cap at 95%
    
    console.log(`Final valuation: $${finalEstimatedValue/100}, Rent: $${finalRentEstimate/100}, Confidence: ${finalConfidence}%`);
    
    return {
        estimatedValue: finalEstimatedValue,
        rentEstimate: finalRentEstimate,
        confidenceScore: finalConfidence,
        dataSource: bestSource,
        pricePerSqFt: finalPricePerSqFt,
        bedrooms: avgBedrooms,
        bathrooms: avgBathrooms,
        sqft: avgSqft
    };
}

// Execute the main function
const valuation = await getPropertyValuation();

// Encode the response data as hex string
const encodedHex = Functions.encodeUint256(valuation.estimatedValue) +
    Functions.encodeUint256(valuation.rentEstimate).slice(2) +
    Functions.encodeUint256(valuation.confidenceScore).slice(2) +
    Functions.encodeString(valuation.dataSource).slice(2) +
    Functions.encodeUint256(valuation.pricePerSqFt).slice(2) +
    Functions.encodeUint256(valuation.bedrooms).slice(2) +
    Functions.encodeUint256(valuation.bathrooms).slice(2) +
    Functions.encodeUint256(valuation.sqft).slice(2);

// Convert hex string to Uint8Array for Chainlink Functions
function hexToUint8Array(hex) {
    // Remove 0x prefix if present
    hex = hex.replace(/^0x/, '');
    // Ensure even length
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }
    // Convert to Uint8Array
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

// Return as Uint8Array
return hexToUint8Array(encodedHex);