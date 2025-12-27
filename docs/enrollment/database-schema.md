# Enrollment Database Schema

Database models for the Student Enrollment System.

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  SchoolYear │────<│    Grade    │     │     Student     │
└─────────────┘     └─────────────┘     └─────────────────┘
       │                   │                    │
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
                   ┌─────────────────┐
                   │   Enrollment    │
                   └─────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   ┌───────────────┐ ┌───────────┐ ┌────────────────┐
   │PaymentSchedule│ │  Payment  │ │ EnrollmentNote │
   └───────────────┘ └───────────┘ └────────────────┘
```

---

## Enums

### SchoolLevel

```prisma
enum SchoolLevel {
  elementary    // Primaire (1ère - 6ème Année)
  college       // Collège (7ème - 10ème Année)
  high_school   // Lycée (11ème - 12ème Année, Terminale)
}
```

### EnrollmentStatus

```prisma
enum EnrollmentStatus {
  draft           // Work in progress, not submitted
  submitted       // Submitted, awaiting review
  review_required // Director review needed (fee adjustment)
  approved        // Approved by director or auto-approved
  rejected        // Rejected by director
  cancelled       // Cancelled by user
}
```

### PaymentMethod

```prisma
enum PaymentMethod {
  cash          // Cash payment with receipt
  orange_money  // Orange Money mobile payment
}
```

### PaymentStatus

```prisma
enum PaymentStatus {
  pending    // Awaiting confirmation
  confirmed  // Payment verified
  failed     // Payment failed/reversed
}
```

---

## Models

### SchoolYear

Academic year configuration with enrollment periods.

```prisma
model SchoolYear {
  id              String       @id @default(cuid())
  name            String       // "2025 - 2026"
  startDate       DateTime     // First day of school
  endDate         DateTime     // Last day of school
  enrollmentStart DateTime     // Enrollment opens
  enrollmentEnd   DateTime     // Enrollment closes
  isActive        Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  grades      Grade[]
  enrollments Enrollment[]
}
```

### Grade

Grade levels with tuition fees.

```prisma
model Grade {
  id           String      @id @default(cuid())
  name         String      // "7ème Année"
  level        SchoolLevel // elementary, college, high_school
  order        Int         // 1-13 for sorting
  tuitionFee   Int         // Annual fee in GNF
  schoolYearId String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  schoolYear  SchoolYear   @relation(fields: [schoolYearId], references: [id])
  enrollments Enrollment[]

  @@unique([schoolYearId, order])
}
```

**Grade Configuration (Guinea):**

| Order | Name | Level | Tuition (GNF) |
|-------|------|-------|---------------|
| 1 | 1ère Année | elementary | 800,000 |
| 2 | 2ème Année | elementary | 820,000 |
| 3 | 3ème Année | elementary | 840,000 |
| 4 | 4ème Année | elementary | 860,000 |
| 5 | 5ème Année | elementary | 880,000 |
| 6 | 6ème Année | elementary | 900,000 |
| 7 | 7ème Année | college | 1,000,000 |
| 8 | 8ème Année | college | 1,020,000 |
| 9 | 9ème Année | college | 1,050,000 |
| 10 | 10ème Année | college | 1,100,000 |
| 11 | 11ème Année | high_school | 1,200,000 |
| 12 | 12ème Année | high_school | 1,250,000 |
| 13 | Terminale | high_school | 1,300,000 |

### Enrollment

Main enrollment record.

```prisma
model Enrollment {
  id               String           @id @default(cuid())
  enrollmentNumber String?          @unique // ENR-2025-00001
  studentId        String?
  schoolYearId     String
  gradeId          String

  // Student Information
  firstName           String
  lastName            String
  dateOfBirth         DateTime?
  gender              String?      // "male" | "female"
  phone               String?
  email               String?
  photoUrl            String?
  birthCertificateUrl String?

  // Parent Information
  fatherName  String?
  fatherPhone String?
  fatherEmail String?
  motherName  String?
  motherPhone String?
  motherEmail String?
  address     String?

  // Financial
  originalTuitionFee Int          // From grade.tuitionFee
  adjustedTuitionFee Int?         // If adjusted (requires approval)
  adjustmentReason   String?

  // Status & Workflow
  status            EnrollmentStatus @default(draft)
  currentStep       Int              @default(1)
  isReturningStudent Boolean         @default(false)
  draftExpiresAt    DateTime?        // 10 days from creation
  submittedAt       DateTime?
  approvedAt        DateTime?
  approvedBy        String?
  autoApproveAt     DateTime?        // 3 days after submission

  // Audit
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  student          Student?          @relation(fields: [studentId], references: [id])
  schoolYear       SchoolYear        @relation(fields: [schoolYearId], references: [id])
  grade            Grade             @relation(fields: [gradeId], references: [id])
  creator          User              @relation("EnrollmentCreator", fields: [createdBy], references: [id])
  approver         User?             @relation("EnrollmentApprover", fields: [approvedBy], references: [id])
  paymentSchedules PaymentSchedule[]
  payments         Payment[]
  notes            EnrollmentNote[]
}
```

### PaymentSchedule

3 payment schedules per enrollment.

```prisma
model PaymentSchedule {
  id             String   @id @default(cuid())
  enrollmentId   String
  scheduleNumber Int      // 1, 2, or 3
  amount         Int      // GNF
  months         String[] // ["September", "October", "May"]
  dueDate        DateTime
  isPaid         Boolean  @default(false)
  paidAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  payments   Payment[]

  @@unique([enrollmentId, scheduleNumber])
}
```

**Schedule Configuration:**

| Schedule | Months | Due Date |
|----------|--------|----------|
| 1 | September, October, May | October 15 |
| 2 | November, December, January | December 15 |
| 3 | February, March, April | March 15 |

### Payment

Individual payment transactions.

```prisma
model Payment {
  id                String        @id @default(cuid())
  enrollmentId      String
  paymentScheduleId String?
  amount            Int           // GNF
  method            PaymentMethod
  status            PaymentStatus @default(confirmed)
  receiptNumber     String        @unique
  transactionRef    String?       // For Orange Money
  receiptImageUrl   String?
  recordedBy        String
  recordedAt        DateTime      @default(now())
  confirmedBy       String?
  confirmedAt       DateTime?
  notes             String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  enrollment      Enrollment       @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  paymentSchedule PaymentSchedule? @relation(fields: [paymentScheduleId], references: [id])
  recorder        User             @relation("PaymentRecorder", fields: [recordedBy], references: [id])
  confirmer       User?            @relation("PaymentConfirmer", fields: [confirmedBy], references: [id])
}
```

### EnrollmentNote

Notes attached to enrollments.

```prisma
model EnrollmentNote {
  id           String   @id @default(cuid())
  enrollmentId String
  title        String
  content      String
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  author     User       @relation(fields: [createdBy], references: [id])
}
```

---

## Student Model Updates

```prisma
model Student {
  id            String   @id @default(cuid())
  studentNumber String?  @unique  // STU-00001
  firstName     String
  lastName      String
  // ... other fields

  enrollments Enrollment[]
}
```

---

## User Model Updates

```prisma
model User {
  id   String @id @default(cuid())
  // ... other fields

  createdEnrollments  Enrollment[]     @relation("EnrollmentCreator")
  approvedEnrollments Enrollment[]     @relation("EnrollmentApprover")
  recordedPayments    Payment[]        @relation("PaymentRecorder")
  confirmedPayments   Payment[]        @relation("PaymentConfirmer")
  enrollmentNotes     EnrollmentNote[]
}
```

---

## Indexes

Recommended indexes for performance:

```prisma
@@index([schoolYearId])
@@index([gradeId])
@@index([status])
@@index([createdBy])
@@index([studentId])
@@index([enrollmentNumber])
```

---

## Seed Script

Location: `app/db/prisma/seed.ts`

Run with:
```bash
npm run db:seed
```

Creates:
- Active school year 2025-2026
- 13 grades with tuition fees
