/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Ignorer les erreurs ESLint
    },
    typescript: {
        ignoreBuildErrors: true, // Ignorer les erreurs TypeScript
    },
};

export default nextConfig;
