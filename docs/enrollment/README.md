# Student Enrollment System

The Student Enrollment System is a comprehensive 6-step wizard for enrolling students at GSPN (Groupe Scolaire Prive de Nongo) in Guinea.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [User Guide](#user-guide)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [PDF Generation](#pdf-generation)

---

## Overview

The enrollment system allows school staff to:
- Enroll new students or re-enroll returning students
- Track payment schedules across 3 installments
- Record payments (cash or Orange Money)
- Generate PDF enrollment documents
- Manage enrollment approvals (director workflow)

### Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Enrollment List | `/enrollments` | View all enrollments |
| New Enrollment | `/enrollments/new` | Start enrollment wizard |
| View Enrollment | `/enrollments/[id]` | View enrollment details |

---

## Features

### 6-Step Wizard

1. **Grade Selection** - Choose school year and grade level
2. **Student Information** - Enter student and parent details
3. **Payment Schedule** - View/adjust tuition breakdown
4. **Payment Transaction** - Record initial payment (optional)
5. **Review** - Verify all information
6. **Confirmation** - Success page with PDF download

### Payment System

- **3 Payment Schedules** per enrollment:
  - Schedule 1: September + October + May
  - Schedule 2: November + December + January
  - Schedule 3: February + March + April
- Each schedule = 1/3 of total tuition
- Supports cash and Orange Money payments

### Offline Support

- Drafts saved locally via IndexedDB (Dexie.js)
- Auto-sync when connection restored
- 10-day draft expiration

### Approval Workflow

- Standard enrollments: Auto-approved after 3 days
- Adjusted tuition: Requires director review (`needs_review` status)
- Status tracking: draft → submitted → completed/rejected
- **Required comments**: Completing, rejecting, and cancelling enrollments require a comment

See [Enrollment Statuses](./enrollment-statuses.md) for detailed status definitions.

---

## Architecture

### File Structure

```
app/ui/
├── app/
│   ├── enrollments/
│   │   ├── page.tsx                 # Enrollment list
│   │   └── new/
│   │       └── page.tsx             # Wizard entry point
│   └── api/
│       ├── school-years/
│       │   └── active/route.ts      # Get active school year
│       └── enrollments/
│           ├── route.ts             # List/Create enrollments
│           ├── search-student/route.ts
│           └── [id]/
│               ├── route.ts         # Get/Update/Delete
│               ├── submit/route.ts  # Submit for approval
│               ├── approve/route.ts # Approve/Reject
│               ├── payments/route.ts
│               ├── notes/route.ts
│               └── pdf/route.ts     # Generate PDF
├── components/
│   └── enrollment/
│       ├── wizard-context.tsx       # State management
│       ├── wizard-progress.tsx      # Step indicator
│       ├── wizard-navigation.tsx    # Nav buttons
│       ├── enrollment-wizard.tsx    # Main container
│       ├── index.ts
│       └── steps/
│           ├── step-grade-selection.tsx
│           ├── step-student-info.tsx
│           ├── step-payment-breakdown.tsx
│           ├── step-payment-transaction.tsx
│           ├── step-review.tsx
│           └── step-confirmation.tsx
└── lib/
    ├── enrollment/
    │   ├── types.ts                 # TypeScript types
    │   ├── validation.ts            # Zod schemas
    │   ├── calculations.ts          # Payment calculations
    │   └── index.ts
    └── pdf/
        ├── styles.ts                # PDF styling
        ├── letterhead.tsx           # School header
        ├── enrollment-document.tsx  # PDF template
        └── index.ts
```

### State Management

The wizard uses React Context with `useReducer`:

```typescript
interface WizardState {
  currentStep: number
  completedSteps: number[]
  enrollmentId?: string
  data: WizardData
  isDirty: boolean
  isSubmitting: boolean
}

type WizardAction =
  | { type: "GO_TO_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<WizardData> }
  | { type: "SET_ENROLLMENT_ID"; id: string }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "MARK_CLEAN" }
```

---

## User Guide

### Starting a New Enrollment

1. Navigate to **Enrollments** → **New Enrollment**
2. Select the grade level (Elementary, College, or High School)
3. Choose "New Student" or "Returning Student"
4. Fill in student and parent information
5. Review the payment schedule (adjust if needed)
6. Optionally record an initial payment
7. Review all information
8. Submit enrollment

### For Returning Students

1. Toggle "Returning Student" on Step 2
2. Search by student number, name, or date of birth
3. Select the student from results
4. Information auto-fills from previous enrollment
5. Update any changed information

### Recording Payments

Payments can be recorded:
- During enrollment (Step 4)
- After enrollment via the enrollment details page

Payment methods:
- **Cash**: Requires receipt number
- **Orange Money**: Requires transaction reference

### Downloading PDF

After submission:
1. On the confirmation page, click "Download PDF"
2. PDF includes all enrollment details
3. Print for physical records

---

## API Reference

See [api-reference.md](./api-reference.md) for detailed API documentation.

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/school-years/active` | GET | Get active school year with grades |
| `/api/enrollments` | GET | List enrollments (with filters) |
| `/api/enrollments` | POST | Create new enrollment |
| `/api/enrollments/[id]` | GET | Get enrollment details |
| `/api/enrollments/[id]` | PUT | Update enrollment |
| `/api/enrollments/[id]` | DELETE | Delete draft enrollment |
| `/api/enrollments/[id]/submit` | POST | Submit for approval |
| `/api/enrollments/[id]/approve` | POST | Complete enrollment (requires comment) |
| `/api/enrollments/[id]/approve` | DELETE | Reject enrollment (requires reason) |
| `/api/enrollments/[id]/cancel` | POST | Cancel enrollment (requires reason) |
| `/api/enrollments/[id]/payments` | GET/POST | Manage payments |
| `/api/enrollments/[id]/notes` | GET/POST | Manage notes |
| `/api/enrollments/[id]/pdf` | GET | Generate PDF |
| `/api/enrollments/search-student` | GET | Search returning students |
| `/api/enrollments/suggested-students` | GET | Get suggested students from previous grade |

---

## Database Schema

See [database-schema.md](./database-schema.md) for full schema documentation.

### Models Overview

```
SchoolYear (1) ─────┬───── (*) Grade
                    │
                    └───── (*) Enrollment ─────┬───── (*) PaymentSchedule
                                               ├───── (*) Payment
                                               └───── (*) EnrollmentNote
```

### Grade Levels (Guinea Format)

| Level | Grades | Tuition Range |
|-------|--------|---------------|
| Elementary (Primaire) | 1ère - 6ème Année | 800,000 - 900,000 GNF |
| College (Collège) | 7ème - 10ème Année | 1,000,000 - 1,100,000 GNF |
| High School (Lycée) | 11ème - 12ème Année, Terminale | 1,200,000 - 1,300,000 GNF |

---

## PDF Generation

The system generates professional PDF enrollment documents using `@react-pdf/renderer`.

### Features

- Bilingual (French/English)
- School letterhead
- Student and parent information
- Payment schedule table
- Payment history
- Summary with balance
- Signature areas

### API Usage

```bash
# French PDF (default)
GET /api/enrollments/abc123/pdf

# English PDF
GET /api/enrollments/abc123/pdf?lang=en
```

### Response

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Inscription_John_Doe_ENR-2025-00001.pdf"
```

---

## i18n Support

All UI text is translated:
- **French** (primary): `lib/i18n/fr.ts`
- **English** (secondary): `lib/i18n/en.ts`

Key translation sections:
- `enrollmentWizard.*` - Wizard UI strings
- `gradeNames.*` - Grade level names

---

## Related Documentation

- [API Reference](./api-reference.md) - Complete API documentation
- [Enrollment Statuses](./enrollment-statuses.md) - Status definitions and workflow
- [Database Schema](./database-schema.md) - Data model documentation
- [Payment Calculations](./payment-calculations.md) - Payment schedule logic
