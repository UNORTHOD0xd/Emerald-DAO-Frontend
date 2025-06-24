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
import { parseEther, formatEther } from 'viem';
import { 
  Card, 
  CardContent, 
  Button, 
  Input, 
  Modal,
  Badge,
  LoadingSpinner 
} from '@/components/ui';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';

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
}

interface PropertyAcquisitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proposalId: string) => void;
}

export const PropertyAcquisitionForm: React.FC<PropertyAcquisitionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { address, isConnected } = useAccount();
  const { canVote, votingPower } = useEmeraldDAO();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Contract write hook for proposal creation
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
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
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      onSuccess?.(hash);
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
        return !!formData.description;
      case 4:
        return !!(formData.deedUrl && formData.inspectionUrl);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
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

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!canVote) {
      alert('You need ERLD tokens to create proposals');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create proposal metadata
      const proposalMetadata = {
        title: `Acquire Property: ${formData.address}`,
        description: formData.description,
        propertyData: {
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          propertyType: formData.propertyType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          sqft: formData.sqft,
          askingPrice: formData.askingPrice,
          expectedMonthlyRent: formData.expectedMonthlyRent,
          estimatedROI: calculateROI(),
          documents: {
            deed: formData.deedUrl,
            inspection: formData.inspectionUrl,
            appraisal: formData.appraisalUrl,
            photos: formData.photoUrls.filter(url => url.trim() !== ''),
          },
        },
        type: 'property_acquisition',
        createdAt: new Date().toISOString(),
      };

      // Create property acquisition proposal on-chain
      console.log('Creating property acquisition proposal:', proposalMetadata);

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Create metadata URI (in production, this would be uploaded to IPFS)
      const metadataUri = `data:application/json;base64,${btoa(JSON.stringify(proposalMetadata))}`;

      await writeContract({
        address: CONTRACT_CONFIG.propertyAcquisition.address,
        abi: CONTRACT_CONFIG.propertyAcquisition.abi,
        functionName: 'createPropertyProposal',
        args: [
          proposalMetadata.title,
          proposalMetadata.description,
          fullAddress,
          parseEther(formData.askingPrice),
          parseEther(formData.expectedMonthlyRent),
          metadataUri
        ],
      });

    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              <FileText size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold">Property Description</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Proposal Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe why this property would be a good investment for the DAO. Include details about the location, market conditions, tenant history, and expected returns..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a detailed explanation of the investment opportunity.
              </p>
            </div>
          </div>
        );

      case 4:
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

      case 5:
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
                    <span className="text-gray-600">Address:</span>
                    <span>{formData.address}, {formData.city}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span>{formData.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span>{formData.bedrooms}BR / {formData.bathrooms}BA / {formData.sqft} sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asking Price:</span>
                    <span>${parseInt(formData.askingPrice || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span>${parseInt(formData.expectedMonthlyRent || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Est. Annual ROI:</span>
                    <Badge variant="success">{calculateROI()}%</Badge>
                  </div>
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

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Property Location';
      case 2: return 'Property Details';
      case 3: return 'Description';
      case 4: return 'Documents';
      case 5: return 'Review & Submit';
      default: return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Property Acquisition Proposal
          </h2>
          <Badge variant="info">Step {step} of 5</Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Location</span>
            <span>Details</span>
            <span>Description</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-emerald-600 h-2 rounded-full"
              initial={{ width: '20%' }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {step < 5 ? (
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