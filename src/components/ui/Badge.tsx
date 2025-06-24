'use client';

import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'emerald' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

const badgeVariants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  rounded = true,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border',
        badgeVariants[variant],
        badgeSizes[size],
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Predefined status badges for common DAO states
export const ProposalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'succeeded':
        return 'success';
      case 'pending':
      case 'queued':
        return 'warning';
      case 'defeated':
      case 'canceled':
      case 'expired':
        return 'error';
      case 'executed':
        return 'emerald';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant(status)} size="sm">
      {status}
    </Badge>
  );
};

export const HealthScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Badge variant={getVariant(score)} size="sm">
      {score}/100
    </Badge>
  );
};