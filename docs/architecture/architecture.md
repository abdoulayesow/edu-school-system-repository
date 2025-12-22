# Technical Architecture - GSPN School Management System

| **Document Info** | |
|-------------------|---|
| **Product** | GSPN School Management System |
| **Version** | 1.0 |
| **Date** | December 19, 2025 |
| **Status** | Draft |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Offline-First Strategy](#3-offline-first-strategy)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Strategy](#8-deployment-strategy)
9. [Cost Analysis](#9-cost-analysis)
10. [Project Structure](#10-project-structure)

---

## 1. Architecture Overview

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Offline-First** | PWA with IndexedDB, background sync when online |
| **Low Cost** | Vercel free/hobby tier, Turso free tier, minimal infrastructure |
| **Reliable** | Local data persistence, conflict resolution, audit logging |
| **Secure** | RBAC, encrypted storage, audit trails, input validation |
| **Web-Based** | Next.js PWA, responsive design, mobile-friendly |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              GSPN SCHOOL MANAGEMENT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              CLIENT (Browser/PWA)                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │    │
│  │  │   Next.js   │  │    React    │  │  Tailwind   │  │   Service Worker    │     │    │
│  │  │  App Router │  │ Components  │  │     CSS     │  │   (Offline Cache)   │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘     │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                    LOCAL STORAGE LAYER                                   │    │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │    │    │
│  │  │  │    IndexedDB    │  │   Dexie.js      │  │    Sync Queue           │  │    │    │
│  │  │  │  (Local Data)   │  │   (ORM Layer)   │  │  (Pending Operations)   │  │    │    │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                               │
│                                          │ HTTPS (when online)                           │
│                                          ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              SERVER (Vercel Edge)                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │    │
│  │  │  Next.js    │  │    tRPC     │  │    Auth     │  │   Background Jobs   │     │    │
│  │  │ API Routes  │  │  (Type-safe)│  │  (NextAuth) │  │   (Vercel Cron)     │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                               │
│                                          │ libSQL (HTTP)                                 │
│                                          ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              DATABASE (Turso)                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │              SQLite-Compatible Edge Database                             │    │    │
│  │  │  • Primary Region: Europe (closest to Guinea)                            │    │    │
│  │  │  • Embedded Replicas: Edge locations for low latency                     │    │    │
│  │  │  • Free Tier: 9GB storage, 500M reads, 25M writes/month                  │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, edge runtime, Vercel native |
| **UI Library** | React 18+ | Component-based, large ecosystem |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, consistent design system, accessible components |
| **State Management** | Zustand + TanStack Query | Lightweight, works well with offline sync |
| **Local Database** | Dexie.js (IndexedDB wrapper) | Offline storage, reactive queries, sync-friendly |
| **Forms** | React Hook Form + Zod | Type-safe validation, good performance |
| **Tables** | TanStack Table | Powerful data tables with filtering/sorting |
| **Charts** | Recharts | Lightweight, React-native charting |
| **Icons** | Lucide React | Clean, consistent icon set |
| **PWA** | next-pwa / Serwist | Service worker, offline caching |

### Backend Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Runtime** | Next.js API Routes (Edge) | Serverless, low latency, Vercel native |
| **API Layer** | tRPC v11 | End-to-end type safety, React Query integration |
| **Authentication** | NextAuth.js v5 | Flexible auth, credential provider for offline |
| **Database Client** | Drizzle ORM | Type-safe, SQLite-native, lightweight |
| **Database** | Turso (libSQL) | SQLite-compatible, edge-native, generous free tier |
| **File Storage** | Vercel Blob | Document uploads, receipts, images |
| **Background Jobs** | Vercel Cron | Period close reminders, notifications |

### Development Tools

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety across full stack |
| **ESLint + Prettier** | Code quality and formatting |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **Drizzle Kit** | Database migrations |
| **pnpm** | Fast, efficient package manager |

---

## 3. Offline-First Strategy

### Sync Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              OFFLINE-FIRST DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  USER ACTION                                                                             │
│      │                                                                                   │
│      ▼                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  1. WRITE TO LOCAL (IndexedDB via Dexie.js)                                     │    │
│  │     • Instant UI feedback                                                        │    │
│  │     • Generate local UUID for new records                                        │    │
│  │     • Mark record with syncStatus: 'pending'                                     │    │
│  │     • Add to sync queue                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│      │                                                                                   │
│      ▼                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  2. CHECK CONNECTIVITY                                                          │    │
│  │     • navigator.onLine                                                           │    │
│  │     • Actual ping to /api/health                                                 │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│      │                                                                                   │
│      ├──── OFFLINE ────────────────────────────────────────────────────────┐            │
│      │                                                                      │            │
│      │  ┌─────────────────────────────────────────────────────────────┐    │            │
│      │  │  3a. QUEUE FOR LATER                                        │    │            │
│      │  │      • Store in syncQueue table                             │    │            │
│      │  │      • Show "Pending Sync" indicator in UI                  │    │            │
│      │  │      • Register Background Sync (if supported)              │    │            │
│      │  └─────────────────────────────────────────────────────────────┘    │            │
│      │                                                                      │            │
│      ▼                                                                      │            │
│  ┌──────────────────────────────────────────────────────────────────────────┘           │
│  │  3b. ONLINE - SYNC TO SERVER                                                         │
│  │      • Process sync queue in order (FIFO)                                            │
│  │      • Send batch of operations to /api/sync                                         │
│  │      • Handle conflicts (server wins with merge)                                     │
│  │      • Update local records with server timestamps                                   │
│  │      • Mark syncStatus: 'synced'                                                     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘│
│      │                                                                                   │
│      ▼                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  4. PULL REMOTE CHANGES                                                         │    │
│  │     • Fetch changes since last sync timestamp                                    │    │
│  │     • Merge into local database                                                  │    │
│  │     • Update UI via reactive Dexie queries                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Local Database Schema (Dexie.js)

```typescript
// db/local-schema.ts
import Dexie, { Table } from 'dexie';

export interface LocalStudent {
  id: string;           // UUID
  serverId?: number;    // Server ID after sync
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentDate: string;
  gradeLevel: string;
  status: 'active' | 'inactive' | 'pending';
  // Sync metadata
  syncStatus: 'pending' | 'synced' | 'conflict';
  localUpdatedAt: string;
  serverUpdatedAt?: string;
  version: number;
}

export interface SyncQueueItem {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  createdAt: string;
  attempts: number;        // Retry counter for dead-letter queue pattern
  lastError?: string;      // Last error message for debugging
  lastAttemptAt?: string;  // Timestamp of last sync attempt
}

// Dead-letter queue for failed sync operations (after max retries)
export interface SyncErrorItem {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  createdAt: string;
  failedAt: string;
  attempts: number;
  lastError: string;
}

// Queue for offline file uploads (stored as blobs in IndexedDB)
export interface FileUploadQueueItem {
  id?: number;
  localBlobId: string;     // Local reference: 'local-blob:<uuid>'
  relatedTable: string;    // e.g., 'payments', 'students'
  relatedRecordId: string; // The record this file belongs to
  fieldName: string;       // e.g., 'documentUrl', 'photoUrl'
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;              // The actual file data
  createdAt: string;
  attempts: number;
}

// Sync conflicts requiring user resolution
export interface SyncConflictItem {
  id?: number;
  table: string;
  recordId: string;
  localVersion: any;       // JSON of user's offline version
  serverVersion: any;      // JSON of conflicting server version
  conflictedFields: string[]; // Fields that differ
  detectedAt: string;
  resolution?: 'local_wins' | 'server_wins' | 'merged' | 'pending';
  resolvedAt?: string;
}

export class GSPNLocalDB extends Dexie {
  students!: Table<LocalStudent>;
  payments!: Table<LocalPayment>;
  activities!: Table<LocalActivity>;
  enrollments!: Table<LocalEnrollment>;
  attendance!: Table<LocalAttendance>;
  syncQueue!: Table<SyncQueueItem>;
  syncErrors!: Table<SyncErrorItem>;           // Dead-letter queue
  fileUploadQueue!: Table<FileUploadQueueItem>; // Offline file uploads
  syncConflicts!: Table<SyncConflictItem>;     // User-resolvable conflicts

  constructor() {
    super('gspn-local');
    this.version(1).stores({
      students: 'id, serverId, syncStatus, lastName',
      payments: 'id, serverId, syncStatus, studentId, date',
      activities: 'id, serverId, syncStatus, type',
      enrollments: 'id, serverId, syncStatus, studentId, activityId',
      attendance: 'id, serverId, syncStatus, activityId, date',
      syncQueue: '++id, table, recordId, createdAt',
      syncErrors: '++id, table, recordId, failedAt',
      fileUploadQueue: '++id, relatedTable, relatedRecordId, createdAt',
      syncConflicts: '++id, table, recordId, resolution',
    });
  }
}

export const localDb = new GSPNLocalDB();

// Constants for sync behavior
export const SYNC_CONFIG = {
  MAX_RETRY_ATTEMPTS: 5,           // Move to syncErrors after this many failures
  RETRY_BACKOFF_MS: [1000, 5000, 15000, 60000, 300000], // Exponential backoff
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB max for offline file storage
};
```

### Conflict Resolution Strategy

| Scenario | Resolution |
|----------|------------|
| **Create conflict** (same ID) | Keep both with merge, flag for user review |
| **Update conflict** | Flag for user resolution via Conflict Resolution UI |
| **Delete conflict** | Server wins, soft-delete locally |
| **Network failure mid-sync** | Retry with exponential backoff (max 5 attempts) |
| **Version mismatch** | Three-way merge with base version, flag conflicts |
| **Max retries exceeded** | Move to dead-letter queue, alert user |

### User-Facing Conflict Resolution Flow

When conflicts are detected, users see a clear resolution interface:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONFLICT RESOLUTION UI                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ⚠️ CONFLICT BANNER (shown on affected record's page)                           │    │
│  │  "This record has conflicting changes made by another user. [Resolve Now]"      │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  RESOLUTION MODAL (two-column comparison)                                       │    │
│  │  ┌─────────────────────────┬─────────────────────────┐                          │    │
│  │  │ Your Version (Offline)  │ Server Version          │                          │    │
│  │  ├─────────────────────────┼─────────────────────────┤                          │    │
│  │  │ Guardian Phone: 111-222 │ Guardian Phone: 999-888 │ ← Conflicting field      │    │
│  │  │ Status: Active          │ Status: Inactive        │ ← Conflicting field      │    │
│  │  │ Grade: 10th             │ Grade: 10th             │ ← Same (no conflict)     │    │
│  │  ├─────────────────────────┼─────────────────────────┤                          │    │
│  │  │ [Keep Your Version]     │ [Use Server Version]    │                          │    │
│  │  └─────────────────────────┴─────────────────────────┘                          │    │
│  │                        [Merge Field by Field]                                   │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Dead-Letter Queue Pattern (Poison Pill Prevention)

Failed sync operations are handled gracefully:

```typescript
// lib/sync/queue-processor.ts
async function processSyncQueue() {
  const pendingItems = await localDb.syncQueue.toArray();
  
  for (const item of pendingItems) {
    try {
      await syncItemToServer(item);
      await localDb.syncQueue.delete(item.id);
    } catch (error) {
      item.attempts += 1;
      item.lastError = error.message;
      item.lastAttemptAt = new Date().toISOString();
      
      if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
        // Move to dead-letter queue - unblocks the sync queue
        await localDb.syncErrors.add({
          ...item,
          failedAt: new Date().toISOString(),
        });
        await localDb.syncQueue.delete(item.id);
        // Trigger UI notification
        notifySyncError(item);
      } else {
        // Update with retry info, will retry with backoff
        await localDb.syncQueue.update(item.id, item);
      }
    }
  }
}
```

**UI Indicator:** When `syncErrors` table is not empty, show a red cloud icon in the header. Clicking opens a view showing failed operations with "Retry" or "Discard" options.

### Offline File Upload Strategy

Files are queued locally and uploaded when online:

```typescript
// lib/sync/file-upload.ts
async function queueFileForUpload(
  file: File,
  relatedTable: string,
  relatedRecordId: string,
  fieldName: string
): Promise<string> {
  // Validate file size
  if (file.size > SYNC_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large. Maximum size is ${SYNC_CONFIG.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
  }
  
  // Generate local blob reference
  const localBlobId = `local-blob:${crypto.randomUUID()}`;
  
  // Store in IndexedDB
  await localDb.fileUploadQueue.add({
    localBlobId,
    relatedTable,
    relatedRecordId,
    fieldName,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  
  // Return local reference (used in record until upload completes)
  return localBlobId;
}

// Sync worker processes file queue first
async function processFileUploadQueue() {
  const pendingFiles = await localDb.fileUploadQueue.toArray();
  
  for (const item of pendingFiles) {
    try {
      // Upload to Vercel Blob
      const permanentUrl = await uploadToVercelBlob(item.blob, item.fileName);
      
      // Update the related record with permanent URL
      await updateRecordField(
        item.relatedTable,
        item.relatedRecordId,
        item.fieldName,
        permanentUrl
      );
      
      // Remove from queue
      await localDb.fileUploadQueue.delete(item.id);
    } catch (error) {
      item.attempts += 1;
      if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
        // Move to sync errors
        await moveToBlobUploadErrors(item, error);
      }
    }
  }
}
```

### Initial Data Hydration (Phased Loading)

To avoid slow first-sync, data is loaded in phases:

```typescript
// lib/sync/initial-hydration.ts
async function performInitialSync() {
  // Phase 1: Hot data only (fast initial load)
  const hotData = await trpc.sync.getInitialData.query({
    studentsFilter: { status: 'active' },
    paymentsFilter: { periodId: currentPeriodId },
    ticketsFilter: { status: ['open', 'pending_approval'] },
  });
  
  await hydrateLocalDb(hotData);
  
  // Mark initial sync complete - app is now usable
  await markInitialSyncComplete();
  
  // Phase 2: Background load of older data (non-blocking)
  if (navigator.onLine) {
    backgroundLoadHistoricalData();
  }
}

// On-demand loading for historical data
async function loadHistoricalData(periodId: string) {
  // Show loading indicator
  showLoadingIndicator('Loading historical data...');
  
  const historicalData = await trpc.sync.getHistoricalData.query({ periodId });
  await hydrateLocalDb(historicalData);
  
  hideLoadingIndicator();
}
```

**User Experience:**
- App becomes usable after Phase 1 (active data only)
- Historical data loads in background or on-demand
- Clear "Loading historical data..." indicator when fetching old records

### PWA Configuration

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.vercel\.app\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-cache' },
    },
  ],
});
```

---

## 4. System Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS APP STRUCTURE                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  app/                                                                                    │
│  ├── (auth)/                    # Auth routes (login, register)                          │
│  │   ├── login/page.tsx                                                                  │
│  │   └── layout.tsx             # Minimal layout for auth                                │
│  │                                                                                       │
│  ├── (dashboard)/               # Protected dashboard routes                             │
│  │   ├── layout.tsx             # Dashboard shell with sidebar                           │
│  │   │                                                                                   │
│  │   ├── director/              # Ousmane's views                                        │
│  │   │   ├── page.tsx           # Director dashboard                                     │
│  │   │   ├── approvals/         # Exception approvals                                    │
│  │   │   └── reports/           # Reports & analytics                                    │
│  │   │                                                                                   │
│  │   ├── secretary/             # Mariama's views                                        │
│  │   │   ├── page.tsx           # Secretary dashboard                                    │
│  │   │   ├── students/          # Student management                                     │
│  │   │   └── activities/        # Activity management                                    │
│  │   │                                                                                   │
│  │   ├── accountant/            # Ibrahima's views                                       │
│  │   │   ├── page.tsx           # Accountant dashboard                                   │
│  │   │   ├── payments/          # Payment recording                                      │
│  │   │   ├── reconciliation/    # Bank reconciliation                                    │
│  │   │   └── period-close/      # Period close wizard                                    │
│  │   │                                                                                   │
│  │   ├── teacher/               # Amadou's views                                         │
│  │   │   ├── page.tsx           # Teacher dashboard                                      │
│  │   │   └── attendance/        # Attendance marking                                     │
│  │   │                                                                                   │
│  │   └── academic/              # Fatoumata's views                                      │
│  │       ├── page.tsx           # Academic director dashboard                            │
│  │       └── reports/           # Participation reports                                  │
│  │                                                                                       │
│  ├── api/                       # API routes                                             │
│  │   ├── trpc/[trpc]/route.ts   # tRPC handler                                          │
│  │   ├── auth/[...nextauth]/    # NextAuth routes                                       │
│  │   ├── sync/route.ts          # Offline sync endpoint                                 │
│  │   └── health/route.ts        # Health check for connectivity                         │
│  │                                                                                       │
│  ├── layout.tsx                 # Root layout                                            │
│  └── globals.css                # Global styles                                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE MANAGEMENT LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  UI STATE (Zustand)                                                              │    │
│  │  • Modal open/close                                                              │    │
│  │  • Sidebar collapsed                                                             │    │
│  │  • Selected filters                                                              │    │
│  │  • Toast notifications                                                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  SERVER STATE (TanStack Query + tRPC)                                            │    │
│  │  • Remote data fetching                                                          │    │
│  │  • Caching                                                                       │    │
│  │  • Background refetching                                                         │    │
│  │  • Optimistic updates                                                            │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  LOCAL STATE (Dexie.js + useLiveQuery)                                           │    │
│  │  • Offline data                                                                  │    │
│  │  • Sync queue                                                                    │    │
│  │  • Reactive updates                                                              │    │
│  │  • Conflict tracking                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AUTH STATE (NextAuth + Zustand)                                                 │    │
│  │  • User session                                                                  │    │
│  │  • Role/permissions                                                              │    │
│  │  • Offline auth token                                                            │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA (Turso/SQLite)                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐                         │
│  │    users     │       │   students   │       │  activities  │                         │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤                         │
│  │ id (PK)      │       │ id (PK)      │       │ id (PK)      │                         │
│  │ email        │       │ student_id   │       │ name         │                         │
│  │ password_hash│       │ first_name   │       │ description  │                         │
│  │ role         │──┐    │ last_name    │       │ type         │                         │
│  │ first_name   │  │    │ date_of_birth│       │ teacher_id   │──────┐                  │
│  │ last_name    │  │    │ guardian_name│       │ fee_amount   │      │                  │
│  │ is_active    │  │    │ guardian_phone│      │ max_capacity │      │                  │
│  │ created_at   │  │    │ grade_level  │       │ schedule     │      │                  │
│  │ updated_at   │  │    │ enrollment_dt│       │ is_active    │      │                  │
│  └──────────────┘  │    │ status       │       │ created_at   │      │                  │
│                    │    │ created_at   │       │ updated_at   │      │                  │
│                    │    │ updated_at   │       └──────────────┘      │                  │
│                    │    └──────────────┘              │               │                  │
│                    │           │                      │               │                  │
│                    │           │                      │               │                  │
│                    │    ┌──────▼──────────────────────▼───┐          │                  │
│                    │    │       activity_enrollments      │          │                  │
│                    │    ├─────────────────────────────────┤          │                  │
│                    │    │ id (PK)                         │          │                  │
│                    │    │ student_id (FK)                 │          │                  │
│                    │    │ activity_id (FK)                │          │                  │
│                    │    │ enrolled_at                     │          │                  │
│                    │    │ status (active/cancelled)       │          │                  │
│                    │    │ cancelled_at                    │          │                  │
│                    │    │ cancellation_reason             │          │                  │
│                    │    └─────────────────────────────────┘          │                  │
│                    │                    │                             │                  │
│                    │           ┌────────▼─────────┐                   │                  │
│                    │           │    attendance    │                   │                  │
│                    │           ├──────────────────┤                   │                  │
│                    │           │ id (PK)          │                   │                  │
│                    │           │ enrollment_id(FK)│                   │                  │
│                    └──────────►│ recorded_by (FK) │◄──────────────────┘                  │
│                                │ date             │                                      │
│                                │ status           │                                      │
│                                │ notes            │                                      │
│                                │ created_at       │                                      │
│                                └──────────────────┘                                      │
│                                                                                          │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐                         │
│  │   payments   │       │ bank_deposits│       │reconciliations│                        │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤                         │
│  │ id (PK)      │       │ id (PK)      │       │ id (PK)      │                         │
│  │ student_id   │───┐   │ deposit_date │       │ payment_id   │─────────┐               │
│  │ amount       │   │   │ amount       │       │ deposit_id   │─────────┼───┐           │
│  │ payment_type │   │   │ bank_account │       │ matched_at   │         │   │           │
│  │ category     │   │   │ reference_no │       │ matched_by   │         │   │           │
│  │ reference    │   │   │ document_url │       │ status       │         │   │           │
│  │ document_url │   │   │ status       │       └──────────────┘         │   │           │
│  │ status       │   │   │ recorded_by  │              ▲                 │   │           │
│  │ validated_by │   │   │ validated_by │              │                 │   │           │
│  │ validated_at │   │   │ created_at   │              │                 │   │           │
│  │ recorded_by  │   │   └──────────────┘              │                 │   │           │
│  │ created_at   │   │          │                      │                 │   │           │
│  └──────────────┘   │          └──────────────────────┴─────────────────┘   │           │
│         │           │                                                        │           │
│         │           │   ┌──────────────────────────────────────────────────┘           │
│         │           │   │                                                               │
│         │           │   │   ┌──────────────┐       ┌──────────────┐                     │
│         │           │   │   │   periods    │       │ audit_logs   │                     │
│         │           │   │   ├──────────────┤       ├──────────────┤                     │
│         │           │   │   │ id (PK)      │       │ id (PK)      │                     │
│         │           │   │   │ name         │       │ table_name   │                     │
│         │           │   │   │ start_date   │       │ record_id    │                     │
│         │           │   │   │ end_date     │       │ action       │                     │
│         │           │   │   │ status       │       │ old_values   │                     │
│         │           └───┼──►│ closed_by    │       │ new_values   │                     │
│         │               │   │ closed_at    │       │ user_id      │                     │
│         └───────────────┼──►│ created_at   │       │ created_at   │                     │
│                         │   └──────────────┘       └──────────────┘                     │
│                         │                                                               │
│  ┌──────────────────────▼─────────────────────────────────────────────────────────┐    │
│  │                         exception_tickets                                       │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │ id (PK) | type | description | related_table | related_id | status |            │    │
│  │ created_by | assigned_to | resolution | resolved_by | resolved_at | created_at  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Tables (Drizzle Schema)

```typescript
// db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users & Auth
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['director', 'secretary', 'accountant', 'teacher', 'academic_director'] }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Students
export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: text('student_id').notNull().unique(), // e.g., GSPN-2025-001
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  guardianName: text('guardian_name').notNull(),
  guardianPhone: text('guardian_phone').notNull(),
  gradeLevel: text('grade_level').notNull(),
  enrollmentDate: text('enrollment_date').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'pending'] }).default('pending'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Payments
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => students.id),
  amount: real('amount').notNull(),
  paymentType: text('payment_type', { enum: ['cash', 'mobile_money', 'bank_transfer'] }).notNull(),
  category: text('category', { enum: ['enrollment', 'tuition', 'activity', 'other'] }).notNull(),
  reference: text('reference'), // Mobile money transaction ID, etc.
  documentUrl: text('document_url'), // Receipt/screenshot
  status: text('status', { enum: ['unvalidated', 'validated', 'reconciled'] }).default('unvalidated'),
  validatedBy: integer('validated_by').references(() => users.id),
  validatedAt: text('validated_at'),
  recordedBy: integer('recorded_by').references(() => users.id),
  periodId: integer('period_id').references(() => periods.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Activities
export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['curricular', 'extracurricular'] }).notNull(),
  teacherId: integer('teacher_id').references(() => users.id),
  feeAmount: real('fee_amount').default(0),
  maxCapacity: integer('max_capacity'),
  schedule: text('schedule'), // JSON string for schedule
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Exception Tickets
export const exceptionTickets = sqliteTable('exception_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['payment_discrepancy', 'enrollment_issue', 'refund_request', 'other'] }).notNull(),
  description: text('description').notNull(),
  relatedTable: text('related_table'),
  relatedId: integer('related_id'),
  status: text('status', { enum: ['open', 'pending_approval', 'approved', 'rejected', 'resolved'] }).default('open'),
  createdBy: integer('created_by').references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  resolution: text('resolution'),
  resolvedBy: integer('resolved_by').references(() => users.id),
  resolvedAt: text('resolved_at'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  recordId: integer('record_id').notNull(),
  action: text('action', { enum: ['create', 'update', 'delete'] }).notNull(),
  oldValues: text('old_values'), // JSON
  newValues: text('new_values'), // JSON
  userId: integer('user_id').references(() => users.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

---

## 6. API Design

### tRPC Router Structure

```typescript
// server/routers/_app.ts
import { router } from '../trpc';
import { authRouter } from './auth';
import { studentsRouter } from './students';
import { paymentsRouter } from './payments';
import { activitiesRouter } from './activities';
import { attendanceRouter } from './attendance';
import { reconciliationRouter } from './reconciliation';
import { reportsRouter } from './reports';
import { exceptionsRouter } from './exceptions';
import { syncRouter } from './sync';

export const appRouter = router({
  auth: authRouter,
  students: studentsRouter,
  payments: paymentsRouter,
  activities: activitiesRouter,
  attendance: attendanceRouter,
  reconciliation: reconciliationRouter,
  reports: reportsRouter,
  exceptions: exceptionsRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
```

### Example Router (Students)

```typescript
// server/routers/students.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { eq, like, and } from 'drizzle-orm';

export const studentsRouter = router({
  // List students with pagination and filters
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'pending']).optional(),
      gradeLevel: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  // Get single student
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  // Create student
  create: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.string(),
      guardianName: z.string().min(1),
      guardianPhone: z.string().min(1),
      gradeLevel: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate student ID, create record, log audit
    }),

  // Update student
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        guardianPhone: z.string().optional(),
        gradeLevel: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update with audit log
    }),
});
```

### Sync Endpoint

```typescript
// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SyncOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  localTimestamp: string;
}

interface SyncRequest {
  lastSyncTimestamp: string;
  operations: SyncOperation[];
}

export async function POST(request: NextRequest) {
  const body: SyncRequest = await request.json();
  
  // 1. Process incoming operations
  const results = await processOperations(body.operations);
  
  // 2. Get changes since last sync
  const remoteChanges = await getChangesSince(body.lastSyncTimestamp);
  
  // 3. Return sync response
  return NextResponse.json({
    success: true,
    syncTimestamp: new Date().toISOString(),
    processedOperations: results,
    remoteChanges,
    conflicts: results.filter(r => r.conflict),
  });
}
```

---

## 7. Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ONLINE LOGIN                                  OFFLINE ACCESS                            │
│  ───────────                                   ──────────────                            │
│  ┌─────────────┐                               ┌─────────────┐                          │
│  │ User enters │                               │ User opens  │                          │
│  │ credentials │                               │ app offline │                          │
│  └──────┬──────┘                               └──────┬──────┘                          │
│         │                                             │                                  │
│         ▼                                             ▼                                  │
│  ┌─────────────┐                               ┌─────────────┐                          │
│  │  NextAuth   │                               │ Check local │                          │
│  │  validates  │                               │ session     │                          │
│  └──────┬──────┘                               └──────┬──────┘                          │
│         │                                             │                                  │
│         ▼                                             ▼                                  │
│  ┌─────────────┐                               ┌─────────────┐                          │
│  │ Create JWT  │                               │ Valid local │──No──► Force online      │
│  │ + Session   │                               │ session?    │        login             │
│  └──────┬──────┘                               └──────┬──────┘                          │
│         │                                             │ Yes                              │
│         ▼                                             ▼                                  │
│  ┌─────────────┐                               ┌─────────────┐                          │
│  │ Store in    │                               │ Allow read  │                          │
│  │ IndexedDB   │                               │ operations  │                          │
│  │ (encrypted) │                               │ + queue     │                          │
│  └─────────────┘                               │ writes      │                          │
│                                                └─────────────┘                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  // Student Management
  'students:read': ['director', 'secretary', 'accountant', 'teacher', 'academic_director'],
  'students:create': ['secretary'],
  'students:update': ['secretary'],
  'students:delete': ['director'],

  // Payment Management
  'payments:read': ['director', 'secretary', 'accountant'],
  'payments:create': ['accountant'],
  'payments:validate': ['accountant'],
  'payments:reconcile': ['accountant'],

  // Activity Management
  'activities:read': ['director', 'secretary', 'teacher', 'academic_director'],
  'activities:create': ['secretary'],
  'activities:assign_students': ['secretary'],
  
  // Attendance
  'attendance:read': ['director', 'secretary', 'teacher', 'academic_director'],
  'attendance:mark': ['teacher'],

  // Exceptions
  'exceptions:create': ['secretary', 'accountant'],
  'exceptions:approve': ['director'],

  // Reports
  'reports:view_financial': ['director', 'accountant'],
  'reports:view_academic': ['director', 'academic_director'],
  'reports:view_enrollment': ['director', 'secretary', 'academic_director'],

  // Period Management
  'periods:close': ['accountant'],
  'periods:reopen': ['director'],

  // Audit
  'audit:view': ['director'],
} as const;

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}
```

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Transport** | HTTPS only | Vercel automatic SSL |
| **Authentication** | JWT + Session | NextAuth.js with short-lived tokens |
| **Authorization** | RBAC | Middleware + tRPC context |
| **Data** | Input validation | Zod schemas on all inputs |
| **Storage** | Encrypted IndexedDB | Web Crypto API for sensitive fields |
| **Audit** | Complete trail | All mutations logged with user/timestamp |
| **Passwords** | Hashed | bcrypt with high rounds |
| **Sessions** | Secure cookies | httpOnly, secure, sameSite |

---

## 8. Deployment Strategy

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["cdg1"],  // Paris (closest to Guinea)
  "crons": [
    {
      "path": "/api/cron/period-reminder",
      "schedule": "0 8 28-31 * *"  // Last days of month, 8 AM
    },
    {
      "path": "/api/cron/sync-cleanup",
      "schedule": "0 2 * * *"  // Daily at 2 AM
    }
  ]
}
```

### Environment Variables

```bash
# .env.local (development)
# .env.production (Vercel)

# Database (Turso)
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# NextAuth
NEXTAUTH_URL="https://gspn.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# App Config
NEXT_PUBLIC_APP_NAME="GSPN"
NEXT_PUBLIC_SCHOOL_NAME="Groupe Scolaire Privé Ndiolou"
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. Cost Analysis

### Monthly Cost Breakdown

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby (Free) | $0 | 100GB bandwidth, 100 hrs compute |
| **Turso** | Free | $0 | 9GB storage, 500M reads, 25M writes |
| **Vercel Blob** | Free tier | $0 | 1GB storage |
| **Domain** | (optional) | ~$12/year | Custom domain |
| **Total** | | **$0-1/month** | Sufficient for 1 school |

### Scaling Path

| Stage | Users | Monthly Cost | Notes |
|-------|-------|--------------|-------|
| **MVP** | 1 school, ~50 users | $0 | Free tiers sufficient |
| **Growth** | 1 school, ~200 users | $0-20 | May need Vercel Pro |
| **Scale** | 5+ schools | $50-100 | Turso paid, Vercel Pro |

---

## 10. Project Structure

```
gspn-school-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (public)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── director/
│   │   ├── secretary/
│   │   ├── accountant/
│   │   ├── teacher/
│   │   ├── academic/
│   │   └── layout.tsx            # Dashboard shell
│   ├── api/
│   │   ├── trpc/[trpc]/
│   │   ├── auth/[...nextauth]/
│   │   ├── sync/
│   │   └── cron/
│   ├── layout.tsx
│   └── globals.css
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── form.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── dashboard/                # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── metric-card.tsx
│   ├── students/                 # Feature components
│   │   ├── student-form.tsx
│   │   ├── student-table.tsx
│   │   └── student-profile.tsx
│   ├── payments/
│   ├── activities/
│   ├── attendance/
│   └── reports/
│
├── lib/                          # Shared utilities
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Database schema
│   │   └── local.ts              # Dexie local DB
│   ├── auth/
│   │   ├── options.ts            # NextAuth config
│   │   └── permissions.ts        # RBAC
│   ├── sync/
│   │   ├── queue.ts              # Sync queue manager
│   │   ├── conflict.ts           # Conflict resolution
│   │   └── hooks.ts              # useSyncStatus, etc.
│   ├── utils/
│   │   ├── cn.ts                 # Class name utility
│   │   ├── date.ts               # Date formatting
│   │   └── currency.ts           # GNF formatting
│   └── trpc/
│       ├── client.ts             # tRPC client
│       └── server.ts             # tRPC server
│
├── server/                       # Server-side code
│   ├── routers/
│   │   ├── _app.ts               # Root router
│   │   ├── auth.ts
│   │   ├── students.ts
│   │   ├── payments.ts
│   │   ├── activities.ts
│   │   ├── attendance.ts
│   │   ├── reconciliation.ts
│   │   ├── reports.ts
│   │   ├── exceptions.ts
│   │   └── sync.ts
│   ├── trpc.ts                   # tRPC setup
│   └── context.ts                # Request context
│
├── hooks/                        # Custom React hooks
│   ├── use-students.ts
│   ├── use-payments.ts
│   ├── use-offline.ts
│   ├── use-sync.ts
│   └── use-permissions.ts
│
├── stores/                       # Zustand stores
│   ├── ui-store.ts
│   ├── auth-store.ts
│   └── sync-store.ts
│
├── types/                        # TypeScript types
│   ├── index.ts
│   ├── api.ts
│   └── database.ts
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/
│
├── drizzle/                      # Database migrations
│   ├── 0000_initial.sql
│   └── meta/
│
├── tests/                        # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                    # Local environment
├── .env.example                  # Environment template
├── drizzle.config.ts             # Drizzle config
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── pnpm-lock.yaml
```

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Sprints 1-2)

- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema & migrations
- [ ] Authentication (NextAuth)
- [ ] Basic RBAC
- [ ] PWA configuration
- [ ] Local database setup (Dexie)

### Phase 2: Core Features (Sprints 3-4)

- [ ] Student management (CRUD)
- [ ] Payment recording
- [ ] Activity management
- [ ] Basic sync mechanism

### Phase 3: Validation & Reconciliation (Sprint 5)

- [ ] Payment validation workflow
- [ ] Bank deposit recording
- [ ] Reconciliation matching
- [ ] Exception tickets

### Phase 4: Reporting & Polish (Sprint 6)

- [ ] Dashboard views per role
- [ ] Period close workflow
- [ ] Reports generation
- [ ] Offline UX refinements

---

{info:title=Document History}
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 19, 2025 | Technical Team | Initial architecture based on constraints |
{info}
