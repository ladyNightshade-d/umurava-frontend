'use client';

import { Suspense } from 'react';
import Candidates from '@/src/views/Candidates';
import ProtectedRoute from '@/src/components/ProtectedRoute';

function CandidatesContent() {
    return <Candidates />;
}

export default function CandidatesPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <CandidatesContent />
            </Suspense>
        </ProtectedRoute>
    );
}
