/** @type {import('next').NextConfig} */
import path from "path"
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
  experimental: {
    // Allows importing server-only code from outside of the Next.js project root.
    externalDir: true,
    // Turbopack configuration for monorepo aliases
    turbo: {
      resolveAlias: {
        "@api": "../api",
        "@db": "../db",
      },
    },
  },
  // Fix workspace root warning for Vercel - points to monorepo root
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  typescript: {
    // TODO: Fix TypeScript errors and set to false
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable parallel static generation for faster builds
  staticPageGenerationTimeout: 120,
}


export default withSerwist(nextConfig)
