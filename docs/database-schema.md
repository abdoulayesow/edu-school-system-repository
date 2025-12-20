# Database Schema - GSPN School Management System

| **Document Info** | |
|-------------------|---|
| **Product** | GSPN School Management System |
| **Version** | 1.0 |
| **Date** | December 19, 2025 |
| **Database** | Turso (libSQL/SQLite) |

---

## Overview

This document contains the complete database schema for the GSPN School Management System. The schema is designed for:

- **SQLite compatibility** (Turso/libSQL)
- **Offline-first sync** (version tracking, soft deletes)
- **Full audit trail** (all changes logged)
- **Role-based access** (users with roles)

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SCHEMA OVERVIEW                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌─────────┐         ┌───────────┐         ┌────────────┐         ┌─────────────┐      │
│   │  users  │────────►│ students  │────────►│  payments  │────────►│ bank_deposits│     │
│   └─────────┘         └───────────┘         └────────────┘         └─────────────┘      │
│       │                    │                      │                       │              │
│       │                    │                      │                       │              │
│       │               ┌────▼────────┐             │                       │              │
│       │               │ activity_   │             └───────────┬───────────┘              │
│       │               │ enrollments │                         │                          │
│       │               └─────────────┘                         ▼                          │
│       │                    │                          ┌──────────────┐                   │
│       │                    │                          │reconciliations│                  │
│       │               ┌────▼────┐                     └──────────────┘                   │
│       │               │attendance│                                                       │
│       │               └─────────┘                                                        │
│       │                                                                                  │
│       │    ┌────────────┐    ┌──────────────────┐    ┌────────────┐    ┌────────────┐  │
│       └───►│ activities │    │ exception_tickets│    │  periods   │    │ audit_logs │  │
│            └────────────┘    └──────────────────┘    └────────────┘    └────────────┘  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### 1. Users

Stores all system users (staff members).

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('director', 'secretary', 'accountant', 'teacher', 'academic_director')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_active INTEGER DEFAULT 1, -- Boolean: 1 = active, 0 = inactive
    last_login_at TEXT,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `email` | TEXT | Unique login email |
| `password_hash` | TEXT | bcrypt hashed password |
| `role` | TEXT | User role (RBAC) |
| `first_name` | TEXT | First name |
| `last_name` | TEXT | Last name |
| `phone` | TEXT | Phone number |
| `is_active` | INTEGER | Account active status |
| `version` | INTEGER | Optimistic locking version |

---

### 2. Students

Stores enrolled student information.

```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE, -- Human-readable ID: GSPN-2025-001
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL, -- ISO date: YYYY-MM-DD
    gender TEXT CHECK (gender IN ('male', 'female')),
    -- Guardian information
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT,
    guardian_relationship TEXT DEFAULT 'parent',
    -- Academic information
    grade_level TEXT NOT NULL,
    enrollment_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'withdrawn')),
    -- Documents
    birth_certificate_url TEXT,
    photo_url TEXT,
    -- Additional info
    address TEXT,
    medical_notes TEXT,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_last_name ON students(last_name);
CREATE INDEX idx_students_grade_level ON students(grade_level);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_guardian_phone ON students(guardian_phone);
```

| Column | Type | Description |
|--------|------|-------------|
| `student_id` | TEXT | Human-readable ID (e.g., GSPN-2025-001) |
| `grade_level` | TEXT | Current grade (e.g., "6ème", "Terminale") |
| `status` | TEXT | Enrollment status |
| `guardian_*` | TEXT | Guardian contact information |

---

### 3. Activities

Stores curricular and extracurricular activities.

```sql
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('curricular', 'extracurricular')),
    teacher_id INTEGER REFERENCES users(id),
    fee_amount REAL DEFAULT 0, -- Fee in GNF
    max_capacity INTEGER,
    -- Schedule (JSON)
    schedule TEXT, -- {"days": ["monday", "wednesday"], "time": "14:00", "duration": 60}
    location TEXT,
    is_active INTEGER DEFAULT 1,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_teacher_id ON activities(teacher_id);
CREATE INDEX idx_activities_is_active ON activities(is_active);
```

| Column | Type | Description |
|--------|------|-------------|
| `type` | TEXT | curricular or extracurricular |
| `fee_amount` | REAL | Activity fee in GNF (0 for included) |
| `schedule` | TEXT | JSON schedule object |
| `max_capacity` | INTEGER | Maximum students (null = unlimited) |

