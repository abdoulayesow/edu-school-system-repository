/** @type {import('next').NextConfig} */
import path from "path"
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allows importing server-only code from outside of the Next.js project root.
    externalDir: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@api": path.resolve(process.cwd(), "../api"),
      "@db": path.resolve(process.cwd(), "../db"),
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}


export default withSerwist(nextConfig)
