# Permission System Simplification Plan

**Date:** 2026-02-07
**Goal:** Consolidate dual permission systems into a single, maintainable role-based model
**Estimated Effort:** 6-8 hours

## Problem Statement

Current system has:
- **700-line seed file** with repetitive permission assignments
- **Dual permission systems**: database-driven (permissions.ts) + hardcoded (rbac.ts)
- **Complexity** for a use case where permissions rarely change
- **Three clear role branches** that aren't explicitly modeled

## Solution Approach

**Simplified Role-Based Model** with three permission branches:

1. **Ownership Branch** - Full system access (proprietaire)
2. **Accounting Branch** - Financial operations (comptable, agent_recouvrement, secretariat)
3. **Academic Branch** - Educational operations (proviseur, directeur, censeur, enseignant, professeur_principal)

### Key Design Decisions

✅ **Code-based permission definitions** (not database) - Since changes are rare
✅ **Role profiles** instead of granular resource×action matrix
✅ **Database for overrides only** - Keep PermissionOverride table for exceptions
✅ **Single permission system** - Remove rbac.ts entirely
✅ **Backward compatible** - Same PermissionGuard API, different implementation

## Implementation Plan

### Phase 1: Analysis & Design (1-2 hours)

**Task 1.1: Audit Current Permission Usage**
- [ ] Search codebase for all `PermissionGuard` usages
- [ ] List all resource:action pairs actually used in UI
- [ ] Document current rbac.ts route rules and action permissions
- [ ] Identify which permissions are critical vs. unused

**Task 1.2: Design New Permission Model**
- [ ] Define three role profile types (Ownership, Accounting, Academic)
- [ ] Map 13 staff roles to profiles
- [ ] Define permission sets for each profile
- [ ] Create scope rules for each profile (all vs. own_level)

**Deliverable:** `lib/permissions-v2.ts` design spec (comments/types only)

---

### Phase 2: Build New Permission System (2-3 hours)

**Task 2.1: Create Simplified Permission Core**

File: `app/ui/lib/permissions-v2.ts`

```typescript
// Permission Profiles (replaces 700-line seed file)
enum PermissionProfile {
  OWNERSHIP = 'ownership',      // Supreme access
  ACCOUNTING = 'accounting',    // Financial operations
  ACADEMIC_ADMIN = 'academic_admin',  // School administration
  ACADEMIC_TEACHER = 'academic_teacher'  // Teaching staff
}

// Map roles to profiles
const ROLE_PROFILES: Record<StaffRole, PermissionProfile> = {
  proprietaire: PermissionProfile.OWNERSHIP,

  comptable: PermissionProfile.ACCOUNTING,
  agent_recouvrement: PermissionProfile.ACCOUNTING,
  secretariat: PermissionProfile.ACCOUNTING,
  coordinateur: PermissionProfile.ACCOUNTING,

  proviseur: PermissionProfile.ACADEMIC_ADMIN,
  directeur: PermissionProfile.ACADEMIC_ADMIN,
  censeur: PermissionProfile.ACADEMIC_ADMIN,
  surveillant_general: PermissionProfile.ACADEMIC_ADMIN,

  enseignant: PermissionProfile.ACADEMIC_TEACHER,
  professeur_principal: PermissionProfile.ACADEMIC_TEACHER,

  gardien: null  // No permissions
}

// Define what each profile can do
const PROFILE_PERMISSIONS = {
  [PermissionProfile.OWNERSHIP]: {
    scope: 'all',
    resources: '*',  // Everything
    actions: '*'
  },

  [PermissionProfile.ACCOUNTING]: {
    scope: 'all',
    can: [
      // Students (view only for context)
      'students:view',
      'student_enrollment:view',
      'student_enrollment:export',

      // Full financial access
      'fee_structure:*',
      'fee_assignment:*',
      'student_balance:*',
      'payment_recording:*',
      'receipts:*',
      'expenses:*',
      'bank_transactions:*',
      'safe_management:*',
      'mobile_money_transactions:*',

      // Reports
      'financial_reports:*',
      'financial_analytics:*'
    ]
  },

  [PermissionProfile.ACADEMIC_ADMIN]: {
    scope: 'own_level',  // Only their school level
    can: [
      // Student management
      'students:view',
      'students:create',
      'students:update',
      'student_enrollment:*',
      'student_transfer:*',
      'student_documents:*',

      // Academic operations
      'classes:*',
      'subjects:*',
      'academic_year:view',
      'teachers_assignment:*',
      'schedule:*',
      'club_enrollment:*',

      // Grades & attendance
      'grades:view',
      'grades:update',
      'report_cards:*',
      'grade_approval:approve',
      'attendance:*',

      // Reports
      'academic_reports:*',
      'attendance_reports:*'
    ]
  },

  [PermissionProfile.ACADEMIC_TEACHER]: {
    scope: 'own_classes',  // Only assigned classes
    can: [
      // View students in their classes
      'students:view',
      'student_enrollment:view',

      // Grade management for their classes
      'grades:view',
      'grades:update',
      'report_cards:view',

      // Attendance for their classes
      'attendance:view',
      'attendance:create',

      // Schedule
      'schedule:view'
    ]
  }
}
```