---

### 4. Activity Enrollments

Links students to activities.

```sql
CREATE TABLE activity_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    activity_id INTEGER NOT NULL REFERENCES activities(id),
    enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
    enrolled_by INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    cancelled_at TEXT,
    cancellation_reason TEXT,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    
    UNIQUE(student_id, activity_id)
);

CREATE INDEX idx_activity_enrollments_student_id ON activity_enrollments(student_id);
CREATE INDEX idx_activity_enrollments_activity_id ON activity_enrollments(activity_id);
CREATE INDEX idx_activity_enrollments_status ON activity_enrollments(status);
```

---

### 5. Attendance

Stores attendance records for activities.

```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL REFERENCES activity_enrollments(id),
    date TEXT NOT NULL, -- ISO date: YYYY-MM-DD
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
    notes TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    
    UNIQUE(enrollment_id, date)
);

CREATE INDEX idx_attendance_enrollment_id ON attendance(enrollment_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
```

---

### 6. Periods

Financial periods for accounting close.

```sql
CREATE TABLE periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., "September-October 2025"
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closing', 'closed', 'reopened')),
    closed_by INTEGER REFERENCES users(id),
    closed_at TEXT,
    reopened_by INTEGER REFERENCES users(id),
    reopened_at TEXT,
    reopen_reason TEXT,
    -- Summary (populated on close)
    total_enrollments INTEGER,
    total_payments REAL,
    total_deposits REAL,
    summary_json TEXT, -- Detailed JSON summary
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_periods_status ON periods(status);
CREATE INDEX idx_periods_dates ON periods(start_date, end_date);
```

---

### 7. Payments

All payment transactions.

```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- student_id is nullable to support non-student payments (donations, other income)
    -- Business rule: If student_id IS NULL, category must be 'other_income' and description is required
    -- This rule is enforced at the application layer via Zod validation
    student_id INTEGER REFERENCES students(id),
    period_id INTEGER REFERENCES periods(id),
    -- Payment details
    amount REAL NOT NULL, -- Amount in GNF
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'mobile_money', 'bank_transfer', 'check')),
    category TEXT NOT NULL CHECK (category IN ('enrollment', 'tuition', 'activity', 'other_income', 'other')),
    description TEXT,
    -- Mobile money / reference
    payment_reference TEXT, -- Transaction ID for mobile money
    mobile_money_provider TEXT CHECK (mobile_money_provider IN ('orange_money', 'mtn_momo', NULL)),
    mobile_money_phone TEXT,
    -- Documentation
    document_url TEXT, -- Receipt/screenshot URL
    document_reference TEXT, -- Manual reference number
    -- Status workflow
    status TEXT DEFAULT 'unvalidated' CHECK (status IN ('unvalidated', 'validated', 'reconciled', 'rejected')),
    -- Validation
    validated_by INTEGER REFERENCES users(id),
    validated_at TEXT,
    validation_notes TEXT,
    -- Recording
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    payment_date TEXT NOT NULL, -- Actual payment date
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_period_id ON payments(period_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_category ON payments(category);
```

| Column | Type | Description |
|--------|------|-------------|
| `amount` | REAL | Amount in GNF |
| `payment_type` | TEXT | cash, mobile_money, bank_transfer, check |
| `category` | TEXT | What the payment is for |
| `status` | TEXT | Workflow status |
| `document_url` | TEXT | Vercel Blob URL for receipt |

---

### 8. Bank Deposits

Bank deposit records for reconciliation.

```sql
CREATE TABLE bank_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_id INTEGER REFERENCES periods(id),
    -- Deposit details
    deposit_date TEXT NOT NULL,
    amount REAL NOT NULL,
    bank_name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    reference_number TEXT,
    -- Documentation
    document_url TEXT, -- Bank slip scan
    -- Status
    status TEXT DEFAULT 'recorded' CHECK (status IN ('recorded', 'validated', 'reconciled')),
    -- Validation
    validated_by INTEGER REFERENCES users(id),
    validated_at TEXT,
    -- Recording
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_bank_deposits_period_id ON bank_deposits(period_id);
CREATE INDEX idx_bank_deposits_deposit_date ON bank_deposits(deposit_date);
CREATE INDEX idx_bank_deposits_status ON bank_deposits(status);
```

---

### 9. Reconciliation Links

Flexible many-to-many links between payments and bank deposits.

