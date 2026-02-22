# Administration API Reference

All administration API endpoints are located under `/api/admin/`.

## Authentication & Authorization

All endpoints require authentication and role-based authorization using `requireRole()` from `@/lib/authz`.

## School Years

### List School Years
```
GET /api/admin/school-years
```
Returns all school years sorted by start date (descending).

**Response:**
```json
[
  {
    "id": "string",
    "name": "2025 - 2026",
    "startDate": "2025-09-01",
    "endDate": "2026-06-30",
    "enrollmentStart": "2025-07-01",
    "enrollmentEnd": "2026-06-15",
    "isActive": true,
    "status": "active"
  }
]
```

### Create School Year
```
POST /api/admin/school-years
```
**Body:**
```json
{
  "name": "2025 - 2026",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30",
  "enrollmentStart": "2025-07-01",
  "enrollmentEnd": "2026-06-15"
}
```

### Get School Year
```
GET /api/admin/school-years/[id]
```

### Update School Year
```
PUT /api/admin/school-years/[id]
```

### Delete School Year
```
DELETE /api/admin/school-years/[id]
```
Only allowed if no enrollments exist for the school year.

### Activate School Year
```
POST /api/admin/school-years/[id]/activate
```
Activates the school year and deactivates the current active year.

### Copy Configuration
```
POST /api/admin/school-years/[id]/copy-config
```
**Body:**
```json
{
  "sourceYearId": "string",
  "copyGrades": true,
  "copySubjects": true,
  "copyRooms": true
}
```

---

## Grades

### List Grades
```
GET /api/admin/grades?schoolYearId={id}
```
Returns grades with rooms, subjects, and enrollment counts.

**Query Parameters:**
- `schoolYearId` (required): School year ID

### Create Grade
```
POST /api/admin/grades
```
**Body:**
```json
{
  "name": "7eme Annee",
  "code": "7EME",
  "level": "college",
  "order": 7,
  "tuitionFee": 500000,
  "capacity": 70,
  "series": null,
  "isEnabled": true,
  "schoolYearId": "string"
}
```

### Get Grade
```
GET /api/admin/grades/[id]
```

### Update Grade
```
PUT /api/admin/grades/[id]
```

### Delete Grade
```
DELETE /api/admin/grades/[id]
```
Only allowed if no enrollments exist.

### Toggle Grade Enabled
```
POST /api/admin/grades/[id]/toggle
```
Toggles the `isEnabled` status.

---

## Rooms

### List Rooms
```
GET /api/admin/grades/[gradeId]/rooms
```

### Create Room
```
POST /api/admin/grades/[gradeId]/rooms
```
**Body:**
```json
{
  "name": "A",
  "displayName": "7A",
  "capacity": 35,
  "isActive": true
}
```

### Update Room
```
PUT /api/admin/grades/[gradeId]/rooms/[roomId]
```

### Delete Room
```
DELETE /api/admin/grades/[gradeId]/rooms/[roomId]
```
Only allowed if no students are assigned.

---

## Subjects

### List All Subjects
```
GET /api/admin/subjects
```
Returns all available subjects for assignment.

### List Grade Subjects
```
GET /api/admin/grades/[gradeId]/subjects
```

### Assign Subject to Grade
```
POST /api/admin/grades/[gradeId]/subjects
```
**Body:**
```json
{
  "subjectId": "string",
  "coefficient": 2,
  "hoursPerWeek": 4,
  "series": null
}
```

### Remove Subject from Grade
```
DELETE /api/admin/grades/[gradeId]/subjects?subjectId={id}
```

---

## Room Assignments

### List Assignments / Unassigned Students
```
GET /api/admin/room-assignments
```
**Query Parameters:**
- `schoolYearId` (required): School year ID
- `gradeId`: Filter by grade
- `roomId`: Filter by room
- `unassigned`: Set to `true` to get unassigned students

### Assign Student to Room (Single)
```
POST /api/admin/room-assignments
```
**Body:**
```json
{
  "studentProfileId": "string",
  "gradeRoomId": "string",
  "schoolYearId": "string"
}
```

### Assign Students to Room (Bulk)
```
POST /api/admin/room-assignments
```
**Body:**
```json
{
  "assignments": [
    { "studentProfileId": "string", "gradeRoomId": "string" },
    { "studentProfileId": "string", "gradeRoomId": "string" }
  ],
  "schoolYearId": "string"
}
```

**Response:**
```json
{
  "created": [...],
  "errors": [
    { "studentProfileId": "string", "error": "Room is at full capacity" }
  ]
}
```

### Update Assignment
```
PUT /api/admin/room-assignments/[id]
```

### Delete Assignment
```
DELETE /api/admin/room-assignments/[id]
```

---

## Teachers

### List Teachers
```
GET /api/admin/teachers
```
Returns teachers with workload information.

**Response:**
```json
[
  {
    "id": "string",
    "person": { "firstName": "string", "lastName": "string" },
    "user": { "email": "string" },
    "_count": { "classAssignments": 5 },
    "totalHours": 20
  }
]
```

### Get Teacher Schedule
```
GET /api/admin/teachers/[id]/schedule?schoolYearId={id}
```
Returns the teacher's class assignments for a school year.

---

## Class Assignments

### List Class Assignments
```
GET /api/admin/class-assignments?schoolYearId={id}
```

### Create Assignment
```
POST /api/admin/class-assignments
```
**Body:**
```json
{
  "gradeSubjectId": "string",
  "teacherProfileId": "string",
  "schoolYearId": "string"
}
```

### Update Assignment
```
PUT /api/admin/class-assignments/[id]
```

### Delete Assignment
```
DELETE /api/admin/class-assignments/[id]
```

---

## Users & Invitations

### List Users
```
GET /api/admin/users
```
Returns registered users.

### List Invitations
```
GET /api/admin/users?invitations=true
```
Returns pending and past invitations.

### Send Invitation
```
POST /api/admin/users/invite
```
**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "teacher"
}
```

### Resend Invitation
```
POST /api/admin/users/[id]/resend-invite
```
Generates a new token and sends a new invitation email.

---

## Accept Invitation (Auth Endpoint)

### Validate Invitation Token
```
GET /api/auth/accept-invitation?token={token}
```
Returns invitation details if valid.

### Accept Invitation
```
POST /api/auth/accept-invitation
```
**Body:**
```json
{
  "token": "string",
  "name": "John Doe",
  "password": "securepassword"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [...] // Optional validation errors
}
```

Common HTTP status codes:
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden (insufficient role)
- `404` - Resource not found
- `500` - Internal server error
