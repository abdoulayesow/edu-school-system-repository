# Feature Request: Students, Attendance & Accounting Module

## Executive Summary
Build three interconnected features for school operations:
- **Students**: Central hub for student information, payments, and attendance
- **Attendance**: Daily tracking system with analytics
- **Accounting**: Financial management for payments and expenses

## Business Context
- Target: Private schools in Guinea (GSPN model)
- Users: Admins, Accountants, Teachers, Secretaries
- Payment methods: Cash (bank deposit required) + Orange Money (mobile payment)
- School schedule: Mon-Fri (Elementary/College), Mon-Sat (High School)

---

## 1. Students Module

### 1.1 Student List Page
**Layout**: Master-detail view
- **Left sidebar**: Student list with filters (collapsible on mobile)
- **Main area**: Selected student details
- **Right panel**: Quick actions (optional, responsive)

**Filters**:
- Grade (dropdown)
- Name (search input, matches first/last name)
- Date of birth (date range picker)
- Status badges:
  - 🔴 Payment Late (>15 days overdue)
  - 🟡 Payment Due Soon (within 7 days)
  - 🟢 Payment Current
  - ⚠️ Frequently Absent (>10% absence rate)
  - ⭐ Excellent Attendance (>95%)

**Student Card in List**:
- Photo (if available)
- Full name
- Grade & class
- Status badges (max 2 visible, +N more)
- Quick view icon

### 1.2 Student Detail View
**Tabs**:
1. **Personal Information** (editable with permission)
2. **Payment Status** 
3. **Attendance Record**
4. **Grades** (future)
5. **Documents** (future)

#### 1.2.1 Payment Status Tab
**Progress Visualization**:
- Progress bar: `Paid / Total Owed` for current school year
- Color-coded status:
  - 🥇 **Complete** (100% paid, gold medal icon)
  - 🟢 **In Advance** (next month paid early)
  - 🟡 **On Time** (current month paid)
  - 🔴 **Late** (overdue payments)

**Payment History Table**:
- Date | Amount | Method | Status | Actions
- Show current school year by default
- "View Previous Years" toggle

**Actions**:
- Button: "Record Payment" → Opens payment form

#### 1.2.2 Attendance Tab
**Visualizations**:
- Attendance rate (circular progress): `X% present this year`
- Heatmap calendar (GitHub-style): Shows attendance patterns
- Monthly breakdown chart (bar chart)
- Recent absences list (last 10)

**Actions**:
- Button: "Mark Absent/Present for Today" (if not yet recorded)

### 1.3 List of Grades
**Purpose**: View grades with enrolled students, manage grade-specific information

**Grade Overview Card**:
- Grade name (e.g., "CP1", "7ème", "Terminale A")
- Student count
- Grade leader ("Responsable de classe")
- Quick stats: Average attendance rate, Payment status distribution

**Grade Detail View**:

**Tab 1: Students**
- List of all students in the grade
- Quick access to mark attendance for entire grade
- Filter students by status

**Tab 2: Subjects ("Matières")**
- List of subjects for this grade (from curriculum)
- Each subject shows:
  - Title
  - Description
  - Teacher assigned (first & last name)
  - Coefficient (for grading)
- Actions: Edit subject assignments, Change teacher

**Tab 3: Analytics**
- Student grade attendance ratio (pie/donut chart)
- Student grade payment status ratio (bar chart)
- Trend charts over time

**Grade Leader Management**:
- Editable field to assign/change grade leader
- Shows student photo, name, and contact info

---

## 2. Attendance Module

### 2.1 Daily Attendance Recording
**Actor**: Teacher/Secretary
**Time**: Every morning ~9:00 AM
**Goal**: Mark attendance for entire grade in <2 minutes

### Recommended Approach: "Quick Check-in" Interface

**Desktop/Tablet View**:
1. Select: Grade → Date (defaults to today)
2. Student grid layout (3-4 columns):
   - Photo | Name | Quick buttons: ✅ Present | ❌ Absent | ⏰ Late | 📝 Excused
   - Default state: All "Present" (tap to change)
3. Bulk actions: "Mark All Present" | "Save & Exit"

