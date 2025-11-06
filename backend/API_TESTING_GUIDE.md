# API Testing Guide - Friasoft School Management System

## Overview

This guide provides step-by-step instructions for testing all 40+ API endpoints of the Friasoft School Management System backend.

## Prerequisites

- PostgreSQL installed and running
- Backend database initialized with `npm run db:migrate`
- Backend server running with `npm run dev`
- Test data seeded with `npm run db:seed`
- Postman, cURL, or similar API testing tool

## Quick Start

```bash
# 1. Migrate database schema
npm run db:migrate

# 2. Seed test data
npm run db:seed

# 3. Start backend server
npm run dev

# Server will be running at: http://localhost:5000
```

## API Response Format

### Success Response
```json
{
  "status": "OK",
  "message": "Operation successful",
  "data": { /* specific data */ }
}
```

### Paginated Response
```json
{
  "status": "OK",
  "message": "Data retrieved successfully",
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "status": "ERROR",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Testing Flow

### 1. System Health Check

```bash
# Check API is running
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-11-06T...",
  "message": "Friasoft School Management API is running",
  "version": "0.1.0",
  "environment": "development"
}
```

### 2. Authentication

#### 2.1 Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@friasoft.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "schoolId": "YOUR_SCHOOL_ID",
    "role": "teacher"
  }'
```

#### 2.2 Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@friasoft-test.com",
    "password": "password123"
  }'

# Response contains access_token and refreshToken
# Save the access_token for authenticated requests
```

#### 2.3 Get Current User (Requires Authentication)
```bash
# Replace YOUR_ACCESS_TOKEN with the token from login
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2.4 Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 2.5 Change Password
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "NewPassword456!",
    "confirmPassword": "NewPassword456!"
  }'
```

### 3. Schools Management

#### 3.1 Create School
```bash
curl -X POST http://localhost:5000/api/schools \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New School Name",
    "email": "newschool@email.com",
    "phone": "+224 666 123 456",
    "country": "Guinea",
    "city": "Kindia",
    "address": "123 Main Street",
    "subscriptionPlan": "Premium"
  }'
```

#### 3.2 List Schools
```bash
curl -X GET "http://localhost:5000/api/schools?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3.3 Get School Details
```bash
curl -X GET http://localhost:5000/api/schools/SCHOOL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3.4 Update School
```bash
curl -X PUT http://localhost:5000/api/schools/SCHOOL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated School Name",
    "city": "Kindia"
  }'
```

#### 3.5 Delete School
```bash
curl -X DELETE http://localhost:5000/api/schools/SCHOOL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Users Management

#### 4.1 Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "email": "newteacher@school.com",
    "firstName": "Marie",
    "lastName": "Diallo",
    "phone": "+224 622 123 456",
    "role": "teacher"
  }'
```

#### 4.2 List Users
```bash
curl -X GET "http://localhost:5000/api/users?schoolId=SCHOOL_ID&role=teacher" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4.3 Get User Details
```bash
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4.4 Update User
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "phone": "+224 666 123 456"
  }'
```

#### 4.5 Change User Role
```bash
curl -X PATCH http://localhost:5000/api/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "accountant"
  }'
```

#### 4.6 Deactivate User
```bash
curl -X PATCH http://localhost:5000/api/users/USER_ID/deactivate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Students Management

#### 5.1 Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "firstName": "Sougou",
    "lastName": "Camara",
    "email": "sougou@school.com",
    "phone": "+224 622 789 456",
    "gender": "M",
    "dateOfBirth": "2010-05-15"
  }'
```

#### 5.2 List Students
```bash
curl -X GET "http://localhost:5000/api/students?schoolId=SCHOOL_ID&page=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5.3 Get Student Details
```bash
curl -X GET http://localhost:5000/api/students/STUDENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5.4 Update Student
```bash
curl -X PUT http://localhost:5000/api/students/STUDENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@school.com",
    "phone": "+224 666 789 456"
  }'
```

#### 5.5 Enroll Student in Class
```bash
curl -X POST http://localhost:5000/api/students/STUDENT_ID/enroll \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "CLASS_ID",
    "enrollmentStatus": "active"
  }'
```

### 6. Classes Management

#### 6.1 Create Class
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "name": "Form 2B",
    "gradeLevel": 2,
    "teacherId": "TEACHER_ID",
    "capacity": 35
  }'
```

#### 6.2 List Classes
```bash
curl -X GET "http://localhost:5000/api/classes?schoolId=SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 6.3 Get Class Details
```bash
curl -X GET http://localhost:5000/api/classes/CLASS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 6.4 Update Class
```bash
curl -X PUT http://localhost:5000/api/classes/CLASS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Form 2B",
    "capacity": 40
  }'
```

#### 6.5 Delete Class
```bash
curl -X DELETE http://localhost:5000/api/classes/CLASS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Subjects Management

#### 7.1 Create Subject
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "name": "Physics",
    "code": "PHY"
  }'
```

#### 7.2 List Subjects
```bash
curl -X GET "http://localhost:5000/api/subjects?schoolId=SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7.3 Get Subject Details
```bash
curl -X GET http://localhost:5000/api/subjects/SUBJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7.4 Update Subject
```bash
curl -X PUT http://localhost:5000/api/subjects/SUBJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Physics Advanced"
  }'
