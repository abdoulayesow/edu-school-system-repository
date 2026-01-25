# Claude Code Context

This file provides context for Claude Code to understand the project structure and conventions.

## Project Structure

This is a monorepo with two main applications:

```
edu-school-system-repository/
├── app/
│   ├── ui/          # Next.js frontend application
│   └── db/          # Database layer (Prisma)
└── docs/
    └── summaries/   # Session summaries for continuity
```

## Recent Major Changes (2026-01-24)

### Navigation Reorganization
All routes now follow a hierarchical structure with consistent prefixes:
- `/students/*` - Student-related pages (enrollments, attendance, clubs, grades, timetable)
- `/accounting/*` - Financial pages (balance, payments, expenses)
- `/dashboard/*` - Analytics and reports
- `/administration/*` - System configuration

Old routes (e.g., `/enrollments`, `/expenses`, `/grades`) redirect to new locations for backward compatibility.

### New Admin Features
- **Role Management** (`/admin/users/roles`) - View and change user roles
- **Permission Overrides** (`/admin/users/[id]/permissions`) - Grant/deny individual permissions
- **Time Periods** - Added to administration navigation

## Command Locations

### UI Commands (run from `app/ui/`)
- `npm run dev` - Start development server (port 8000)
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - TypeScript type checking
- `npm test` - Run tests

### Database Commands (run from `app/db/`)
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run migrations in development
- `npx prisma migrate deploy` - Deploy migrations
- `npx prisma db push` - Push schema changes (no migration)
- `npx prisma studio` - Open Prisma Studio

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Components**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with design tokens in `lib/design-tokens.ts`
- **Icons**: Lucide React

## Key Paths

| Component | Path |
|-----------|------|
| Next.js pages/app | `app/ui/app/` |
| API routes | `app/ui/app/api/` |
| React components | `app/ui/components/` |
| UI primitives (shadcn) | `app/ui/components/ui/` |
| Prisma schema | `app/db/prisma/schema.prisma` |
| i18n translations | `app/ui/lib/i18n/` (en.ts, fr.ts) |
| Shared types | `app/ui/lib/` |
| Session summaries | `docs/summaries/` |
| Navigation config | `app/ui/lib/nav-config.ts` |
| RBAC rules | `app/ui/lib/rbac.ts` |

## Application Routes

### Students Section (`/students/*`)
- `/students/enrollments` - Student enrollments management
- `/students/attendance` - Attendance tracking
- `/students/clubs` - Club enrollments
- `/students/timetable` - Class schedules
- `/students/grades` - Grading with tab navigation:
  - Overview, Entry, Bulletin, Ranking, Remarks, Conduct

### Accounting Section (`/accounting/*`)
- `/accounting/balance` - Financial balance
- `/accounting/payments` - Payment tracking
- `/accounting/expenses` - Expense management

### Dashboard Section (`/dashboard/*`)
- `/dashboard/reports` - Analytics and reports

### Administration Section (`/admin/*`)
- `/admin/users` - User invitations
- `/admin/users/roles` - Role management
- `/admin/users/[id]/permissions` - Permission overrides
- `/admin/school-years` - School year configuration
- `/admin/trimesters` - Trimester setup
- `/admin/grades` - Grades and rooms
- `/admin/teachers` - Teacher assignments
- `/admin/clubs` - Club administration
- `/admin/time-periods` - Time period configuration

## Coding Conventions

### Internationalization (i18n)
- App is bilingual: English and French
- Translations in `app/ui/lib/i18n/en.ts` and `fr.ts`
- Access via `useI18n()` hook: `const { t, locale } = useI18n()`
- Always add new translation keys to BOTH files

### Currency Formatting
```tsx
new Intl.NumberFormat("fr-GN", {
  style: "currency",
  currency: "GNF",
  minimumFractionDigits: 0,
}).format(amount)
```

### Phone Numbers
- Default country code: Guinea (+224)
- Format: `+224 XXX XX XX XX`

### Enrollment Statuses
- `draft` - Not yet submitted, can be edited/deleted
- `submitted` - Awaiting review, can be edited
- `needs_review` - Flagged for review, can be edited
- `completed` - Approved, read-only
- `rejected` - Denied, read-only
- `cancelled` - Cancelled, read-only

### API Route Pattern
```tsx
// GET, PUT, DELETE in same route.ts file
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error
  // ...
}
```

### Grade Levels
- `kindergarten`: PS (order=-2), MS (order=-1), GS (order=0)
- `primary`: CP1, CP2, CE1, CE2, CM1, CM2
- `middle`: 6eme, 5eme, 4eme, 3eme
- `high`: 2nde, 1ere, Terminale

### Staff Roles (13 roles)
- `proprietaire` - Owner (full system access, 115+ permissions)
- `admin_systeme` - System Admin
- `proviseur` - Principal
- `censeur` - Vice Principal
- `surveillant_general` - General Supervisor
- `directeur` - Director
- `secretariat` - Secretary
- `comptable` - Accountant
- `agent_recouvrement` - Collection Agent
- `coordinateur` - Coordinator
- `enseignant` - Teacher
- `professeur_principal` - Head Teacher
- `gardien` - Security Guard

### Permission System
- **RolePermission** - Base permissions assigned to roles
- **PermissionOverride** - User-specific grants/denials
  - `granted: true` = GRANT (adds permission)
  - `granted: false` = DENY (removes permission)
- Effective permissions = `(Role Permissions - Denials) ∪ Grants`

## Session Summaries

For complex multi-session work, create summaries in `docs/summaries/` with format:
`YYYY-MM-DD_feature-name.md`

Include:
- Completed work
- Key files modified
- Design patterns used
- Remaining tasks
- Resume prompt for next session

## Important Notes

- The UI and DB are separate packages - run commands from the correct directory
- TypeScript config is at `app/ui/tsconfig.json`
- The Prisma client is imported in UI as `@/lib/prisma`
- Dev server runs on port 8000 (not 3000)
- Only GS (Grande Section) accepts new kindergarten enrollments
- Soft limit of 70 students per grade (shows warning)
- All old routes redirect to new hierarchical structure for backward compatibility
- Permission guards use `<PermissionGuard resource="..." action="...">` component
- i18n translations accessed via `const { t } = useI18n()` then `t.section.key`
- Tab navigation implemented in `/students/grades` layout
