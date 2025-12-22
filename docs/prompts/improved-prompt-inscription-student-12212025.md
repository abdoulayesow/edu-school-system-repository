# Project Overview

We are building a comprehensive, web-based school management system tailored for educational institutions in Guinea, where internet connectivity can be unreliable. The application will eventually support offline capabilities. The system aims to manage everything from student enrollment and accounting to staff, grades, and classes.

# Technical Context

This project is in its **early stages**. Your primary task is to **build out the features** described below, adhering to the existing architecture and technology stack. The `README.md` outlines the project's vision, but the implementation is minimal.

- **Monorepo Architecture**: The project uses `pnpm` workspaces. The main application is located in `app/ui`.
- **Technology Stack**:
    - **Framework**: Next.js 16 with the App Router.
    - **Database**: PostgreSQL with Prisma as the ORM. The schema is in `app/db/prisma/schema.prisma`.
    - **Authentication**: NextAuth.js.
    - **UI**: `shadcn-ui` components and Tailwind CSS.
- **Existing Data Model**: The current Prisma schema is minimal, primarily containing models for authentication (`User`, `Account`, `Session`, `Role`). You will need to **extend this schema** with new models to support the student enrollment feature.

# Feature: Student Enrollment for a School Year

We are building the feature to enroll students for an upcoming or current school year. A school year is designated by the years it spans (e.g., "2025 - 2026" for the academic year starting in September 2025 and ending in June 2026).

**Enrollment Types**:
- **New Student**: A student who has never been enrolled in the school before. Their information will need to be collected from scratch.
- **Returning Student**: A student who was enrolled in a previous year. Their existing information should be searchable and editable.

**User Role**: The enrollment process will be performed by a school employee. For now, any user performing this action should have the `"employee"` role.

---

## Enrollment Process: A Multi-Step Flow

The user will initiate the enrollment process by clicking a button, which will open a multi-step form.

### Step 1: Grade Selection
- **Display**: Show today's date and the target school year for the enrollment.
- **User Input**:
    1.  Select the school level: Elementary, Middle, or High School.
    2.  Select the specific grade for enrollment.
- **Dynamic Info**: Upon grade selection, display the number of students already enrolled in that grade and the total yearly tuition fee.
- **Action**: Both selections are mandatory. The user clicks "Next" to proceed.

### Step 2: Student Information
This step is for creating or updating the student's record.

- **For New Students**: Present a blank form to capture the following information:
    - **Personal Information**:
        - First Name (mandatory)
        - Last Name (mandatory)
        - Gender (mandatory)
        - Date of Birth (mandatory)
        - Phone Number (mandatory)
        - Email
        - Profile Picture (upload)
        - Birth Certificate (image or PDF upload)
    - **Parent/Guardian Information**:
        - Father's First & Last Name (mandatory)
        - Mother's First & Last Name (mandatory)
        - Address
        - Father's Email & Phone
        - Mother's Email & Phone
        - **Requirement**: At least one parent's phone number must be provided.
    - **Additional Information**:
        - A section to add multiple notes (e.g., medical conditions, hobbies), each with a title and details.

- **For Returning Students**:
    - Provide a search interface to find the student by their unique **Student Number**, Last Name, First Name, Date of Birth, or previous grade.
    - Once found, display all their existing information in the form.
    - Allow the user to edit and save any changes before proceeding.

- **Action**: After saving, the user can continue. The application should be able to resume an incomplete enrollment within 10 days of its creation.

### Step 3: Payment Breakdown
- **Display**: Show the total tuition fee for the selected grade for the entire school year. Also, display a scheduled payment breakdown.
- **Example Breakdown** (for a 9,000,000 GNF yearly fee for "2025-2026"):
    - **Tranche 1**:
        - September 2025: 1,000,000 GNF
        - October 2025: 1,000,000 GNF
        - May 2026: 1,000,000 GNF
    - **Tranche 2**:
        - November 2025: 1,000,000 GNF
        - December 2025: 1,000,000 GNF
        - January 2026: 1,000,000 GNF
    - **Tranche 3**:
        - February 2026: 1,000,000 GNF
        - March 2026: 1,000,000 GNF
        - April 2026: 1,000,000 GNF
- **Exception Handling**: Allow the user to **reduce** the total amount owed for the school year. This action will require subsequent approval.
- **Dynamic Update**: If the yearly amount is changed, the payment breakdown must be recalculated and updated instantly.

### Step 4: Payment Transaction
- **Payment Methods**: Cash or Orange Money. This step is skippable if no payment is being made at the time.
- **Functionality**:
    - The user enters the amount being paid.
    - The application automatically calculates and shows which payment tranches and months are covered by the payment.
    - An "Enrollment Fees" field should be displayed but set to 0 GNF and be non-editable for now.
- **Receipt Information (Mandatory if payment is made)**:
    - **Cash**: Receipt Number and an uploaded copy of the physical receipt (image/PDF).
    - **Orange Money**: Transaction ID and an uploaded copy of the receipt (image/PDF).
- **Action**: Save payment information or skip to the next step.

### Step 5: Review
- **Display**: A comprehensive summary of all the information entered in the previous steps.
- **Functionality**: Allow the user to navigate back to any previous step to make corrections.
- **Action**: The user clicks "Submit Enrollment" to finalize.

### Step 6: Confirmation
- **Status Update**:
    - If the standard tuition was paid, the enrollment status is set to `SUBMITTED`.
    - If the tuition was reduced, the status is set to `REVIEW_REQUIRED`.
- **Document Generation**: Generate a PDF document with the school's letterhead (use the logo from `/public/logo.png`) detailing the enrollment information. This document is intended for printing.

---

## Post-Submission Logic

- **`SUBMITTED` status**: If not reviewed by an admin within 3 days, the enrollment is automatically approved.
- **`REVIEW_REQUIRED` status**: This enrollment requires manual approval from a user with a higher privilege level (e.g., 'admin').

---

# Implementation Plan & Recommendations

1.  **Database Schema**:
    - **Extend** the existing Prisma schema in `app/db/prisma/schema.prisma`.
    - **Create new models**: `SchoolYear`, `Grade`, `Student`, `Enrollment`, `Payment`, `Note`.
    - **Define relationships**: Link these models logically (e.g., a `Student` can have multiple `Enrollment`s, an `Enrollment` belongs to a `SchoolYear` and a `Grade`).
    - **Define fields**: Carefully add all the fields required by the feature description (e.g., `student_number`, `amount_owed`, `status` on the `Enrollment` model).
    - **Indexes**: Add indexes to frequently queried fields like `student_number`, `last_name`, etc., to ensure performance.

2.  **API Endpoints**:
    - Create new API routes within the `app/ui/app/api/` directory.
    - Follow the RESTful pattern for resources like `enrollments`, `students`, etc.
    - Implement the logic for each step of the enrollment flow.

3.  **UI Components**:
    - Build the UI in the `app/ui/app/enrollments/` directory.
    - Use `shadcn-ui` components for all UI elements (forms, buttons, dialogs, etc.).
    - Ensure the UI is responsive and follows the existing visual style.

4.  **Seeding**:
    - Create a script to seed the database with sample data for `SchoolYear` and `Grade` to facilitate testing.

5.  **Documentation**:
    - Provide a brief `README.md` in the `app/ui/app/enrollments/` directory explaining how the feature is implemented.

**Questions for Clarification**:
- You are encouraged to ask questions if any part of the requirements is unclear.