```

#### 7.5 Delete Subject
```bash
curl -X DELETE http://localhost:5000/api/subjects/SUBJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Grades Management

#### 8.1 Record Grade
```bash
curl -X POST http://localhost:5000/api/grades \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "studentId": "STUDENT_ID",
    "subjectId": "SUBJECT_ID",
    "classId": "CLASS_ID",
    "score": 85.5,
    "term": "Term 1",
    "academicYear": "2024-2025",
    "notes": "Good progress"
  }'
```

#### 8.2 Get Student Grades
```bash
curl -X GET "http://localhost:5000/api/grades/student/STUDENT_ID?academicYear=2024-2025" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 8.3 Get Class Grades
```bash
curl -X GET "http://localhost:5000/api/grades/class/CLASS_ID?term=Term%201" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 8.4 Update Grade
```bash
curl -X PUT http://localhost:5000/api/grades/GRADE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 87.0,
    "notes": "Improved performance"
  }'
```

#### 8.5 Finalize Grade
```bash
curl -X PATCH http://localhost:5000/api/grades/GRADE_ID/finalize \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Timetable Management

#### 9.1 Create Timetable Entry
```bash
curl -X POST http://localhost:5000/api/timetable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "classId": "CLASS_ID",
    "subjectId": "SUBJECT_ID",
    "teacherId": "TEACHER_ID",
    "dayOfWeek": "Monday",
    "startTime": "08:00",
    "endTime": "09:30",
    "room": "Room 101"
  }'
```

#### 9.2 Get Class Timetable
```bash
curl -X GET "http://localhost:5000/api/timetable?classId=CLASS_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 9.3 Get Timetable Entry Details
```bash
curl -X GET http://localhost:5000/api/timetable/ENTRY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 9.4 Update Timetable Entry
```bash
curl -X PUT http://localhost:5000/api/timetable/ENTRY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "08:30",
    "endTime": "10:00"
  }'
```

#### 9.5 Delete Timetable Entry
```bash
curl -X DELETE http://localhost:5000/api/timetable/ENTRY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Invoices/Financial Management

#### 10.1 Create Invoice
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "SCHOOL_ID",
    "studentId": "STUDENT_ID",
    "description": "School fees for Term 1",
    "amount": 500000,
    "dueDate": "2024-12-31"
  }'
```

#### 10.2 List Invoices
```bash
curl -X GET "http://localhost:5000/api/invoices?schoolId=SCHOOL_ID&status=sent" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 10.3 Get Invoice Details
```bash
curl -X GET http://localhost:5000/api/invoices/INVOICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 10.4 Update Invoice
```bash
curl -X PUT http://localhost:5000/api/invoices/INVOICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sent",
    "dueDate": "2025-01-15"
  }'
```

#### 10.5 Record Payment
```bash
curl -X POST http://localhost:5000/api/invoices/INVOICE_ID/payment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250000,
    "paymentMethod": "bank_transfer",
    "transactionId": "TRX-2024-001"
  }'
```

#### 10.6 Financial Report
```bash
curl -X GET "http://localhost:5000/api/invoices/reports/summary?schoolId=SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Automated Test Commands

Save these as `test-api.sh` to test all endpoints:

```bash
#!/bin/bash

# Set variables
API="http://localhost:5000"
ADMIN_EMAIL="admin@friasoft-test.com"
ADMIN_PASS="password123"

echo "🚀 Starting API Tests..."

# 1. Health Check
echo "1️⃣  Testing health check..."
curl -s "$API/api/health" | jq '.'

# 2. Login
echo -e "\n2️⃣  Testing login..."
LOGIN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
TOKEN=$(echo $LOGIN | jq -r '.data.accessToken')
echo $LOGIN | jq '.'

# 3. Get Current User
echo -e "\n3️⃣  Testing get current user..."
curl -s -X GET "$API/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Add more tests for each endpoint...
```

## Performance Testing

Use Apache Bench or loadtest:

```bash
# Load test health endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:5000/api/health

# Load test with authentication (requires proper token)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/schools
```

## Common Issues & Solutions

### Issue: "Authorization header is missing"
**Solution**: Add `Authorization: Bearer YOUR_ACCESS_TOKEN` header to requests

### Issue: "Invalid token"
**Solution**: Login again and get a fresh token from the /api/auth/login endpoint

### Issue: "Database connection failed"
**Solution**:
1. Verify PostgreSQL is running
2. Check database credentials in .env
3. Run `npm run db:migrate` again

### Issue: "School not found" or "User not found"
**Solution**:
1. Run `npm run db:seed` to create test data
2. Use correct IDs from seeded data

## Next Steps

After testing all endpoints:
1. ✅ All endpoints working correctly
2. ✅ Database connections stable
3. ✅ Authentication/Authorization working
4. 🔄 Load testing results recorded
5. 🔄 Proceed to frontend development

---

**Need Help?**
- Check backend README: `./backend/README.md`
- Review endpoint documentation: `../BACKEND_COMPLETE.md`
- Check error logs in server console
