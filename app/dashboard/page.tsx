'use client';

import Dashboard from '@/src/views/Dashboard';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}
