# Implementation Plan: Grade Timetable & Pagination Improvements

## Overview

This plan covers two major feature sets:
1. **Grade Timetable Enhancement**: Add weekly schedule grid with time slots and room assignments
2. **Pagination Improvements**: Server-side search/filtering, page number input, and configurable items per page

---

## Part 1: Grade Timetable Feature

### Current State
- ✅ Timetable page exists at `/timetable` ([page.tsx](app/ui/app/timetable/page.tsx))
- ✅ Shows grades with subjects and teacher assignments
- ✅ Displays total hours per week per grade
- ❌ No weekly schedule grid (Mon-Fri with specific time slots)
- ❌ No time period/slot definitions (e.g., Period 1: 8:00-9:00)
- ❌ No room scheduling for individual class sessions

### Database Schema Changes

#### New Models Needed

**1. TimePeriod** - Define school periods (e.g., Period 1, Break, Lunch)
```prisma
model TimePeriod {
  id          String    @id @default(cuid())
  schoolYearId String
  name        String    // "Period 1", "Break", "Lunch"
  startTime   String    // "08:00"
  endTime     String    // "09:00"
  periodType  PeriodType @default(class) // class, break, lunch
  order       Int       // 1, 2, 3... for sorting

  schoolYear  SchoolYear @relation(...)
  scheduleSlots ScheduleSlot[]

  @@unique([schoolYearId, order])
  @@index([schoolYearId])
}

enum PeriodType {
  class
  break
  lunch
}
```

**2. ScheduleSlot** - Individual class sessions in the weekly timetable
```prisma
model ScheduleSlot {
  id              String    @id @default(cuid())
  gradeRoomId     String    // Which class section (e.g., 7A)
  timePeriodId    String    // Which time period
  dayOfWeek       Int       // 1=Monday, 5=Friday
  gradeSubjectId  String    // Which subject
  teacherProfileId String?  // Which teacher (can override ClassAssignment)
  roomLocation    String?   // Physical room (e.g., "Room 205", "Lab A")

  gradeRoom       GradeRoom @relation(...)
  timePeriod      TimePeriod @relation(...)
  gradeSubject    GradeSubject @relation(...)
  teacherProfile  TeacherProfile? @relation(...)

  @@unique([gradeRoomId, timePeriodId, dayOfWeek])
  @@index([gradeRoomId])
  @@index([teacherProfileId])
  @@index([gradeSubjectId])
}
```

### Implementation Steps

#### Step 1: Database Migration
- [ ] Add `TimePeriod` model to schema.prisma
- [ ] Add `ScheduleSlot` model to schema.prisma
- [ ] Add relations to existing models (GradeRoom, GradeSubject, etc.)
- [ ] Run `npx prisma migrate dev` from app/db/
- [ ] Run `npx prisma generate` from app/db/

#### Step 2: API Routes

**2.1 Time Periods API** - `/api/admin/time-periods/route.ts`
```typescript
// GET: List all periods for active school year
// POST: Create new time period
// PUT: Update period
// DELETE: Delete period
```

**2.2 Schedule Slots API** - `/api/timetable/slots/route.ts`
```typescript
// GET: Get schedule slots for a grade/room
// Query params: gradeRoomId, dayOfWeek
// POST: Create schedule slot
// PUT: Update slot
// DELETE: Delete slot
```

#### Step 3: UI Components

**3.1 Time Period Management** - `/app/admin/time-periods/page.tsx`
- List all time periods with CRUD operations
- Drag-and-drop reordering for period sequence
- Validation: no overlapping times

**3.2 Timetable Grid Component** - `/components/timetable-grid.tsx`
- Weekly grid view (rows = time periods, columns = days)
- Each cell shows: Subject name, Teacher, Room
- Click cell to assign/edit schedule slot
- Color coding by subject or teacher
- Empty cells show "+" to add new slot

**3.3 Enhanced Timetable Page** - Update `/app/timetable/page.tsx`
- Add tabs: "Overview" (current view) | "Weekly Schedule"
- Weekly Schedule tab:
  - Dropdown to select Grade Room (e.g., "7A", "7B")
  - Show TimetableGrid component
  - Export to PDF button (future enhancement)

