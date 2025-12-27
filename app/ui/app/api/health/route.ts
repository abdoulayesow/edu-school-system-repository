import { NextResponse } from "next/server"

/**
 * Health check endpoint for connectivity detection
 *
 * This endpoint is designed to be:
 * - Fast (minimal processing)
 * - Lightweight (minimal response)
 * - Not cached (always fresh)
 *
 * The service worker uses this to detect online/offline status
 * with a 2-second timeout.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: Date.now(),
    },
    {
      headers: {
        // Prevent caching
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  )
}

// HEAD request for minimal response
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
