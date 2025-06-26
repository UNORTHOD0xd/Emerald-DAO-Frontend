'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Play,
  CheckCircle2,
  Info,
  Activity,
  Home,
  Database,
  Vote,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { EnhancedPropertyAcquisitionForm } from '@/components/property';
import { EnhancedProposalCard } from '@/components/governance/EnhancedProposalCard';
import { TokenProtectedRoute } from '@/components/layout';
import { useEnhancedGovernanceData } from '@/hooks/useEnhancedGovernanceData';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { type DemoProperty, demoProperties } from '@/data/demoProperties';

export default function WorkingDemoPage() {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<DemoProperty | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'create' | 'vote' | 'complete'>('select');
  const [, setCompletedProposalId] = useState<string | null>(null);

  const { proposals, isLoading, refreshProposals } = useEnhancedGovernanceData();
  const { canVote, votingPower, isDAOMember } = useEmeraldDAO();

  const handlePropertySelect = (property: DemoProperty) => {
    setSelectedProperty(property);
    setShowPropertyForm(true);
    setCurrentStep('create');
  };

  const handleProposalCreated = (proposalId: string) => {
    setCompletedProposalId(proposalId);
    setShowPropertyForm(false);
    setCurrentStep('vote');
    // Refresh proposals to show the new one
    setTimeout(() => {
      refreshProposals();
    }, 2000);
  };

  const handleVoteComplete = () => {
    setCurrentStep('complete');
    refreshProposals();
  };

  const activeProposals = proposals.filter(p => p.status === 'Active' || p.status === 'Pending');
  const recentProposal = activeProposals[0];

  const steps = [
    {
      id: 'select',
      title: '1. Select Property',
      description: 'Choose a demo property to create a proposal',
      icon: <Home size={24} />,
      status: currentStep === 'select' ? 'active' : selectedProperty ? 'completed' : 'pending'
    },
    {
      id: 'create',
      title: '2. Create Proposal',
      description: 'Oracle validation + DAO proposal creation',
      icon: <Database size={24} />,
      status: currentStep === 'create' ? 'active' : 
              currentStep === 'vote' || currentStep === 'complete' ? 'completed' : 'pending'
    },
    {
      id: 'vote',
      title: '3. Vote on Proposal',
      description: 'Community voting on the blockchain',
      icon: <Vote size={24} />,
      status: currentStep === 'vote' ? 'active' : currentStep === 'complete' ? 'completed' : 'pending'
    },
    {
      id: 'complete',
      title: '4. Proposal Complete',
      description: 'End-to-end workflow finished',
      icon: <CheckCircle2 size={24} />,
      status: currentStep === 'complete' ? 'completed' : 'pending'
    }
  ];

  return (
    <TokenProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />}>
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Working Demo: Real Contract Integration
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete property acquisition workflow with live smart contracts
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" size="lg">
                Live Contracts
              </Badge>
              {isDAOMember && (
                <Badge variant="success" size="lg">
                  DAO Member
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                        ${step.status === 'completed' 
                          ? 'bg-green-100 border-green-500 text-green-600' 
                          : step.status === 'active'
                          ? 'bg-blue-100 border-blue-500 text-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'}
                      `}>
                        {step.status === 'completed' ? <CheckCircle2 size={24} /> : step.icon}
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                        <p className="text-xs text-gray-600 max-w-24">{step.description}</p>
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`
                        w-16 h-0.5 mx-4 mt-6
                        ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {currentStep === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Home size={48} className="text-emerald-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Select a Property for DAO Acquisition
                    </h2>
                    <p className="text-gray-600">
                      Choose one of our demo properties to create a real proposal with oracle validation
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {demoProperties.map((property) => (
                      <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={property.imageUrl}
                            alt={`${property.city}, ${property.state}`}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {property.address}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {property.city}, {property.state} {property.zipCode}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <div className="font-medium">${parseInt(property.askingPrice).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Rent:</span>
                              <div className="font-medium">${parseInt(property.expectedMonthlyRent).toLocaleString()}/mo</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handlePropertySelect(property)}
                            leftIcon={<Play size={16} />}
                          >
                            Start Demo
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'create' && selectedProperty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database size={24} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Creating Proposal with Oracle Validation
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    The property acquisition form will request oracle validation and create a real proposal on the blockchain.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-start space-x-2">
                      <Info size={16} className="text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Selected Property:</p>
                        <p>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</p>
                        <p>Asking Price: ${parseInt(selectedProperty.askingPrice).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'vote' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Vote size={24} className="text-emerald-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Vote on Active Proposals
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Your proposal has been created! You can now vote on it and see real-time results.
                    </p>
                    {!canVote && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Voting Power Required</p>
                            <p>You need ERLD tokens to participate in governance. Current voting power: {votingPower}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isLoading ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Activity size={48} className="mx-auto text-gray-400 mb-4 animate-pulse" />
                      <p className="text-gray-600">Loading proposals...</p>
                    </CardContent>
                  </Card>
                ) : recentProposal ? (
                  <EnhancedProposalCard
                    proposal={recentProposal}
                    userCanVote={canVote}
                    onVoteComplete={handleVoteComplete}
                    onClick={() => {
                      // Could open detailed view
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Vote size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No active proposals found. Try creating one!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 size={64} className="text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Demo Completed Successfully!
                  </h2>
                  <p className="text-green-700 mb-6">
                    You've successfully demonstrated the complete property acquisition workflow
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">What You Accomplished:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle2 size={16} />
                          <span>Selected property for acquisition</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle2 size={16} />
                          <span>Requested Chainlink oracle validation</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle2 size={16} />
                          <span>Created real blockchain proposal</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle2 size={16} />
                          <span>Participated in DAO governance voting</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Start New Demo
                    </Button>
                    <Link href="/dashboard/governance">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        View All Proposals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Technical Information */}
          <Card className="mt-8 border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-semibold mb-2">Live Smart Contract Integration:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-1">
                      <li>• <strong>Oracle Contract:</strong> Real Chainlink Functions requests</li>
                      <li>• <strong>Property Acquisition:</strong> Live proposal creation</li>
                      <li>• <strong>DAO Governance:</strong> Real voting on Sepolia testnet</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• <strong>Mock Data Fallback:</strong> Consistent property valuations</li>
                      <li>• <strong>State Changes:</strong> All interactions modify blockchain state</li>
                      <li>• <strong>Production Ready:</strong> Ready for mainnet deployment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Acquisition Form Modal */}
          <EnhancedPropertyAcquisitionForm
            isOpen={showPropertyForm}
            onClose={() => setShowPropertyForm(false)}
            onSuccess={handleProposalCreated}
            preSelectedProperty={selectedProperty}
          />
        </div>
      </div>
    </TokenProtectedRoute>
  );
}