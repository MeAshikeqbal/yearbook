import type { NextConfig } from "next";

// Only initialise the Cloudflare dev bridge during `next dev`.
// Do NOT call this during `next build` — it tries to connect to Hyperdrive
// and errors out if a local connection string isn't configured.
if (process.env.NODE_ENV === "development") {
  // Dynamic import so the module is never bundled into the production build
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  }).catch(() => {
    // Silently ignore if the package isn't available (e.g. CI without devDeps)
  });
}

const nextConfig: NextConfig = {
  experimental: {
    // Reduces worker bundle size for large icon/SDK packages
    optimizePackageImports: ["lucide-react", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
  },
};

export default nextConfig;
