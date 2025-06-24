'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  DollarSign, 
  Building2, 
  Settings,
  AlertTriangle
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader,
  ModalFooter,
  Button, 
  Input,
  TextArea,
  Badge
} from '@/components/ui';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposalData: ProposalFormData) => Promise<void>;
  userVotingPower: number;
  minimumProposalThreshold: number;
}

export interface ProposalFormData {
  title: string;
  description: string;
  proposalType: 'Property Acquisition' | 'Treasury Management' | 'Governance' | 'Emergency' | 'Other';
  targets: string[];
  values: string[];
  calldatas: string[];
  metadataURI?: string;
}

interface ProposalTemplate {
  id: string;
  title: string;
  description: string;
  type: ProposalFormData['proposalType'];
  icon: React.ElementType;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'address';
    required: boolean;
    placeholder?: string;
  }>;
}

const proposalTemplates: ProposalTemplate[] = [
  {
    id: 'property-acquisition',
    title: 'Property Acquisition',
    description: 'Propose acquiring a new real estate property for the DAO',
    type: 'Property Acquisition',
    icon: Building2,
    fields: [
      { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true, placeholder: '123 Main St, City, State' },
      { name: 'proposedPrice', label: 'Proposed Purchase Price (ETH)', type: 'number', required: true, placeholder: '100' },
      { name: 'propertyDescription', label: 'Property Description', type: 'textarea', required: true, placeholder: 'Describe the property, its features, and investment potential...' },
      { name: 'dueDate', label: 'Due Diligence Deadline', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
    ]
  },
  {
    id: 'treasury-management',
    title: 'Treasury Management',
    description: 'Propose changes to treasury allocation or spending',
    type: 'Treasury Management',
    icon: DollarSign,
    fields: [
      { name: 'amount', label: 'Amount (ETH)', type: 'number', required: true, placeholder: '10' },
      { name: 'recipient', label: 'Recipient Address', type: 'address', required: true, placeholder: '0x...' },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, placeholder: 'Describe the purpose and justification for this treasury action...' },
      { name: 'timeline', label: 'Execution Timeline', type: 'text', required: false, placeholder: 'When should this be executed?' },
    ]
  },
  {
    id: 'governance',
    title: 'Governance Change',
    description: 'Propose changes to DAO governance parameters or rules',
    type: 'Governance',
    icon: Settings,
    fields: [
      { name: 'parameter', label: 'Parameter to Change', type: 'text', required: true, placeholder: 'e.g., voting period, quorum threshold' },
      { name: 'currentValue', label: 'Current Value', type: 'text', required: true, placeholder: 'Current setting' },
      { name: 'proposedValue', label: 'Proposed Value', type: 'text', required: true, placeholder: 'New proposed setting' },
      { name: 'rationale', label: 'Rationale', type: 'textarea', required: true, placeholder: 'Explain why this change is necessary...' },
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency Action',
    description: 'Propose urgent action that requires immediate attention',
    type: 'Emergency',
    icon: AlertTriangle,
    fields: [
      { name: 'urgency', label: 'Urgency Level', type: 'text', required: true, placeholder: 'High/Critical' },
      { name: 'issue', label: 'Issue Description', type: 'textarea', required: true, placeholder: 'Describe the emergency situation...' },
      { name: 'proposedAction', label: 'Proposed Action', type: 'textarea', required: true, placeholder: 'What action should be taken?' },
      { name: 'timeline', label: 'Required Timeline', type: 'text', required: true, placeholder: 'How quickly must this be resolved?' },
    ]
  },
];

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userVotingPower,
  minimumProposalThreshold,
}) => {
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    proposalType: 'Other',
    targets: [],
    values: [],
    calldatas: [],
  });
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateProposal = userVotingPower >= minimumProposalThreshold;

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      proposalType: template.type,
      targets: [],
      values: [],
      calldatas: [],
    });
    setStep('form');
  };

  const handleCustomProposal = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      proposalType: 'Other',
      targets: [],
      values: [],
      calldatas: [],
    });
    setStep('form');
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!canCreateProposal) return;

    setIsSubmitting(true);
    try {
      // Combine custom fields into description
      let fullDescription = formData.description;
      if (selectedTemplate && Object.keys(customFields).length > 0) {
        fullDescription += '\n\nDetails:\n';
        selectedTemplate.fields.forEach(field => {
          const value = customFields[field.name];
          if (value) {
            fullDescription += `${field.label}: ${value}\n`;
          }
        });
      }

      const proposalData: ProposalFormData = {
        ...formData,
        description: fullDescription,
      };

      await onSubmit(proposalData);
      onClose();
      
      // Reset form
      setStep('template');
      setFormData({
        title: '',
        description: '',
        proposalType: 'Other',
        targets: [],
        values: [],
        calldatas: [],
      });
      setCustomFields({});
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setStep('template');
      setFormData({
        title: '',
        description: '',
        proposalType: 'Other',
        targets: [],
        values: [],
        calldatas: [],
      });
      setCustomFields({});
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      title={step === 'template' ? 'Create New Proposal' : 'Proposal Details'}
    >
      <ModalContent>
        {!canCreateProposal && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Insufficient Voting Power</h4>
                <p className="text-sm text-yellow-700">
                  You need at least {minimumProposalThreshold.toLocaleString()} voting power to create proposals. 
                  You currently have {userVotingPower.toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Choose a template to get started, or create a custom proposal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposalTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    disabled={!canCreateProposal}
                    className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <IconComponent size={24} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <Badge variant="neutral" size="sm" className="mt-2">
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleCustomProposal}
                disabled={!canCreateProposal}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Create Custom Proposal</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('template')}
              >
                ← Back to Templates
              </Button>
              {selectedTemplate && (
                <Badge variant="emerald">
                  {selectedTemplate.title}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Proposal Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a clear, descriptive title for your proposal"
                required
              />

              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of your proposal..."
                rows={4}
                required
              />

              {selectedTemplate && selectedTemplate.fields.map((field) => (
                <div key={field.name}>
                  {field.type === 'textarea' ? (
                    <TextArea
                      label={field.label}
                      value={customFields[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                    />
                  ) : (
                    <Input
                      label={field.label}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={customFields[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <Input
                label="Metadata URI (Optional)"
                value={formData.metadataURI || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, metadataURI: e.target.value }))}
                placeholder="https://ipfs.io/ipfs/..."
                helperText="Link to additional proposal documentation"
              />
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {step === 'form' && (
          <Button 
            onClick={handleSubmit} 
            disabled={!canCreateProposal || !formData.title || !formData.description || isSubmitting}
            loading={isSubmitting}
          >
            Create Proposal
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};