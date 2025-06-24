'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  DollarSign, 
  Send, 
  Shield,
  Calculator,
  Info
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

interface WithdrawalProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (withdrawalData: WithdrawalFormData) => Promise<void>;
  treasuryBalance: number;
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
  spentThisMonth: number;
}

export interface WithdrawalFormData {
  recipient: string;
  amount: number;
  token: 'ETH' | 'ERC20';
  tokenAddress?: string;
  reason: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  executionDate?: string;
}

export const WithdrawalProposalModal: React.FC<WithdrawalProposalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  treasuryBalance,
  dailyLimit,
  monthlyLimit,
  spentToday,
  spentThisMonth,
}) => {
  const [formData, setFormData] = useState<WithdrawalFormData>({
    recipient: '',
    amount: 0,
    token: 'ETH',
    reason: '',
    urgency: 'Medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatETH = (amount: number) => {
    return `${(amount || 0).toFixed(4)} ETH`;
  };

  // Calculate limits and warnings
  const remainingDaily = Math.max(0, dailyLimit - spentToday);
  const remainingMonthly = Math.max(0, monthlyLimit - spentThisMonth);
  const exceedsDailyLimit = formData.amount > remainingDaily;
  const exceedsMonthlyLimit = formData.amount > remainingMonthly;
  const exceedsTreasuryBalance = formData.amount > treasuryBalance;
  const isLargeWithdrawal = formData.amount > treasuryBalance * 0.1; // >10% of treasury

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Low': return 'success';
      case 'Medium': return 'info';
      case 'High': return 'warning';
      case 'Emergency': return 'error';
      default: return 'neutral';
    }
  };

  const getWarningLevel = () => {
    if (exceedsTreasuryBalance) return 'error';
    if (exceedsMonthlyLimit) return 'error';
    if (exceedsDailyLimit) return 'warning';
    if (isLargeWithdrawal) return 'warning';
    return 'info';
  };

  const getWarningMessage = () => {
    if (exceedsTreasuryBalance) {
      return 'Amount exceeds treasury balance';
    }
    if (exceedsMonthlyLimit) {
      return 'Amount exceeds monthly spending limit';
    }
    if (exceedsDailyLimit) {
      return 'Amount exceeds daily spending limit - requires governance approval';
    }
    if (isLargeWithdrawal) {
      return 'Large withdrawal (>10% of treasury) - requires enhanced approval';
    }
    return 'Withdrawal within normal limits';
  };

  const canSubmit = () => {
    return (
      formData.recipient &&
      formData.amount > 0 &&
      formData.reason.trim() &&
      !exceedsTreasuryBalance &&
      !isSubmitting
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        recipient: '',
        amount: 0,
        token: 'ETH',
        reason: '',
        urgency: 'Medium',
      });
    } catch (error) {
      console.error('Failed to create withdrawal proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({
        recipient: '',
        amount: 0,
        token: 'ETH',
        reason: '',
        urgency: 'Medium',
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      title="Create Withdrawal Proposal"
    >
      <ModalContent>
        <div className="space-y-6">
          {/* Treasury Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Treasury Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Available Balance</p>
                <p className="font-semibold text-gray-900">{formatETH(treasuryBalance)}</p>
              </div>
              <div>
                <p className="text-gray-600">Daily Limit Remaining</p>
                <p className="font-semibold text-gray-900">{formatETH(remainingDaily)}</p>
                <p className="text-xs text-gray-500">
                  {formatETH(spentToday)} / {formatETH(dailyLimit)} used
                </p>
              </div>
              <div>
                <p className="text-gray-600">Monthly Limit Remaining</p>
                <p className="font-semibold text-gray-900">{formatETH(remainingMonthly)}</p>
                <p className="text-xs text-gray-500">
                  {formatETH(spentThisMonth)} / {formatETH(monthlyLimit)} used
                </p>
              </div>
            </div>
          </div>

          {/* Warning/Status Message */}
          <div className={`p-4 rounded-lg border ${
            getWarningLevel() === 'error' ? 'bg-red-50 border-red-200' :
            getWarningLevel() === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              {getWarningLevel() === 'error' ? (
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              ) : getWarningLevel() === 'warning' ? (
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              )}
              <div>
                <p className={`font-medium ${
                  getWarningLevel() === 'error' ? 'text-red-800' :
                  getWarningLevel() === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {getWarningMessage()}
                </p>
                {(exceedsDailyLimit || isLargeWithdrawal) && (
                  <p className={`text-sm mt-1 ${
                    getWarningLevel() === 'error' ? 'text-red-700' :
                    getWarningLevel() === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    This withdrawal will require DAO governance approval and may have extended processing time.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="token"
                    value="ETH"
                    checked={formData.token === 'ETH'}
                    onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value as 'ETH' | 'ERC20' }))}
                    className="mr-2"
                  />
                  <span>ETH</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="token"
                    value="ERC20"
                    checked={formData.token === 'ERC20'}
                    onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value as 'ETH' | 'ERC20' }))}
                    className="mr-2"
                  />
                  <span>ERC20 Token</span>
                </label>
              </div>
            </div>

            {formData.token === 'ERC20' && (
              <Input
                label="Token Contract Address"
                value={formData.tokenAddress || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tokenAddress: e.target.value }))}
                placeholder="0x..."
                required
              />
            )}

            <Input
              label="Recipient Address"
              value={formData.recipient}
              onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              placeholder="0x..."
              required
              leftIcon={<Send size={16} />}
            />

            <div>
              <Input
                label={`Amount (${formData.token})`}
                type="number"
                step="0.0001"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.0"
                required
                leftIcon={<DollarSign size={16} />}
              />
              {formData.amount > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Percentage of treasury:</span>
                    <span className="font-medium">
                      {((formData.amount / treasuryBalance) * 100).toFixed(2)}%
                    </span>
                  </div>
                  {formData.token === 'ETH' && (
                    <div className="flex justify-between">
                      <span>Estimated USD value:</span>
                      <span className="font-medium">
                        {formatCurrency(formData.amount * 2000)} {/* Mock ETH price */}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="flex space-x-2">
                {(['Low', 'Medium', 'High', 'Emergency'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.urgency === level
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    } border`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Badge variant={getUrgencyColor(formData.urgency)} size="sm">
                  {formData.urgency} Priority
                </Badge>
              </div>
            </div>

            <TextArea
              label="Reason for Withdrawal"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a detailed explanation for this withdrawal request..."
              rows={4}
              required
              helperText="This will be visible to all DAO members during voting"
            />

            {formData.urgency !== 'Emergency' && (
              <Input
                label="Preferred Execution Date (Optional)"
                type="date"
                value={formData.executionDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, executionDate: e.target.value }))}
                helperText="When should this withdrawal be executed if approved?"
              />
            )}
          </div>

          {/* Approval Process Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Shield size={16} className="mr-2" />
              Approval Process
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {exceedsDailyLimit || isLargeWithdrawal ? (
                <>
                  <li>• This withdrawal requires DAO governance approval</li>
                  <li>• Voting period: 3-7 days depending on urgency</li>
                  <li>• Requires majority approval and quorum</li>
                  {isLargeWithdrawal && <li>• Enhanced review for large withdrawals</li>}
                </>
              ) : (
                <>
                  <li>• This withdrawal is within normal limits</li>
                  <li>• Can be processed by treasury managers</li>
                  <li>• Expected processing time: 1-2 days</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!canSubmit()}
          loading={isSubmitting}
        >
          Create Withdrawal Proposal
        </Button>
      </ModalFooter>
    </Modal>
  );
};