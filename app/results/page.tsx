'use client';

import { Suspense } from 'react';
import Results from '@/src/views/Results';
import ProtectedRoute from '@/src/components/ProtectedRoute';

function ResultsContent() {
    return <Results />;
}

export default function ResultsPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <ResultsContent />
            </Suspense>
        </ProtectedRoute>
    );
}
