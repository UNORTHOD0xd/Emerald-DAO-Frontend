'use client';

import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'emerald' | 'blue' | 'gray' | 'white';
  className?: string;
}

interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const spinnerColors = {
  emerald: 'border-emerald-600',
  blue: 'border-blue-600',
  gray: 'border-gray-600',
  white: 'border-white',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'emerald',
  className,
}) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-t-transparent',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
    />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  children,
  fallback,
  className,
}) => {
  if (loading) {
    return (
      <div className={clsx('flex items-center justify-center p-8', className)}>
        {fallback || (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('animate-pulse bg-gray-200 rounded h-4', className)} />
);

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white p-6 rounded-lg border border-gray-200">
    <div className="space-y-3">
      <SkeletonLine className="h-6 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <SkeletonLine className="h-4 w-5/6" />
      <SkeletonLine className="h-4 w-2/3" />
    </div>
  </div>
);