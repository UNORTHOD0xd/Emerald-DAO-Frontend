'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  Info,
  Activity,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { ProposalWorkflowDemo, DemoPropertySelector } from '@/components/property';
import { TokenProtectedRoute } from '@/components/layout';
import { type DemoProperty } from '@/data/demoProperties';

export default function ProposalDemoPage() {
  const [selectedProperty, setSelectedProperty] = useState<DemoProperty | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedProposalId, setCompletedProposalId] = useState<string | null>(null);
  const [showPropertySelector, setShowPropertySelector] = useState(true);

  const handlePropertySelect = (property: DemoProperty) => {
    setSelectedProperty(property);
    setShowPropertySelector(false);
    setIsRunning(false);
    setIsCompleted(false);
    setCompletedProposalId(null);
  };

  const startDemo = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCompletedProposalId(null);
    setShowPropertySelector(true);
    setSelectedProperty(null);
  };

  const handleDemoComplete = (proposalId: string) => {
    setIsCompleted(true);
    setCompletedProposalId(proposalId);
    setIsRunning(false);
  };

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
                  Property Acquisition Demo
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete end-to-end demonstration of the Emerald DAO workflow
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" size="lg">
                Live Demo
              </Badge>
              {isCompleted && (
                <Badge variant="success" size="lg">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Demo Status */}
          <Card className="mb-8 border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity size={24} className="text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Chainlink-Powered Property Acquisition
                    </h3>
                    <p className="text-sm text-gray-600">
                      Demonstrates real oracle requests, DAO governance, and automated execution
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isRunning && !isCompleted && selectedProperty && (
                    <Button 
                      onClick={startDemo}
                      leftIcon={<Play size={16} />}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Start Demo
                    </Button>
                  )}
                  
                  {(isRunning || isCompleted) && (
                    <Button 
                      variant="outline"
                      onClick={resetDemo}
                      leftIcon={<RotateCcw size={16} />}
                    >
                      Reset Demo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Selector */}
          {showPropertySelector && (
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
                      Select a Demo Property
                    </h2>
                    <p className="text-gray-600">
                      Choose from our curated properties to demonstrate the acquisition process
                    </p>
                  </div>
                  
                  <DemoPropertySelector
                    onSelectProperty={handlePropertySelect}
                    onClose={() => {}} // No close needed on this page
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Selected Property Overview */}
          {selectedProperty && !showPropertySelector && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedProperty.imageUrl}
                      alt={`${selectedProperty.city}, ${selectedProperty.state}`}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedProperty.address}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                      </p>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700">Asking Price:</span>
                          <div className="font-semibold text-emerald-700">
                            ${parseInt(selectedProperty.askingPrice).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-700">Monthly Rent:</span>
                          <div className="font-semibold text-emerald-700">
                            ${parseInt(selectedProperty.expectedMonthlyRent).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-700">Property Type:</span>
                          <div className="font-semibold">{selectedProperty.propertyType}</div>
                        </div>
                        <div>
                          <span className="text-gray-700">Size:</span>
                          <div className="font-semibold">
                            {selectedProperty.bedrooms}BR / {selectedProperty.bathrooms}BA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Workflow Demo */}
          {selectedProperty && !showPropertySelector && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProposalWorkflowDemo
                propertyAddress={`${selectedProperty.address}, ${selectedProperty.city}, ${selectedProperty.state}`}
                askingPrice={parseInt(selectedProperty.askingPrice)}
                expectedRent={parseInt(selectedProperty.expectedMonthlyRent)}
                onComplete={handleDemoComplete}
                autoAdvance={isRunning}
              />
            </motion.div>
          )}

          {/* Completion Summary */}
          {isCompleted && completedProposalId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 size={64} className="text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Demo Completed Successfully!
                  </h2>
                  <p className="text-green-700 mb-4">
                    The complete property acquisition workflow has been demonstrated
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Proposal ID:</span>
                        <div className="font-mono text-green-800">{completedProposalId}</div>
                      </div>
                      <div>
                        <span className="text-green-700">Property:</span>
                        <div className="font-semibold text-green-800">
                          {selectedProperty?.city}, {selectedProperty?.state}
                        </div>
                      </div>
                      <div>
                        <span className="text-green-700">Acquisition Price:</span>
                        <div className="font-semibold text-green-800">
                          ${parseInt(selectedProperty?.askingPrice || '0').toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-green-700">Oracle Validated:</span>
                        <div className="font-semibold text-green-800">✓ Yes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={resetDemo}
                      variant="outline"
                      leftIcon={<RotateCcw size={16} />}
                    >
                      Run Another Demo
                    </Button>
                    <Link href="/dashboard/governance">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        View in Governance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Educational Information */}
          <Card className="mt-8 border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-semibold mb-2">What This Demo Demonstrates:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ul className="space-y-1">
                      <li>• <strong>Chainlink Functions:</strong> Real estate data aggregation</li>
                      <li>• <strong>DAO Governance:</strong> Community-driven decision making</li>
                      <li>• <strong>Timelock Security:</strong> Delayed execution for safety</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• <strong>Chainlink Automation:</strong> Decentralized execution</li>
                      <li>• <strong>Price Feeds:</strong> ETH/USD conversion for payments</li>
                      <li>• <strong>NFT Integration:</strong> Property ownership tokens</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-xs text-blue-700">
                    This demonstration uses production-ready smart contracts with mock oracle data for consistency. 
                    In production, all oracle requests would connect to live Chainlink Networks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TokenProtectedRoute>
  );
}