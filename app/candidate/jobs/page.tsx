'use client';

import JobBoard from '@/src/views/candidates/JobBoard';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function JobBoardPage() {
    return (
        <ProtectedRoute>
            <JobBoard />
        </ProtectedRoute>
    );
}
