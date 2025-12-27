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
  },
  // Fix workspace root warning for Vercel - points to monorepo root
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  // Webpack config only used for production builds (turbopack used for dev)
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@api": path.resolve(process.cwd(), "../api"),
      "@db": path.resolve(process.cwd(), "../db"),
    }
    return config
  },
  typescript: {
    // TODO: Fix TypeScript errors and set to false
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}


export default withSerwist(nextConfig)
