# Administration User Guide

This guide walks you through the administration features of the GSPN School Management System.

## Table of Contents

1. [School Year Management](#school-year-management)
2. [Grades & Rooms Configuration](#grades--rooms-configuration)
3. [Teacher Assignments](#teacher-assignments)
4. [User Invitations](#user-invitations)
5. [Room Assignments](#room-assignments)

---

## School Year Management

Navigate to **Administration > School Years** to manage academic years.

### Creating a School Year

1. Click **Create School Year**
2. Fill in the required fields:
   - **Name**: e.g., "2025 - 2026"
   - **Start Date**: First day of school
   - **End Date**: Last day of school
   - **Enrollment Start**: When enrollment opens
   - **Enrollment End**: When enrollment closes
3. Click **Save**

The new school year is created with status "New".

### Activating a School Year

1. Find the school year you want to activate
2. Click **Activate**
3. Confirm the action

> **Note:** Only one school year can be active at a time. Activating a new year will deactivate the current one.

### Copying Configuration from Previous Year

To save time, copy grades, subjects, and rooms from a previous year:

1. Select the school year to configure
2. Click **Copy Configuration**
3. Choose the source year
4. Select what to copy:
   - Grades (with tuition fees)
   - Subjects (with coefficients)
   - Rooms (with capacities)
5. Click **Copy**

### School Year Status

| Status | Description |
|--------|-------------|
| New | Recently created, can be edited freely |
| Active | Currently in use, limited edits allowed |
| Passed | Historical data, read-only |

---

## Grades & Rooms Configuration

Navigate to **Administration > Grades & Rooms** to manage class structure.

### Viewing Grades

1. Select a school year from the dropdown
2. Use the level tabs to filter:
   - All
   - Kindergarten (Maternelle)
   - Elementary (Primaire)
   - College
   - High School (Lycee)

Each grade card shows:
- Student count
- Number of rooms
- Number of subjects
- Tuition fee

### Adding a Grade

1. Click **Add Grade**
2. Fill in the details:
   - **Name**: e.g., "7eme Annee"
   - **Code**: Short code (e.g., "7EME")
   - **Level**: Select school level
   - **Order**: Sorting position
   - **Tuition Fee**: Annual fee in GNF
   - **Capacity**: Maximum students (soft limit)
   - **Series**: For high school only (SM, SS, SE)
3. Click **Save**

### Enabling/Disabling Grades

- Click the power icon to toggle a grade's availability for enrollment
- Disabled grades won't appear in the enrollment wizard

### Managing Rooms

1. Expand a grade card by clicking **Manage Rooms**
2. View existing rooms with current/max capacity
3. Click **Add Room** to create a new section:
   - **Name**: "A", "B", "C"
   - **Display Name**: "7A", "7B", "7C"
   - **Capacity**: Maximum students (hard limit)
4. Edit or delete rooms using the action icons

> **Note:** Rooms with assigned students cannot be deleted.

### Managing Subjects

1. Click **Manage Subjects** on a grade card
2. View currently assigned subjects with:
   - Coefficient (grade weight)
   - Hours per week
3. Add a new subject:
   - Select from the dropdown
   - Set coefficient and hours
   - Click **Add Subject**
4. Remove subjects using the trash icon

---

## Teacher Assignments

Navigate to **Administration > Teachers & Classes** to manage teaching assignments.

### View Modes

Switch between two views:

**By Subject**
- Shows all grades grouped by level
- Displays subjects within each grade
- Shows assigned teacher or "Unassigned"

**By Teacher**
- Shows teacher cards with:
  - Total teaching hours
  - Number of class assignments
- Click **View Schedule** to see assignments

### Assigning Teachers

1. In "By Subject" view, find the unassigned subject-grade
2. Click **Assign Teacher**
3. Select a teacher from the dropdown
4. Click **Save**

### Removing Assignments

1. Find the existing assignment
2. Click the remove icon
3. Confirm the action

### Teacher Schedule

1. Click **View Schedule** on a teacher card
2. See all their class assignments:
   - Subject name
   - Grade
   - Hours per week

---

## User Invitations

Navigate to **Administration > Users** to manage system users.

### Sending Invitations

1. Click **Invite User**
2. Fill in:
   - **Email**: User's email address
   - **Name**: Optional, helps identify the invitee
   - **Role**: Select from:
     - Director
     - Academic Director
     - Secretary
     - Accountant
     - Teacher
3. Click **Send Invitation**

An email is sent with a link to create their account.

### Tracking Invitations

The Invitations tab shows:
- Pending invitations
- Accepted invitations
- Expired invitations

Each invitation displays:
- Email address
- Role assigned
- Expiration date
- Status badge
- Who sent it

### Resending Invitations

If an invitation expired or wasn't received:
1. Find the invitation
2. Click **Resend**

This generates a new token and sends a fresh email.

### Accepting an Invitation

When a user receives an invitation:
1. They click the link in the email
2. Enter their full name
3. Create a password (min 8 characters)
4. Click **Create Account**

They can then sign in with their email and password.

---

## Room Assignments

After students are enrolled and approved, assign them to specific rooms.

### Accessing Room Assignments

1. Go to **Administration > Grades & Rooms**
2. Expand a grade to see its rooms
3. Click **Assign Students**

### Assigning Students

1. In the dialog, select a room from the dropdown
   - View current occupancy
   - Full rooms are disabled
2. The table shows unassigned students:
   - Student name
   - Student number
3. Select students using checkboxes:
   - Use **Select All** for bulk selection
   - Selection is limited by room capacity
4. Click **Assign Students**

### Assignment Results

- **Success**: Students are assigned, room count updates
- **Partial Success**: Some assignments succeeded, others failed
- **Error**: No assignments were made

Common errors:
- Room at full capacity
- Student already assigned to another room

### Reassigning Students

To move a student to a different room:
1. Find their current assignment (in the API)
2. Delete the assignment
3. Create a new assignment to the target room

---

## Best Practices

### Start of Year Setup

1. Create the new school year
2. Copy configuration from previous year
3. Adjust tuition fees as needed
4. Add/remove grades or rooms
5. Update subject assignments
6. Activate the school year
7. Begin enrollment

### User Management

- Invite teachers early so they can be assigned to classes
- Use descriptive names in invitations
- Monitor expired invitations and resend as needed

### Room Planning

- Create rooms before enrollment opens
- Set realistic capacities based on classroom size
- Leave some buffer for late enrollments

### Data Integrity

- Don't delete grades/rooms with existing data
- Use disable instead of delete when possible
- Keep past school years for historical reference
