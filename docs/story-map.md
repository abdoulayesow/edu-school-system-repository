# User Story Map - GSPN School Management System

| **Document Info** | |
|-------------------|---|
| **Product** | GSPN School Management System |
| **Version** | 1.0 |
| **Date** | December 19, 2025 |
| **Status** | Draft |

---

## Table of Contents

1. [Story Map Overview](#1-story-map-overview)
2. [Visual Story Map](#2-visual-story-map)
3. [Backbone - Activities](#3-backbone---activities)
4. [Release Plan](#4-release-plan)
5. [Detailed User Stories](#5-detailed-user-stories)
6. [Acceptance Criteria Patterns](#6-acceptance-criteria-patterns)
7. [Dependencies](#7-dependencies)

---

## 1. Story Map Overview

{panel:title=Story Map Structure|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

This story map follows the core workflow identified in the stakeholder recording:

**Enrollment → Payment → Validation → Reconciliation → Reporting**

The backbone represents the major activities (horizontal), while user stories are organized vertically by priority (Release 1 MVP at top, future releases below).

{panel}

### Key Personas

| Code | Persona | Primary Activities |
|------|---------|-------------------|
| **M** | Mariama (Secretary) | Enrollment, Activity Management |
| **I** | Ibrahima (Accountant) | Payment, Reconciliation, Reporting |
| **F** | Fatoumata (Academic Director) | Activity Oversight |
| **A** | Amadou (Teacher) | Attendance Confirmation |
| **O** | Ousmane (Director) | Approvals, Dashboards |
| **P** | Aissatou (Parent) | Payment, Tracking (R2) |
| **S** | Mamadou (Student) | Self-service (R2) |

---

## 2. Visual Story Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                        GSPN SCHOOL MANAGEMENT SYSTEM - STORY MAP                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                   │
│  ══════════════════════════════════════════════════════════════════ BACKBONE (Activities) ══════════════════════════════════════════════════════ │
│                                                                                                                                                   │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐        │
│  │   1. ENROLLMENT   │  │    2. PAYMENT     │  │   3. ACTIVITIES   │  │  4. VALIDATION    │  │ 5. RECONCILIATION │  │   6. REPORTING    │        │
│  │      MGMT         │  │    PROCESSING     │  │      MGMT         │  │   & CONFIRM       │  │                   │  │                   │        │
│  │   👩‍💼 Mariama      │  │   👨‍💼 Ibrahima     │  │   👩‍💼 👨‍🏫 M/A      │  │   👨‍🏫 👨‍💼 A/I      │  │   👨‍💼 Ibrahima     │  │   👔 👨‍💼 O/I       │        │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘  └───────────────────┘        │
│           │                      │                      │                      │                      │                      │                   │
│  ═══════════════════════════════════════════════════════ RELEASE 1 (MVP) - Walking Skeleton ════════════════════════════════════════════════════ │
│           │                      │                      │                      │                      │                      │                   │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐         │
│  │ Register new    │    │ Record payment  │    │ Create activity │    │ Confirm student │    │ Record bank     │    │ View enrollment │         │
│  │ student         │    │ (cash/receipt)  │    │ (class/club)    │    │ attendance      │    │ deposit         │    │ summary         │         │
│  │ [E-1.1] M       │    │ [P-1.1] I       │    │ [A-1.1] M       │    │ [V-1.1] A       │    │ [R-1.1] I       │    │ [RP-1.1] O/I    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Send enrollment │    │ Generate        │    │ Assign student  │    │ Validate        │    │ Match payments  │    │ View payment    │         │
│  │ confirmation    │    │ receipt         │    │ to activity     │    │ payment record  │    │ to deposits     │    │ summary         │         │
│  │ [E-1.2] M       │    │ [P-1.2] I       │    │ [A-1.2] M       │    │ [V-1.2] I       │    │ [R-1.2] I       │    │ [RP-1.2] O/I    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Upload student  │    │ Attach          │    │ List students   │    │ Report          │    │ Flag            │    │ View activity   │         │
│  │ documents       │    │ supporting doc  │    │ per activity    │    │ participation   │    │ discrepancies   │    │ summary         │         │
│  │ [E-1.3] M       │    │ [P-1.3] I       │    │ [A-1.3] M/A     │    │ [V-1.3] A       │    │ [R-1.3] I       │    │ [RP-1.3] F/O    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                      │                      │                      │                      │                      │                   │
│  ═════════════════════════════════════════════════════════ RELEASE 1 (MVP) - Core Features ═════════════════════════════════════════════════════ │
│           │                      │                      │                      │                      │                      │                   │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐         │
│  │ Search/filter   │    │ Track payment   │    │ Distinguish     │    │ Open exception  │    │ Period close    │    │ Period close    │         │
│  │ students        │    │ status          │    │ curr/extra-curr │    │ ticket          │    │ workflow        │    │ report          │         │
│  │ [E-2.1] M       │    │ [P-2.1] I/M     │    │ [A-2.1] M/F     │    │ [V-2.1] M/I     │    │ [R-2.1] I       │    │ [RP-2.1] O/I    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Bulk enrollment │    │ Record mobile   │    │ Cancel activity │    │ Approve         │    │ Reconciliation  │    │ Anomaly         │         │
│  │ import          │    │ money payment   │    │ enrollment      │    │ exception       │    │ report          │    │ report          │         │
│  │ [E-2.2] M       │    │ [P-2.2] I       │    │ [A-2.2] M       │    │ [V-2.2] O       │    │ [R-2.2] I       │    │ [RP-2.2] O/I    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Edit student    │    │ Process refund  │    │ Activity        │    │ Control check   │    │ Audit trail     │    │ Dashboard       │         │
│  │ record          │    │ (with approval) │    │ calendar        │    │ (correction)    │    │ view            │    │ view            │         │
│  │ [E-2.3] M       │    │ [P-2.3] I/O     │    │ [A-2.3] M/F     │    │ [V-2.3] I       │    │ [R-2.3] O       │    │ [RP-2.3] O      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                      │                      │                      │                      │                      │                   │
│  ════════════════════════════════════════════════════════════ RELEASE 2 - Parent & Notifications ═══════════════════════════════════════════════ │
│           │                      │                      │                      │                      │                      │                   │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐                             ┌────────▼────────┐         │
│  │ Parent views    │    │ Parent pays     │    │ Student         │    │ Parent receives │                             │ Parent views    │         │
│  │ enrollment      │    │ via mobile      │    │ self-enrolls    │    │ confirmation    │                             │ child's reports │         │
│  │ [E-3.1] P       │    │ [P-3.1] P       │    │ [A-3.1] S       │    │ [V-3.1] P       │                             │ [RP-3.1] P      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                             └─────────────────┘         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                             ┌─────────────────┐         │
│  │ SMS enrollment  │    │ Payment         │    │ Student views   │    │ SMS attendance  │                             │ Student views   │         │
│  │ notification    │    │ reminders       │    │ schedule        │    │ notification    │                             │ own grades      │         │
│  │ [E-3.2] P       │    │ [P-3.2] P       │    │ [A-3.2] S       │    │ [V-3.2] P       │                             │ [RP-3.2] S      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                             └─────────────────┘         │
│                                                                                                                                                   │
│  ══════════════════════════════════════════════════════════════ RELEASE 3 - Academic Features ══════════════════════════════════════════════════ │
│                                                                                                                                                   │
│                                ┌─────────────────┐    ┌─────────────────┐                             ┌─────────────────┐                        │
│                                │ Grade entry     │    │ Timetable       │                             │ Report cards    │                        │
│                                │ [P-4.1] A       │    │ management      │                             │ [RP-4.1] F/P/S  │                        │
│                                └─────────────────┘    │ [A-4.1] F       │                             └─────────────────┘                        │
│                                                       └─────────────────┘                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Backbone - Activities

### Activity 1: Enrollment Management

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **ENR** | Enrollment Management | Student registration, document collection, enrollment confirmation | Secretary (Mariama) |

**Key Workflow:**
```
Student/Parent Request → Secretary Collects Documents → System Records Enrollment → 
Confirmation Message Sent → Payment Linked → Student Record Created
```

---

### Activity 2: Payment Processing

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **PAY** | Payment Processing | Recording payments, generating receipts, tracking payment status | Accountant (Ibrahima) |

**Key Workflow:**
```
Payment Received → Supporting Document Attached → Receipt Generated → 
Payment Linked to Student/Activity → Validated in System
```

---

### Activity 3: Activity Management

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **ACT** | Activity Management | Creating activities, assigning students, managing enrollments | Secretary (Mariama), Teachers |

**Key Workflow:**
```
Activity Created (Curricular/Extracurricular) → Students Assigned → 
Payment Recorded → Teacher Notified → Activity Calendar Updated
```

---

### Activity 4: Validation & Confirmation

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **VAL** | Validation & Confirmation | Attendance confirmation, payment validation, exception handling | Teachers, Accountant |

**Key Workflow:**
```
Teacher Confirms Attendance → Report Sent to Student Affairs → 
Payment Validated → Exception Ticket (if needed) → Leadership Approval
```

---

### Activity 5: Reconciliation

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **REC** | Reconciliation | Bank deposits, payment matching, period close | Accountant (Ibrahima) |

**Key Workflow:**
```
Bank Deposit Recorded → System Validates → Payments Matched → 
Discrepancies Flagged → Period Closed → Summary Generated
```

---

### Activity 6: Reporting

| ID | Activity | Description | Owner |
|----|----------|-------------|-------|
| **RPT** | Reporting | Enrollment summaries, payment reports, period statements, dashboards | Director, Accountant |

**Key Workflow:**
```
Select Report Type → Filter by Period/Activity → Generate Report → 
Review Anomalies → Export/Print → Archive
```

---

## 4. Release Plan

{panel:title=Release Summary|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| Release | Theme | Timeline | Stories | Users |
|---------|-------|----------|---------|-------|
| **R1 - MVP** | Core Enrollment → Payment → Validation Flow | Sprints 1-6 | 36 stories | Staff (M, I, F, A, O) |
| **R2** | Parent Portal & Notifications | Sprints 7-9 | 12 stories | + Parents, Students |
| **R3** | Academic Features | Sprints 10-11 | 6+ stories | All users |

{panel}

### Release 1 - MVP Scope

**Goal:** Complete traceability from enrollment to reconciliation

| Sprint | Focus | Stories |
|--------|-------|---------|
| Sprint 1-2 | Enrollment + Basic Payment | E-1.1, E-1.2, E-1.3, P-1.1, P-1.2, P-1.3 |
| Sprint 3-4 | Activities + Validation | A-1.1, A-1.2, A-1.3, V-1.1, V-1.2, V-1.3 |
| Sprint 5 | Reconciliation | R-1.1, R-1.2, R-1.3, R-2.1, R-2.2, R-2.3 |
| Sprint 6 | Reporting + Polish | RP-1.1 to RP-2.3, E-2.x, P-2.x, A-2.x, V-2.x |

---

## 5. Detailed User Stories

### 5.1 Enrollment Management Stories

{panel:title=Enrollment Stories|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

#### E-1.1: Register New Student
**As** Mariama (Secretary)  
**I want to** register a new student in the system  
**So that** I can create an official enrollment record with all required information

**Acceptance Criteria:**
- [ ] System captures: student name, date of birth, parent/guardian info, contact details
- [ ] Unique student ID is auto-generated
- [ ] Enrollment date is recorded automatically
- [ ] Status is set to "Pending" until payment confirmed
- [ ] System prevents duplicate enrollments (same student name + DOB)

**Personas:** 👩‍💼 Mariama

---

#### E-1.2: Send Enrollment Confirmation
**As** Mariama (Secretary)  
**I want to** send a confirmation message when enrollment is complete  
**So that** parents have proof of enrollment and know next steps

**Acceptance Criteria:**
- [ ] Confirmation generated automatically when enrollment saved
- [ ] Confirmation includes: student name, enrollment ID, enrollment date, amount due
- [ ] Confirmation can be printed or sent via SMS (R2)
- [ ] Copy stored in system linked to student record

**Personas:** 👩‍💼 Mariama

---

#### E-1.3: Upload Student Documents
**As** Mariama (Secretary)  
**I want to** upload supporting documents for a student  
**So that** all required documentation is stored digitally and accessible

**Acceptance Criteria:**
- [ ] System accepts: PDF, JPG, PNG formats
- [ ] Document types supported: birth certificate, previous school records, ID photos
- [ ] Each document linked to student record with upload date
- [ ] Documents viewable from student profile

**Personas:** 👩‍💼 Mariama

---

#### E-2.1: Search/Filter Students
**As** Mariama (Secretary)  
**I want to** search and filter student records  
**So that** I can quickly find any student's information

**Acceptance Criteria:**
- [ ] Search by: name, student ID, parent name, phone number
- [ ] Filter by: enrollment status, grade level, enrollment date range
- [ ] Results show key info: name, ID, status, grade, parent contact
- [ ] Click to view full student profile

**Personas:** 👩‍💼 Mariama

---

#### E-2.2: Bulk Enrollment Import
**As** Mariama (Secretary)  
**I want to** import multiple student enrollments from a spreadsheet  
**So that** I can efficiently process high-volume enrollment periods

**Acceptance Criteria:**
- [ ] System provides Excel/CSV template
- [ ] Import validates required fields before processing
- [ ] Errors reported with row numbers for correction
- [ ] Successfully imported students created with "Pending" status
- [ ] Import log saved for audit

**Personas:** 👩‍💼 Mariama

---

#### E-2.3: Edit Student Record
**As** Mariama (Secretary)  
**I want to** update a student's information  
**So that** records remain accurate and current

**Acceptance Criteria:**
- [ ] Editable fields: contact info, guardian info, grade level
- [ ] Non-editable fields: student ID, enrollment date (audit trail)
- [ ] All changes logged with timestamp and user
- [ ] Reason for change required for key fields

**Personas:** 👩‍💼 Mariama

{panel}

---

### 5.2 Payment Processing Stories

{panel:title=Payment Stories|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

#### P-1.1: Record Payment (Cash/Receipt)
**As** Ibrahima (Accountant)  
**I want to** record a payment received from a student/parent  
**So that** all transactions are documented in the system

**Acceptance Criteria:**
- [ ] Payment linked to specific student
- [ ] Payment type captured: cash, check, bank transfer, mobile money
- [ ] Amount recorded in GNF
- [ ] Payment date and received-by staff captured
- [ ] Payment category: enrollment fee, tuition, activity fee, other
- [ ] System prevents recording without supporting document reference

**Personas:** 👨‍💼 Ibrahima

---

#### P-1.2: Generate Receipt
**As** Ibrahima (Accountant)  
**I want to** generate a receipt for every payment  
**So that** parents have official proof of payment

**Acceptance Criteria:**
- [ ] Receipt auto-generated when payment saved
- [ ] Receipt includes: receipt number, date, student name, amount, payment type, description
- [ ] Receipt can be printed or exported as PDF
- [ ] Copy stored in system linked to payment record
- [ ] Receipt number is unique and sequential

**Personas:** 👨‍💼 Ibrahima

---

#### P-1.3: Attach Supporting Document
**As** Ibrahima (Accountant)  
**I want to** attach supporting documents to a payment  
**So that** every transaction has proper documentation for audit

**Acceptance Criteria:**
- [ ] Document upload required before payment finalized (configurable)
- [ ] Supported types: bank slip, mobile money screenshot, signed receipt
- [ ] Document linked to payment record
- [ ] Document viewable from payment detail screen

**Personas:** 👨‍💼 Ibrahima

---

#### P-2.1: Track Payment Status
**As** Ibrahima (Accountant) **or** Mariama (Secretary)  
**I want to** view payment status for any student  
**So that** I can answer inquiries and follow up on outstanding payments

**Acceptance Criteria:**
- [ ] Status shows: total due, total paid, balance
- [ ] Payment history listed with dates and amounts
- [ ] Filter by payment type, date range
- [ ] Export payment history to PDF

**Personas:** 👨‍💼 Ibrahima, 👩‍💼 Mariama

---

#### P-2.2: Record Mobile Money Payment (Orange Money)
**As** Ibrahima (Accountant)  
**I want to** record a mobile money payment  
**So that** digital payments are tracked with proper transaction references

**Acceptance Criteria:**
- [ ] Mobile money provider selection: Orange Money, MTN Mobile Money
- [ ] Transaction reference number captured
- [ ] Screenshot attachment supported
- [ ] Amount and sender phone number recorded

**Personas:** 👨‍💼 Ibrahima

---

#### P-2.3: Process Refund
**As** Ibrahima (Accountant)  
**I want to** process a refund with proper approval  
**So that** refunds are documented and authorized

**Acceptance Criteria:**
- [ ] Refund request creates exception ticket
- [ ] Reason for refund required
- [ ] Approval from Director required
- [ ] Refund recorded as negative payment with reference to original
- [ ] Audit trail maintained

**Personas:** 👨‍💼 Ibrahima, 👔 Ousmane (approval)

{panel}

---

### 5.3 Activity Management Stories

{panel:title=Activity Stories|borderStyle=solid|borderColor=#6554C0|bgColor=#EAE6FF}

#### A-1.1: Create Activity
**As** Mariama (Secretary)  
**I want to** create a new activity (class or club)  
**So that** students can be enrolled and tracked

**Acceptance Criteria:**
- [ ] Activity name, description, type (curricular/extracurricular)
- [ ] Schedule: days, times, location
- [ ] Responsible teacher assigned
- [ ] Fee amount (if applicable)
- [ ] Maximum capacity (optional)

**Personas:** 👩‍💼 Mariama

---

#### A-1.2: Assign Student to Activity
**As** Mariama (Secretary)  
**I want to** assign a student to an activity  
**So that** their enrollment is recorded and the teacher knows who to expect

**Acceptance Criteria:**
- [ ] Student selected from enrolled students
- [ ] Activity selected from active activities
- [ ] System checks for payment (warning if unpaid)
- [ ] Enrollment date recorded
- [ ] Teacher notified of new enrollment

**Personas:** 👩‍💼 Mariama

---

#### A-1.3: List Students per Activity
**As** Mariama (Secretary) **or** Amadou (Teacher)  
**I want to** view a list of students enrolled in an activity  
**So that** I know who is supposed to participate

**Acceptance Criteria:**
- [ ] List shows: student name, enrollment date, payment status
- [ ] Filter by: payment status, enrollment date
- [ ] Export to PDF/Excel
- [ ] Teacher can access list for their activities

**Personas:** 👩‍💼 Mariama, 👨‍🏫 Amadou

---

#### A-2.1: Distinguish Curricular vs Extracurricular
**As** Mariama (Secretary) **or** Fatoumata (Academic Director)  
**I want to** clearly see whether an activity is curricular or extracurricular  
**So that** reporting and tracking is accurate

**Acceptance Criteria:**
- [ ] Activity type clearly labeled in UI
- [ ] Filter activities by type
- [ ] Reports can separate curricular from extracurricular
- [ ] Different icons/colors for visual distinction

**Personas:** 👩‍💼 Mariama, 👩‍🏫 Fatoumata

---

#### A-2.2: Cancel Activity Enrollment
**As** Mariama (Secretary)  
**I want to** cancel a student's enrollment in an activity  
**So that** incorrect or changed enrollments are properly handled

**Acceptance Criteria:**
- [ ] Cancellation reason required
- [ ] Original enrollment record retained (marked cancelled)
- [ ] Cancellation date recorded
- [ ] If paid, system prompts for refund decision
- [ ] Teacher notified of cancellation

**Personas:** 👩‍💼 Mariama

---

#### A-2.3: Activity Calendar
**As** Mariama (Secretary) **or** Fatoumata (Academic Director)  
**I want to** view all activities in a calendar format  
**So that** I can see scheduling and plan accordingly

**Acceptance Criteria:**
- [ ] Calendar view showing all activities
- [ ] Filter by: activity type, teacher, grade level
- [ ] Click activity to see details and enrolled students
- [ ] Month/week/day views

**Personas:** 👩‍💼 Mariama, 👩‍🏫 Fatoumata

{panel}

---

### 5.4 Validation & Confirmation Stories

{panel:title=Validation Stories|borderStyle=solid|borderColor=#FF5630|bgColor=#FFEBE6}

#### V-1.1: Confirm Student Attendance
**As** Amadou (Teacher)  
**I want to** confirm attendance for students in my activities  
**So that** participation is recorded and reported

**Acceptance Criteria:**
- [ ] List of enrolled students shown for selected activity/date
- [ ] Mark each student: present, absent, excused
- [ ] Quick "all present" option
- [ ] Comments field for notes
- [ ] Confirmation submitted with timestamp

**Personas:** 👨‍🏫 Amadou

---

#### V-1.2: Validate Payment Record
**As** Ibrahima (Accountant)  
**I want to** validate that a payment is properly documented  
**So that** only verified payments are counted in reconciliation

**Acceptance Criteria:**
- [ ] Validation checkbox/button on payment record
- [ ] Validation only possible if supporting document attached
- [ ] Validated payments show validation date and validator
- [ ] Validated payments cannot be edited without approval

**Personas:** 👨‍💼 Ibrahima

---

#### V-1.3: Report Participation to Student Affairs
**As** Amadou (Teacher)  
**I want to** submit my attendance confirmations to student affairs  
**So that** records are complete and the office is informed

**Acceptance Criteria:**
- [ ] Attendance automatically visible to student affairs when submitted
- [ ] Summary report generated for selected period
- [ ] Any anomalies flagged (e.g., student never attended)
- [ ] Report shows: activity, dates, attendance counts per student

**Personas:** 👨‍🏫 Amadou

---

#### V-2.1: Open Exception Ticket
**As** Mariama (Secretary) **or** Ibrahima (Accountant)  
**I want to** create a ticket for an exception situation  
**So that** issues are documented and routed for approval

**Acceptance Criteria:**
- [ ] Ticket type: payment discrepancy, enrollment issue, refund request, other
- [ ] Description of issue required
- [ ] Supporting documents can be attached
- [ ] Ticket assigned to Director for approval
- [ ] Status tracking: open, pending approval, approved, rejected, resolved

**Personas:** 👩‍💼 Mariama, 👨‍💼 Ibrahima

---

#### V-2.2: Approve Exception
**As** Ousmane (Director)  
**I want to** review and approve/reject exception tickets  
**So that** decisions are documented and authorized

**Acceptance Criteria:**
- [ ] List of pending tickets visible in dashboard
- [ ] Full ticket details viewable including documents
- [ ] Approve/reject with required comment
- [ ] Decision recorded with timestamp
- [ ] Requestor notified of decision
- [ ] Approved exceptions allow related action (e.g., refund)

**Personas:** 👔 Ousmane

---

#### V-2.3: Control Check (Correction)
**As** Ibrahima (Accountant)  
**I want to** perform a control check and correction on flagged items  
**So that** discrepancies are resolved with proper documentation

**Acceptance Criteria:**
- [ ] Control check triggered by reconciliation flag or ticket
- [ ] Original record shown alongside correction
- [ ] Reason for correction required
- [ ] Correction linked to approval (if required)
- [ ] Audit trail shows original → correction chain

**Personas:** 👨‍💼 Ibrahima

{panel}

---

### 5.5 Reconciliation Stories

{panel:title=Reconciliation Stories|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

#### R-1.1: Record Bank Deposit
**As** Ibrahima (Accountant)  
**I want to** record a bank deposit  
**So that** cash/payments are tracked from receipt to bank

**Acceptance Criteria:**
- [ ] Deposit date, amount, bank account, reference number
- [ ] Bank slip attachment required
- [ ] Deposit linked to specific payments (optional)
- [ ] Status: recorded, validated, reconciled

**Personas:** 👨‍💼 Ibrahima

---

#### R-1.2: Match Payments to Deposits
**As** Ibrahima (Accountant)  
**I want to** match recorded payments to bank deposits  
**So that** reconciliation is accurate

**Acceptance Criteria:**
- [ ] System suggests matches based on amounts/dates
- [ ] Manual matching supported
- [ ] Matched items marked as reconciled
- [ ] Unmatched items flagged for review

**Personas:** 👨‍💼 Ibrahima

---

#### R-1.3: Flag Discrepancies
**As** Ibrahima (Accountant)  
**I want to** flag discrepancies found during reconciliation  
**So that** issues are tracked and resolved

**Acceptance Criteria:**
- [ ] Flag types: missing payment, missing deposit, amount mismatch
- [ ] Flagged items create automatic tickets
- [ ] Resolution tracked and documented
- [ ] Flag resolved when correction validated

**Personas:** 👨‍💼 Ibrahima

---

#### R-2.1: Period Close Workflow
**As** Ibrahima (Accountant)  
**I want to** close a financial period  
**So that** all transactions are finalized and reported

**Acceptance Criteria:**
- [ ] Period selection: monthly (e.g., September-October)
- [ ] Pre-close checklist: all payments validated, all deposits reconciled, no open flags
- [ ] Close creates snapshot of all transactions
- [ ] Closed period cannot be edited without approval
- [ ] Close generates summary report

**Personas:** 👨‍💼 Ibrahima

---

#### R-2.2: Reconciliation Report
**As** Ibrahima (Accountant)  
**I want to** generate a reconciliation report  
**So that** I have a clear view of payments vs. deposits

**Acceptance Criteria:**
- [ ] Report shows: total payments, total deposits, matched, unmatched
- [ ] Breakdown by payment type
- [ ] List of discrepancies with status
- [ ] Export to PDF/Excel

**Personas:** 👨‍💼 Ibrahima

---

#### R-2.3: Audit Trail View
**As** Ousmane (Director)  
**I want to** view the complete audit trail for any transaction  
**So that** I can verify proper procedures were followed

**Acceptance Criteria:**
- [ ] Journal view showing all actions on a record
- [ ] Each entry: date/time, user, action, old value, new value
- [ ] Filter by: date range, user, action type
- [ ] Export audit trail for compliance

**Personas:** 👔 Ousmane

{panel}

---

### 5.6 Reporting Stories

{panel:title=Reporting Stories|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

#### RP-1.1: View Enrollment Summary
**As** Ousmane (Director) **or** Ibrahima (Accountant)  
**I want to** view an enrollment summary for a period  
**So that** I know how many students enrolled

**Acceptance Criteria:**
- [ ] Filter by: period, grade level, enrollment status
- [ ] Summary shows: total enrolled, new enrollments, withdrawals
- [ ] Breakdown by grade level
- [ ] Trend comparison to previous periods

**Personas:** 👔 Ousmane, 👨‍💼 Ibrahima

---

#### RP-1.2: View Payment Summary
**As** Ousmane (Director) **or** Ibrahima (Accountant)  
**I want to** view a payment summary for a period  
**So that** I know total revenue and outstanding amounts

**Acceptance Criteria:**
- [ ] Filter by: period, payment type, payment category
- [ ] Summary shows: total received, by type, outstanding
- [ ] Breakdown by category (enrollment, tuition, activities)
- [ ] Comparison to budget (if applicable)

**Personas:** 👔 Ousmane, 👨‍💼 Ibrahima

---

#### RP-1.3: View Activity Summary
**As** Fatoumata (Academic Director) **or** Ousmane (Director)  
**I want to** view activity participation summary  
**So that** I know engagement levels

**Acceptance Criteria:**
- [ ] List of activities with enrollment counts
- [ ] Attendance rates per activity
- [ ] Revenue per activity (extracurricular)
- [ ] Filter by: activity type, period, teacher

**Personas:** 👩‍🏫 Fatoumata, 👔 Ousmane

---

#### RP-2.1: Period Close Report
**As** Ousmane (Director) **or** Ibrahima (Accountant)  
**I want to** generate a comprehensive period close report  
**So that** the period is documented and archived

**Acceptance Criteria:**
- [ ] Includes: enrollments, activities, payments, expenses (if tracked)
- [ ] Lists anomalies and corrective actions
- [ ] Summary totals with breakdown
- [ ] Digital signature/approval status
- [ ] Export to PDF for archive

**Personas:** 👔 Ousmane, 👨‍💼 Ibrahima

---

#### RP-2.2: Anomaly Report
**As** Ousmane (Director) **or** Ibrahima (Accountant)  
**I want to** view a report of all anomalies and exceptions  
**So that** I can monitor issues and resolutions

**Acceptance Criteria:**
- [ ] List of: open tickets, discrepancies, exceptions
- [ ] Status and age of each item
- [ ] Assignee and approver
- [ ] Resolution notes
- [ ] Filter by: status, type, date range

**Personas:** 👔 Ousmane, 👨‍💼 Ibrahima

---

#### RP-2.3: Dashboard View
**As** Ousmane (Director)  
**I want to** see a real-time dashboard of school operations  
**So that** I have instant visibility without running reports

**Acceptance Criteria:**
- [ ] Cards showing: total students, new enrollments, revenue, outstanding
- [ ] Recent activity feed
- [ ] Alerts for: pending approvals, open tickets, overdue items
- [ ] Quick links to common actions
- [ ] Refresh/auto-update

**Personas:** 👔 Ousmane

{panel}

---

### 5.7 Release 2 Stories (Parent & Student)

{panel:title=Release 2 Stories - Future|borderStyle=dashed|borderColor=#FF5630|bgColor=#FFEBE6}

| ID | Story | Persona |
|----|-------|---------|
| E-3.1 | Parent views child's enrollment status | 👩 Aissatou |
| E-3.2 | Parent receives SMS enrollment notification | 👩 Aissatou |
| P-3.1 | Parent pays via Orange Money portal | 👩 Aissatou |
| P-3.2 | Parent receives payment reminders | 👩 Aissatou |
| A-3.1 | Student self-enrolls in activity (with parent approval) | 👦 Mamadou |
| A-3.2 | Student views personal schedule | 👦 Mamadou |
| V-3.1 | Parent receives payment confirmation SMS | 👩 Aissatou |
| V-3.2 | Parent receives attendance notification | 👩 Aissatou |
| RP-3.1 | Parent views child's reports/progress | 👩 Aissatou |
| RP-3.2 | Student views own grades/attendance | 👦 Mamadou |

{panel}

---

## 6. Acceptance Criteria Patterns

{panel:title=Standard Acceptance Criteria|borderStyle=solid|borderColor=#6554C0|bgColor=#EAE6FF}

Based on the stakeholder recording, these patterns should be applied across all stories:

### Traceability Pattern
> Every transaction must be traceable
- [ ] Action logged with timestamp and user ID
- [ ] Changes create audit trail entry
- [ ] Previous values preserved in history

### Documentation Pattern
> Every transaction must be justified and validated
- [ ] Supporting document attachment required (or reason for exception)
- [ ] Document linked to record
- [ ] Document accessible from record detail view

### Confirmation Pattern
> Always confirm receipt in the system
- [ ] System sends confirmation when action complete
- [ ] Confirmation includes reference number
- [ ] Confirmation can be retrieved/reprinted

### Exception Pattern
> Each exception must be justified and approved
- [ ] Exception creates ticket automatically
- [ ] Reason/justification required
- [ ] Approval workflow triggered
- [ ] Approval recorded with timestamp and approver

### Validation Pattern
> Validated before reconciliation
- [ ] Status progression: draft → validated → reconciled
- [ ] Validation requires all required fields complete
- [ ] Validation requires supporting document
- [ ] Validated records locked for edit (unless approved)

{panel}

---

## 7. Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STORY DEPENDENCIES                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  E-1.1 Register Student ──────────────────────────────────────────────┐ │
│       │                                                                │ │
│       ├──► P-1.1 Record Payment                                        │ │
│       │         │                                                      │ │
│       │         ├──► P-1.2 Generate Receipt                            │ │
│       │         │                                                      │ │
│       │         └──► R-1.2 Match to Deposits                           │ │
│       │                                                                │ │
│       └──► A-1.2 Assign to Activity                                    │ │
│                 │                                                      │ │
│                 └──► V-1.1 Confirm Attendance                          │ │
│                                                                        │ │
│  R-1.1 Record Deposit ────► R-1.2 Match Payments ────► R-2.1 Period   │ │
│                                      │                    Close        │ │
│                                      │                      │          │ │
│                                      ▼                      ▼          │ │
│                              R-1.3 Flag Discrepancies   RP-2.1 Period  │ │
│                                      │                    Report       │ │
│                                      ▼                                 │ │
│                              V-2.1 Exception Ticket                    │ │
│                                      │                                 │ │
│                                      ▼                                 │ │
│                              V-2.2 Approve Exception                   │ │
│                                                                        │ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Critical Path (MVP)

1. **E-1.1** → Student record exists
2. **P-1.1** → Payments can be recorded
3. **A-1.1** → Activities can be created
4. **A-1.2** → Students assigned to activities
5. **V-1.1** → Attendance confirmed
6. **R-1.1** → Deposits recorded
7. **R-1.2** → Reconciliation possible
8. **RP-2.1** → Period can be closed with report

---

## 8. Story Map Metrics

| Metric | Count |
|--------|-------|
| **Total Backbone Activities** | 6 |
| **Total Stories (All Releases)** | 48 |
| **Release 1 (MVP) Stories** | 36 |
| **Release 2 Stories** | 10 |
| **Release 3 Stories** | 2+ |
| **Primary Personas Covered** | 5 |
| **Secondary Personas** | 2 |

---

{info:title=Document History}
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 19, 2025 | Product Team | Initial story map based on stakeholder recording |
{info}
