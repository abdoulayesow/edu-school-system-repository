# Enrollment API Reference

Complete API documentation for the Student Enrollment System.

---

## Authentication

All endpoints require authentication via NextAuth session. Include session cookie in requests.

---

## School Years

### Get Active School Year

```http
GET /api/school-years/active
```

Returns the currently active school year with all grades and enrollment counts.

**Response:**

```json
{
  "id": "uuid",
  "name": "2025 - 2026",
  "startDate": "2025-09-01T00:00:00.000Z",
  "endDate": "2026-06-30T00:00:00.000Z",
  "enrollmentStart": "2025-07-01T00:00:00.000Z",
  "enrollmentEnd": "2025-10-31T00:00:00.000Z",
  "isActive": true,
  "grades": [
    {
      "id": "uuid",
      "name": "1ère Année",
      "level": "elementary",
      "order": 1,
      "tuitionFee": 800000,
      "enrollmentCount": 45
    }
  ]
}
```

---

## Enrollments

### List Enrollments

```http
GET /api/enrollments
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (draft, submitted, approved, etc.) |
| `schoolYearId` | string | Filter by school year |
| `gradeId` | string | Filter by grade |
| `search` | string | Search by student name or enrollment number |
| `drafts` | boolean | If true, only show user's drafts |

**Response:**

```json
{
  "enrollments": [
    {
      "id": "uuid",
      "enrollmentNumber": "ENR-2025-00001",
      "firstName": "Mamadou",
      "lastName": "Diallo",
      "gradeName": "7ème Année",
      "status": "submitted",
      "createdAt": "2025-12-24T10:00:00.000Z",
      "submittedAt": "2025-12-24T10:30:00.000Z"
    }
  ],
  "total": 100
}
```

---

### Create Enrollment

```http
POST /api/enrollments
```

**Request Body:**

```json
{
  "schoolYearId": "uuid",
  "gradeId": "uuid",
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "isReturningStudent": false,
  "studentId": null
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "enrollmentNumber": null,
  "status": "draft",
  "currentStep": 1,
  "draftExpiresAt": "2026-01-03T10:00:00.000Z",
  "grade": { ... },
  "schoolYear": { ... }
}
```

---

### Get Enrollment

```http
GET /api/enrollments/:id
```

**Response:**

```json
{
  "id": "uuid",
  "enrollmentNumber": "ENR-2025-00001",
  "studentId": "uuid",
  "schoolYearId": "uuid",
  "gradeId": "uuid",
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "dateOfBirth": "2010-05-15T00:00:00.000Z",
  "gender": "male",
  "phone": "+224621000000",
  "email": null,
  "fatherName": "Ibrahim Diallo",
  "fatherPhone": "+224622000000",
  "motherName": "Fatoumata Diallo",
  "motherPhone": "+224623000000",
  "address": "Nongo, Ratoma",
  "originalTuitionFee": 1000000,
  "adjustedTuitionFee": null,
  "adjustmentReason": null,
  "status": "submitted",
  "currentStep": 6,
  "isReturningStudent": false,
  "submittedAt": "2025-12-24T10:30:00.000Z",
  "approvedAt": null,
  "autoApproveAt": "2025-12-27T10:30:00.000Z",
  "grade": { ... },
  "schoolYear": { ... },
  "paymentSchedules": [ ... ],
  "payments": [ ... ],
  "notes": [ ... ],
  "tuitionFee": 1000000,
  "totalPaid": 333333,
  "remainingBalance": 666667
}
```

---

### Update Enrollment

```http
PUT /api/enrollments/:id
```

Used for auto-save during wizard. Only drafts can be updated (except by directors).

**Request Body:** (all fields optional)

```json
{
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "dateOfBirth": "2010-05-15",
  "gender": "male",
  "phone": "+224621000000",
  "email": "student@email.gn",
  "fatherName": "Ibrahim Diallo",
  "fatherPhone": "+224622000000",
  "motherName": "Fatoumata Diallo",
  "motherPhone": "+224623000000",
  "address": "Nongo, Ratoma",
  "gradeId": "uuid",
  "adjustedTuitionFee": 900000,
  "adjustmentReason": "Sibling discount",
  "currentStep": 3
}
```

**Response:** Updated enrollment object

---

### Delete Enrollment

```http
DELETE /api/enrollments/:id
```

Only draft enrollments can be deleted.

**Response:** `200 OK`

```json
{
  "message": "Enrollment deleted"
}
```

---

### Submit Enrollment

```http
POST /api/enrollments/:id/submit
```

Submits a draft enrollment for approval. Creates payment schedules.

**Request Body:**

```json
{
  "schedules": [
    {
      "scheduleNumber": 1,
      "amount": 333333,
      "months": ["September", "October", "May"],
      "dueDate": "2025-10-15"
    },
    {
      "scheduleNumber": 2,
      "amount": 333333,
      "months": ["November", "December", "January"],
      "dueDate": "2025-12-15"
    },
    {
      "scheduleNumber": 3,
      "amount": 333334,
      "months": ["February", "March", "April"],
      "dueDate": "2026-03-15"
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid",
  "enrollmentNumber": "ENR-2025-00001",
  "status": "submitted",
  "submittedAt": "2025-12-24T10:30:00.000Z",
  "autoApproveAt": "2025-12-27T10:30:00.000Z",
  "studentNumber": "STU-00001",
  "paymentSchedules": [ ... ]
}
```

---

### Complete (Approve) Enrollment

```http
POST /api/enrollments/:id/approve
```

**Authorization:** Director only

Completes an enrollment that is in `submitted` or `needs_review` status.

**Request Body:**

```json
{
  "comment": "All documents verified, enrollment approved."
}
```

> **Note:** A comment is required when completing an enrollment.

**Response:**

```json
{
  "id": "uuid",
  "status": "completed",
  "approvedAt": "2025-12-24T11:00:00.000Z",
  "approvedBy": "director-user-id",
  "statusComment": "All documents verified, enrollment approved.",
  "statusChangedAt": "2025-12-24T11:00:00.000Z",
  "statusChangedBy": "director-user-id"
}
```

---

### Reject Enrollment

```http
DELETE /api/enrollments/:id/approve
```

**Authorization:** Director only

Rejects an enrollment that is in `submitted` or `needs_review` status.

**Request Body:**

```json
{
  "reason": "Incomplete documentation - missing birth certificate"
}
```

> **Note:** A reason is required when rejecting an enrollment.

**Response:**

```json
{
  "id": "uuid",
  "status": "rejected",
  "statusComment": "Incomplete documentation - missing birth certificate",
  "statusChangedAt": "2025-12-24T11:00:00.000Z",
  "statusChangedBy": "director-user-id"
}
```

---

### Cancel Enrollment

```http
POST /api/enrollments/:id/cancel
```

**Authorization:** Creator or Director

Cancels a draft enrollment.

**Request Body:**

```json
{
  "reason": "Student enrolled at another school"
}
```

> **Note:** A reason is required when cancelling an enrollment.

**Response:**

```json
{
  "id": "uuid",
  "status": "cancelled",
  "statusComment": "Student enrolled at another school",
  "statusChangedAt": "2025-12-24T11:00:00.000Z",
  "statusChangedBy": "user-id"
}
```

---

## Payments

### List Payments

```http
GET /api/enrollments/:id/payments
```

**Response:**

```json
{
  "payments": [
    {
      "id": "uuid",
      "enrollmentId": "uuid",
      "paymentScheduleId": "uuid",
      "amount": 333333,
      "method": "cash",
      "status": "confirmed",
      "receiptNumber": "REC-2025-00001",
      "transactionRef": null,
      "recordedBy": "uuid",
      "recordedAt": "2025-12-24T10:30:00.000Z",
      "recorder": {
        "name": "Secretary User",
        "email": "secretary@school.gn"
      }
    }
  ]
}
```

---

### Record Payment

```http
POST /api/enrollments/:id/payments
```

**Request Body:**

```json
{
  "amount": 333333,
  "method": "cash",
  "receiptNumber": "REC-2025-00001",
  "transactionRef": null,
  "paymentScheduleId": "uuid",
  "notes": "First installment"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "amount": 333333,
  "method": "cash",
  "status": "confirmed",
  "receiptNumber": "REC-2025-00001"
}
```

---

## Notes

### List Notes

```http
GET /api/enrollments/:id/notes
```

**Response:**

```json
{
  "notes": [
    {
      "id": "uuid",
      "enrollmentId": "uuid",
      "title": "Missing document",
      "content": "Birth certificate not yet provided",
      "createdBy": "uuid",
      "createdAt": "2025-12-24T10:30:00.000Z",
      "author": {
        "name": "Secretary User",
        "email": "secretary@school.gn"
      }
    }
  ]
}
```

---

### Add Note

```http
POST /api/enrollments/:id/notes
```

**Request Body:**

```json
{
  "title": "Missing document",
  "content": "Birth certificate not yet provided"
}
```

**Response:** `201 Created`

---

## Student Search

### Search Returning Students

```http
GET /api/enrollments/search-student?q=:query
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search by student number, name, or DOB |

**Response:**

```json
{
  "students": [
    {
      "id": "uuid",
      "studentNumber": "STU-00001",
      "firstName": "Mamadou",
      "lastName": "Diallo",
      "dateOfBirth": "2010-05-15",
      "lastGrade": "6ème Année",
      "lastEnrollmentYear": "2024 - 2025"
    }
  ]
}
```

---

### Get Suggested Students

```http
GET /api/enrollments/suggested-students?gradeId=:gradeId
```

Returns students who were enrolled in the **previous grade** during the **previous school year** and are eligible to return.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `gradeId` | string | ID of the grade being enrolled into |
| `limit` | number | Max results (default: 20) |

**Logic:**
1. Gets the current grade's order (e.g., Grade 4 = order 4)
2. Finds the previous grade (order - 1 = Grade 3)
3. Gets the previous school year
4. Finds students with `completed` enrollments from that grade/year
5. Excludes students already enrolled this year

**Response:**

```json
[
  {
    "id": "student-uuid",
    "enrollmentId": "enrollment-uuid",
    "studentNumber": "STU-00001",
    "firstName": "Mamadou",
    "lastName": "Diallo",
    "dateOfBirth": "2010-05-15T00:00:00.000Z",
    "lastGrade": "3ème Année",
    "lastEnrollmentYear": "2024 - 2025",
    "fatherName": "Ibrahim Diallo",
    "fatherPhone": "+224622000000",
    "motherName": "Fatoumata Diallo",
    "motherPhone": "+224623000000",
    "email": null,
    "phone": "+224621000000",
    "address": "Nongo, Ratoma"
  }
]
```

**Notes:**
- Returns empty array if current grade is Grade 1 (no previous grade)
- Returns empty array if no previous school year exists
- Pre-fills parent information for faster enrollment

---

## PDF Generation

### Generate Enrollment PDF

```http
GET /api/enrollments/:id/pdf
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lang` | string | `fr` | Language (`fr` or `en`) |

**Response:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Inscription_Mamadou_Diallo_ENR-2025-00001.pdf"

[PDF binary data]
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description",
  "errors": [ ... ]  // Optional: Zod validation errors
}
```

**HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |
