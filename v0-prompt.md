# GSPN School Management System v0 Prompt (Enhanced with Personas & Story Map)

## 1. Global Design System & Theme

**Objective:** Design a comprehensive and professional school management system for the "Groupe Scolaire Privé Ndiolou (GSPN)". The application must be clean, trustworthy, and user-friendly, optimized for an offline-first environment with low bandwidth. The design must reflect the core principles: **Security, Traceability, Fair Treatment, and Real-time Visibility.**

**Theme and Style:**
*   **Look and Feel:** Professional, secure, and highly trustworthy. Use a modern, minimalist design with a clear information hierarchy. The interface should feel robust and reliable, not flashy.
*   **Color Palette:**
    *   Primary: `#0747A6` (Deep Blue) for primary actions, navigation, and focus elements.
    *   Secondary/Neutral: `#DEEBFF` (Light Blue) for backgrounds, panels, and selected states. Use standard grays and whites for the overall interface.
    *   Success: `#00875A` (Green) for confirmations, validated status, and positive feedback.
    *   Warning/Attention: `#FFAB00` (Amber) for pending statuses or items needing attention.
    *   Error/Critical: `#BF2600` (Red) for errors, discrepancies, and negative feedback.
*   **Typography:** Use a clear, highly legible, and modern sans-serif font like **Inter** or **Lato**. Ensure clear visual hierarchy between headings, body text, and labels.
*   **Core Components:**
    *   **Data Tables:** Clean, with clear headings, alternating row colors, and status tags (e.g., "Paid," "Pending," "Validated"). Should include search and filter controls.
    *   **Forms:** Well-structured with clear labels, required field indicators, and grouped sections. File upload components should be simple drag-and-drop or file selection.
    *   **Buttons:** Primary actions (e.g., "Save," "Submit," "Approve") should use the primary blue. Secondary actions (e.g., "Cancel," "Print") should be outlined or subtle.
    *   **Modals:** Used for focused tasks like "New Enrollment" or "Record Payment" to avoid navigating away from the main screen.
    *   **Status Tags/Pills:** Use colored pills to indicate status clearly (e.g., Green for "Validated", Amber for "Pending", Red for "Rejected").

## 2. Role-Based Dashboards & Workflows

### 2.1 Ousmane (School Director) - The Oversight Dashboard

**Persona Goal:** Ousmane needs high-level, real-time visibility to ensure the school is running smoothly and ethically. He is not involved in day-to-day data entry but is the primary approver for exceptions.

**v0 Prompt for Ousmane's Dashboard:**
Design the main dashboard for a School Director. It should provide an at-a-glance overview of the school's operational health. The dashboard must be clean, professional, and focus on key metrics and action items.

*   **Header:** "GSPN Director's Dashboard" with the user's name (Ousmane Sylla).
*   **Key Metric Cards (Top Row):**
    *   **Total Enrollment:** Large number with a small trend indicator (e.g., "+5% from last month").
    *   **Total Revenue (This Period):** Large number, with a sub-metric for "Outstanding Payments."
    *   **Pending Approvals:** A critical alert card with a large number, colored in Amber/Red. Clicking this should navigate to the Exception Approval screen.
    *   **Open Reconciliation Flags:** An alert card showing the number of financial discrepancies that need attention.
*   **Main Dashboard Panes (Two-column layout):**
    *   **Left Column: "Action Items & Recent Activity"**
        *   A list of the top 5 "Pending Exception Tickets" requiring his approval. Each item should show the request type, who submitted it, and the date.
        *   A feed of "Recent High-Impact Events" (e.g., "Period Closed by Ibrahima," "Bulk Enrollment Processed by Mariama").
    *   **Right Column: "Summary Reports"**
        *   A simple bar chart showing "Enrollments by Grade Level."
        *   A pie chart showing "Revenue by Category" (Tuition, Extracurricular, etc.).
        *   A link to "View All Reports."

### 2.2 Mariama (Secretary) - The Enrollment & Activity Hub

**Persona Goal:** Mariama is the operational backbone. She needs to process enrollments and manage activities quickly and accurately, reducing paperwork and manual follow-ups.

**v0 Prompt for Mariama's Screens:**
Design a two-part interface for the school Secretary.

**1. The Enrollment Management Screen:**
*   A powerful data table of all students with columns for `Student ID`, `Full Name`, `Grade`, `Enrollment Date`, and `Payment Status` (a colored tag).
*   Above the table, include a prominent **"+ New Enrollment"** button (primary blue) and a comprehensive search bar to quickly find students.
*   Clicking **"+ New Enrollment"** opens a clean, well-organized modal form with fields for `First Name`, `Last Name`, `Date of Birth`, `Guardian Info`, and a file upload area for `Birth Certificate`.
*   When viewing a student's profile, show all their details, enrolled activities, payment history, and attached documents.

