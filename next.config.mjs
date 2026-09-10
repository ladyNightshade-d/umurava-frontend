/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@radix-ui/react-*'],
    images: {
        unoptimized: true,
    },
};
export default nextConfig;