**Mobile View** (optimized for phone):
1. Swipe-based interface:
   - Swipe right = Present (green)
   - Swipe left = Absent (red)
   - Tap for options: Late/Excused
2. Progress indicator: "12/30 checked"
3. Auto-save after each swipe

**Smart Features**:
- Auto-mark frequent absentees with ⚠️ icon
- Voice input: "Mark Amadou Diallo as absent" (future)
- Offline support: Sync when online

### 2.2 Attendance Analytics Page
**Filters**: Grade, Date Range, Student
**Visualizations**:
- Grade attendance rate (line chart over time)
- Student attendance comparison (bar chart)
- Absence reasons breakdown (pie chart)
- Chronic absentee list (>10% absence rate)

**Export Options**:
- Download attendance report (PDF/Excel)
- Filter by date range

---

## 3. Accounting Module

### 3.1 Balance Dashboard
**Key Metrics** (cards):
1. **Total Revenue** (confirmed payments only)
   - Cash Available (deposited) | Cash Pending Deposit
   - Orange Money Received
2. **Total Expenses** (approved expenses)
3. **Net Balance** (Revenue - Expenses)
4. **Pending Actions** (requires review)

**Visualizations**:
- Revenue vs Expenses (monthly comparison chart)
- Payment methods breakdown (pie chart)
- Cash flow timeline (area chart)

### 3.2 Payment Management

#### Payment Status Flow:
```
CASH Payment:
Draft → Pending Deposit → Pending Review → Confirmed → Completed
         (user submits)   (cash deposited)  (reviewed)   (distributed)

ORANGE MONEY Payment:
Draft → Pending Review → Confirmed → Completed
       (user submits)   (24h + review) (distributed to months)

Rejection:
Any status → Rejected → Returns to Draft (with review notes)
```

#### Payment Form Fields:
**Required**:
- Student (autocomplete)
- Amount (number, min: 1000 GNF)
- Method (CASH | ORANGE_MONEY)
- Date (defaults to today)

**Conditional** (CASH only):
- Deposited at bank? (yes/no)
- Deposit date
- Bank reference number
- Deposited by (user selector, "Me" quick option)

**Conditional** (ORANGE MONEY only):
- Transaction ID
- Phone number

**Auto-calculated**:
- Distribution to months (show preview table)

#### Payment Actions:
1. **Create Payment** (all users with permission)
2. **Update Payment** (only if status = Draft or Rejected)
3. **Confirm Cash Deposit** (only if status = Pending Deposit)
   - Requires: date, bank reference, depositor
   - Moves to: Pending Review
4. **Review Payment** (only Accountant/Admin role)
   - Actions: Approve → Confirmed | Reject → Rejected (with notes)
5. **Auto-complete** (system, after 24h in Confirmed status)

### 3.3 Expense Management

#### Expense Status Flow:
```
Draft → Pending Review → Approved → Paid
       (user submits)   (accountant reviews) (payment completed)

Rejection:
Pending Review → Rejected → Returns to Draft (with notes)
```

#### Expense Form Fields:
- Amount, Date, Category (dropdown: Supplies, Salaries, Utilities, Maintenance, Other)
- Description (text area)
- Method (CASH preferred, ORANGE_MONEY optional)
- Receipt (file upload, optional)

#### Expense Categories (suggested):
- 💼 Salaries & Benefits
- 📚 School Supplies
- 💡 Utilities (electricity, water)
- 🔧 Maintenance & Repairs
- 🚌 Transportation
- 📢 Marketing
- 🏢 Rent
- 📝 Other (specify)

---

## 4. Database Requirements

### New Models Needed:

