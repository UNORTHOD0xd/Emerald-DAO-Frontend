'use client';

import React from 'react';
import { Settings, User, Shield, Bell } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';

export default function SettingsPage() {
  const { address, isDAOMember, balance, votingPower } = useEmeraldDAO();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your DAO account and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                {address}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membership Status
              </label>
              <div className="flex items-center space-x-2">
                {isDAOMember ? (
                  <Badge variant="emerald">Active Member</Badge>
                ) : (
                  <Badge variant="neutral">Non-member</Badge>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ERLD Balance
              </label>
              <p className="text-sm text-gray-900">
                {parseFloat(balance).toFixed(4)} ERLD
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voting Power
              </label>
              <p className="text-sm text-gray-900">
                {parseFloat(votingPower).toFixed(4)} ERLD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Governance Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Vote Delegation</h4>
                <p className="text-sm text-gray-600">Delegate your voting power to another address</p>
              </div>
              <Badge variant="info">Self-delegated</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Proposal Notifications</h4>
                <p className="text-sm text-gray-600">Get notified about new proposals</p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">New Proposals</h4>
                <p className="text-sm text-gray-600">Notify when new proposals are created</p>
              </div>
              <Badge variant="success">On</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Voting Reminders</h4>
                <p className="text-sm text-gray-600">Remind me to vote before deadline</p>
              </div>
              <Badge variant="success">On</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Emergency Alerts</h4>
                <p className="text-sm text-gray-600">Critical DAO security notifications</p>
              </div>
              <Badge variant="success">On</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <div className="text-center py-8">
        <Settings size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Settings Coming Soon</h3>
        <p className="text-gray-600">
          Additional customization options and preferences will be available soon.
        </p>
      </div>
    </div>
  );
}