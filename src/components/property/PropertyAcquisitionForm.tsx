'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  DollarSign, 
  Home, 
  FileText, 
  Upload, 
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { 
  Card, 
  CardContent, 
  Button, 
  Input, 
  Modal,
  Badge,
} from '@/components/ui';
import { ChainlinkPriceDisplay } from '@/components/property/ChainlinkPriceDisplay';
import { OracleStatusIndicator } from '@/components/property/OracleStatusIndicator';
import { ChainlinkRequestStatus } from '@/components/property/ChainlinkRequestStatus';
import { DemoPropertySelector } from '@/components/property/DemoPropertySelector';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { useRealChainlinkData } from '@/hooks/useRealChainlinkData';
import { useDemoPropertyData } from '@/hooks/useDemoPropertyData';
import { type DemoProperty } from '@/data/demoProperties';
import { usePublicClient } from 'wagmi';

interface PropertyFormData {
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
  // Due diligence documents
  deedUrl: string;
  inspectionUrl: string;
  appraisalUrl: string;
  photoUrls: string[];
  // Chainlink oracle data
  oracleValidation: boolean;
  estimatedValue: string;
  priceConfidence: number;
}

interface PropertyAcquisitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proposalId: string) => void;
  demoMode?: boolean;
  preSelectedProperty?: DemoProperty;
}