**Task 2.2: Implement Permission Checking Logic**

```typescript
// Simplified hasPermission function
export async function hasPermission(
  context: PermissionContext,
  resource: PermissionResource,
  action: PermissionAction
): Promise<PermissionCheckResult> {
  // 1. Check overrides first (from database)
  const override = await getPermissionOverride(context.userId, resource, action)
  if (override) {
    return {
      granted: override.granted,
      reason: override.reason,
      scope: override.scope
    }
  }

  // 2. Check role profile
  if (!context.staffRole) {
    return { granted: false, reason: 'No staff role' }
  }

  const profile = ROLE_PROFILES[context.staffRole]
  if (!profile) {
    return { granted: false, reason: 'Role has no permissions' }
  }

  const permissions = PROFILE_PERMISSIONS[profile]

  // 3. Check if action is allowed
  const permission = `${resource}:${action}`
  const allowed = permissions.can.includes(permission) ||
                  permissions.can.includes(`${resource}:*`) ||
                  permissions.resources === '*'

  if (!allowed) {
    return { granted: false, reason: 'Action not permitted' }
  }

  // 4. Check scope
  const scopeAllowed = checkScope(permissions.scope, context)

  return {
    granted: scopeAllowed,
    scope: permissions.scope
  }
}
```

**Task 2.3: Update API Endpoints**
- [ ] Update `/api/permissions/check/route.ts` to use permissions-v2
- [ ] Update `/api/permissions/check-batch/route.ts` to use permissions-v2
- [ ] Keep same response format (backward compatible)

---

### Phase 3: Remove Legacy System (1-2 hours)

**Task 3.1: Migrate rbac.ts Usage**

Current rbac.ts has two mechanisms:
1. **Route-level checks** via `isAllowedPathForRole()`
2. **Action-level checks** via `canPerformAction()`

Strategy: Replace with new permission system

- [ ] Find all usages of `isAllowedPathForRole`
- [ ] Find all usages of `canPerformAction`
- [ ] Replace with `PermissionGuard` or `hasPermission` checks
- [ ] Remove `lib/rbac.ts` file

**Example migration:**

```typescript
// BEFORE (rbac.ts)
if (!canPerformAction('students:edit', user.role)) {
  return <NoAccess />
}

// AFTER (permissions-v2)
<PermissionGuard resource="students" action="update">
  <EditButton />
</PermissionGuard>
```

**Task 3.2: Update Route Protection**

Current: Middleware uses `isAllowedPathForRole()`
New: Use permission-based route guards

- [ ] Audit middleware protection (if any)
- [ ] Update to use permission checks
- [ ] Document public vs. protected routes