#### Step 4: Translation Keys
Add to `en.ts` and `fr.ts`:
```typescript
timetable: {
  weeklySchedule: "Weekly Schedule",
  timePeriods: "Time Periods",
  addPeriod: "Add Period",
  periodName: "Period Name",
  startTime: "Start Time",
  endTime: "End Time",
  periodType: "Period Type",
  class: "Class",
  break: "Break",
  lunch: "Lunch",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  assignSlot: "Assign Class",
  removeSlot: "Remove Class",
  roomLocation: "Room Location",
}
```

### Design Considerations

**Approach 1: Grade-Level Timetable (Recommended)**
- All sections of a grade (7A, 7B, 7C) follow the same base schedule
- Subjects are taught at same time across sections (makes teacher scheduling easier)
- Room assignments differentiate sections
- **Pros**: Simpler to manage, easier teacher coordination
- **Cons**: Less flexibility per section

**Approach 2: Section-Specific Timetable**
- Each grade room (7A, 7B, 7C) has completely independent schedule
- Maximum flexibility
- **Pros**: Complete customization
- **Cons**: Complex teacher scheduling, potential conflicts

**Recommendation**: Start with Approach 1, allow customization per section where needed.

---

## Part 2: Pagination Improvements

### Current State Analysis

**Students Page** ([page.tsx](app/ui/app/students/page.tsx)):
- ✅ Fetches with offset/limit from API
- ✅ Shows DataPagination component
- ❌ Search is client-side only (line 72-85)
- ❌ Filters (grade, payment, attendance) are client-side
- ⚠️ API supports server-side search but UI doesn't use it

**API Route** ([route.ts](app/ui/app/api/students/route.ts)):
- ✅ Already supports `search` param (line 14, 40-46)
- ✅ Already supports `gradeId` param (line 48-64)
- ⚠️ Payment/attendance filters calculated after fetch (lines 226-233)
- ❌ Pagination breaks with payment/attendance filters

### Implementation Steps

#### Step 1: Server-Side Search Implementation

**1.1 Update Students Page**
- [ ] Remove client-side `filteredStudents` logic
- [ ] Pass `searchQuery` to `useStudents()` hook
- [ ] Pass `gradeFilter` to `useStudents()` hook
- [ ] Update to use raw `students` data (not filtered)

**1.2 Update useStudents Hook** ([use-api.ts](app/ui/lib/hooks/use-api.ts))
```typescript
export function useStudents(params?: {
  limit?: number
  offset?: number
  search?: string        // NEW
  gradeId?: string       // NEW
  paymentStatus?: string // NEW (won't work perfectly, see note)
  attendanceStatus?: string // NEW (won't work perfectly, see note)
}) {
  // Build query string with new params
}
```

**1.3 Update Other List Pages**
- Enrollments: Already has server-side search, just wire up UI
- Expenses: Check if API supports search, add if needed
- Activities: Check if API supports search, add if needed

#### Step 2: Page Number Input

**2.1 Enhance DataPagination Component**
```typescript
// Add new props:
interface DataPaginationProps {
  // ... existing props
  showPageInput?: boolean // Default true
  onPageChange?: (page: number) => void
}

// Add UI:
// [Prev] [1] ... [<input>] ... [totalPages] [Next]
// Or simpler: "Go to page: [input] [Go]"
```

**2.2 Update List Pages**
- Add `handlePageChange(page)` function
- Calculate new offset: `(page - 1) * ITEMS_PER_PAGE`
- Call `setOffset(newOffset)`

#### Step 3: Configurable Items Per Page

**3.1 Enhance DataPagination Component**
```typescript
// Add props:
interface DataPaginationProps {
  // ... existing props
  itemsPerPage: number
  onItemsPerPageChange?: (limit: number) => void
  availableLimits?: number[] // Default [25, 50, 100]
}

// Add UI:
// "Show: [25 | 50 | 100] per page"
```

**3.2 Update List Pages**
- Add state: `const [itemsPerPage, setItemsPerPage] = useState(50)`
- Pass to `useXxx({ limit: itemsPerPage, ... })`
- Reset offset when limit changes

#### Step 4: Translation Keys
```typescript
common: {
  pagination: {
    pageOf: "Page {current} of {total} ({count} results)",
    goToPage: "Go to page",     // NEW
    go: "Go",                    // NEW
    show: "Show",                // NEW
    perPage: "per page",         // NEW
    itemsPerPage: "Items per page", // NEW
  }
}
```

### Known Limitations

**Payment/Attendance Filtering**
- Current API calculates these statuses AFTER fetching from database
- Server-side filtering would require:
  - Pre-calculating and storing status in DB (adds complexity)
  - OR accepting that these filters work on current page only
