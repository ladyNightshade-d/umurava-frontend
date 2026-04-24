'use client';

import CreateJob from '@/src/views/CreateJob';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function CreateJobPage() {
    return (
        <ProtectedRoute>
            <CreateJob />
        </ProtectedRoute>
    );
}
