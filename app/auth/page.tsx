'use client';

import { Suspense } from 'react';
import Auth from '@/src/views/Auth';

function AuthContent() {
    return <Auth />;
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
