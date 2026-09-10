'use client';

import { Suspense } from 'react';
import CandidateFeedback from '@/src/views/candidates/CandidateFeedback';
import ProtectedRoute from '@/src/components/ProtectedRoute';

function CandidateFeedbackContent() {
    return <CandidateFeedback />;
}

export default function CandidateFeedbackPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <CandidateFeedbackContent />
            </Suspense>
        </ProtectedRoute>
    );
}
