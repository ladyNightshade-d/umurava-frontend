'use client';

import MyApplications from '@/src/views/candidates/MyApplications';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function MyApplicationsPage() {
    return (
        <ProtectedRoute>
            <MyApplications />
        </ProtectedRoute>
    );
}
