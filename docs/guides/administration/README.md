# Administration Module

The Administration module provides comprehensive tools for managing the school system's core configuration, including school years, grades, rooms, teacher assignments, and user invitations.

## Features

### 1. School Year Management
- Create and configure academic years
- Set enrollment periods
- Activate/deactivate school years
- Copy configuration from previous years

### 2. Grades & Rooms Management
- Configure grades with tuition fees and capacity
- Create rooms/sections within each grade
- Assign subjects to grades
- Enable/disable grades for enrollment

### 3. Teachers & Classes
- View all teachers and their workload
- Assign teachers to subjects by grade
- View teacher schedules
- Manage class assignments

### 4. User Invitation System
- Invite new users via email
- Assign roles during invitation
- Track invitation status
- Resend expired invitations

### 5. Room Assignments
- Assign enrolled students to specific rooms
- Bulk assignment support
- Track room capacity

## Access Control

| Role | Permissions |
|------|-------------|
| Director | Full access to all administration features |
| Academic Director | View school years, grades, teachers; No user management |
| Secretary | View school years, grades; Room assignments; No user management |
| Accountant | View school years only |
| Teacher | No access to administration |

## Quick Links

- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)
- [User Guide](./user-guide.md)

## File Structure

```
app/ui/app/admin/
├── grades/
│   └── page.tsx        # Grades & Rooms management
├── school-years/
│   └── page.tsx        # School Year management
├── teachers/
│   └── page.tsx        # Teachers & Classes
└── users/
    └── page.tsx        # User invitation management

app/ui/app/api/admin/
├── school-years/       # School year CRUD + activate + copy-config
├── grades/             # Grade CRUD + toggle + rooms + subjects
├── room-assignments/   # Student room assignment
├── teachers/           # Teacher list + schedules
├── class-assignments/  # Teacher-subject-grade assignments
├── subjects/           # Subject list
└── users/              # User list + invitation management
```

## Getting Started

1. **Initial Setup**: Create a school year in Admin > School Years
2. **Configure Grades**: Set up grades with tuition fees in Admin > Grades & Rooms
3. **Add Rooms**: Create rooms/sections within each grade
4. **Assign Subjects**: Add subjects to each grade
5. **Invite Teachers**: Send invitations in Admin > Users
6. **Assign Teachers**: Map teachers to subjects in Admin > Teachers & Classes

## Internationalization

The administration module is fully bilingual (English/French). All UI text uses i18n keys from:
- `app/ui/lib/i18n/en.ts`
- `app/ui/lib/i18n/fr.ts`

Keys are organized under the `admin` namespace.
