import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    typescript: {
        // ⚠️ Warning: This will ignore TypeScript errors during build
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
