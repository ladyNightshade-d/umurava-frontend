'use client';

import { Suspense } from 'react';
import CandidateAuth from '@/src/views/candidates/CandidateAuth';

function CandidateAuthContent() {
    return <CandidateAuth />;
}

export default function CandidateAuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CandidateAuthContent />
        </Suspense>
    );
}
