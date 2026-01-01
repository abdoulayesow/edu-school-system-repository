# Administration Database Schema

This document describes the database models used by the Administration module.

## Core Models

### SchoolYear

Represents an academic year with its enrollment period.

```prisma
model SchoolYear {
  id              String           @id @default(cuid())
  name            String           // "2025 - 2026"
  startDate       DateTime         // September 1, 2025
  endDate         DateTime         // June 30, 2026
  enrollmentStart DateTime         // July 1, 2025
  enrollmentEnd   DateTime         // June 15, 2026
  isActive        Boolean          @default(false)
  status          SchoolYearStatus @default(new)
  syncVersion     Int              @default(0)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  grades                 Grade[]
  enrollments            Enrollment[]
  classAssignments       ClassAssignment[]
  studentRoomAssignments StudentRoomAssignment[]
}
```

**Status Values:**
- `new` - Newly created, not yet active
- `active` - Currently active school year
- `passed` - Past school year (read-only)

---

### Grade

Represents a grade/class level within a school year.

```prisma
model Grade {
  id            String      @id @default(cuid())
  name          String      // "7eme Annee"
  code          String?     // "7EME"
  level         SchoolLevel // kindergarten, elementary, college, high_school
  order         Int         // Sorting order (1-19)
  tuitionFee    Int         // Annual fee in GNF
  capacity      Int         @default(70) // Soft limit
  schoolYearId  String
  gradeLeaderId String?     // Teacher ID (responsable de classe)
  series        String?     // For high school: "SM", "SS", "SE"
  isEnabled     Boolean     @default(true)

  // Relations
  schoolYear    SchoolYear  @relation(...)
  gradeLeader   TeacherProfile? @relation(...)
  enrollments   Enrollment[]
  subjects      GradeSubject[]
  rooms         GradeRoom[]
}
```

**Level Values:**
- `kindergarten` - Maternelle (PS, MS, GS)
- `elementary` - Primaire (Grades 1-6)
- `college` - College (Grades 7-10)
- `high_school` - Lycee (Grades 11-12 + Terminal)

**Series Values (High School only):**
- `SM` - Sciences Mathematiques
- `SS` - Sciences Sociales
- `SE` - Sciences Experimentales

---

### GradeRoom

Represents a section/room within a grade.

```prisma
model GradeRoom {
  id          String    @id @default(cuid())
  gradeId     String
  name        String    // "A", "B", "C"
  displayName String    // "7A", "7B", "7C"
  capacity    Int       @default(35)
  isActive    Boolean   @default(true)
  syncVersion Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  grade       Grade     @relation(...)
  studentAssignments StudentRoomAssignment[]
}
```

**Constraints:**
- Unique combination of `gradeId` + `name`
- Capacity is a hard limit for student assignments

---

### StudentRoomAssignment

Links a student to a specific room for a school year.

```prisma
model StudentRoomAssignment {
  id               String   @id @default(cuid())
  studentProfileId String
  gradeRoomId      String
  schoolYearId     String
  assignedAt       DateTime @default(now())
  assignedBy       String   // User ID who made the assignment
  isActive         Boolean  @default(true)
  syncVersion      Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  studentProfile   StudentProfile @relation(...)
  gradeRoom        GradeRoom      @relation(...)
  schoolYear       SchoolYear     @relation(...)
  assigner         User           @relation(...)
}
```

**Constraints:**
- Unique combination of `studentProfileId` + `schoolYearId`
- A student can only be assigned to one room per school year

---

### Subject

Master list of subjects taught in the school.

```prisma
model Subject {
  id         String    @id @default(cuid())
  code       String    @unique  // "MATH", "FRANCAIS", "ANGLAIS"
  nameFr     String    // "Mathematiques"
  nameEn     String    // "Mathematics"
  isOptional Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  gradeSubjects GradeSubject[]
}
```

---

### GradeSubject

Links a subject to a grade with specific configuration.

```prisma
model GradeSubject {
  id           String    @id @default(cuid())
  gradeId      String
  subjectId    String
  coefficient  Int       @default(1)
  hoursPerWeek Int?
  series       String?   // For Terminal specializations
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  grade            Grade     @relation(...)
  subject          Subject   @relation(...)
  classAssignments ClassAssignment[]
}
```

**Constraints:**
- Unique combination of `gradeId` + `subjectId` + `series`

---

### ClassAssignment

Assigns a teacher to a subject-grade combination.

```prisma
model ClassAssignment {
  id               String    @id @default(cuid())
  gradeSubjectId   String
  teacherProfileId String
  schoolYearId     String
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  gradeSubject    GradeSubject    @relation(...)
  teacherProfile  TeacherProfile  @relation(...)
  schoolYear      SchoolYear      @relation(...)
}
```

**Constraints:**
- Unique combination of `gradeSubjectId` + `schoolYearId`
- One teacher per subject-grade per school year

---

### UserInvitation

Tracks user invitation lifecycle.

```prisma
model UserInvitation {
  id         String    @id @default(cuid())
  email      String
  name       String?   // Optional name for the invitee
  role       Role
  token      String    @unique
  expiresAt  DateTime
  invitedBy  String    // User ID
  acceptedAt DateTime? // Set when invitation is accepted
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  inviter    User      @relation(...)
}
```

**Token Generation:**
- 32-byte random hex string
- Expires in 7 days
- New token generated on resend

**Invitation Lifecycle:**
1. Created with `acceptedAt = null`
2. Token validated via `/api/auth/accept-invitation?token=...`
3. Account created, `acceptedAt` set to current timestamp

---

## Entity Relationship Diagram

```
SchoolYear
    ├── Grade[]
    │      ├── GradeRoom[]
    │      │      └── StudentRoomAssignment[]
    │      ├── GradeSubject[]
    │      │      └── ClassAssignment[]
    │      └── Enrollment[]
    ├── ClassAssignment[]
    └── StudentRoomAssignment[]

Subject
    └── GradeSubject[]
           └── ClassAssignment[]

TeacherProfile
    ├── ClassAssignment[]
    └── Grade[] (as grade leader)

User
    ├── StudentRoomAssignment[] (as assigner)
    └── UserInvitation[] (as inviter)
```

---

## Indexes

Key indexes for performance:

| Model | Index | Purpose |
|-------|-------|---------|
| SchoolYear | `isActive` | Quick lookup of active year |
| SchoolYear | `status` | Filter by status |
| Grade | `schoolYearId` | Fetch grades by year |
| Grade | `level` | Filter by school level |
| Grade | `isEnabled` | Filter enabled grades |
| GradeRoom | `gradeId` | Fetch rooms by grade |
| GradeRoom | `isActive` | Filter active rooms |
| StudentRoomAssignment | `gradeRoomId` | Count students per room |
| StudentRoomAssignment | `schoolYearId` | Filter by year |
| UserInvitation | `email` | Lookup by email |
| UserInvitation | `token` | Validate invitation token |

---

## Data Integrity

### Cascade Deletes
- Deleting a SchoolYear cascades to: Grades, Enrollments
- Deleting a Grade cascades to: Rooms, GradeSubjects
- Deleting a GradeRoom cascades to: StudentRoomAssignments
- Deleting a GradeSubject cascades to: ClassAssignments

### Soft Limits
- Grade capacity (70) - Shows warning but allows enrollment
- Room capacity - Hard limit, prevents over-assignment

### Business Rules
- Only one active school year at a time
- Cannot delete grades/rooms with existing data
- Room assignment requires completed enrollment status
- Invitation token expires after 7 days