This design supports real-world accounting scenarios:
- One deposit covering multiple payments
- One payment split across multiple deposits (partial reconciliation)
- Accurate tracking of which portion of each payment is reconciled

```sql
-- Renamed from 'reconciliations' to 'reconciliation_links' for clarity
-- This is a join table allowing flexible payment-to-deposit matching
CREATE TABLE reconciliation_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL REFERENCES payments(id),
    deposit_id INTEGER NOT NULL REFERENCES bank_deposits(id),
    -- The portion of the payment's amount covered by this link
    -- Allows partial reconciliation (e.g., payment of 100,000 GNF split across two deposits)
    matched_amount REAL NOT NULL,
    matched_by INTEGER NOT NULL REFERENCES users(id),
    matched_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    
    -- A specific payment/deposit combo should be unique
    -- But a payment CAN be linked to multiple deposits (and vice versa)
    UNIQUE(payment_id, deposit_id)
);

CREATE INDEX idx_reconciliation_links_payment_id ON reconciliation_links(payment_id);
CREATE INDEX idx_reconciliation_links_deposit_id ON reconciliation_links(deposit_id);

-- Helper view: Get reconciliation status for each payment
CREATE VIEW payment_reconciliation_status AS
SELECT 
    p.id as payment_id,
    p.amount as payment_amount,
    COALESCE(SUM(rl.matched_amount), 0) as reconciled_amount,
    p.amount - COALESCE(SUM(rl.matched_amount), 0) as unreconciled_amount,
    CASE 
        WHEN COALESCE(SUM(rl.matched_amount), 0) = 0 THEN 'unreconciled'
        WHEN COALESCE(SUM(rl.matched_amount), 0) < p.amount THEN 'partial'
        ELSE 'fully_reconciled'
    END as reconciliation_status
FROM payments p
LEFT JOIN reconciliation_links rl ON p.id = rl.payment_id
GROUP BY p.id;
```

---

### 10. Exception Tickets

Issue tracking and approval workflow.

**Polymorphic Association Note:** The `related_table` and `related_id` fields create a polymorphic 
association (one ticket can relate to any table). SQLite/SQL cannot enforce foreign keys on 
polymorphic relationships. **Integrity is enforced at the application layer:**

1. **Zod validation** ensures `related_table` is one of: `payments`, `students`, `bank_deposits`, 
   `activity_enrollments`, `reconciliation_links`
2. **Centralized helper function** `createExceptionTicket()` validates the record exists before creating
3. **Integration tests** verify invalid table names and non-existent record IDs are rejected

```sql
CREATE TABLE exception_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT NOT NULL UNIQUE, -- EXC-2025-001
    -- Ticket details
    type TEXT NOT NULL CHECK (type IN ('payment_discrepancy', 'enrollment_issue', 'refund_request', 'reconciliation_mismatch', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    -- Related records (polymorphic association - enforced at application layer)
    -- Valid tables: payments, students, bank_deposits, activity_enrollments, reconciliation_links
    related_table TEXT,
    related_id INTEGER,
    -- Workflow
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending_approval', 'approved', 'rejected', 'resolved', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    -- Assignment
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    -- Resolution
    resolution TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('approved', 'rejected', 'corrected', 'cancelled', NULL)),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TEXT,
    -- Attachments
    attachments_json TEXT, -- JSON array of attachment URLs
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_exception_tickets_ticket_number ON exception_tickets(ticket_number);
CREATE INDEX idx_exception_tickets_status ON exception_tickets(status);
CREATE INDEX idx_exception_tickets_type ON exception_tickets(type);
CREATE INDEX idx_exception_tickets_assigned_to ON exception_tickets(assigned_to);
CREATE INDEX idx_exception_tickets_created_by ON exception_tickets(created_by);
```

---

### 11. Audit Logs

Complete audit trail for all changes.

**Important Design Note:** The `user_email` and `user_role` fields are intentionally denormalized. 
This is a feature, not a bug. The audit log must be an **immutable record** of what happened 
at that exact point in time. If a user's role changes later (e.g., promoted from secretary to 
academic director), we need to know what role they had when they performed the action.
Changing these values retroactively would compromise audit integrity.

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- What changed
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
    -- Change details
    old_values TEXT, -- JSON of old values
    new_values TEXT, -- JSON of new values
    changed_fields TEXT, -- JSON array of field names that changed
    -- Who and when (INTENTIONALLY DENORMALIZED for historical accuracy)
    user_id INTEGER REFERENCES users(id),
    user_email TEXT, -- Denormalized: captures email AT THE TIME of action (immutable)
    user_role TEXT,  -- Denormalized: captures role AT THE TIME of action (immutable)
    ip_address TEXT,
    user_agent TEXT,
    -- Context
    reason TEXT, -- Optional reason for change
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

