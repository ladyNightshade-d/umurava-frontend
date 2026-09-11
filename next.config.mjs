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
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "img-src 'self' data: blob: https:",
                            "font-src 'self' https://fonts.gstatic.com",
                            // Hardcode the backend URL — env vars are undefined at build time on Netlify
                            "connect-src 'self' https://umurava-backen.onrender.com https://accounts.google.com",
                            "frame-src 'none'",
                            "object-src 'none'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