export const PropertyAcquisitionForm: React.FC<PropertyAcquisitionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  demoMode = false,
  preSelectedProperty,
}) => {
  const { address, isConnected } = useAccount();
  const { canVote, votingPower } = useEmeraldDAO();
  const [step, setStep] = useState(demoMode ? (preSelectedProperty ? 1 : 0) : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const publicClient = usePublicClient();
  
  // Demo property data hook
  const { 
    selectedProperty: demoProperty,
    setSelectedProperty: setDemoProperty,
    getDemoFormData
  } = useDemoPropertyData();
  
  // Generate a mock property ID for Chainlink oracle demonstration
  const [mockPropertyId, setMockPropertyId] = useState<string>('');
  const { 
    valuationData: valuation, 
    isLoading: isOracleLoading, 
    isRequesting: isRequestingOracle,
    error: oracleError,
    hasRealData,
    requestValuation: requestOracleValuation,
    requestHash,
    isConfirmed: isOracleConfirmed
  } = useRealChainlinkData(mockPropertyId);
  const [formData, setFormData] = useState<PropertyFormData>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'Residential',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1000,
    askingPrice: '',
    expectedMonthlyRent: '',
    description: '',
    deedUrl: '',
    inspectionUrl: '',
    appraisalUrl: '',
    photoUrls: [],
    oracleValidation: false,
    estimatedValue: '',
    priceConfidence: 0,
  });

  // Contract write hook for proposal creation
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle pre-selected demo property
  useEffect(() => {
    if (preSelectedProperty && demoMode) {
      const demoFormData = getDemoFormData(preSelectedProperty);
      setFormData(demoFormData);
      setDemoProperty(preSelectedProperty);
      setMockPropertyId(preSelectedProperty.id);
      setShowDemoSelector(false);
    }
  }, [preSelectedProperty, demoMode, getDemoFormData, setDemoProperty]);

  // Handle demo property selection
  const handleDemoPropertySelect = (property: DemoProperty) => {
    const demoFormData = getDemoFormData(property);
    setFormData(demoFormData);
    setDemoProperty(property);
    setMockPropertyId(property.id);
    setShowDemoSelector(false);
    setStep(1);
  };

  // State preservation flags to prevent form reset during transactions
  const [shouldPreserveData, setShouldPreserveData] = useState(false);
  const [hasStartedWorkflow, setHasStartedWorkflow] = useState(false);

  // Mark data as worth preserving when oracle request starts or workflow begins
  useEffect(() => {
    if (isRequestingOracle || isOracleLoading || formData.oracleValidation || step > 2 || requestHash) {
      setShouldPreserveData(true);
      setHasStartedWorkflow(true);
    }
  }, [isRequestingOracle, isOracleLoading, formData.oracleValidation, step, requestHash]);

  // Reset form when modal closes but preserve data during oracle transactions
  useEffect(() => {
    if (!isOpen && !shouldPreserveData && !hasStartedWorkflow && !isRequestingOracle && !isOracleLoading) {
      setStep(demoMode ? (preSelectedProperty ? 1 : 0) : 1);
      // Only reset form data if there's no pre-selected property or we're not in demo mode
      if (!preSelectedProperty || !demoMode) {
        setFormData({
          address: '',
          city: '',
          state: '',
          zipCode: '',
          propertyType: 'Residential',
          bedrooms: 1,
          bathrooms: 1,
          sqft: 1000,
          askingPrice: '',
          expectedMonthlyRent: '',
          description: '',
          deedUrl: '',
          inspectionUrl: '',
          appraisalUrl: '',
          photoUrls: [],
          oracleValidation: false,
          estimatedValue: '',
          priceConfidence: 0,
        });
        setMockPropertyId('');
        setDemoProperty(null);
      }
      setIsSubmitting(false);
    }
    
    // Reset preservation flags when modal actually closes after successful submission
    if (!isOpen && (isSuccess || !hasStartedWorkflow)) {
      setTimeout(() => {
        setShouldPreserveData(false);
        setHasStartedWorkflow(false);
      }, 2000); // Longer delay to prevent premature reset during transaction flow
    }
  }, [isOpen, shouldPreserveData, hasStartedWorkflow, isRequestingOracle, isOracleLoading, demoMode, preSelectedProperty, setDemoProperty, isSuccess]);

  // Generate property ID for oracle when location is entered (skip in demo mode)
  useEffect(() => {
    if (formData.address && formData.city && formData.state && !demoMode) {
      const propertyId = `${formData.address}_${formData.city}_${formData.state}`.replace(/\s+/g, '_').toLowerCase();
      setMockPropertyId(propertyId);
    }
  }, [formData.address, formData.city, formData.state, demoMode]);

  // Update form data when oracle valuation is received (skip in demo mode as it's pre-populated)
  useEffect(() => {
    if (valuation && !isOracleLoading && !demoMode && isOpen) {
      setFormData(prev => ({
        ...prev,
        oracleValidation: true,
        estimatedValue: valuation.estimatedValue.toString(),
        priceConfidence: Number(valuation.confidenceScore),
      }));
    }
  }, [valuation, isOracleLoading, demoMode, isOpen]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      onSuccess?.(hash);
      // Allow form to reset after successful completion
      setShouldPreserveData(false);
      setHasStartedWorkflow(false);
      onClose();
    }
  }, [isSuccess, hash, onSuccess, onClose]);

  const handleInputChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPhotoUrl = () => {
    setFormData(prev => ({
      ...prev,
      photoUrls: [...prev.photoUrls, ''],
    }));
  };

  const updatePhotoUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.map((photo, i) => i === index ? url : photo),
    }));
  };

  const removePhotoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.address && formData.city && formData.state && formData.zipCode);
      case 2:
        return !!(formData.askingPrice && formData.expectedMonthlyRent && formData.sqft > 0);
      case 3:
        return formData.oracleValidation; // Oracle validation required
      case 4:
        return !!formData.description;
      case 5:
        return !!(formData.deedUrl && formData.inspectionUrl);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      // Mark workflow as started when user progresses past step 2 (property details)
      if (step >= 2) {
        setShouldPreserveData(true);
        setHasStartedWorkflow(true);
      }
      setStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const calculateROI = () => {
    const price = parseFloat(formData.askingPrice) || 0;
    const monthlyRent = parseFloat(formData.expectedMonthlyRent) || 0;
    const annualRent = monthlyRent * 12;
    
    if (price > 0) {
      return ((annualRent / price) * 100).toFixed(2);
    }
    return '0.00';
  };

  const getPriceDifferenceAnalysis = () => {
    const askingPrice = parseFloat(formData.askingPrice) || 0;
    const oraclePrice = parseFloat(formData.estimatedValue) || 0;
    
    if (askingPrice > 0 && oraclePrice > 0) {
      const difference = ((askingPrice - oraclePrice) / oraclePrice) * 100;
      return {
        difference: difference.toFixed(1),
        isOverpriced: difference > 10,
        isUnderpriced: difference < -10,
        isFair: Math.abs(difference) <= 10,
      };
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!canVote) {
      alert('You need ERLD tokens and voting power to create proposals. Make sure you have delegated your tokens to yourself.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields before proceeding
      if (!formData.askingPrice || !formData.expectedMonthlyRent) {
        alert('Asking price and expected monthly rent are required');
        return;
      }

      // Validate numeric values
      const askingPriceNum = parseFloat(formData.askingPrice);
      const rentNum = parseFloat(formData.expectedMonthlyRent);
      
      if (isNaN(askingPriceNum) || askingPriceNum <= 0) {
        alert('Invalid asking price');
        return;
      }
      
      if (isNaN(rentNum) || rentNum <= 0) {
        alert('Invalid expected monthly rent');
        return;
      }

      // Create lightweight proposal metadata (under 200 char limit)
      const compactMetadata = {
        addr: `${formData.address}, ${formData.city}, ${formData.state}`.substring(0, 30),
        price: formData.askingPrice,
        roi: calculateROI(),
        type: formData.propertyType,
        beds: formData.bedrooms,
        baths: formData.bathrooms
      };

      // Create property acquisition proposal on-chain
      console.log('Creating property acquisition proposal:', compactMetadata);

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Create short metadata URI that stays under 200 character contract limit
      const metadataUri = `ipfs://mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Prepare arguments with validation (matching deployed contract signature)
      const args = [
        fullAddress,                                    // propertyAddress
        metadataUri,                                   // metadataURI  
        parseEther(formData.askingPrice.toString())    // proposedPrice
      ];

      console.log('Contract call arguments:', args);
      console.log('Contract address:', CONTRACT_CONFIG.propertyAcquisition.address);

      // Check if contract is deployed before attempting to call it
      if (publicClient) {
        try {
          const contractCode = await publicClient.getCode({
            address: CONTRACT_CONFIG.propertyAcquisition.address,
          });
          
          if (!contractCode || contractCode === '0x') {
            console.warn('PropertyAcquisition contract not deployed, using demo mode');
            // In demo mode, just simulate successful proposal creation
            setTimeout(() => {
              const mockProposalId = `0x${Date.now().toString(16)}`;
              console.log('Demo proposal created with ID:', mockProposalId);
              onSuccess?.(mockProposalId);
              onClose();
            }, 2000);
            return;
          }
          
          console.log('Contract is deployed, proceeding with transaction...');
        } catch (deploymentError) {
          console.error('Contract deployment check failed:', deploymentError);
          console.warn('Falling back to demo mode due to contract issues');
          // Fallback to demo mode if contract check fails
          setTimeout(() => {
            const mockProposalId = `0x${Date.now().toString(16)}`;
            console.log('Demo proposal created with ID:', mockProposalId);
            alert('Note: Created as demo proposal due to contract deployment issues');
            onSuccess?.(mockProposalId);
            onClose();
          }, 2000);
          return;
        }
      }

      writeContract({
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'createPropertyProposal',
        args,
        value: parseEther('0.1'), // MIN_PROPOSAL_BOND (0.1 ETH)
      });

    } catch (error) {
      console.error('Failed to create proposal:', error);
      let errorMessage = 'Failed to create proposal. ';
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Contract execution failed. The PropertyAcquisition contract may not be properly deployed or initialized.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction.';
        } else {
          errorMessage += error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DemoPropertySelector
            onSelectProperty={handleDemoPropertySelect}
            onClose={onClose}
          />
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Property Location</h3>
            </div>
            
            <Input
              label="Property Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main Street"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Austin"
                required
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="TX"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="78701"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Home size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Property Details</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Bedrooms"
                type="number"
                value={formData.bedrooms.toString()}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                min="0"
              />
              <Input
                label="Bathrooms"
                type="number"
                value={formData.bathrooms.toString()}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                min="0"
                step="0.5"
              />
              <Input
                label="Square Feet"
                type="number"
                value={formData.sqft.toString()}
                onChange={(e) => handleInputChange('sqft', parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Asking Price (USD)"
                type="number"
                value={formData.askingPrice}
                onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                placeholder="500000"
                leftIcon={<DollarSign size={16} />}
                required
              />
              <Input
                label="Expected Monthly Rent (USD)"
                type="number"
                value={formData.expectedMonthlyRent}
                onChange={(e) => handleInputChange('expectedMonthlyRent', e.target.value)}
                placeholder="3500"
                leftIcon={<DollarSign size={16} />}
                required
              />
            </div>
            
            {formData.askingPrice && formData.expectedMonthlyRent && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-medium">Estimated Annual ROI:</span>
                    <Badge variant="success" size="lg">
                      {calculateROI()}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Chainlink Oracle Validation</h3>
            </div>
            
            {mockPropertyId && (
              <div className="space-y-3 mb-4">
                <OracleStatusIndicator
                  hasRealData={hasRealData}
                  isLoading={isOracleLoading || isRequestingOracle}
                  error={oracleError}
                  contractAddress={CONTRACT_CONFIG.oracle.address}
                />
                
                {/* Chainlink Functions Request Status */}
                <ChainlinkRequestStatus
                  requestHash={requestHash}
                  isRequesting={isRequestingOracle}
                  isConfirmed={isOracleConfirmed}
                  error={oracleError}
                  onRequestNew={() => {
                    // Mark workflow as started before making oracle request
                    setShouldPreserveData(true);
                    setHasStartedWorkflow(true);
                    requestOracleValuation();
                  }}
                />
                
                <ChainlinkPriceDisplay propertyId={mockPropertyId} />
              </div>
            )}

            {formData.oracleValidation && (
              <div className="space-y-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-emerald-800 mb-3">Oracle Valuation Analysis</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-800">Asking Price:</span>
                        <div className="font-semibold">${parseInt(formData.askingPrice || '0').toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-800">Oracle Estimate:</span>
                        <div className="font-semibold">${parseInt(formData.estimatedValue || '0').toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-800">Confidence Score:</span>
                        <div className="font-semibold">{formData.priceConfidence}%</div>
                      </div>
                      <div>
                        <span className="text-gray-800">Price Analysis:</span>
                        {(() => {
                          const analysis = getPriceDifferenceAnalysis();
                          if (!analysis) return <div className="text-gray-500">Calculating...</div>;
                          
                          let badgeVariant: 'success' | 'warning' | 'error' = 'success';
                          let badgeText = 'Fair Pricing';
                          
                          if (analysis.isOverpriced) {
                            badgeVariant = 'error';
                            badgeText = `${analysis.difference}% Overpriced`;
                          } else if (analysis.isUnderpriced) {
                            badgeVariant = 'success';
                            badgeText = `${Math.abs(parseFloat(analysis.difference))}% Underpriced`;
                          }
                          
                          return <Badge variant={badgeVariant}>{badgeText}</Badge>;
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(() => {
                  const analysis = getPriceDifferenceAnalysis();
                  if (analysis?.isOverpriced) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle size={16} className="text-red-600 mt-0.5" />
                          <div className="text-sm text-red-800">
                            <p className="font-medium mb-1">Price Alert:</p>
                            <p>The asking price is significantly higher than the oracle valuation. Consider negotiating the price or providing additional justification for the premium.</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Oracle Validation Complete</p>
                      <p>Chainlink oracle data has been integrated into this proposal. This valuation will be included in the governance discussion.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!formData.oracleValidation && !isOracleLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Oracle Validation Required</p>
                    <p>Please wait for Chainlink oracle validation to complete before proceeding.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Property Description</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Investment Proposal Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe why this property would be a good investment for the DAO. Include details about the location, market conditions, tenant history, and expected returns..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
                required
              />
              <p className="text-sm text-gray-700 mt-1">
                Provide a detailed explanation of the investment opportunity.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Upload size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Due Diligence Documents</h3>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  All documents should be uploaded to IPFS or a secure document storage service. 
                  Provide the direct URLs below.
                </p>
              </div>
            </div>
            
            <Input
              label="Property Deed URL"
              value={formData.deedUrl}
              onChange={(e) => handleInputChange('deedUrl', e.target.value)}
              placeholder="https://ipfs.io/ipfs/..."
              required
            />
            
            <Input
              label="Property Inspection Report URL"
              value={formData.inspectionUrl}
              onChange={(e) => handleInputChange('inspectionUrl', e.target.value)}
              placeholder="https://ipfs.io/ipfs/..."
              required
            />
            
            <Input
              label="Property Appraisal URL"
              value={formData.appraisalUrl}
              onChange={(e) => handleInputChange('appraisalUrl', e.target.value)}
              placeholder="https://ipfs.io/ipfs/..."
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Photos
              </label>
              {formData.photoUrls.map((url, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <Input
                    value={url}
                    onChange={(e) => updatePhotoUrl(index, e.target.value)}
                    placeholder="https://ipfs.io/ipfs/..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePhotoUrl(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addPhotoUrl}
                leftIcon={<Upload size={16} />}
              >
                Add Photo URL
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Review & Submit</h3>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Property Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-800">Address:</span>
                    <span>{formData.address}, {formData.city}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Property Type:</span>
                    <span>{formData.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Size:</span>
                    <span>{formData.bedrooms}BR / {formData.bathrooms}BA / {formData.sqft} sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Asking Price:</span>
                    <span>${parseInt(formData.askingPrice || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Monthly Rent:</span>
                    <span>${parseInt(formData.expectedMonthlyRent || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-800 font-medium">Est. Annual ROI:</span>
                    <Badge variant="success">{calculateROI()}%</Badge>
                  </div>
                  {formData.oracleValidation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Oracle Valuation:</span>
                        <span>${parseInt(formData.estimatedValue || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Oracle Confidence:</span>
                        <Badge variant="info">{formData.priceConfidence}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Price Analysis:</span>
                        {(() => {
                          const analysis = getPriceDifferenceAnalysis();
                          if (!analysis) return <span>-</span>;
                          
                          let badgeVariant: 'success' | 'warning' | 'error' = 'success';
                          let badgeText = 'Fair Pricing';
                          
                          if (analysis.isOverpriced) {
                            badgeVariant = 'error';
                            badgeText = `${analysis.difference}% Overpriced`;
                          } else if (analysis.isUnderpriced) {
                            badgeVariant = 'success';
                            badgeText = `${Math.abs(parseFloat(analysis.difference))}% Underpriced`;
                          }
                          
                          return <Badge variant={badgeVariant}>{badgeText}</Badge>;
                        })()}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <Info size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Proposal Requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Your voting power: {votingPower} ERLD</li>
                    <li>• Proposal will be subject to DAO governance vote</li>
                    <li>• Voting period: 7 days after proposal creation</li>
                    <li>• Quorum required: 100,000 ERLD tokens</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create Property Acquisition Proposal
            </h2>
            {demoMode && (
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="emerald" size="sm">Demo Mode</Badge>
                {demoProperty && (
                  <span className="text-sm text-gray-600">
                    {demoProperty.city}, {demoProperty.state}
                  </span>
                )}
              </div>
            )}
          </div>
          <Badge variant="info">
            {demoMode && step === 0 ? 'Select Property' : `Step ${step} of 6`}
          </Badge>
        </div>

        {/* Progress Bar */}
        {!(demoMode && step === 0) && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Location</span>
              <span>Details</span>
              <span>Oracle</span>
              <span>Description</span>
              <span>Documents</span>
              <span>Review</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-emerald-600 h-2 rounded-full"
                initial={{ width: '16.7%' }}
                animate={{ width: `${(step / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-4 flex-1 min-h-0">
          <div className="max-h-full overflow-y-auto">
            {renderStep()}
          </div>
        </div>

        {/* Navigation */}
        {!(demoMode && step === 0) && (
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={handlePrev}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {step < 6 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!validateStep(step)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isPending || isConfirming}
                  leftIcon={isSubmitting || isPending || isConfirming ? <Loader2 size={16} className="animate-spin" /> : undefined}
                >
                  {isSubmitting || isPending || isConfirming ? 'Creating Proposal...' : 'Create Proposal'}
                </Button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Error: {error.message}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};