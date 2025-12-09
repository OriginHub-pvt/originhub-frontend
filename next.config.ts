import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    typescript: {
        // ⚠️ Warning: This will ignore TypeScript errors during build
        ignoreBuildErrors: true,
    },
    // Disable static optimization to avoid Clerk initialization errors during build
    // Pages will be rendered dynamically at runtime
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

export default nextConfig;
