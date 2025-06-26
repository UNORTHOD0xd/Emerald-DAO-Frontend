export interface DemoProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Mixed-Use';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  askingPrice: string;
  expectedMonthlyRent: string;
  description: string;
  imageUrl: string;
  // Mock oracle data
  estimatedValue: string;
  confidenceScore: number;
  dataSource: string;
  pricePerSqFt: number;
  // Mock documents
  deedUrl: string;
  inspectionUrl: string;
  appraisalUrl: string;
  photoUrls: string[];
}

// Mock property data based on your existing images and propertyValuations.js logic
export const demoProperties: DemoProperty[] = [
  {
    id: 'austin_tx_demo',
    address: '2401 E 6th St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    propertyType: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    askingPrice: '485000',
    expectedMonthlyRent: '3200',
    description: 'Beautiful modern home in the heart of East Austin. This property features an open floor plan, updated kitchen with granite countertops, and a spacious backyard perfect for entertaining. Located in one of Austin\'s most desirable neighborhoods with easy access to downtown, local restaurants, and music venues. The area has shown consistent appreciation and strong rental demand from young professionals and tech workers.',
    imageUrl: '/images/Austin_TX.webp',
    estimatedValue: '475000',
    confidenceScore: 85,
    dataSource: 'Zillow',
    pricePerSqFt: 262,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo1PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo1Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo1Appraisal',
    photoUrls: [
      '/images/Austin_TX.webp',
      'https://ipfs.io/ipfs/QmDemo1Photo2',
      'https://ipfs.io/ipfs/QmDemo1Photo3'
    ]
  },
  {
    id: 'denver_co_demo',
    address: '1537 N High St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80218',
    propertyType: 'Residential',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    askingPrice: '625000',
    expectedMonthlyRent: '4100',
    description: 'Stunning Victorian-style home in the trendy Highland neighborhood. This property boasts original hardwood floors, high ceilings, and modern updates throughout. The kitchen features stainless steel appliances and quartz countertops. Large backyard with mountain views. Walking distance to parks, breweries, and the light rail. Denver\'s strong job market and population growth make this an excellent investment opportunity.',
    imageUrl: '/images/Denver.webp',
    estimatedValue: '610000',
    confidenceScore: 80,
    dataSource: 'RentSpree',
    pricePerSqFt: 284,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo2PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo2Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo2Appraisal',
    photoUrls: [
      '/images/Denver.webp',
      'https://ipfs.io/ipfs/QmDemo2Photo2',
      'https://ipfs.io/ipfs/QmDemo2Photo3'
    ]
  },
  {
    id: 'miami_fl_demo',
    address: '425 NE 22nd St',
    city: 'Miami',
    state: 'FL',
    zipCode: '33137',
    propertyType: 'Residential',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    askingPrice: '520000',
    expectedMonthlyRent: '3800',
    description: 'Modern waterfront condo in the vibrant Wynwood Arts District. Floor-to-ceiling windows offer stunning city views, while the open-concept design maximizes space and natural light. Building amenities include a rooftop pool, fitness center, and 24/7 concierge. Walking distance to world-class dining, art galleries, and nightlife. Miami\'s growing tech scene and international appeal drive strong rental demand.',
    imageUrl: '/images/Miami.webp',
    estimatedValue: '535000',
    confidenceScore: 75,
    dataSource: 'RealtyMole',
    pricePerSqFt: 433,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo3PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo3Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo3Appraisal',
    photoUrls: [
      '/images/Miami.webp',
      'https://ipfs.io/ipfs/QmDemo3Photo2',
      'https://ipfs.io/ipfs/QmDemo3Photo3'
    ]
  },
  {
    id: 'nashville_tn_demo',
    address: '1205 16th Ave S',
    city: 'Nashville',
    state: 'TN',
    zipCode: '37212',
    propertyType: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1650,
    askingPrice: '375000',
    expectedMonthlyRent: '2900',
    description: 'Charming bungalow in the historic Music Row area. This property features original character with modern conveniences, including updated electrical and plumbing. Hardwood floors throughout, spacious front porch, and private backyard. Walking distance to Vanderbilt University, Music Row studios, and downtown Nashville. The city\'s booming music and healthcare industries ensure steady rental demand.',
    imageUrl: '/images/Nashville.webp',
    estimatedValue: '365000',
    confidenceScore: 82,
    dataSource: 'Zillow',
    pricePerSqFt: 227,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo4PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo4Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo4Appraisal',
    photoUrls: [
      '/images/Nashville.webp',
      '/images/Nashville_floorplan.png',
      'https://ipfs.io/ipfs/QmDemo4Photo3'
    ]
  },
  {
    id: 'portland_or_demo',
    address: '2847 SE Division St',
    city: 'Portland',
    state: 'OR',
    zipCode: '97202',
    propertyType: 'Residential',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    askingPrice: '425000',
    expectedMonthlyRent: '2700',
    description: 'Cozy craftsman home in the trendy Division-Richmond neighborhood. Features include original built-ins, refinished hardwood floors, and a updated kitchen with subway tile backsplash. Small but efficient layout with a detached garage and mature landscaping. Located on a quiet tree-lined street with easy access to Division\'s famous food scene, boutique shops, and public transportation.',
    imageUrl: '/images/Portland.webp',
    estimatedValue: '415000',
    confidenceScore: 78,
    dataSource: 'RentSpree',
    pricePerSqFt: 386,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo5PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo5Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo5Appraisal',
    photoUrls: [
      '/images/Portland.webp',
      'https://ipfs.io/ipfs/QmDemo5Photo2',
      'https://ipfs.io/ipfs/QmDemo5Photo3'
    ]
  },
  {
    id: 'seattle_wa_demo',
    address: '1423 E Pine St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98122',
    propertyType: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1750,
    askingPrice: '695000',
    expectedMonthlyRent: '4200',
    description: 'Contemporary townhome in the vibrant Capitol Hill neighborhood. This three-story property features an open-concept main floor, modern kitchen with stainless appliances, and rooftop deck with Sound views. Master suite with walk-in closet and spa-like bathroom. Attached garage and private courtyard. Walking distance to Pike Place Market, tech companies, and Seattle\'s best restaurants and nightlife.',
    imageUrl: '/images/Seattle.webp',
    estimatedValue: '710000',
    confidenceScore: 88,
    dataSource: 'Zillow',
    pricePerSqFt: 397,
    deedUrl: 'https://ipfs.io/ipfs/QmDemo6PropertyDeed',
    inspectionUrl: 'https://ipfs.io/ipfs/QmDemo6Inspection',
    appraisalUrl: 'https://ipfs.io/ipfs/QmDemo6Appraisal',
    photoUrls: [
      '/images/Seattle.webp',
      'https://ipfs.io/ipfs/QmDemo6Photo2',
      'https://ipfs.io/ipfs/QmDemo6Photo3'
    ]
  }
];

// Helper function to calculate ROI
export const calculatePropertyROI = (askingPrice: string, monthlyRent: string): string => {
  const price = parseFloat(askingPrice) || 0;
  const rent = parseFloat(monthlyRent) || 0;
  const annualRent = rent * 12;
  
  if (price > 0) {
    return ((annualRent / price) * 100).toFixed(2);
  }
  return '0.00';
};

// Helper function to get price analysis
export const getPriceAnalysis = (askingPrice: string, estimatedValue: string) => {
  const asking = parseFloat(askingPrice) || 0;
  const estimated = parseFloat(estimatedValue) || 0;
  
  if (asking > 0 && estimated > 0) {
    const difference = ((asking - estimated) / estimated) * 100;
    return {
      difference: difference.toFixed(1),
      isOverpriced: difference > 10,
      isUnderpriced: difference < -10,
      isFair: Math.abs(difference) <= 10,
    };
  }
  return null;
};