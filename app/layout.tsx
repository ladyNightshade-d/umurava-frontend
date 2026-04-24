'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { store } from '@/src/store';
import { Toaster } from '@/src/components/ui/toaster';
import { Toaster as Sonner } from '@/src/components/ui/sonner';
import { TooltipProvider } from '@/src/components/ui/tooltip';
import '@/src/index.css';

const queryClient = new QueryClient();

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <title>HireWise - AI-Powered Recruitment Platform</title>
                <meta name="description" content="AI-powered recruitment platform for intelligent candidate screening" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            <TooltipProvider>
                                {children}
                                <Toaster />
                                <Sonner />
                            </TooltipProvider>
                        </AuthProvider>
                    </QueryClientProvider>
                </Provider>
            </body>
        </html>
    );
}
