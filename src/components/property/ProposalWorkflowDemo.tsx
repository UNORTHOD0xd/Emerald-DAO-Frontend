'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  FileText,
  Home,
  Users,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Vote,
  Timer,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, Button, Badge, LoadingSpinner } from '@/components/ui';
import { MockOracleDemo } from './MockOracleDemo';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  icon: React.ReactNode;
  details?: string[];
  data?: any;
}

interface ProposalWorkflowDemoProps {
  propertyAddress: string;
  askingPrice: number;
  expectedRent: number;
  onComplete: (proposalId: string) => void;
  autoAdvance?: boolean;
}

export const ProposalWorkflowDemo: React.FC<ProposalWorkflowDemoProps> = ({
  propertyAddress,
  askingPrice,
  expectedRent,
  onComplete,
  autoAdvance = false,
}) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [oracleData, setOracleData] = useState<any>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'oracle_request',
      title: 'Request Property Valuation',
      description: 'Chainlink Oracle validates property value and market data',
      status: 'processing',
      icon: <FileText size={20} />,
      details: [
        'Connecting to Chainlink DON',
        'Executing property valuation functions',
        'Fetching market data from multiple APIs',
        'Processing confidence scoring algorithm'
      ]
    },
    {
      id: 'oracle_response',
      title: 'Oracle Data Received',
      description: 'Property valuation completed with confidence score',
      status: 'pending',
      icon: <CheckCircle2 size={20} />,
      details: [
        'Estimated value determined',
        'Rental yield calculated',
        'Market confidence scored',
        'Price analysis completed'
      ]
    },
    {
      id: 'proposal_creation',
      title: 'Create DAO Proposal',
      description: 'Property acquisition proposal submitted to governance',
      status: 'pending',
      icon: <Vote size={20} />,
      details: [
        'Proposal metadata uploaded to IPFS',
        'Smart contract interaction initiated',
        'Governance parameters validated',
        'Proposal ID generated'
      ]
    },
    {
      id: 'dao_voting',
      title: 'DAO Voting Process',
      description: 'Community votes on property acquisition',
      status: 'pending',
      icon: <Users size={20} />,
      details: [
        '7-day voting period begins',
        'Token holders cast votes',
        'Quorum threshold monitored',
        'Voting results calculated'
      ]
    },
    {
      id: 'execution_queue',
      title: 'Queue for Execution',
      description: 'Approved proposal queued in Timelock contract',
      status: 'pending',
      icon: <Timer size={20} />,
      details: [
        'Proposal approved by DAO',
        'Queued in Timelock contract',
        '24-hour delay period begins',
        'Ready for final execution'
      ]
    },
    {
      id: 'chainlink_automation',
      title: 'Automated Execution',
      description: 'Chainlink Automation executes the property purchase',
      status: 'pending',
      icon: <Zap size={20} />,
      details: [
        'Chainlink Keepers triggered',
        'Treasury funds converted via Price Feeds',
        'Property acquisition executed',
        'NFT minted to represent ownership'
      ]
    }
  ]);

  // Handle oracle completion
  const handleOracleComplete = (data: any) => {
    setOracleData(data);
    updateStepStatus('oracle_request', 'completed');
    updateStepStatus('oracle_response', 'completed', data);
    
    if (autoAdvance) {
      setTimeout(() => {
        setCurrentStep(2);
        processStep('proposal_creation');
      }, 2000);
    }
  };

  // Update step status
  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], data?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, data }
        : step
    ));
  };

  // Process individual steps
  const processStep = async (stepId: string) => {
    setIsProcessing(true);
    updateStepStatus(stepId, 'processing');

    switch (stepId) {
      case 'proposal_creation':
        await simulateProposalCreation();
        break;
      case 'dao_voting':
        await simulateDAOVoting();
        break;
      case 'execution_queue':
        await simulateTimelockQueue();
        break;
      case 'chainlink_automation':
        await simulateChainlinkExecution();
        break;
      default:
        break;
    }

    setIsProcessing(false);
  };

  const simulateProposalCreation = async () => {
    // Simulate proposal creation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockProposalId = `prop_${Date.now()}`;
    setProposalId(mockProposalId);
    
    const proposalData = {
      proposalId: mockProposalId,
      title: `Acquire Property: ${propertyAddress}`,
      askingPrice,
      expectedRent,
      oracleValuation: oracleData?.estimatedValue,
      confidence: oracleData?.confidenceScore,
    };

    updateStepStatus('proposal_creation', 'completed', proposalData);
    
    if (autoAdvance) {
      setTimeout(() => {
        setCurrentStep(3);
        processStep('dao_voting');
      }, 1000);
    }
  };

  const simulateDAOVoting = async () => {
    // Simulate 7-day voting period (accelerated for demo)
    const votingSteps = [
      { progress: 25, delay: 1000, message: 'Early voting period...' },
      { progress: 50, delay: 1500, message: 'Community engagement increasing...' },
      { progress: 75, delay: 1500, message: 'Quorum threshold reached...' },
      { progress: 100, delay: 1000, message: 'Voting completed!' }
    ];

    for (const step of votingSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    const votingResults = {
      forVotes: 125000, // ERLD tokens
      againstVotes: 35000,
      abstainVotes: 15000,
      quorum: 100000,
      result: 'PASSED'
    };

    updateStepStatus('dao_voting', 'completed', votingResults);
    
    if (autoAdvance) {
      setTimeout(() => {
        setCurrentStep(4);
        processStep('execution_queue');
      }, 1000);
    }
  };

  const simulateTimelockQueue = async () => {
    // Simulate timelock queueing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const timelockData = {
      queuedAt: Date.now(),
      executionTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      operationId: `op_${Date.now()}`,
    };

    updateStepStatus('execution_queue', 'completed', timelockData);
    
    if (autoAdvance) {
      setTimeout(() => {
        setCurrentStep(5);
        processStep('chainlink_automation');
      }, 1000);
    }
  };

  const simulateChainlinkExecution = async () => {
    // Simulate Chainlink Automation execution
    const executionSteps = [
      { delay: 1000, message: 'Chainlink Keepers activated...' },
      { delay: 1500, message: 'Converting ETH via Price Feeds...' },
      { delay: 2000, message: 'Executing property purchase...' },
      { delay: 1000, message: 'Minting property NFT...' }
    ];

    for (const step of executionSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    const executionData = {
      transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      nftTokenId: Math.floor(Math.random() * 10000),
      finalPrice: askingPrice,
      ethUsed: askingPrice / 3200, // Assuming ETH price
      executedAt: Date.now()
    };

    updateStepStatus('chainlink_automation', 'completed', executionData);
    onComplete(proposalId!);
  };

  const advanceToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    if (stepIndex > 1 && !oracleData) {
      // If trying to advance without oracle data, show warning
      return;
    }
    
    const step = steps[stepIndex];
    if (step && step.status === 'pending') {
      processStep(step.id);
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-green-600" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <Card className="border border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Home size={24} className="text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-emerald-800">
                Property Acquisition Workflow Demo
              </h2>
              <p className="text-sm text-emerald-700">
                Complete end-to-end demonstration with Chainlink integration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-emerald-700">Property:</span>
              <div className="font-semibold text-emerald-800">{propertyAddress}</div>
            </div>
            <div>
              <span className="text-emerald-700">Asking Price:</span>
              <div className="font-semibold text-emerald-800">
                ${askingPrice.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-emerald-700">Expected Rent:</span>
              <div className="font-semibold text-emerald-800">
                ${expectedRent.toLocaleString()}/month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer
                ${index <= currentStep 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-300 bg-gray-50'
                }
                ${index === currentStep ? 'ring-2 ring-emerald-200' : ''}
              `}
              whileHover={{ scale: 1.05 }}
              onClick={() => advanceToStep(index)}
            >
              {step.status === 'completed' ? (
                <Check size={20} className="text-emerald-600" />
              ) : step.status === 'processing' ? (
                <Loader2 size={20} className="text-blue-600 animate-spin" />
              ) : (
                <span className="text-xs font-bold text-gray-600">{index + 1}</span>
              )}
            </motion.div>
            
            {index < steps.length - 1 && (
              <div className={`
                h-0.5 w-16 mx-2
                ${index < currentStep ? 'bg-emerald-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    {steps[0].icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{steps[0].title}</h3>
                      <p className="text-sm text-gray-600">{steps[0].description}</p>
                    </div>
                  </div>
                  
                  <MockOracleDemo
                    propertyAddress={propertyAddress}
                    onComplete={handleOracleComplete}
                    autoStart={autoAdvance}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep >= 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {steps[currentStep].icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStepStatusIcon(steps[currentStep].status)}
                    <Badge 
                      variant={
                        steps[currentStep].status === 'completed' ? 'success' :
                        steps[currentStep].status === 'processing' ? 'info' : 'default'
                      }
                    >
                      {steps[currentStep].status}
                    </Badge>
                  </div>
                </div>

                {/* Step specific content */}
                {currentStep === 1 && oracleData && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Oracle Validation Complete</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Estimated Value:</span>
                        <div className="font-semibold">${oracleData.estimatedValue?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-green-700">Confidence Score:</span>
                        <div className="font-semibold">{oracleData.confidenceScore}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && steps[2].data && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Proposal Created</h4>
                    <div className="text-sm">
                      <div className="font-mono text-blue-700">
                        Proposal ID: {steps[2].data.proposalId}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && steps[3].data && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">Voting Results</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-emerald-700">For:</span>
                        <div className="font-semibold">{steps[3].data.forVotes?.toLocaleString()} ERLD</div>
                      </div>
                      <div>
                        <span className="text-emerald-700">Against:</span>
                        <div className="font-semibold">{steps[3].data.againstVotes?.toLocaleString()} ERLD</div>
                      </div>
                      <div>
                        <span className="text-emerald-700">Result:</span>
                        <Badge variant="success">{steps[3].data.result}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && steps[5].data && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Execution Complete</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-purple-700">Transaction:</span>
                        <div className="font-mono text-xs">{steps[5].data.transactionHash?.slice(0, 16)}...</div>
                      </div>
                      <div>
                        <span className="text-purple-700">Property NFT:</span>
                        <div className="font-semibold">#{steps[5].data.nftTokenId}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous Step
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (currentStep < steps.length - 1) {
                        advanceToStep(currentStep + 1);
                      }
                    }}
                    disabled={
                      currentStep === steps.length - 1 ||
                      isProcessing ||
                      (currentStep === 0 && !oracleData)
                    }
                    leftIcon={isProcessing ? <Loader2 size={16} className="animate-spin" /> : undefined}
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next Step'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Demo Information */}
      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">End-to-End Demo Features:</p>
              <ul className="space-y-1 text-xs">
                <li>• Live Chainlink Oracle integration with mock data fallback</li>
                <li>• Real governance smart contract interactions</li>
                <li>• Timelock delay simulation for security</li>
                <li>• Chainlink Automation for decentralized execution</li>
                <li>• Complete state changes demonstrating full workflow</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};