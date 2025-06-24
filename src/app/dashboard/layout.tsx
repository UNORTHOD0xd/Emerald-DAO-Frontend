'use client';

import { TokenProtectedRoute, DashboardLayout } from '@/components/layout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TokenProtectedRoute minimumBalance={0.0001}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </TokenProtectedRoute>
  );
}