**Task 3.3: Clean Up Seed File**

Current: 700-line seed-permissions.ts
New: Minimal seed for system roles only

- [ ] Replace seed-permissions.ts with minimal version
- [ ] Only seed PermissionOverride examples (if needed)
- [ ] Update seed script runner

---

### Phase 4: Update Database Schema (30 minutes)

**Task 4.1: Simplify Permission Tables**

Since permissions are now code-based, we can:

- [ ] Consider removing `RolePermission` table (permissions now in code)
- [ ] Keep `PermissionOverride` table (for exceptions)
- [ ] Keep `AuditLog` table (for tracking access)

**Alternative:** Keep `RolePermission` table but only for documentation/UI display

**Task 4.2: Migration**

```prisma
// Option A: Remove RolePermission table
// Create migration to drop RolePermission table

// Option B: Keep but mark as "documentation only"
// Add comment to schema.prisma
```

---

### Phase 5: Testing & Validation (1-2 hours)

**Task 5.1: Permission Matrix Test**

Create test file: `app/db/scripts/test-permissions.ts`

```typescript
// Test each role against expected permissions
const PERMISSION_TESTS = [
  {
    role: 'proprietaire',
    should: { grant: ['students:view', 'payments:create', ...] }
  },
  {
    role: 'comptable',
    should: {
      grant: ['payments:create', 'expenses:view'],
      deny: ['students:update', 'grades:update']
    }
  },
  // ... for all roles
]
```

**Task 5.2: UI Testing Checklist**

Test each protected page/component:
- [ ] `/students/enrollments` - Who can view?
- [ ] `/students/enrollments` - Who can create?
- [ ] `/students/grading/*` - Who can access?
- [ ] `/accounting/balance` - Who can view?
- [ ] `/accounting/expenses` - Who can create?
- [ ] `/admin/users` - Who can manage?

**Task 5.3: Scope Testing**

- [ ] Test `own_level` scope: Proviseur sees only high school students
- [ ] Test `own_classes` scope: Teacher sees only their assigned students
- [ ] Test `all` scope: Proprietaire sees everything

---

### Phase 6: Documentation & Cleanup (30 minutes)

**Task 6.1: Update CLAUDE.md**

- [ ] Document new permission system architecture
- [ ] Remove references to old rbac.ts
- [ ] Add permission profile documentation
- [ ] Update "Adding new permissions" guide

**Task 6.2: Code Cleanup**

- [ ] Delete `lib/rbac.ts`
- [ ] Delete old `lib/permissions.ts` (rename v2 to permissions.ts)
- [ ] Remove unused imports
- [ ] Update TypeScript types/exports

**Task 6.3: Create Permission Reference**

New file: `docs/permissions-reference.md`

```markdown
# Permission System Reference

## Role Profiles

### Ownership Profile
- **Roles:** Proprietaire
- **Scope:** All
- **Access:** Everything

### Accounting Profile
- **Roles:** Comptable, Agent Recouvrement, Secretariat, Coordinateur
- **Scope:** All
- **Access:** Financial operations + student viewing

### Academic Admin Profile
- **Roles:** Proviseur, Directeur, Censeur, Surveillant General
- **Scope:** Own level (kindergarten/elementary/college/high_school)
- **Access:** Student management, academic operations, grades

### Academic Teacher Profile
- **Roles:** Enseignant, Professeur Principal
- **Scope:** Own classes
- **Access:** View students, manage grades/attendance for assigned classes

## Common Permissions

| Resource | Action | Ownership | Accounting | Academic Admin | Teacher |
|----------|--------|-----------|------------|----------------|---------|
| students | view | ✅ | ✅ | ✅ | ✅ (own) |
| students | update | ✅ | ❌ | ✅ | ❌ |
| payments | create | ✅ | ✅ | ❌ | ❌ |
| grades | update | ✅ | ❌ | ✅ | ✅ (own) |
...
```

---

## File Changes Summary

