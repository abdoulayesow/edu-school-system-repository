/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker"
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  NetworkOnly,
  ExpirationPlugin,
  type PrecacheEntry,
  type SerwistGlobalConfig,
} from "serwist"

// Service Worker type declarations
interface SyncEvent extends Event {
  tag: string
  waitUntil(promise: Promise<unknown>): void
}

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[]
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis & { __SW_MANIFEST: (PrecacheEntry | string)[] }

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Health check - Network only (for connectivity detection)
    {
      matcher: ({ url }) => url.pathname === "/api/health",
      handler: new NetworkOnly({
        networkTimeoutSeconds: 2,
      }),
    },
    // API routes - Network first with cache fallback
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    // Static assets - Cache first
    {
      matcher: ({ request }) =>
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font",
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // Images - Cache first with expiration
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "image-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // HTML pages - Network first
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60, // 1 hour
          }),
        ],
      }),
    },
    // Default cache from Serwist
    ...defaultCache,
  ],
})

// Background sync for offline operations
self.addEventListener("sync", (event) => {
  const syncEvent = event as SyncEvent
  if (syncEvent.tag === "offline-sync") {
    syncEvent.waitUntil(syncOfflineOperations())
  }
})

// Handle sync when coming back online
async function syncOfflineOperations(): Promise<void> {
  // Post message to all clients to trigger sync
  const clients = await self.clients.matchAll({ type: "window" })
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_REQUESTED" })
  })
}

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

serwist.addEventListeners()