#### 1. Student (extend existing?)
```prisma
model Student {
  id              String      @id @default(cuid())
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  photo           String?
  gradeId         String
  grade           Grade       @relation(fields: [gradeId], references: [id])
  enrollmentId    String?
  enrollment      Enrollment? @relation(fields: [enrollmentId], references: [id])
  isGradeLeader   Boolean     @default(false)
  
  // Relations
  attendances     Attendance[]
  payments        Payment[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

#### 2. Grade (extend existing?)
```prisma
model Grade {
  id              String          @id @default(cuid())
  name            String          // e.g., "CP1", "7ème", "Terminale A"
  level           Int             // 1-13
  schoolYearId    String
  schoolYear      SchoolYear      @relation(fields: [schoolYearId], references: [id])
  gradeLeaderId   String?
  gradeLeader     Student?        @relation("GradeLeader", fields: [gradeLeaderId], references: [id])
  
  // Relations
  students        Student[]
  gradeSubjects   GradeSubject[]
  attendances     Attendance[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

#### 3. Subject ("Matière")
```prisma
model Subject {
  id              String          @id @default(cuid())
  code            String          @unique // e.g., "MATH", "FRANCAIS"
  nameFr          String
  nameEn          String
  description     String?
  
  // Relations
  gradeSubjects   GradeSubject[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

#### 4. GradeSubject (many-to-many mapping)
```prisma
model GradeSubject {
  id              String      @id @default(cuid())
  gradeId         String
  grade           Grade       @relation(fields: [gradeId], references: [id])
  subjectId       String
  subject         Subject     @relation(fields: [subjectId], references: [id])
  teacherId       String?
  teacher         User?       @relation(fields: [teacherId], references: [id])
  coefficient     Int         @default(1) // For grade weighting
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([gradeId, subjectId])
}
```

#### 5. Attendance
```prisma
model Attendance {
  id              String          @id @default(cuid())
  studentId       String
  student         Student         @relation(fields: [studentId], references: [id])
  gradeId         String
  grade           Grade           @relation(fields: [gradeId], references: [id])
  date            DateTime
  status          AttendanceStatus @default(PRESENT)
  notes           String?
  
  createdBy       String
  createdByUser   User            @relation(fields: [createdBy], references: [id])
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@unique([studentId, date])
  @@index([gradeId, date])
  @@index([studentId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}
```

#### 6. Payment (extend existing)
```prisma
model Payment {
  id                  String          @id @default(cuid())
  studentId           String
  student             Student         @relation(fields: [studentId], references: [id])
  enrollmentId        String?
  enrollment          Enrollment?     @relation(fields: [enrollmentId], references: [id])
  
  amount              Decimal         @db.Decimal(10, 2)
  method              PaymentMethod
  status              PaymentStatus   @default(DRAFT)
  date                DateTime
  
  // Cash-specific fields
  cashDepositDate     DateTime?
  bankReference       String?
  depositedBy         String?
  depositedByUser     User?           @relation("PaymentDepositor", fields: [depositedBy], references: [id])
  
  // Orange Money-specific fields
  transactionId       String?
  phoneNumber         String?
  
  // Review fields
  reviewedBy          String?
  reviewedByUser      User?           @relation("PaymentReviewer", fields: [reviewedBy], references: [id])
  reviewedAt          DateTime?
  reviewNotes         String?
  
  createdBy           String
  createdByUser       User            @relation("PaymentCreator", fields: [createdBy], references: [id])
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@index([studentId])
  @@index([status])
}

enum PaymentMethod {
  CASH
  ORANGE_MONEY
}

enum PaymentStatus {
  DRAFT
  PENDING_DEPOSIT
  PENDING_REVIEW
  CONFIRMED
  COMPLETED
  REJECTED
}
```

#### 7. Expense
```prisma
model Expense {
  id              String          @id @default(cuid())
  amount          Decimal         @db.Decimal(10, 2)
  date            DateTime
  category        ExpenseCategory
  description     String
  method          PaymentMethod   @default(CASH)
  receiptUrl      String?
  
  status          ExpenseStatus   @default(DRAFT)
  
  createdBy       String
  createdByUser   User            @relation("ExpenseCreator", fields: [createdBy], references: [id])
  approvedBy      String?
  approvedByUser  User?           @relation("ExpenseApprover", fields: [approvedBy], references: [id])
  approvedAt      DateTime?
  approvalNotes   String?
  
  schoolYearId    String
  schoolYear      SchoolYear      @relation(fields: [schoolYearId], references: [id])
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([status])
  @@index([schoolYearId])
}

enum ExpenseCategory {
  SALARIES
  SUPPLIES
  UTILITIES
  MAINTENANCE
  TRANSPORTATION
  MARKETING
  RENT
  OTHER
}

enum ExpenseStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  PAID
}
```

### Seed Data Requirements:
- Import all subjects from `docs/grade-class-data/guinea-curriculum-structure.md`
- Create 10-15 sample teachers (User with role="TEACHER")
- Assign teachers to subjects per grade
- Generate attendance records from Sept 15 to today:
  - 90% present, 10% absent (random distribution)
  - Respect school schedules (Mon-Fri for Elementary/College, Mon-Sat for High School)
- Designate 1 grade leader per grade (randomly selected student)
- Create sample payments with various statuses
- Create sample expenses with various statuses

---

## 5. Permissions Matrix

| Feature | Admin | Accountant | Secretary | Teacher | Parent |
|---------|-------|------------|-----------|---------|--------|
| View Students | ✅ | ✅ | ✅ | ✅ (own grade) | ✅ (own child) |
| Edit Student Info | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Payments | ✅ | ✅ | ✅ | ❌ | ✅ (own child) |
| Record Payment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Review Payment | ✅ | ✅ | ❌ | ❌ | ❌ |
| Confirm Cash Deposit | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ✅ | ✅ (own grade) | ❌ |
| View Attendance | ✅ | ✅ | ✅ | ✅ | ✅ (own child) |
| Edit Grade Info | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Teachers | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Expense | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Expense | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Balance | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 6. Translation Requirements

### French Capitalization Rules:
- ✅ Capitalize: First word only (except proper nouns)
- ✅ Example: "Responsable de classe", "Liste des élèves"
- ❌ Avoid: "Responsable De Classe", "Liste Des Élèves"

### Key Terms to Translate:
- Grade Leader: "Responsable de classe"
- Subject/Class: "Matière"
- Student: "Élève"
- Attendance: "Présence" or "Assiduité"
- Payment: "Paiement"
- Expense: "Dépense"
- Balance: "Solde" or "Bilan"
- Cash Deposit: "Dépôt en espèces"
- Orange Money: "Orange Money" (keep as-is, brand name)
- Present: "Présent(e)"
- Absent: "Absent(e)"
- Late: "En retard"
- Excused: "Excusé(e)"

### Add to i18n files:
- `app/ui/lib/i18n/en.ts`
- `app/ui/lib/i18n/fr.ts`

Use nested keys structure:
```typescript
students: {
  title: "Students",
  list: "Student List",
  gradeLeader: "Grade Leader",
  filters: {
    grade: "Grade",
    name: "Name",
    dateOfBirth: "Date of Birth",
    status: "Status"
  },
  status: {
    paymentLate: "Payment Late",
    paymentDueSoon: "Payment Due Soon",
    paymentCurrent: "Payment Current",
    frequentlyAbsent: "Frequently Absent",
    excellentAttendance: "Excellent Attendance"
  },
  attendance: {
    rate: "Attendance Rate",
    markPresent: "Mark Present",
    markAbsent: "Mark Absent",
    markLate: "Mark Late",
    markExcused: "Mark Excused"
  },
  payment: {
    status: "Payment Status",
    history: "Payment History",
    recordPayment: "Record Payment",
    complete: "Complete",
    inAdvance: "In Advance",
    onTime: "On Time",
    late: "Late"
  }
},
grades: {
  title: "Grades",
  list: "Grade List",
  students: "Students",
  subjects: "Subjects",
  analytics: "Analytics",
  gradeLeader: "Grade Leader"
},
attendance: {
  title: "Attendance",
  markAttendance: "Mark Attendance",
  quickCheckIn: "Quick Check-in",
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  markAllPresent: "Mark All Present",
  saveAndExit: "Save & Exit"
},
accounting: {
  title: "Accounting",
  balance: "Balance",
  payments: "Payments",
  expenses: "Expenses",
  totalRevenue: "Total Revenue",
  totalExpenses: "Total Expenses",
  netBalance: "Net Balance",
  cashAvailable: "Cash Available",
  cashPending: "Cash Pending Deposit",
  orangeMoney: "Orange Money",
  payment: {
    create: "Create Payment",
    update: "Update Payment",
    review: "Review Payment",
    approve: "Approve",
    reject: "Reject",
    method: "Payment Method",
    amount: "Amount",
    date: "Date",
    status: {
      draft: "Draft",
      pendingDeposit: "Pending Deposit",
      pendingReview: "Pending Review",
      confirmed: "Confirmed",
      completed: "Completed",
      rejected: "Rejected"
    }
  },
  expense: {
    create: "Create Expense",
    category: "Category",
    description: "Description",
    receipt: "Receipt",
    categories: {
      salaries: "Salaries & Benefits",
      supplies: "School Supplies",
      utilities: "Utilities",
      maintenance: "Maintenance & Repairs",
      transportation: "Transportation",
      marketing: "Marketing",
      rent: "Rent",
      other: "Other"
    }
  }
}
```

---

## 7. Dark Mode Requirements

**Current State**: Light mode only (default)
**Goal**: Support system preference + manual toggle

**Implementation**:
1. Verify `next-themes` is configured in `app/ui/app/layout.tsx`
2. Add theme toggle to navigation bar (sun/moon icons)
3. Ensure all new components use theme-aware Tailwind classes:
   - ✅ `bg-background`, `text-foreground`
   - ✅ `dark:bg-gray-800`, `dark:text-white`
   - ❌ Hardcoded: `bg-white`, `text-black`

**Test Pages**:
- Students list & detail
- Attendance interface
- Accounting dashboard
- All charts should support dark mode

---

## 8. Technical Constraints & Considerations

### Performance:
- Student list: Paginate if >100 students (use cursor-based pagination)
- Attendance: Use virtual scrolling for large grades (>50 students)
- Charts: Lazy load, show loading states with skeleton screens

### Offline Support:
- Attendance marking must work offline (priority feature)
- Payment viewing works offline (cached data)
- Payment creation syncs when online (queue in IndexedDB)

### Security:
- Validate all monetary amounts (prevent negative/excessive)
- Audit trail: Log all payment status changes
- RBAC: Enforce permissions server-side (never trust client)
- Sanitize all user inputs (XSS prevention)

### Data Validation:
- Payment amount: Min 1,000 GNF, max 100,000,000 GNF
- Bank reference: Alphanumeric, 8-20 chars
- Orange Money: Valid phone format (+224...)
- Dates: Cannot be future (for attendance/payments)
- Receipt uploads: Max 10MB, allowed types: PDF, JPG, PNG

### Error Handling:
- Show user-friendly error messages
- Log errors to monitoring service
- Provide retry mechanisms for failed syncs
- Graceful degradation when features unavailable

---

## 9. Acceptance Criteria

### Students Module:
- [ ] Can filter students by all specified criteria
- [ ] Payment progress bar displays correctly with color coding
- [ ] Attendance heatmap shows last 365 days
- [ ] Grade leader is visible and editable
- [ ] All subjects from curriculum loaded per grade
- [ ] Student detail tabs load within 500ms
- [ ] Mobile responsive (works on phones 375px+)

### Attendance:
- [ ] Can mark attendance for entire grade in <2 minutes
- [ ] Works offline (syncs when online)
- [ ] Analytics show accurate absence rates
- [ ] Attendance history viewable for date ranges
- [ ] Swipe interface works smoothly on mobile
- [ ] Cannot mark attendance for future dates
- [ ] Can edit attendance for past dates (with permission)

### Accounting:
- [ ] Balance dashboard shows correct metrics
- [ ] Payment status flows work as specified
- [ ] Cash deposit tracking works correctly
- [ ] Orange Money 24h review period enforced (clarify: auto or manual)
- [ ] Expense approval workflow functions
- [ ] Cannot create negative amounts
- [ ] Audit trail logs all changes
- [ ] Charts display data accurately

### General:
- [ ] All text properly translated (FR/EN)
- [ ] Dark mode works on all new pages
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Sample data populated for testing
- [ ] All forms validate inputs
- [ ] Loading states shown during async operations
- [ ] Error messages are clear and actionable

---

## 10. Questions to Clarify

Before starting implementation, please confirm:

1. **Grade Leaders**: Can one student be grade leader for multiple years, or only current year?

2. **Payment Distribution**: When a payment is made, you mentioned "distributed to the months" - should this follow the same logic as enrollment (fill earliest unpaid months first)?

3. **Attendance Excused vs Absent**: Do excused absences count toward the 10% absence rate, or only unexcused?

4. **Teacher Management**: You mentioned "we will build a feature for staffing later" - for now, should I create a basic Teacher table linked to User, or just use User role="TEACHER"?

5. **Orange Money 24h Review**: Is this automatic (system moves to Confirmed after 24h) or manual (accountant must review within 24h)?

6. **Expense Receipts**: Required or optional? Any file size/type limits?

7. **School Year Transition**: When a new school year starts, should attendance data from previous years be archived or remain accessible?

8. **Currency**: All amounts in GNF (Guinean Franc)? Any formatting requirements (e.g., "1 000 000 GNF" vs "1,000,000 GNF")?

9. **Attendance Editing**: Can teachers edit past attendance records? If yes, how far back (7 days, 30 days, unlimited)?

10. **Payment Rejection**: When a payment is rejected, can the amount be edited, or must it be cancelled and recreated?

---

## 11. Implementation Phases (Recommended)

### Phase 1: Foundation (Sprint 1)
- Update Prisma schema with new models
- Create seed data for subjects, teachers, grades
- Generate attendance data (Sept 15 - today)
- Set up i18n translations

### Phase 2: Students Module (Sprint 2)
- Build student list page with filters
- Implement student detail view with tabs
- Create payment status visualization
- Add attendance tab with charts

### Phase 3: Attendance (Sprint 3)
- Build quick check-in interface (desktop/mobile)
- Implement offline support
- Create attendance analytics page
- Add bulk actions

### Phase 4: Accounting (Sprint 4)
- Build balance dashboard
- Implement payment management (CRUD)
- Create payment status workflow
- Add cash deposit tracking

### Phase 5: Advanced Features (Sprint 5)
- Expense management
- Advanced analytics
- Automated notifications
- Report generation

---

## 12. API Endpoints (Suggested)

### Students
- `GET /api/students` - List students with filters
- `GET /api/students/:id` - Get student details
- `PATCH /api/students/:id` - Update student info
- `GET /api/students/:id/payments` - Get payment history
- `GET /api/students/:id/attendance` - Get attendance records

### Grades
- `GET /api/grades` - List grades
- `GET /api/grades/:id` - Get grade details
- `GET /api/grades/:id/students` - Get students in grade
- `GET /api/grades/:id/subjects` - Get subjects for grade
- `PATCH /api/grades/:id` - Update grade (leader, etc.)

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create attendance record(s)
- `PATCH /api/attendance/:id` - Update attendance record
- `GET /api/attendance/analytics` - Get analytics data

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id` - Update payment
- `POST /api/payments/:id/deposit` - Confirm cash deposit
- `POST /api/payments/:id/review` - Review payment (approve/reject)

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `PATCH /api/expenses/:id` - Update expense
- `POST /api/expenses/:id/review` - Review expense (approve/reject)

### Accounting
- `GET /api/accounting/balance` - Get balance metrics
- `GET /api/accounting/analytics` - Get accounting analytics

---

## 13. UX/UI Design Principles

### Visual Hierarchy
- Use color coding consistently (green=good, yellow=warning, red=alert)
- Primary actions should be prominent (large buttons, high contrast)
- Secondary actions should be accessible but not distracting

### Feedback & States
- Loading: Show skeleton screens, not just spinners
- Success: Toast notification + visual confirmation
- Error: Clear message + suggested action
- Empty states: Helpful message + CTA

### Mobile-First
- Design for smallest screen first (375px)
- Touch targets minimum 44x44px
- Thumb-friendly navigation (bottom tabs/bars)
- Minimize scrolling and taps

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast (4.5:1 minimum)

---

**Document Version**: 1.0  
**Last Updated**: December 25, 2025  
**Author**: Friasoft Development Team  
**Status**: Ready for Implementation

---

## References
- [Guinea Curriculum Structure](../grade-class-data/guinea-curriculum-structure.md)
- [GSPN Database Schema](../database/database-schema.md)
- [Authentication Guide](../authentication/authentication-guide.md)
- [i18n Implementation](../translation/i18n-implementation.md)