### 12. Sync Metadata

Tracks sync state for offline support.

```sql
CREATE TABLE sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    device_id TEXT NOT NULL,
    last_sync_at TEXT,
    last_pull_at TEXT,
    last_push_at TEXT,
    sync_version INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, device_id)
);

CREATE TABLE sync_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    local_version TEXT NOT NULL, -- JSON
    server_version TEXT NOT NULL, -- JSON
    resolution TEXT CHECK (resolution IN ('pending', 'local_wins', 'server_wins', 'merged', 'manual')),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 13. Documents

File attachments metadata.

```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Reference
    related_table TEXT NOT NULL,
    related_id INTEGER NOT NULL,
    -- Document info
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- receipt, birth_certificate, bank_slip, etc.
    mime_type TEXT,
    size_bytes INTEGER,
    -- Storage
    url TEXT NOT NULL, -- Vercel Blob URL
    blob_pathname TEXT, -- Blob storage path
    -- Upload info
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    -- Sync metadata
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE INDEX idx_documents_related ON documents(related_table, related_id);
CREATE INDEX idx_documents_type ON documents(type);
```

---

## Drizzle ORM Schema

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { 
    enum: ['director', 'secretary', 'accountant', 'teacher', 'academic_director'] 
  }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastLoginAt: text('last_login_at'),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
}, (table) => ({
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role),
}));

// ============================================
// STUDENTS
// ============================================
export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: text('student_id').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }),
  guardianName: text('guardian_name').notNull(),
  guardianPhone: text('guardian_phone').notNull(),
  guardianEmail: text('guardian_email'),
  guardianRelationship: text('guardian_relationship').default('parent'),
  gradeLevel: text('grade_level').notNull(),
  enrollmentDate: text('enrollment_date').notNull(),
  status: text('status', { 
    enum: ['active', 'inactive', 'pending', 'withdrawn'] 
  }).default('pending'),
  birthCertificateUrl: text('birth_certificate_url'),
  photoUrl: text('photo_url'),
  address: text('address'),
  medicalNotes: text('medical_notes'),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
});

// ============================================
// ACTIVITIES
// ============================================
export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['curricular', 'extracurricular'] }).notNull(),
  teacherId: integer('teacher_id').references(() => users.id),
  feeAmount: real('fee_amount').default(0),
  maxCapacity: integer('max_capacity'),
  schedule: text('schedule'), // JSON
  location: text('location'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
});

// ============================================
// PAYMENTS
// ============================================
// Note: studentId is nullable to support non-student payments (donations, other income)
// Business rule enforced via Zod: if studentId is null, category must be 'other_income' and description required
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => students.id), // Nullable for non-student payments
  periodId: integer('period_id').references(() => periods.id),
  amount: real('amount').notNull(),
  paymentType: text('payment_type', { 
    enum: ['cash', 'mobile_money', 'bank_transfer', 'check'] 
  }).notNull(),
  category: text('category', { 
    enum: ['enrollment', 'tuition', 'activity', 'other_income', 'other'] 
  }).notNull(),
  description: text('description'),
  paymentReference: text('payment_reference'),
  mobileMoneyProvider: text('mobile_money_provider', { 
    enum: ['orange_money', 'mtn_momo'] 
  }),
  mobileMoneyPhone: text('mobile_money_phone'),
  documentUrl: text('document_url'),
  documentReference: text('document_reference'),
  status: text('status', { 
    enum: ['unvalidated', 'validated', 'reconciled', 'rejected'] 
  }).default('unvalidated'),
  validatedBy: integer('validated_by').references(() => users.id),
  validatedAt: text('validated_at'),
  validationNotes: text('validation_notes'),
  recordedBy: integer('recorded_by').notNull().references(() => users.id),
  paymentDate: text('payment_date').notNull(),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
});

// ============================================
// PERIODS
// ============================================
export const periods = sqliteTable('periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status', { 
    enum: ['open', 'closing', 'closed', 'reopened'] 
  }).default('open'),
  closedBy: integer('closed_by').references(() => users.id),
  closedAt: text('closed_at'),
  reopenedBy: integer('reopened_by').references(() => users.id),
  reopenedAt: text('reopened_at'),
  reopenReason: text('reopen_reason'),
  totalEnrollments: integer('total_enrollments'),
  totalPayments: real('total_payments'),
  totalDeposits: real('total_deposits'),
  summaryJson: text('summary_json'),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ============================================
// EXCEPTION TICKETS
// ============================================
export const exceptionTickets = sqliteTable('exception_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketNumber: text('ticket_number').notNull().unique(),
  type: text('type', { 
    enum: ['payment_discrepancy', 'enrollment_issue', 'refund_request', 'reconciliation_mismatch', 'other'] 
  }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  relatedTable: text('related_table'),
  relatedId: integer('related_id'),
  status: text('status', { 
    enum: ['open', 'pending_approval', 'approved', 'rejected', 'resolved', 'cancelled'] 
  }).default('open'),
  priority: text('priority', { 
    enum: ['low', 'normal', 'high', 'urgent'] 
  }).default('normal'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  resolution: text('resolution'),
  resolutionType: text('resolution_type', { 
    enum: ['approved', 'rejected', 'corrected', 'cancelled'] 
  }),
  resolvedBy: integer('resolved_by').references(() => users.id),
  resolvedAt: text('resolved_at'),
  attachmentsJson: text('attachments_json'),
  version: integer('version').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
});

// ============================================
// AUDIT LOGS
// ============================================
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  recordId: integer('record_id').notNull(),
  action: text('action', { enum: ['create', 'update', 'delete', 'restore'] }).notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  changedFields: text('changed_fields'),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email'),
  userRole: text('user_role'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  reason: text('reason'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ============================================
// RELATIONS
// ============================================
export const studentsRelations = relations(students, ({ many }) => ({
  payments: many(payments),
  activityEnrollments: many(activityEnrollments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  period: one(periods, {
    fields: [payments.periodId],
    references: [periods.id],
  }),
  recordedByUser: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
  }),
  validatedByUser: one(users, {
    fields: [payments.validatedBy],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  teacher: one(users, {
    fields: [activities.teacherId],
    references: [users.id],
  }),
  enrollments: many(activityEnrollments),
}));
```

