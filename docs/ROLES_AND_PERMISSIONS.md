# Staff Roles and Permissions Guide

This document describes the role-based access control (RBAC) system and provides guidance for testing different user roles.

## Overview

The system uses a database-driven permission model with:
- **StaffRole**: The user's role in the organization (French terms in database)
- **PermissionResource**: What is being accessed (students, payments, etc.)
- **PermissionAction**: What operation is performed (view, create, update, delete, approve, export)
- **PermissionScope**: Whose data can be accessed (all, own_level, own_classes, own_children, none)

## Role Mapping

When inviting users via the UI, English role names are mapped to French database values:

| UI Role | Database StaffRole | Description |
|---------|-------------------|-------------|
| director | `proviseur` | Principal - Full oversight of secondary education |
| academic_director | `censeur` | Vice Principal - Academic programs and teacher management |
| secretary | `secretariat` | Secretary - Administrative support, enrollment processing |
| accountant | `comptable` | Accountant - Financial management, safe/bank oversight |
| teacher | `enseignant` | Teacher - Teaching, grading own classes |

## Permission Scopes Explained

| Scope | Description |
|-------|-------------|
| `all` | Access to all records across the system |
| `own_level` | Access limited to their school level (kindergarten, elementary, college, high_school) |
| `own_classes` | Access limited to classes they teach |
| `own_children` | Access limited to their own children's records (for parents) |
| `none` | No access |

---

## Role Details

### Comptable (Accountant) - 26 permissions

**Primary Responsibilities**: Financial management, payment recording, expense tracking, treasury operations.

**Full Access (scope: all)**:
| Resource | Actions |
|----------|---------|
| students | view |
| student_enrollment | view |
| fee_structure | view |
| fee_assignment | view |
| student_balance | view |
| payment_recording | view, create, update |
| receipts | view, create, export |
| safe_balance | view, update |
| safe_income | view, create |
| safe_expense | view, create, approve |
| bank_transfers | view, create |
| daily_verification | view, create |
| financial_reports | view, export |
| financial_analytics | view, export |

**What they CAN do**:
- View all students and enrollments
- Record and update payments
- Create and export receipts
- Manage safe/treasury balance
- Create and approve expenses
- Create bank transfers
- Perform daily cash verification
- View and export financial reports

**What they CANNOT do**:
- Create/update/delete students
- Manage enrollments (approve, create)
- View or manage grades, attendance
- Manage user accounts
- Access system settings

---

### Proviseur (Director) - 40 permissions

**Primary Responsibilities**: Full oversight of secondary education level.

**Access Scope**: `own_level` (secondary school level only)

| Resource | Actions |
|----------|---------|
| students | view, update, delete |
| student_enrollment | view, create, update, approve |
| student_transfer | view, approve |
| student_documents | view, update |
| classes | view, create, update |
| subjects | view, update |
| teachers_assignment | view, update |
| schedule | view, update |
| grades | view |
| report_cards | view, export |
| grade_approval | approve |
| attendance | view |
| attendance_justification | approve |
| student_balance | view |
| receipts | view |
| staff | view |
| staff_assignment | update |
| discipline_records | view, create |
| sanctions | view, approve |
| sms | create |
| announcements | create |
| academic_reports | view, export |
| attendance_reports | view, export |

---

### Censeur (Academic Director) - 26 permissions

**Primary Responsibilities**: Academic programs and teacher management for secondary level.

**Access Scope**: `own_level`

| Resource | Actions |
|----------|---------|
| students | view, update |
| student_enrollment | view |
| student_transfer | view |
| classes | view, create, update |
| subjects | view, update |
| teachers_assignment | view, update |
| schedule | view, create, update |
| grades | view, update |
| report_cards | view, export |
| grade_approval | approve |
| attendance | view |
| attendance_justification | view |
| staff | view |
| staff_assignment | update |
| academic_reports | view, export |
| attendance_reports | view |

---

### Secretariat (Secretary) - 13 permissions

**Primary Responsibilities**: Administrative support, enrollment processing.

**Access Scope**: `all`

| Resource | Actions |
|----------|---------|
| students | view, create, update |
| student_enrollment | view, create, update |
| student_documents | view, update |
| classes | view |
| schedule | view |
| student_balance | view |
| receipts | view |
| sms | create |

