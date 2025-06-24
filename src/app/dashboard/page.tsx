'use client';

import React from 'react';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';

export default function Dashboard() {
  const { 
    address, 
    balance,
    votingPower,
    treasuryBalance,
    healthScore,
    isLoading,
    isDAOMember,
    canVote,
    totalProperties,
    userOwnershipPercentage
  } = useEmeraldDAO();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DAO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Emerald DAO
        </h1>
        <p className="text-gray-600">
          Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        {isDAOMember && (
          <div className="mt-2 flex items-center space-x-4 text-sm">
            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
              DAO Member
            </span>
            {canVote && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Can Vote
              </span>
            )}
            <span className="text-gray-600">
              Owns {userOwnershipPercentage.toFixed(4)}% of supply
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Your Balance
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {balance} ERLD
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userOwnershipPercentage.toFixed(4)}% of total supply
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Voting Power
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {votingPower}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {canVote ? 'Can participate in governance' : 'No voting power'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Treasury Value
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {treasuryBalance} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            DAO treasury holdings
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Health Score
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {healthScore}/100
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  healthScore >= 80 ? 'bg-green-500' : 
                  healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Properties
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {totalProperties}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Real estate assets owned by DAO
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Member Status
          </h3>
          <p className="text-lg font-bold text-gray-900">
            {isDAOMember ? 'Active Member' : 'Not a Member'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isDAOMember ? 
              'You hold ERLD tokens' : 
              'Acquire ERLD tokens to join'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Governance Power
          </h3>
          <p className="text-lg font-bold text-gray-900">
            {canVote ? 'Can Vote' : 'No Power'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {canVote ? 
              'Participate in DAO decisions' : 
              'Delegate tokens to vote'
            }
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left disabled:opacity-50"
            disabled={!isDAOMember}
          >
            <h3 className="font-medium text-gray-900">View Properties</h3>
            <p className="text-sm text-gray-600">
              Browse DAO property portfolio ({totalProperties} properties)
            </p>
          </button>
          
          <button 
            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left disabled:opacity-50"
            disabled={!canVote}
          >
            <h3 className="font-medium text-gray-900">Vote on Proposals</h3>
            <p className="text-sm text-gray-600">
              {canVote ? 
                'Participate in governance decisions' : 
                'Need voting power to participate'
              }
            </p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left">
            <h3 className="font-medium text-gray-900">View Treasury</h3>
            <p className="text-sm text-gray-600">
              Monitor DAO finances and health score
            </p>
          </button>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Address: {address}</p>
            <p>Is DAO Member: {isDAOMember.toString()}</p>
            <p>Can Vote: {canVote.toString()}</p>
            <p>Balance: {balance} ERLD</p>
            <p>Voting Power: {votingPower}</p>
            <p>Treasury: {treasuryBalance} ETH</p>
            <p>Health Score: {healthScore}</p>
          </div>
        </div>
      )}
    </div>
  );
}