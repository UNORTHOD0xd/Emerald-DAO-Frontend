'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText, DollarSign, Settings, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'address';
    placeholder: string;
    required: boolean;
  }[];
}

const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'property',
    name: 'Property Acquisition',
    description: 'Propose acquiring a new real estate property for the DAO portfolio',
    icon: FileText,
    color: 'emerald',
    fields: [
      { name: 'title', label: 'Proposal Title', type: 'text', placeholder: 'Acquire Commercial Property in Downtown Austin', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'text', placeholder: '123 Main St, Austin, TX 78701', required: true },
      { name: 'acquisitionPrice', label: 'Acquisition Price (USD)', type: 'number', placeholder: '2500000', required: true },
      { name: 'expectedRoi', label: 'Expected ROI (%)', type: 'number', placeholder: '8.5', required: true },
      { name: 'description', label: 'Detailed Description', type: 'textarea', placeholder: 'Describe the property, its location, condition, rental potential, and strategic value to the DAO...', required: true },
      { name: 'dueDate', label: 'Target Acquisition Date', type: 'text', placeholder: 'Q2 2024', required: false },
    ]
  },
  {
    id: 'treasury',
    name: 'Treasury Management',
    description: 'Propose changes to treasury allocation, withdrawals, or financial strategy',
    icon: DollarSign,
    color: 'blue',
    fields: [
      { name: 'title', label: 'Proposal Title', type: 'text', placeholder: 'Diversify Treasury Holdings into USDC', required: true },
      { name: 'amount', label: 'Amount (ETH)', type: 'number', placeholder: '100', required: true },
      { name: 'recipient', label: 'Recipient Address (if applicable)', type: 'address', placeholder: '0x...', required: false },
      { name: 'purpose', label: 'Purpose', type: 'text', placeholder: 'Risk management and diversification', required: true },
      { name: 'description', label: 'Detailed Justification', type: 'textarea', placeholder: 'Explain the financial strategy, risk assessment, and expected benefits...', required: true },
      { name: 'timeline', label: 'Implementation Timeline', type: 'text', placeholder: '30 days after approval', required: false },
    ]
  },
  {
    id: 'governance',
    name: 'Governance Change',
    description: 'Propose changes to DAO governance parameters, voting, or operational rules',
    icon: Settings,
    color: 'purple',
    fields: [
      { name: 'title', label: 'Proposal Title', type: 'text', placeholder: 'Reduce Quorum Requirement to 7.5%', required: true },
      { name: 'parameter', label: 'Parameter to Change', type: 'text', placeholder: 'Minimum Quorum Percentage', required: true },
      { name: 'currentValue', label: 'Current Value', type: 'text', placeholder: '10%', required: true },
      { name: 'proposedValue', label: 'Proposed New Value', type: 'text', placeholder: '7.5%', required: true },
      { name: 'description', label: 'Rationale and Impact Analysis', type: 'textarea', placeholder: 'Explain why this change is needed, potential risks, benefits, and impact on governance...', required: true },
      { name: 'implementation', label: 'Implementation Details', type: 'textarea', placeholder: 'Technical details of how this change will be implemented...', required: false },
    ]
  },
  {
    id: 'emergency',
    name: 'Emergency Action',
    description: 'Propose urgent actions requiring immediate community attention',
    icon: AlertTriangle,
    color: 'red',
    fields: [
      { name: 'title', label: 'Emergency Title', type: 'text', placeholder: 'Emergency Fund Allocation for Market Opportunity', required: true },
      { name: 'urgency', label: 'Urgency Level', type: 'text', placeholder: 'High - Action needed within 48 hours', required: true },
      { name: 'action', label: 'Required Action', type: 'text', placeholder: 'Allocate $2M for immediate property acquisition', required: true },
      { name: 'description', label: 'Emergency Description', type: 'textarea', placeholder: 'Describe the emergency situation, why immediate action is needed, and consequences of delay...', required: true },
      { name: 'authorization', label: 'Authorization Requested', type: 'textarea', placeholder: 'Specify exactly what authority is being requested...', required: true },
      { name: 'deadline', label: 'Action Deadline', type: 'text', placeholder: '48 hours from approval', required: true },
    ]
  },
];

export default function CreateProposalPage() {
  const router = useRouter();
  const { canVote, isDAOMember } = useEmeraldDAO();
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with empty values
    const initialData: Record<string, string> = {};
    template.fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement actual proposal creation
      console.log('Creating proposal:', { template: selectedTemplate.id, data: formData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to governance page
      router.push('/dashboard/governance');
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedTemplate && selectedTemplate.fields
    .filter(field => field.required)
    .every(field => formData[field.name]?.trim());

  if (!isDAOMember) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">DAO Membership Required</h2>
        <p className="text-gray-600">
          You need to hold ERLD tokens to create proposals.
        </p>
        <Button
          onClick={() => router.push('/dashboard')}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Proposal</h1>
          <p className="text-gray-600">
            Select a template and fill out the details for your proposal
          </p>
        </div>
      </div>

      {!selectedTemplate ? (
        /* Template Selection */
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Proposal Type</h2>
            <p className="text-gray-600">
              Select the type of proposal you want to create. Each template includes relevant fields and guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROPOSAL_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-${template.color}-100`}>
                          <IconComponent size={24} className={`text-${template.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Proposal Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${selectedTemplate.color}-100`}>
                    <selectedTemplate.icon size={20} className={`text-${selectedTemplate.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change Template
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {canVote ? (
                'You have voting power and can create proposals'
              ) : (
                'You may need to delegate voting power to participate in governance'
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                loading={isSubmitting}
                leftIcon={<Plus size={16} />}
              >
                {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}