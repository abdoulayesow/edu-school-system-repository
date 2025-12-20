# GSPN School Management System - Development Plan

This document outlines the phased development plan for building the GSPN School Management System from scratch. The structure is designed to be modular, with clear separation between the UI, API, and database layers.

## Guiding Principles

- **UI-First Development:** The initial phases focus exclusively on building a complete and interactive UI with mock data. This allows for rapid iteration on the user experience without backend dependencies.
- **Modular Architecture:** The codebase will be organized into `app/ui`, `app/api`, and `app/db` to ensure a clean separation of concerns.
- **Iterative Implementation:** Features will be built one module at a time (e.g., Student Management, then Accounting) to ensure focus and quality.
- **Leverage the design:** Ui interfaces and pages will based on the design created by v0 in the folder `design-ux/`
---

## Phase 1: Project Scaffolding & UI Foundation

*The goal of this phase is to establish the project structure, set up the UI framework, and build the core application layout.*

**1.1: Set Up Project Structure**
- Create the root directories:
  - `app/`: The main application source folder.
  - `app/ui/`: For the Next.js frontend application.
  - `app/api/`: For backend serverless functions.
  - `app/db/`: For database schema, migrations, and query logic.

**1.2: Initialize UI Project**
- Initialize a new Next.js 14+ project within `app/ui` using the App Router.
- Configure the project with TypeScript and Tailwind CSS.
- Set up `shadcn/ui` for the component library.
- Ensure `tsconfig.json` and other configurations are set up for path aliases (e.g., `@/components`).

**1.3: Define Schema and Mock Data**
- Create `app/db/schema.ts` to define TypeScript types for all database models (Users, Students, Payments, etc.), mirroring `docs/database-schema.md`.
- Create `app/db/sample-data.ts` to export arrays of mock data for each model. This data will be used to populate the UI in Phases 1 & 2.

**1.4: Build Core UI Layout & Navigation**
- Develop the main application layout in `app/ui/components/layout/`. This will include a persistent sidebar and a header.
- Create a centralized navigation configuration file (`app/ui/lib/nav-links.ts`) that defines navigation links and the user roles that can access them.
- Implement a dynamic navigation component that renders links based on a simulated "current user" object.

---

## Phase 2: UI Feature Implementation (with Mock Data)

*The goal of this phase is to build out all major UI features using the foundation and mock data from Phase 1.*

**2.1: Dashboard Module**
- Build the components for the main dashboard (`/dashboard`).
- Use `recharts` and `shadcn/ui` Cards to display key metrics (e.g., student count, recent payments).
- Populate all components with data from `app/db/sample-data.ts`.

**2.2: Student Enrollment Module**
- Implement the student list page (`/enrollments`) with a data table component (`shadcn/ui DataTable`).
- The table should support sorting, filtering, and pagination.
- Create a dynamic route for the student details page (`/enrollments/[id]`).
- Design and build the "Enroll New Student" form using `react-hook-form` and `zod` for validation. (The form will not submit data yet).

**2.3: Accounting Module**
- Implement the payments list page (`/accounting`) with a data table.
- The table should be filterable by student, date, and status.
- Build the "Add Payment" form.

**2.4: Additional Modules**
- Iteratively implement the remaining modules based on the story map:
  - Activities (Classes & Clubs)
  - Attendance
  - User Management
  - Reports

---

## Phase 3: Backend & Database Implementation

*With the UI complete, this phase focuses on building the live backend and database.*

**3.1: Database Setup**
- In `app/db`, configure Drizzle ORM to connect to a Turso/libSQL database.
- Write a migration script (`app/db/migrate.ts`) based on the `app/db/schema.ts` file to create the database tables.

**3.2: API Scaffolding**
- Set up tRPC within the Next.js project to enable type-safe communication between the UI and the API.
- Create API routers in `app/api/routers/` for each data model (e.g., `students.ts`, `payments.ts`).

**3.3: Implement API Endpoints**
- Develop `read` procedures (e.g., `student.getAll`, `payment.getById`) to fetch live data from the database using Drizzle.
- Develop `create`, `update`, and `delete` procedures, ensuring they include business logic and validation.

---

## Phase 4: Integration & Finalization

*The final phase involves connecting the UI to the live backend and implementing advanced features.*

**4.1: Connect UI to API**
- Refactor all UI pages and components in `app/ui` to fetch data from the tRPC API endpoints instead of the mock data file.
- Replace client-side mock data filtering/sorting with server-side API queries.
- Connect all forms to their respective API mutation procedures.

**4.2: Implement Authentication**
- Integrate an authentication provider (e.g., NextAuth.js).
- Replace the simulated "current user" with the real, logged-in user session.
- Secure API endpoints based on user roles.

**4.3: Implement Offline Sync (Advanced)**
- Integrate Dexie.js into the UI project (`app/ui`) for robust IndexedDB management.
- Build the sync engine as detailed in `docs/architecture.md`.
- Create queues for pending operations and a conflict resolution strategy.
- Add UI indicators for online/offline status and sync progress.
