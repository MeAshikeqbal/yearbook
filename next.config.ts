import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  experimental: {
    // Reduces worker bundle size for large icon/SDK packages
    optimizePackageImports: ["lucide-react", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
  },
};

export default nextConfig;
