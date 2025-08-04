// src/app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/components/Layout/ProtectedRoute';
import { Dashboard } from '@/components/Dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}