---

### Enseignant (Teacher) - 10 permissions

**Primary Responsibilities**: Teaching and grading for assigned classes.

**Access Scope**: `own_classes`

| Resource | Actions |
|----------|---------|
| students | view |
| classes | view |
| schedule | view |
| grades | view, create, update |
| report_cards | view |
| attendance | view, create, update |

---

### Admin Systeme (System Admin) - 89 permissions

**Primary Responsibilities**: Full system access for technical administration.

**Access Scope**: `all`

Has access to everything including:
- All student and enrollment management
- All academic operations
- All financial operations
- User account management
- System settings
- Audit logs

---

## Testing Guide

### How to Create Test Users

1. Log in as admin (admin_systeme role)
2. Go to `/admin/users`
3. Click "Invite User"
4. Enter email and select role
5. User receives invitation email
6. User sets password and gains access

### Testing Accountant Role

**Email to test**: `abdoulaye.sow.co@gmail.com`

**Expected Experience**:

1. **Dashboard**: Should see financial-focused widgets
2. **Navigation**: Should only see menu items for:
   - Dashboard
   - Students (view only)
   - Payments
   - Expenses
   - Treasury
   - Financial Reports

3. **Students Page**:
   - Can view student list
   - Cannot create, edit, or delete students
   - Action buttons should be hidden or disabled

4. **Payments Page**:
   - Full access to record, view, update payments
   - Can create receipts
   - Can export payment data

5. **Treasury Page**:
   - Can view and update safe balance
   - Can create bank transfers
   - Can perform daily verification

6. **Pages that should be restricted/hidden**:
   - Grades management
   - Attendance management
   - User management
   - System settings
   - Academic reports (if not financial)

### UI Behavior for Restricted Access

The system uses `<PermissionGuard>` component with these modes:

1. **Hidden (default)**: Element is completely removed from DOM
   ```tsx
   <PermissionGuard resource="students" action="create">
     <Button>Create Student</Button>
   </PermissionGuard>
   ```

2. **Disabled with tooltip**: Shows element but disabled with explanation
   ```tsx
   <PermissionGuard resource="students" action="create" showDisabled>
     <Button>Create Student</Button>
   </PermissionGuard>
   ```

3. **Fallback content**: Shows alternative content when denied
   ```tsx
   <PermissionGuard
     resource="students"
     action="create"
     fallback={<NoPermission resource="students" action="create" />}
   >
     <StudentForm />
   </PermissionGuard>
   ```

### Verifying Permission Enforcement

1. **Frontend Check**: Look for `<PermissionGuard>` usage in components
2. **API Check**: All API routes should use `requirePerm()` from `@/lib/authz`
3. **Browser DevTools**: Check Network tab for 403 responses when testing restricted actions

### Common Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Accountant tries to edit student | Button hidden or 403 error |
| Accountant views payments | Full access |
| Teacher tries to approve grades | 403 error |
| Secretary creates enrollment | Success |
| Director approves enrollment | Success (own level only) |

---

## Troubleshooting

### User gets 403 on all routes

**Cause**: `staffRole` is null in the database.

**Fix**: Update user's staffRole:
```sql
UPDATE "User" SET "staffRole" = 'comptable' WHERE email = 'user@example.com';
```

### Permissions not updating after role change

**Cause**: JWT session token is cached.

**Fix**: User must log out and log back in to refresh their session.

### Permission check shows wrong scope

**Cause**: User's `schoolLevel` not set for `own_level` scope permissions.

**Fix**: Set the user's schoolLevel in the database.

---

## API Reference

### Check Single Permission
```
POST /api/permissions/check
Body: { "resource": "students", "action": "view" }
Response: { "granted": true, "scope": "all" }
```

### Check Multiple Permissions
```
POST /api/permissions/check-batch
Body: { "checks": [{ "resource": "students", "action": "view" }, ...] }
Response: { "results": [{ "resource": "students", "action": "view", "granted": true }, ...] }
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/ui/lib/permissions.ts` | Core permission checking logic |
| `app/ui/lib/authz.ts` | API route permission middleware |
| `app/ui/components/permission-guard.tsx` | Frontend permission component |
| `app/db/prisma/schema.prisma` | StaffRole enum definition |
