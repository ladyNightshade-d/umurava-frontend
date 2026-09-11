// M-9: Root layout is now a SERVER component.
// Client-only providers (Redux, React Query, AuthProvider) are in ClientProviders.tsx.
// This enables SSR, server-side auth checks, and proper Next.js App Router patterns.
import type { Metadata } from 'next';
import ClientProviders from '@/src/components/ClientProviders';
import '@/src/index.css';

export const metadata: Metadata = {
  title: 'HireWise AI - AI-Powered Recruitment Platform',
  description: 'AI-powered recruitment platform for intelligent candidate screening',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
