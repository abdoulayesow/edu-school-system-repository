# Performance Optimization: Indexes, Pagination & Caching

**Date:** 2025-12-31
**Focus:** Database indexes, API pagination, HTTP caching, React Query setup

---

## Overview

This session implemented a comprehensive performance optimization strategy addressing database query efficiency, unbounded API responses, and client-side caching. The work builds on previous N+1 query fixes.

---

## Completed Work

### Phase 1: Database Composite Indexes

Added 4 high-priority composite indexes to `schema.prisma`:

| Model | Index | Use Case |
|-------|-------|----------|
| Enrollment | `@@index([status, approvedAt])` | Payment processing queries |
| Payment | `@@index([status, recordedAt])` | Revenue reporting |
| CashDeposit | `@@index([verifiedBy, depositDate])` | Deposit audit trail |
| BankDeposit | `@@index([depositDate, isReconciled])` | Reconciliation dashboard |

**Note:** Migration needs to be run: `cd app/db && npx prisma migrate dev --name add_performance_indexes`

### Phase 2: API Pagination

Added offset/limit pagination with total counts to:

| API | Before | After |
|-----|--------|-------|
| `/api/enrollments` | Hardcoded `take: 100` | `limit` + `offset` params, returns `{ enrollments, pagination }` |
| `/api/activities` | No limit | Both "activities" and "students" views paginated |

Response structure:
```typescript
{
  data: T[],
  pagination: { total, limit, offset, hasMore }
}
```

### Phase 3a: Cache Utilities

Created `app/ui/lib/cache.ts` with:
- `CacheProfiles`: STATIC_REFERENCE (1d), SEMI_STATIC (1h), STATISTICS (1m), DYNAMIC (30s), NO_CACHE
- `withCache()`: Helper to add Cache-Control headers to responses
- `memoryCache`: Simple in-memory TTL cache for expensive aggregations
- `TTL` constants for common durations

### Phase 3b: HTTP Cache Headers

Applied Cache-Control headers to:
- `/api/grades` → STATISTICS (1 min, stats change frequently)
- `/api/school-years/active` → SEMI_STATIC (1 hour)
- `/api/admin/subjects` → STATIC_REFERENCE (1 day, rarely changes)

### Phase 3c: React Query Integration

Created:
- `app/ui/components/query-provider.tsx` - QueryClient with optimized defaults
- `app/ui/lib/hooks/use-api.ts` - Query key factory + custom hooks
- Wrapped app in `<QueryProvider>` in `layout.tsx`

Available hooks:
- `useGrades(schoolYearId?)` - 5 min staleTime
- `useActiveSchoolYear()` - 1 hour staleTime
- `useSubjects()` - 24 hour staleTime
- `useInvalidateQueries()` - Cache invalidation helper

---

## Key Files Modified

| File | Changes |
|------|---------|
| `app/db/prisma/schema.prisma` | +4 composite indexes |
| `app/ui/app/api/enrollments/route.ts` | Pagination with limit/offset |
| `app/ui/app/api/activities/route.ts` | Pagination for both views |
| `app/ui/app/api/grades/route.ts` | Added STATISTICS cache header |
| `app/ui/app/api/school-years/active/route.ts` | Added SEMI_STATIC cache header |
| `app/ui/app/api/admin/subjects/route.ts` | Added STATIC_REFERENCE cache header |
| `app/ui/lib/cache.ts` | NEW: Cache utilities |
| `app/ui/components/query-provider.tsx` | NEW: React Query provider |
| `app/ui/lib/hooks/use-api.ts` | NEW: Query key factory + hooks |
| `app/ui/app/layout.tsx` | Wrapped app in QueryProvider |

---

## Design Patterns

### Pagination Pattern
```typescript
const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
const offset = parseInt(searchParams.get("offset") || "0")

const [data, total] = await Promise.all([
  prisma.model.findMany({ where, take: limit, skip: offset }),
  prisma.model.count({ where }),
])

return NextResponse.json({
  items: data,
  pagination: { total, limit, offset, hasMore: offset + data.length < total },
})
```

### Cache Header Pattern
```typescript
import { withCache } from "@/lib/cache"

const response = NextResponse.json(data)
return withCache(response, "SEMI_STATIC")
```

---

## Remaining Tasks

### Immediate (Next Session)
- [ ] Add pagination to `/api/students` (currently has limit but no proper pagination response)
- [ ] Add pagination to `/api/payments` (verify pagination metadata)
- [ ] Add pagination to `/api/expenses`
- [ ] Run Prisma migration for new indexes

### Future
- [ ] Migrate Dashboard page to use React Query hooks
- [ ] Migrate Students page to use React Query hooks
- [ ] Migrate Activities page to use React Query hooks
- [ ] Add cache invalidation on mutations

---

## Resume Prompt

```
Resume performance optimization session.

## Context
Previous session at docs/summaries/2025-12-31/2025-12-31_performance-optimization.md completed:
- Added 4 composite indexes to Prisma schema (migration pending)
- Added pagination to /api/enrollments and /api/activities
- Created cache utilities at lib/cache.ts
- Added Cache-Control headers to grades, school-years/active, admin/subjects APIs
- Set up React Query with provider and hooks

## FIXES NEEDED FIRST
TypeScript errors from `npx tsc --noEmit`:

1. **app/ui/app/api/activities/route.ts:116** - readonly array issue
   Change: `status: { in: ["active", "closed"] as const }`
   To: `status: { in: ["active", "closed"] }`
   (Remove `as const` to make it mutable)

2. **app/ui/components/query-provider.tsx:4** - missing devtools package
   Either: `npm install @tanstack/react-query-devtools --save-dev`
   Or: Remove the devtools import and usage (simpler)

## NEXT TASK
Add pagination to these APIs:
1. /api/students - has limit/offset but response format needs pagination metadata
2. /api/payments - verify pagination structure matches pattern
3. /api/expenses - add pagination

## Key Files to Review
- app/ui/lib/cache.ts (cache utilities)
- app/ui/components/query-provider.tsx (React Query setup)
- app/ui/lib/hooks/use-api.ts (query hooks)
- app/ui/app/api/enrollments/route.ts (reference pagination implementation)

## Patterns to Follow
- Use Promise.all for data + count queries
- Return { items, pagination: { total, limit, offset, hasMore } }
- Max limit capped at 100: Math.min(parseInt(limit || "50"), 100)

## Migration Needed
Run: cd app/db && npx prisma migrate dev --name add_performance_indexes
```

---

## Related Documents

- [API Performance & Features](2025-12-31_api-performance-and-features.md) - Previous N+1 fixes
- [Activity Management System](2025-12-31_activity-management-system.md)
