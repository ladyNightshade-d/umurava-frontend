/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@radix-ui/react-*'],
    turbopack: {
        root: 'C:\\Users\\HP\\Documents\\projects\\Hirewise2',
    },
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