---

## Application-Layer Validation (Zod Schemas)

Business rules that cannot be enforced at the database level are validated using Zod in tRPC routers.

### Payment Validation (Nullable Student ID)

```typescript
// server/routers/payments.ts
import { z } from 'zod';

// Payment input schema with business rule:
// If no studentId, category must be 'other_income' and description is required
export const paymentInputSchema = z.object({
  amount: z.number().positive(),
  paymentType: z.enum(['cash', 'mobile_money', 'bank_transfer', 'check']),
  category: z.enum(['enrollment', 'tuition', 'activity', 'other_income', 'other']),
  description: z.string().optional(),
  studentId: z.number().optional(),
  paymentDate: z.string(),
  documentReference: z.string().optional(),
}).refine(data => {
  // Business rule: non-student payments require description and must be 'other_income'
  if (!data.studentId) {
    return data.category === 'other_income' && !!data.description;
  }
  return true;
}, {
  message: "Payments not linked to a student must have category 'other_income' and a description.",
  path: ['studentId'],
});
```

### Exception Ticket Validation (Polymorphic Association)

```typescript
// server/routers/exceptions.ts
import { z } from 'zod';

// Valid tables for polymorphic association
const VALID_RELATED_TABLES = [
  'payments',
  'students', 
  'bank_deposits',
  'activity_enrollments',
  'reconciliation_links',
] as const;

export const exceptionTicketInputSchema = z.object({
  type: z.enum(['payment_discrepancy', 'enrollment_issue', 'refund_request', 'reconciliation_mismatch', 'other']),
  title: z.string().min(1),
  description: z.string().min(1),
  relatedTable: z.enum(VALID_RELATED_TABLES).optional(),
  relatedId: z.number().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
}).refine(data => {
  // If relatedTable is provided, relatedId must also be provided
  if (data.relatedTable && !data.relatedId) return false;
  if (data.relatedId && !data.relatedTable) return false;
  return true;
}, {
  message: "Both relatedTable and relatedId must be provided together.",
});

// lib/exceptions/create.ts - Centralized helper for creating tickets
export async function createExceptionTicket(
  user: User,
  input: z.infer<typeof exceptionTicketInputSchema>
) {
  // Validate related record exists (if provided)
  if (input.relatedTable && input.relatedId) {
    const recordExists = await validateRelatedRecordExists(
      input.relatedTable,
      input.relatedId
    );
    if (!recordExists) {
      throw new Error(`Related record not found: ${input.relatedTable}#${input.relatedId}`);
    }
  }
  
  // Generate ticket number
  const ticketNumber = await generateTicketNumber();
  
  // Insert with audit log
  return await db.insert(exceptionTickets).values({
    ...input,
    ticketNumber,
    createdBy: user.id,
    assignedTo: await getDirectorUserId(), // Auto-assign to director
  });
}

