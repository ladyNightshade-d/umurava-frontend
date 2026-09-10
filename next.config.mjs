/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@radix-ui/react-*'],
    turbopack: {
        root: 'C:\\Users\\HP\\HireWise_Core',
    },
    images: {
        unoptimized: true,
    },
};
export default nextConfig;