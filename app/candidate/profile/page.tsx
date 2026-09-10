'use client';

import CandidateProfile from '@/src/views/candidates/CandidateProfile';
import ProtectedRoute from '@/src/components/ProtectedRoute';

export default function CandidateProfilePage() {
    return (
        <ProtectedRoute>
            <CandidateProfile />
        </ProtectedRoute>
    );
}