### New Files
- `app/ui/lib/permissions-v2.ts` - New simplified permission system
- `docs/permissions-reference.md` - Permission documentation
- `app/db/scripts/test-permissions.ts` - Permission tests

### Modified Files
- `app/ui/app/api/permissions/check/route.ts` - Use new system
- `app/ui/app/api/permissions/check-batch/route.ts` - Use new system
- `app/ui/components/permission-guard.tsx` - Update if needed
- `app/db/prisma/seeds/seed-permissions.ts` - Simplify to ~50 lines
- `CLAUDE.md` - Update permission documentation

### Deleted Files
- `app/ui/lib/rbac.ts` - Legacy system removed
- `app/ui/lib/permissions.ts` - Replaced by permissions-v2.ts (then renamed)

### Database Changes
- *Optional:* Migration to drop `RolePermission` table
- Keep `PermissionOverride` table
- Keep `AuditLog` table

---

## Testing Strategy

### Unit Tests
- Test each profile's permissions
- Test scope filtering logic
- Test override behavior

### Integration Tests
- Test API endpoints with different roles
- Test PermissionGuard component
- Test scope isolation (level/classes)

### Manual Testing
- Login as each role type
- Navigate through UI
- Verify correct access/denial
- Test edge cases (no role, expired override)

---

## Rollback Plan

If issues arise:

1. **Keep old code temporarily**: Don't delete rbac.ts until confident
2. **Feature flag**: Add `useNewPermissions` flag to toggle systems
3. **Backup database**: Before removing RolePermission table
4. **Git branch**: Work on feature branch, merge only when validated

---

## Migration Commands

```bash
# Phase 1: Analysis
cd app/ui
grep -r "PermissionGuard" app/
grep -r "canPerformAction" app/
grep -r "isAllowedPathForRole" app/

# Phase 2: Build
# (Manual implementation)

# Phase 3: Test
cd app/db
npx tsx scripts/test-permissions.ts

# Phase 4: Deploy
cd app/db
npx prisma migrate dev --name simplify_permissions

# Phase 5: Cleanup
cd app/ui
rm lib/rbac.ts
mv lib/permissions-v2.ts lib/permissions.ts
```

---

## Success Criteria

✅ All existing functionality works with new system
✅ No rbac.ts dependencies remain
✅ Seed file reduced from 700 to ~50 lines
✅ Permission logic in one place (permissions-v2.ts)
✅ All manual tests pass
✅ Documentation updated
✅ Code is cleaner and more maintainable

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. Analysis & Design | Audit usage, design model | 1-2 hours |
| 2. Build New System | Implement permissions-v2.ts | 2-3 hours |
| 3. Remove Legacy | Migrate rbac.ts usage | 1-2 hours |
| 4. Schema Updates | Migration (if needed) | 30 min |
| 5. Testing | Test matrix + UI | 1-2 hours |
| 6. Documentation | Update docs, cleanup | 30 min |
| **Total** | | **6-8 hours** |

---

## Next Session Resume Prompt

```
Resume permission system simplification.

Context:
- Analyzed current dual permission system (700-line seed + rbac.ts)
- Decided to consolidate into code-based role profiles (Ownership/Accounting/Academic)
- Plan documented in docs/plans/2026-02-07_permission-system-simplification.md

Current State:
- Dual system still in place (permissions.ts + rbac.ts)
- 700-line seed-permissions.ts file
- PermissionGuard uses database lookups

Next Steps:
1. Start Phase 1: Audit all PermissionGuard and rbac.ts usage
2. Create permissions-v2.ts with role profiles
3. Progressively migrate and test

Files to read first:
- docs/plans/2026-02-07_permission-system-simplification.md (this plan)
- app/ui/lib/permissions.ts (current implementation)
- app/ui/lib/rbac.ts (legacy system)
- app/db/prisma/seeds/seed-permissions.ts (current seed)

Begin with Phase 1, Task 1.1: Audit current permission usage.
```
