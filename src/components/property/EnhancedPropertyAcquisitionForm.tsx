'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Activity,
  Database
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { 
  Card, 
  CardContent, 
  Button, 
  Input, 
  Modal,
  Badge,
} from '@/components/ui';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { useOracleIntegration } from '@/hooks/useOracleIntegration';
import { DemoPropertySelector } from './DemoPropertySelector';
import { type DemoProperty } from '@/data/demoProperties';

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
  deedUrl: string;
  inspectionUrl: string;
  appraisalUrl: string;
  photoUrls: string[];
}

interface EnhancedPropertyAcquisitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proposalId: string) => void;
  preSelectedProperty?: DemoProperty;
}

export const EnhancedPropertyAcquisitionForm: React.FC<EnhancedPropertyAcquisitionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedProperty,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { canVote, votingPower } = useEmeraldDAO();
  const [step, setStep] = useState(preSelectedProperty ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<DemoProperty | null>(preSelectedProperty || null);
  
  // Oracle integration
  const {
    requestValuation,
    isRequesting,
    hasValuation,
    isCompleted: isOracleCompleted,
    error: oracleError,
    formattedValuation,
    currentRequest,
    reset: resetOracle,
  } = useOracleIntegration();

  // Contract interaction for proposal creation
  const { writeContract, data: proposalHash, error: proposalError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: proposalHash,
  });

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
  });

  // Initialize form with pre-selected property
  useEffect(() => {
    if (preSelectedProperty) {
      setSelectedProperty(preSelectedProperty);
      setFormData({
        address: preSelectedProperty.address,
        city: preSelectedProperty.city,
        state: preSelectedProperty.state,
        zipCode: preSelectedProperty.zipCode,
        propertyType: preSelectedProperty.propertyType,
        bedrooms: preSelectedProperty.bedrooms,
        bathrooms: preSelectedProperty.bathrooms,
        sqft: preSelectedProperty.sqft,
        askingPrice: preSelectedProperty.askingPrice,
        expectedMonthlyRent: preSelectedProperty.expectedMonthlyRent,
        description: preSelectedProperty.description,
        deedUrl: preSelectedProperty.deedUrl,
        inspectionUrl: preSelectedProperty.inspectionUrl,
        appraisalUrl: preSelectedProperty.appraisalUrl,
        photoUrls: preSelectedProperty.photoUrls,
      });
      setStep(1);
    }
  }, [preSelectedProperty]);

  // Monitor transaction states for debugging
  useEffect(() => {
    if (proposalError) {
      console.error('Transaction Error:', proposalError);
      console.error('Error Details:', {
        name: proposalError.name,
        message: proposalError.message,
        cause: proposalError.cause,
        stack: proposalError.stack
      });
      setIsSubmitting(false);
    }
  }, [proposalError]);

  useEffect(() => {
    if (proposalHash) {
      console.log('Transaction submitted:', proposalHash);
    }
  }, [proposalHash]);

  useEffect(() => {
    if (isConfirming) {
      console.log('Transaction confirming...');
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      console.log('Transaction confirmed successfully!');
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(proposalHash || '');
      }
      onClose();
    }
  }, [isSuccess, proposalHash, onSuccess, onClose]);

  // Track if form has been closed explicitly by user
  const [shouldPreserveData, setShouldPreserveData] = useState(false);
  const [hasStartedWorkflow, setHasStartedWorkflow] = useState(false);
  
  // Explicit reset function
  const resetForm = useCallback(() => {
    setStep(preSelectedProperty ? 1 : 0);
    setSelectedProperty(preSelectedProperty || null);
    if (!preSelectedProperty) {
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
      });
      resetOracle();
    }
    setIsSubmitting(false);
    setShouldPreserveData(false);
    setHasStartedWorkflow(false);
  }, [preSelectedProperty, resetOracle]);
  
  // Mark data as worth preserving when oracle request starts or workflow begins
  useEffect(() => {
    if (isRequesting || hasValuation || step > 1 || currentRequest) {
      setShouldPreserveData(true);
      setHasStartedWorkflow(true);
    }
  }, [isRequesting, hasValuation, step, currentRequest]);

  // Reset form only when modal closes and we don't need to preserve data
  useEffect(() => {
    if (!isOpen && !shouldPreserveData && !hasStartedWorkflow) {
      console.log('Resetting form - modal closed without data to preserve');
      resetForm();
    }
    
    // Reset preservation flags when modal actually closes after successful submission
    if (!isOpen && (isSuccess || !hasStartedWorkflow)) {
      setTimeout(() => {
        setShouldPreserveData(false);
        setHasStartedWorkflow(false);
      }, 2000); // Longer delay to prevent premature reset during transaction flow
    }
  }, [isOpen, shouldPreserveData, hasStartedWorkflow, isSuccess, resetForm]);

  // Handle successful proposal creation
  useEffect(() => {
    if (isSuccess && proposalHash) {
      onSuccess?.(proposalHash);
      // Allow form to reset after successful completion
      setShouldPreserveData(false);
      setHasStartedWorkflow(false);
      onClose();
    }
  }, [isSuccess, proposalHash, onSuccess, onClose]);

  const handlePropertySelect = (property: DemoProperty) => {
    setSelectedProperty(property);
    setFormData({
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
      askingPrice: property.askingPrice,
      expectedMonthlyRent: property.expectedMonthlyRent,
      description: property.description,
      deedUrl: property.deedUrl,
      inspectionUrl: property.inspectionUrl,
      appraisalUrl: property.appraisalUrl,
      photoUrls: property.photoUrls,
    });
    setStep(1);
    // Reset workflow tracking when selecting a new property
    setHasStartedWorkflow(false);
    setShouldPreserveData(false);
  };

  const handleInputChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequestOracle = async () => {
    const propertyIdentifier = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    try {
      // Mark workflow as started to prevent form reset during transaction
      setHasStartedWorkflow(true);
      setShouldPreserveData(true);
      
      await requestValuation(propertyIdentifier, 'FULL');
    } catch (error) {
      console.error('Failed to request oracle valuation:', error);
      // Don't reset flags on error - let user retry
    }
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

  const getPriceAnalysis = () => {
    if (!formattedValuation) return null;
    
    const askingPrice = parseFloat(formData.askingPrice) || 0;
    const oraclePrice = formattedValuation.estimatedValueUSD;
    
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

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.address && formData.city && formData.state && formData.zipCode);
      case 2:
        return !!(formData.askingPrice && formData.expectedMonthlyRent && formData.sqft > 0);
      case 3:
        return hasValuation || (currentRequest?.status === 'COMPLETED');
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
      setStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!canVote) {
      alert('You need ERLD tokens to create proposals');
      return;
    }

    if (!hasValuation && currentRequest?.status !== 'COMPLETED') {
      alert('Oracle valuation required - please complete step 3 first');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Create lightweight proposal metadata (under 200 char limit)
      const compactMetadata = {
        addr: fullAddress.substring(0, 30),
        price: formData.askingPrice,
        roi: calculateROI(),
        type: formData.propertyType,
        beds: formData.bedrooms,
        baths: formData.bathrooms
      };

      // Create short metadata URI that stays under 200 character contract limit
      const metadataUri = `ipfs://mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      console.log('Creating property acquisition proposal:', compactMetadata);
      console.log('Contract call parameters:', {
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        functionName: 'createPropertyProposal',
        args: [
          fullAddress,
          metadataUri,
          parseEther(formData.askingPrice)
        ],
        value: parseEther('0.1'),
        userAddress: address,
        isConnected,
        votingPower,
        balance: balance?.formatted,
        chainId: chain?.id,
        chainName: chain?.name
      });

      // Check if user has enough ETH for the bond
      const requiredEth = parseEther('0.1');
      if (balance && balance.value < requiredEth) {
        console.error('Insufficient ETH for proposal bond. Required: 0.1 ETH, Available:', balance.formatted);
        alert(`Insufficient ETH for proposal bond. Required: 0.1 ETH, Available: ${balance.formatted} ETH`);
        setIsSubmitting(false);
        return;
      }

      // Create the proposal on-chain with correct parameters
      writeContract({
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'createPropertyProposal',
        args: [
          fullAddress,
          metadataUri,
          parseEther(formData.askingPrice)
        ],
        value: parseEther('0.1'), // Required MIN_PROPOSAL_BOND
      });

    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DemoPropertySelector
            onSelectProperty={handlePropertySelect}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
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
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Database size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Chainlink Oracle Validation</h3>
            </div>

            {!hasValuation && (
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Activity size={48} className="mx-auto text-blue-600 mb-4" />
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Request Property Valuation
                    </h4>
                    <p className="text-blue-700 mb-4">
                      Get real-time property valuation from Chainlink oracles
                    </p>
                    <Button
                      onClick={handleRequestOracle}
                      disabled={isRequesting}
                      leftIcon={isRequesting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                    >
                      {isRequesting ? 'Requesting...' : 'Request Valuation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isRequesting && (
              <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 size={20} className="text-amber-600 animate-spin" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-800">Processing Oracle Request</h4>
                      <p className="text-amber-700 text-sm">
                        {currentRequest?.status === 'PENDING' && 'Submitting request to blockchain...'}
                        {currentRequest?.status === 'PROCESSING' && 'Chainlink DON processing valuation...'}
                      </p>
                      {isRequesting && (
                        <div className="mt-2">
                          <p className="text-amber-600 text-xs">
                            Note: If transaction is rejected or fails, mock data will be provided automatically.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reset oracle and proceed with demo data
                              resetOracle();
                              // Immediately mark as having valuation with demo data
                              setTimeout(() => {
                                // This will trigger the demo flow
                                const propertyIdentifier = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
                                requestValuation(propertyIdentifier, 'FULL');
                              }, 100);
                            }}
                            className="mt-2 text-xs"
                          >
                            Use Demo Data Instead
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasValuation && formattedValuation && (
              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <h4 className="font-semibold text-green-800">Oracle Valuation Complete</h4>
                    <Badge variant="success" size="sm">
                      {formattedValuation.confidenceScore}% Confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Estimated Value:</span>
                      <div className="font-semibold text-green-800">
                        ${Math.round(formattedValuation.estimatedValueUSD).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-700">Monthly Rent:</span>
                      <div className="font-semibold text-green-800">
                        ${Math.round(formattedValuation.monthlyRentUSD).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const analysis = getPriceAnalysis();
                    if (analysis) {
                      return (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 text-sm">Price Analysis:</span>
                            <Badge 
                              variant={
                                analysis.isOverpriced ? 'error' :
                                analysis.isUnderpriced ? 'success' : 'info'
                              }
                              size="sm"
                            >
                              {analysis.isOverpriced && `${analysis.difference}% Overpriced`}
                              {analysis.isUnderpriced && `${Math.abs(parseFloat(analysis.difference))}% Underpriced`}
                              {analysis.isFair && 'Fair Pricing'}
                            </Badge>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            )}

            {oracleError && (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle size={16} className="text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">Oracle Request Issue</h4>
                      <p className="text-red-700 text-sm">{oracleError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resetOracle();
                          // Retry with fallback to demo data
                          const propertyIdentifier = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
                          handleRequestOracle();
                        }}
                        className="mt-2 text-xs"
                      >
                        Retry with Demo Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Investment Description</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Proposal Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe why this property would be a good investment for the DAO..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
                required
              />
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
                  {formattedValuation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Oracle Valuation:</span>
                        <span>${Math.round(formattedValuation.estimatedValueUSD).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Oracle Confidence:</span>
                        <Badge variant="info">{formattedValuation.confidenceScore}%</Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Proposal Requirements:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Your voting power: {votingPower} ERLD</li>
                      <li>• Proposal will be subject to DAO governance vote</li>
                      <li>• Oracle valuation has been validated</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            {selectedProperty && (
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="emerald" size="sm">With Oracle</Badge>
                <span className="text-sm text-gray-600">
                  {selectedProperty.city}, {selectedProperty.state}
                </span>
              </div>
            )}
          </div>
          <Badge variant="info">
            {step === 0 ? 'Select Property' : `Step ${step} of 6`}
          </Badge>
        </div>

        {/* Progress Bar */}
        {step > 0 && (
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
        {step > 0 && (
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
                  disabled={isSubmitting || isPending || isConfirming || (!hasValuation && currentRequest?.status !== 'COMPLETED')}
                  leftIcon={isSubmitting || isPending || isConfirming ? <Loader2 size={16} className="animate-spin" /> : undefined}
                >
                  {isSubmitting || isPending || isConfirming ? 'Creating Proposal...' : 'Create Proposal'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {(proposalError || oracleError) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Error: {proposalError?.message || oracleError}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};