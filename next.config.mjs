/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@radix-ui/react-*'],
    images: {
        unoptimized: true,
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Prevent clickjacking — block iframes entirely
                    { key: 'X-Frame-Options', value: 'DENY' },
                    // Prevent MIME-type sniffing
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Control referrer information sent with requests
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Disable browser features that aren't needed
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
                    // Force HTTPS for 1 year (only active on HTTPS deployments)
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                    // XSS protection for older browsers
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    // Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Next.js requires unsafe-inline for styles
                            "style-src 'self' 'unsafe-inline'",
                            // Next.js requires unsafe-inline and unsafe-eval for scripts in dev
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            // Allow images from self and data URIs
                            "img-src 'self' data: blob:",
                            // Allow fonts from self
                            "font-src 'self'",
                            // API backend connection
                            `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ''} https://accounts.google.com`,
                            // Block all frames
                            "frame-src 'none'",
                            // Block object/embed
                            "object-src 'none'",
                            // Upgrade insecure requests
                            "upgrade-insecure-requests",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