async function validateRelatedRecordExists(table: string, id: number): Promise<boolean> {
  const tableMap = {
    payments: payments,
    students: students,
    bank_deposits: bankDeposits,
    activity_enrollments: activityEnrollments,
    reconciliation_links: reconciliationLinks,
  };
  
  const tableRef = tableMap[table];
  if (!tableRef) return false;
  
  const record = await db.select().from(tableRef).where(eq(tableRef.id, id)).limit(1);
  return record.length > 0;
}
```

### Conflict Resolution Endpoint

```typescript
// server/routers/sync.ts
export const syncRouter = router({
  resolveConflict: protectedProcedure
    .input(z.object({
      tableName: z.string(),
      recordId: z.number(),
      resolution: z.enum(['local_wins', 'server_wins']),
      localVersion: z.any().optional(), // Required if local_wins
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.resolution === 'local_wins') {
        // Apply local version to server
        await applyLocalVersion(input.tableName, input.recordId, input.localVersion);
      }
      
      // Mark conflict as resolved
      await db.update(syncConflicts)
        .set({ 
          resolution: input.resolution,
          resolvedBy: ctx.user.id,
          resolvedAt: new Date().toISOString(),
        })
        .where(and(
          eq(syncConflicts.tableName, input.tableName),
          eq(syncConflicts.recordId, input.recordId)
        ));
        
      return { success: true };
    }),
});
```

---

## Migration Files

### Initial Migration

```sql
-- drizzle/0000_initial.sql
-- Generated migration for GSPN School Management System


-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('director', 'secretary', 'accountant', 'teacher', 'academic_director')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT,
    guardian_relationship TEXT DEFAULT 'parent',
    grade_level TEXT NOT NULL,
    enrollment_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'withdrawn')),
    birth_certificate_url TEXT,
    photo_url TEXT,
    address TEXT,
    medical_notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Periods table (before payments due to FK)
CREATE TABLE IF NOT EXISTS periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closing', 'closed', 'reopened')),
    closed_by INTEGER REFERENCES users(id),
    closed_at TEXT,
    reopened_by INTEGER REFERENCES users(id),
    reopened_at TEXT,
    reopen_reason TEXT,
    total_enrollments INTEGER,
    total_payments REAL,
    total_deposits REAL,
    summary_json TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (student_id is nullable for non-student income)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id), -- Nullable for donations/other income
    period_id INTEGER REFERENCES periods(id),
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'mobile_money', 'bank_transfer', 'check')),
    category TEXT NOT NULL CHECK (category IN ('enrollment', 'tuition', 'activity', 'other_income', 'other')),
    description TEXT,
    payment_reference TEXT,
    mobile_money_provider TEXT CHECK (mobile_money_provider IN ('orange_money', 'mtn_momo', NULL)),
    mobile_money_phone TEXT,
    document_url TEXT,
    document_reference TEXT,
    status TEXT DEFAULT 'unvalidated' CHECK (status IN ('unvalidated', 'validated', 'reconciled', 'rejected')),
    validated_by INTEGER REFERENCES users(id),
    validated_at TEXT,
    validation_notes TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    payment_date TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('curricular', 'extracurricular')),
    teacher_id INTEGER REFERENCES users(id),
    fee_amount REAL DEFAULT 0,
    max_capacity INTEGER,
    schedule TEXT,
    location TEXT,
    is_active INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Activity enrollments table
CREATE TABLE IF NOT EXISTS activity_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    activity_id INTEGER NOT NULL REFERENCES activities(id),
    enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
    enrolled_by INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    cancelled_at TEXT,
    cancellation_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    UNIQUE(student_id, activity_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL REFERENCES activity_enrollments(id),
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
    notes TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    UNIQUE(enrollment_id, date)
);