- **Recommendation**: Document this limitation, consider future enhancement

### File Checklist

#### Timetable Feature
| File | Action | Purpose |
|------|--------|---------|
| `app/db/prisma/schema.prisma` | Edit | Add TimePeriod, ScheduleSlot models |
| `app/ui/app/api/admin/time-periods/route.ts` | Create | CRUD for time periods |
| `app/ui/app/api/timetable/slots/route.ts` | Create | CRUD for schedule slots |
| `app/ui/app/admin/time-periods/page.tsx` | Create | Time period management UI |
| `app/ui/components/timetable-grid.tsx` | Create | Weekly timetable grid component |
| `app/ui/app/timetable/page.tsx` | Edit | Add Weekly Schedule tab |
| `app/ui/lib/i18n/en.ts` | Edit | Add timetable translations |
| `app/ui/lib/i18n/fr.ts` | Edit | Add timetable translations |
| `app/ui/lib/hooks/use-api.ts` | Edit | Add hooks for time periods, slots |

#### Pagination Improvements
| File | Action | Purpose |
|------|--------|---------|
| `app/ui/components/data-pagination.tsx` | Edit | Add page input, items per page selector |
| `app/ui/app/students/page.tsx` | Edit | Use server-side search, wire new pagination |
| `app/ui/app/enrollments/page.tsx` | Edit | Wire server-side search if not done |
| `app/ui/app/expenses/page.tsx` | Edit | Add search support, wire pagination |
| `app/ui/app/activities/page.tsx` | Edit | Add search support, wire pagination |
| `app/ui/app/api/expenses/route.ts` | Edit | Add search param if missing |
| `app/ui/app/api/activities/route.ts` | Edit | Add search param if missing |
| `app/ui/lib/hooks/use-api.ts` | Edit | Update all list hooks with search params |
| `app/ui/lib/i18n/en.ts` | Edit | Add pagination translations |
| `app/ui/lib/i18n/fr.ts` | Edit | Add pagination translations |

---

## Implementation Order

### Phase 1: Pagination Improvements (Lower Risk, High Value)
1. Enhance DataPagination component
2. Add page number input
3. Add configurable items per page
4. Wire up server-side search for Students page
5. Wire up server-side search for other pages
6. Test and verify

**Estimated Complexity**: Medium
**Risk**: Low (builds on existing functionality)

### Phase 2: Timetable Feature (Higher Complexity)
1. Design and add database models
2. Run migrations
3. Create time period management API + UI
4. Create schedule slots API
5. Build timetable grid component
6. Integrate into timetable page
7. Test thoroughly

**Estimated Complexity**: High
**Risk**: Medium (new database schema, complex UI)

---

## Testing Strategy

### Pagination
- [ ] Search works across all pages, not just current page
- [ ] Page input accepts valid page numbers, rejects invalid
- [ ] Items per page updates results correctly
- [ ] Pagination resets when changing filters
- [ ] Total count updates correctly
- [ ] Works on all 4 list pages (Students, Enrollments, Expenses, Activities)

### Timetable
- [ ] Time periods can be created, edited, deleted
- [ ] Time periods cannot overlap
- [ ] Schedule slots assign correctly to grade rooms
- [ ] Grid shows correct schedule for selected grade room
- [ ] Teacher conflicts detected (same teacher, same period, different rooms)
- [ ] Room conflicts detected (same room, same period, different grades)
- [ ] Hours per week calculation matches assigned schedule

---

## Questions for Clarification

1. **Timetable Approach**: Confirm Approach 1 (grade-level) vs Approach 2 (section-specific)?
2. **School Days**: Do you need Saturday support or just Mon-Fri?
3. **Time Period Types**: Besides class/break/lunch, any other types needed?
4. **Conflict Handling**: Should the system prevent or just warn about teacher/room conflicts?
5. **Pagination**: Accept limitation on payment/attendance filters for now?

---

## Success Criteria

### Pagination
- ✅ Users can search across all data (not just current page)
- ✅ Users can jump to any page number
- ✅ Users can choose 25/50/100 items per page
- ✅ All list pages have consistent pagination UX

### Timetable
- ✅ Admin can define school time periods
- ✅ Admin can create weekly schedule for each grade room
- ✅ Teachers can view their teaching schedule
- ✅ System validates no overlaps/conflicts
- ✅ Timetable is visually clear and easy to read
