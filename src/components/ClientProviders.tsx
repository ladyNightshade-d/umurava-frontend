'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { store } from '@/src/store';
import { Toaster } from '@/src/components/ui/toaster';
import { Toaster as Sonner } from '@/src/components/ui/sonner';
import { TooltipProvider } from '@/src/components/ui/tooltip';

// M-9: All client-only providers are isolated here.
// app/layout.tsx is now a server component, enabling SSR and server-side auth checks.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30000,
    },
  },
});

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