**2. The Activity Management Screen:**
*   A view with a list of all activities (e.g., "English Club," "Math Tutoring"). Each item should show the activity name, assigned teacher, and number of enrolled students.
*   Include a toggle to filter between "Curricular" and "Extracurricular" activities.
*   Clicking an activity opens a detail view where Mariama can **"Assign Student"** to that activity. This should allow her to search for an enrolled student and add them to the list. The system should show a warning if the student has outstanding payments.

### 2.3 Ibrahima (Accountant) - The Financial Control Center

**Persona Goal:** Ibrahima needs to ensure every franc is tracked, validated, and reconciled. His interface must be precise, secure, and built for audibility.

**v0 Prompt for Ibrahima's Screens:**
Design three critical screens for the school Accountant, focusing on accuracy and traceability.

**1. The Payment Recording Screen:**
*   A data table of all transactions. Columns: `Transaction ID`, `Student Name`, `Amount`, `Payment Method`, `Date`, and a `Status` tag ("Unvalidated," "Validated," "Reconciled").
*   A **"Record Payment"** button opens a modal. This form is critical:
    *   It must allow linking the payment to a student.
    *   It must have a field for `Payment Type` (Cash, Mobile Money).
    *   It **must** have a mandatory field for a `Supporting Document Reference` or a file upload for a `Scanned Receipt/Screenshot`. A payment cannot be logged without it.

**2. The Reconciliation Screen:**
*   A split-screen or two-panel layout.
    *   **Left Panel: "Validated Payments"** - A list of payments that have been validated but not yet reconciled.
    *   **Right Panel: "Bank Deposits"** - A list of recorded bank deposits.
*   The user should be able to select one or more payments from the left and a deposit from the right. A **"Match & Reconcile"** button should be prominent. The system should show a running total of the selected items to help with matching.
*   Any mismatch should allow Ibrahima to **"Flag Discrepancy,"** which automatically creates an exception ticket for the Director.

**3. Period Close Workflow:**
*   A wizard-like interface to guide him through closing a financial period.
    *   Step 1: "Pre-Close Checklist" - The system automatically checks for unvalidated payments or open discrepancies and blocks closing until they are resolved.
    *   Step 2: "Review Summary" - Shows final totals for the period.
    *   Step 3: "Close Period" - A final confirmation step that, when clicked, locks the period's transactions and generates the final report.

### 2.4 Amadou (Teacher) - The Mobile-First Attendance App

**Persona Goal:** Amadou wants to focus on teaching. He needs a dead-simple, quick way to take attendance for his activities, ideally on his phone.

**v0 Prompt for Amadou's View:**
Design a simple, mobile-friendly web view for a Teacher to take attendance.

*   The initial view should be a list of the teacher's assigned activities for the day (e.g., "English Class - Grade 10," "English Club").
*   Tapping on an activity opens the attendance list for that session.
*   The list should show each student's name and a photo.
*   The interface for marking attendance must be fast:
    *   By default, all students are marked "Present."
    *   The teacher only needs to tap on the students who are "Absent" or "Excused."
    *   A single **"Submit Attendance"** button at the bottom.
*   There should be a small indicator next to each student's name showing their payment status for the activity (e.g., a small green check or a red 'x'), but this should be subtle.

### 2.5 Fatoumata (Academic Director) - The Academic Oversight View

**Persona Goal:** Fatoumata needs to understand participation and ensure academic programs are running as expected. She is not a primary data entry user.

**v0 Prompt for Fatoumata's View:**
Design a simple reporting view for the Academic Director.

*   The view should have two main tabs: **"Activity Overview"** and **"Participation Reports."**
*   **Activity Overview Tab:**
    *   A list of all activities, clearly labeled as "Curricular" or "Extracurricular."
    *   Each activity should show the assigned teacher and the total number of enrolled students.
    *   Filters at the top to narrow down by teacher or grade.
*   **Participation Reports Tab:**
    *   A view that allows her to select an activity and a date range to see attendance trends.
    *   Display a simple chart showing attendance rates over time for a specific club or class.
    *   Show a list of students with low participation rates across multiple activities.


PRODUCT PRINCIPLES
"Offline First" - Every feature works offline, syncs when online
"Simple Over Features" - Core functionality before advanced features
"Cost-Conscious" - Built for budget-constrained schools
"Trust & Transparency" - Never hide costs, always clear communication
"Local First" - Designed for Guinea context, not adapted from elsewhere
"Reliable" - Better to have 80% of features working reliably than 100% features that break