-- Bank deposits table
CREATE TABLE IF NOT EXISTS bank_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_id INTEGER REFERENCES periods(id),
    deposit_date TEXT NOT NULL,
    amount REAL NOT NULL,
    bank_name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    reference_number TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'recorded' CHECK (status IN ('recorded', 'validated', 'reconciled')),
    validated_by INTEGER REFERENCES users(id),
    validated_at TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Reconciliation links table (many-to-many for split payments and flexible matching)
CREATE TABLE IF NOT EXISTS reconciliation_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL REFERENCES payments(id),
    deposit_id INTEGER NOT NULL REFERENCES bank_deposits(id),
    matched_amount REAL NOT NULL,
    matched_by INTEGER NOT NULL REFERENCES users(id),
    matched_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Index for efficient lookup of payment reconciliations
CREATE INDEX IF NOT EXISTS idx_reconciliation_links_payment ON reconciliation_links(payment_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_links_deposit ON reconciliation_links(deposit_id);

-- View to easily check payment reconciliation status
CREATE VIEW IF NOT EXISTS payment_reconciliation_status AS
SELECT 
    p.id AS payment_id,
    p.amount AS payment_amount,
    COALESCE(SUM(rl.matched_amount), 0) AS total_reconciled,
    p.amount - COALESCE(SUM(rl.matched_amount), 0) AS remaining_to_reconcile,
    CASE 
        WHEN COALESCE(SUM(rl.matched_amount), 0) = 0 THEN 'unreconciled'
        WHEN COALESCE(SUM(rl.matched_amount), 0) < p.amount THEN 'partial'
        ELSE 'fully_reconciled'
    END AS reconciliation_status
FROM payments p
LEFT JOIN reconciliation_links rl ON p.id = rl.payment_id AND rl.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- Exception tickets table
CREATE TABLE IF NOT EXISTS exception_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('payment_discrepancy', 'enrollment_issue', 'refund_request', 'reconciliation_mismatch', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    related_table TEXT,
    related_id INTEGER,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending_approval', 'approved', 'rejected', 'resolved', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    resolution TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('approved', 'rejected', 'corrected', 'cancelled', NULL)),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TEXT,
    attachments_json TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
    old_values TEXT,
    new_values TEXT,
    changed_fields TEXT,
    user_id INTEGER REFERENCES users(id),
    user_email TEXT,
    user_role TEXT,
    ip_address TEXT,
    user_agent TEXT,
    reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    related_table TEXT NOT NULL,
    related_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER,
    url TEXT NOT NULL,
    blob_pathname TEXT,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

-- Sync metadata tables
CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    device_id TEXT NOT NULL,
    last_sync_at TEXT,
    last_pull_at TEXT,
    last_push_at TEXT,
    sync_version INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_last_name ON students(last_name);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Seed Data

```sql
-- drizzle/seed.sql
-- Initial seed data for development

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
VALUES ('admin@gspn.edu.gn', '$2b$10$...hashed...', 'director', 'Admin', 'GSPN', 1);

-- Create test users for each role
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES
('ousmane@gspn.edu.gn', '$2b$10$...', 'director', 'Ousmane', 'Sylla', 1),
('mariama@gspn.edu.gn', '$2b$10$...', 'secretary', 'Mariama', 'Camara', 1),
('ibrahima@gspn.edu.gn', '$2b$10$...', 'accountant', 'Ibrahima', 'Diallo', 1),
('amadou@gspn.edu.gn', '$2b$10$...', 'teacher', 'Amadou', 'Bah', 1),
('fatoumata@gspn.edu.gn', '$2b$10$...', 'academic_director', 'Fatoumata', 'Barry', 1);

-- Create initial period
INSERT INTO periods (name, start_date, end_date, status)
VALUES ('September-October 2025', '2025-09-01', '2025-10-31', 'open');

-- Create sample activities
INSERT INTO activities (name, description, type, teacher_id, fee_amount, is_active) VALUES
('English Club', 'Weekly English conversation practice', 'extracurricular', 4, 50000, 1),
('IT Study Group', 'Computer skills and programming basics', 'extracurricular', 4, 75000, 1),
('Mathematics - Grade 10', 'Regular math curriculum', 'curricular', NULL, 0, 1);
```

---

{info:title=Document History}
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 19, 2025 | Technical Team | Initial schema design |
{info}
