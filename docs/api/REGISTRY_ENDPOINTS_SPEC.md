# Registry-Based Cash Management - API Endpoints Specification

**Version:** 1.0
**Date:** 2026-01-11
**Base URL:** `/api`

---

## Table of Contents

1. [Modified Endpoints](#modified-endpoints)
2. [New Endpoints](#new-endpoints)
3. [Data Models](#data-models)
4. [Error Responses](#error-responses)
5. [Authentication](#authentication)

---

## Modified Endpoints

These are existing endpoints that need to be updated for Registry support.

### POST /api/payments

**Status:** MODIFIED (use registryBalance instead of safeBalance)

**Description:** Record a new payment (tuition or activity fee)

**Authorization:** director, accountant, secretary

**Request Body:**
```typescript
{
  enrollmentId: string        // Required
  amount: number              // Required, positive integer
  method: "cash" | "orange_money"  // Required
  receiptNumber: string       // Required, unique
  transactionRef?: string     // Optional, for Orange Money reference
  receiptImageUrl?: string    // Optional, uploaded receipt image
  notes?: string              // Optional
  paymentScheduleId?: string  // Optional, specific schedule to pay
}
```

**Success Response:** `201 Created`
```json
{
  "id": "cly123abc",
  "enrollmentId": "enr456def",
  "amount": 2500000,
  "method": "cash",
  "status": "confirmed",
  "receiptNumber": "CAISSE-20260111-REC-0001",
  "recordedAt": "2026-01-11T14:30:00Z",
  "recordedBy": "user789",
  "enrollment": {
    "id": "enr456def",
    "student": {
      "id": "stu123",
      "firstName": "John",
      "lastName": "Doe",
      "studentNumber": "ST-2024-001"
    },
    "grade": {
      "id": "grade789",
      "name": "6eme"
    }
  },
  "recorder": {
    "id": "user789",
    "name": "Jane Smith"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
  ```json
  {
    "message": "Amount exceeds remaining balance of 2000000 GNF"
  }
  ```
- `404 Not Found` - Enrollment not found
- `500 Internal Server Error` - Server error

**Changed Business Logic:**
```typescript
// OLD (incorrect)
if (method === "cash") {
  newSafeBalance = currentBalance.safeBalance + amount
  await tx.treasuryBalance.update({
    data: { safeBalance: newSafeBalance }
  })
}

// NEW (correct)
if (method === "cash") {
  newRegistryBalance = currentBalance.registryBalance + amount
  await tx.treasuryBalance.update({
    data: { registryBalance: newRegistryBalance }
  })

  await tx.safeTransaction.create({
    data: {
      type: "student_payment",
      direction: "in",
      amount,
      registryBalanceAfter: newRegistryBalance,  // NEW field
      safeBalanceAfter: currentBalance.safeBalance,
      // ...
    }
  })
}

// For Orange Money
if (method === "orange_money") {
  newMobileMoneyBalance = currentBalance.mobileMoneyBalance + amount
  await tx.treasuryBalance.update({
    data: { mobileMoneyBalance: newMobileMoneyBalance }
  })
}
```

**Database Changes:**
- Updates `TreasuryBalance.registryBalance` (for cash)
- Updates `TreasuryBalance.mobileMoneyBalance` (for Orange Money)
- Creates `Payment` record (status: confirmed)
- Creates `SafeTransaction` record with `registryBalanceAfter`

---

### POST /api/expenses/[id]/pay

**Status:** MODIFIED (check registryBalance for cash expenses)

**Description:** Mark an approved expense as paid and deduct from treasury

**Authorization:** director, accountant

**URL Parameters:**
- `id` - Expense ID

**Request Body:**
```typescript
{
  notes?: string  // Optional notes about payment
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Expense paid successfully",
  "expense": {
    "id": "exp123",
    "category": "supplies",
    "description": "Office supplies",
    "amount": 250000,
    "method": "cash",
    "status": "paid",
    "paidAt": "2026-01-11T15:00:00Z",
    "requester": {
      "id": "user456",
      "name": "John Doe"
    },
    "approver": {
      "id": "user123",
      "name": "Director"
    }
  },
  "newRegistryBalance": 2250000
}
```

**Error Responses:**
- `400 Bad Request` - Insufficient funds or invalid status
  ```json
  {
    "message": "Fonds insuffisants dans la caisse",
    "available": 100000,
    "required": 250000
  }
  ```
- `404 Not Found` - Expense not found
- `500 Internal Server Error` - Server error

**Changed Business Logic:**
```typescript
// OLD (incorrect)
if (method === "cash") {
  if (currentBalance.safeBalance < amount) {
    throw new Error("Insufficient funds in safe")
  }
  newSafeBalance = currentBalance.safeBalance - amount
  await tx.treasuryBalance.update({
    data: { safeBalance: newSafeBalance }
  })
}

// NEW (correct)
if (method === "cash") {
  if (currentBalance.registryBalance < amount) {
    throw new Error("Insufficient funds in registry")
  }
  newRegistryBalance = currentBalance.registryBalance - amount
  await tx.treasuryBalance.update({
    data: { registryBalance: newRegistryBalance }
  })

  await tx.safeTransaction.create({
    data: {
      type: "expense_payment",
      direction: "out",
      amount,
      registryBalanceAfter: newRegistryBalance,  // NEW field
      safeBalanceAfter: currentBalance.safeBalance,
      // ...
    }
  })
}

// For Orange Money
if (method === "orange_money") {
  if (currentBalance.mobileMoneyBalance < amount) {
    throw new Error("Solde Orange Money insuffisant")
  }
  newMobileMoneyBalance = currentBalance.mobileMoneyBalance - amount
  await tx.treasuryBalance.update({
    data: { mobileMoneyBalance: newMobileMoneyBalance }
  })
}
```

**Database Changes:**
- Updates `TreasuryBalance.registryBalance` (decreases for cash)
- Updates `TreasuryBalance.mobileMoneyBalance` (decreases for Orange Money)
- Updates `Expense.status` to "paid"
- Updates `Expense.paidAt` to current timestamp
- Creates `SafeTransaction` record

---

### GET /api/treasury/balance

**Status:** MODIFIED (include registryBalance in response)

**Description:** Get current treasury balances

**Authorization:** director, accountant, secretary

**Success Response:** `200 OK`
```json
{
  "id": "bal123",
  "registryBalance": 2500000,  // NEW field
  "safeBalance": 15000000,
  "bankBalance": 420000000,
  "mobileMoneyBalance": 27500000,
  "registryFloatAmount": 2000000,  // NEW field
  "safeThresholdMax": 20000000,
  "lastVerifiedAt": "2026-01-11T08:00:00Z",
  "lastVerifiedBy": "user123"
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

**Changed Response:**
- Added `registryBalance` field
- Added `registryFloatAmount` field

---

## New Endpoints

These are completely new endpoints to support Registry operations.

### POST /api/treasury/daily-opening

**Status:** NEW

**Description:** Morning process - verify safe balance and withdraw float to registry

**Authorization:** director, accountant

**Request Body:**
```typescript
{
  countedSafeBalance: number  // Required, actual counted cash in safe
  floatAmount: number         // Required, amount to withdraw (default 2,000,000)
  notes?: string              // Optional, required if large discrepancy
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "discrepancy": 0,
  "expectedBalance": 15000000,
  "countedBalance": 15000000,
  "safeBalance": 13000000,
  "registryBalance": 2000000,
  "transaction": {
    "id": "txn123",
    "type": "safe_to_registry",
    "amount": 2000000,
    "safeBalanceBefore": 15000000,
    "safeBalanceAfter": 13000000,
    "registryBalanceAfter": 2000000,
    "recordedAt": "2026-01-11T08:00:00Z",
    "recordedBy": "user123"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or already opened
  ```json
  {
    "message": "Already opened today",
    "existingOpening": {
      "recordedAt": "2026-01-11T08:30:00Z"
    }
  }
  ```
  ```json
  {
    "message": "Large discrepancy requires explanation",
    "discrepancy": 500000,
    "expectedBalance": 15000000,
    "countedBalance": 15500000
  }
  ```
  ```json
  {
    "message": "Insufficient funds in safe for float withdrawal",
    "available": 1500000,
    "required": 2000000
  }
  ```
- `500 Internal Server Error` - Server error

**Business Logic:**
```typescript
// 1. Get current balance
const currentBalance = await prisma.treasuryBalance.findFirst()

// 2. Calculate discrepancy
const expectedBalance = currentBalance.safeBalance
const discrepancy = countedSafeBalance - expectedBalance

// 3. Validate discrepancy
if (Math.abs(discrepancy) > 100000 && !notes) {
  throw new Error("Large discrepancy requires explanation")
}

// 4. Check if already opened today
const existingOpening = await prisma.safeTransaction.findFirst({
  where: {
    type: "safe_to_registry",
    recordedAt: {
      gte: startOfDay(today),
      lte: endOfDay(today),
    },
  },
})
if (existingOpening) {
  throw new Error("Already opened today")
}

// 5. Check sufficient funds
if (countedSafeBalance < floatAmount) {
  throw new Error("Insufficient funds in safe for float withdrawal")
}

// 6. Create transaction and update balances
await prisma.$transaction(async (tx) => {
  // Create SafeTransaction
  const transaction = await tx.safeTransaction.create({
    data: {
      type: "safe_to_registry",
      direction: "out",  // From safe perspective
      amount: floatAmount,
      safeBalanceAfter: countedSafeBalance - floatAmount,
      registryBalanceAfter: floatAmount,
      bankBalanceAfter: currentBalance.bankBalance,
      description: `Ouverture journalière - Retrait de fonds de caisse`,
      recordedBy: session.user.id,
      notes,
    },
  })

  // Update balances
  await tx.treasuryBalance.update({
    where: { id: currentBalance.id },
    data: {
      safeBalance: countedSafeBalance - floatAmount,
      registryBalance: floatAmount,
    },
  })

  return transaction
})
```

**Database Changes:**
- Updates `TreasuryBalance.safeBalance` (decreases)
- Updates `TreasuryBalance.registryBalance` (increases)
- Creates `SafeTransaction` (type: safe_to_registry)

---

### POST /api/treasury/daily-closing

**Status:** NEW

**Description:** Evening process - count registry and deposit all to safe

**Authorization:** director, accountant

**Request Body:**
```typescript
{
  countedRegistryBalance: number  // Required, actual counted cash in registry
  notes?: string                  // Optional, required if discrepancy
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "discrepancy": 0,
  "expectedBalance": 2250000,
  "countedBalance": 2250000,
  "safeBalance": 15250000,
  "registryBalance": 0,
  "transaction": {
    "id": "txn456",
    "type": "registry_to_safe",
    "amount": 2250000,
    "safeBalanceBefore": 13000000,
    "safeBalanceAfter": 15250000,
    "registryBalanceAfter": 0,
    "recordedAt": "2026-01-11T18:00:00Z",
    "recordedBy": "user123"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
  ```json
  {
    "message": "Already closed today"
  }
  ```
  ```json
  {
    "message": "Must open registry before closing"
  }
  ```
  ```json
  {
    "message": "Discrepancy requires explanation",
    "discrepancy": 50000,
    "expectedBalance": 2250000,
    "countedBalance": 2300000
  }
  ```
- `500 Internal Server Error` - Server error

**Business Logic:**
```typescript
// 1. Get current balance
const currentBalance = await prisma.treasuryBalance.findFirst()

// 2. Calculate expected and discrepancy
const expectedBalance = currentBalance.registryBalance
const discrepancy = countedRegistryBalance - expectedBalance

// 3. Validate discrepancy
if (Math.abs(discrepancy) > 10000 && !notes) {
  throw new Error("Discrepancy requires explanation")
}

// 4. Check if already closed today
const existingClosing = await prisma.safeTransaction.findFirst({
  where: {
    type: "registry_to_safe",
    recordedAt: {
      gte: startOfDay(today),
      lte: endOfDay(today),
    },
  },
})
if (existingClosing) {
  throw new Error("Already closed today")
}

// 5. Check if opened today
const todayOpening = await prisma.safeTransaction.findFirst({
  where: {
    type: "safe_to_registry",
    recordedAt: {
      gte: startOfDay(today),
      lte: endOfDay(today),
    },
  },
})
if (!todayOpening) {
  throw new Error("Must open registry before closing")
}

// 6. Create transaction and update balances
await prisma.$transaction(async (tx) => {
  const transaction = await tx.safeTransaction.create({
    data: {
      type: "registry_to_safe",
      direction: "in",  // From safe perspective
      amount: countedRegistryBalance,
      safeBalanceAfter: currentBalance.safeBalance + countedRegistryBalance,
      registryBalanceAfter: 0,
      bankBalanceAfter: currentBalance.bankBalance,
      description: `Clôture journalière - Dépôt dans le coffre`,
      recordedBy: session.user.id,
      notes,
    },
  })

  await tx.treasuryBalance.update({
    where: { id: currentBalance.id },
    data: {
      safeBalance: currentBalance.safeBalance + countedRegistryBalance,
      registryBalance: 0,
    },
  })

  return transaction
})
```

**Database Changes:**
- Updates `TreasuryBalance.safeBalance` (increases)
- Updates `TreasuryBalance.registryBalance` (becomes 0)
- Creates `SafeTransaction` (type: registry_to_safe)

---

### GET /api/students/search

**Status:** NEW

**Description:** Fast student search for payment wizard (by number, name, or grade)

**Authorization:** all authenticated users

**Query Parameters:**
- `q` - Search query (student number, first name, last name) - **Required**
- `limit` - Max results to return (default: 10, max: 50) - **Optional**
- `includeEnrollment` - Include current enrollment data (default: true) - **Optional**
- `status` - Filter by student status (default: "active") - **Optional**

**Examples:**
```
GET /api/students/search?q=ST-2024-001
GET /api/students/search?q=John&limit=5
GET /api/students/search?q=6eme&includeEnrollment=true
```

**Success Response:** `200 OK`
```json
{
  "students": [
    {
      "id": "stu123",
      "studentNumber": "ST-2024-001",
      "firstName": "John",
      "lastName": "Doe",
      "photoUrl": "https://cdn.example.com/photos/stu123.jpg",
      "status": "active",
      "currentEnrollment": {
        "id": "enr456",
        "enrollmentNumber": "ENR-2024-001",
        "status": "completed",
        "schoolYearId": "year789",
        "grade": {
          "id": "grade789",
          "name": "6eme",
          "level": "middle"
        },
        "tuitionFee": 10000000,
        "totalPaid": 7500000,
        "remainingBalance": 2500000,
        "paymentProgress": 0.75,
        "lastPaymentDate": "2025-12-15T10:00:00Z"
      }
    },
    {
      "id": "stu456",
      "studentNumber": "ST-2024-002",
      "firstName": "Jane",
      "lastName": "Smith",
      "photoUrl": null,
      "status": "active",
      "currentEnrollment": {
        "id": "enr789",
        "enrollmentNumber": "ENR-2024-002",
        "status": "completed",
        "schoolYearId": "year789",
        "grade": {
          "id": "grade790",
          "name": "5eme",
          "level": "middle"
        },
        "tuitionFee": 10000000,
        "totalPaid": 10000000,
        "remainingBalance": 0,
        "paymentProgress": 1.0,
        "lastPaymentDate": "2025-09-30T14:00:00Z"
      }
    }
  ],
  "total": 2,
  "limit": 10,
  "query": "ST-2024"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid query
  ```json
  {
    "message": "Query parameter 'q' is required",
    "errors": {
      "q": "Required field"
    }
  }
  ```
- `500 Internal Server Error` - Server error

**Search Logic:**
```typescript
const searchQuery = query.toLowerCase().trim()

const students = await prisma.student.findMany({
  where: {
    AND: [
      {
        OR: [
          { studentNumber: { contains: searchQuery, mode: "insensitive" } },
          { firstName: { contains: searchQuery, mode: "insensitive" } },
          { lastName: { contains: searchQuery, mode: "insensitive" } },
          {
            // Combined first + last name search
            AND: [
              { firstName: { contains: searchQuery.split(" ")[0], mode: "insensitive" } },
              { lastName: { contains: searchQuery.split(" ")[1] || "", mode: "insensitive" } },
            ],
          },
        ],
      },
      { status: status || "active" },
    ],
  },
  include: {
    enrollments: {
      where: {
        schoolYear: { isActive: true },
        status: { in: ["completed", "submitted", "needs_review"] },
      },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        payments: {
          where: { status: "confirmed" },
          select: {
            amount: true,
            recordedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    },
  },
  orderBy: [
    { studentNumber: "asc" },
    { firstName: "asc" },
  ],
  take: Math.min(limit, 50),
})

// Calculate payment progress for each student
const studentsWithProgress = students.map((student) => {
  const enrollment = student.enrollments[0]
  if (!enrollment) return { ...student, currentEnrollment: null }

  const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
  const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
  const remainingBalance = tuitionFee - totalPaid
  const paymentProgress = tuitionFee > 0 ? totalPaid / tuitionFee : 0
  const lastPaymentDate = enrollment.payments.length > 0
    ? enrollment.payments[enrollment.payments.length - 1].recordedAt
    : null

  return {
    ...student,
    currentEnrollment: {
      ...enrollment,
      tuitionFee,
      totalPaid,
      remainingBalance,
      paymentProgress,
      lastPaymentDate,
    },
  }
})

return {
  students: studentsWithProgress,
  total: studentsWithProgress.length,
  limit,
  query,
}
```

**Performance Considerations:**
- Use database indexes on `studentNumber`, `firstName`, `lastName`
- Limit results to prevent slow queries
- Consider caching for frequently searched students
- Use `select` to only fetch needed fields

---

### GET /api/treasury/daily-operations/status

**Status:** NEW

**Description:** Check if daily opening/closing has been performed today

**Authorization:** director, accountant, secretary

**Success Response:** `200 OK`
```json
{
  "today": "2026-01-11",
  "opening": {
    "completed": true,
    "transaction": {
      "id": "txn123",
      "recordedAt": "2026-01-11T08:00:00Z",
      "amount": 2000000,
      "recordedBy": {
        "id": "user123",
        "name": "Jane Smith"
      }
    }
  },
  "closing": {
    "completed": false,
    "transaction": null
  },
  "registryBalance": 2500000,
  "expectedRegistryBalance": 2500000
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

**Use Case:**
- Display banner on treasury dashboard: "Don't forget to close the registry at end of day!"
- Show checkmark when opening/closing completed
- Quick status check without fetching full transaction list

---

## Data Models

### TreasuryBalance (Updated)

```typescript
type TreasuryBalance = {
  id: string
  registryBalance: number         // NEW - Active cash register
  safeBalance: number             // Secure overnight storage
  bankBalance: number             // Bank account
  mobileMoneyBalance: number      // Orange Money account
  registryFloatAmount: number     // NEW - Standard daily float (default 2M)
  safeThresholdMax: number        // Trigger for bank deposit (default 20M)
  lastVerifiedAt: Date | null
  lastVerifiedBy: string | null
  syncVersion: number
  createdAt: Date
  updatedAt: Date
}
```

### SafeTransaction (Updated)

```typescript
type SafeTransaction = {
  id: string
  type: SafeTransactionType
  direction: "in" | "out"
  amount: number
  registryBalanceAfter: number | null  // NEW field
  safeBalanceAfter: number
  bankBalanceAfter: number | null
  mobileMoneyBalanceAfter: number | null
  description: string | null
  referenceType: string | null
  referenceId: string | null
  studentId: string | null
  payerName: string | null
  beneficiaryName: string | null
  category: string | null
  receiptNumber: string | null
  recordedBy: string
  recordedAt: Date
  notes: string | null
  isReversal: boolean
  reversalReason: string | null
  reversedBy: string | null
  reversedAt: Date | null
  originalTransactionId: string | null
  syncVersion: number
  createdAt: Date
  updatedAt: Date
}
```

### SafeTransactionType (Updated Enum)

```typescript
enum SafeTransactionType {
  // Existing
  student_payment
  activity_payment
  other_income
  expense_payment
  bank_deposit
  bank_withdrawal
  adjustment
  mobile_money_income
  mobile_money_payment
  mobile_money_fee
  reversal_student_payment
  reversal_expense_payment
  reversal_bank_deposit
  reversal_mobile_money

  // NEW types
  registry_to_safe        // Evening deposit
  safe_to_registry        // Morning withdrawal
  registry_adjustment     // Manual corrections
}
```

### Student Search Response

```typescript
type StudentSearchResult = {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  photoUrl: string | null
  status: StudentStatus
  currentEnrollment: CurrentEnrollment | null
}

type CurrentEnrollment = {
  id: string
  enrollmentNumber: string
  status: EnrollmentStatus
  schoolYearId: string
  grade: {
    id: string
    name: string
    level: SchoolLevel
  }
  tuitionFee: number
  totalPaid: number
  remainingBalance: number
  paymentProgress: number  // 0.0 to 1.0
  lastPaymentDate: Date | null
}
```

---

## Error Responses

All endpoints follow consistent error response format:

### Validation Error (400 Bad Request)
```json
{
  "message": "Validation error",
  "errors": {
    "fieldName": "Error message for this field"
  }
}
```

### Unauthorized (401 Unauthorized)
```json
{
  "message": "Authentication required"
}
```

### Forbidden (403 Forbidden)
```json
{
  "message": "Insufficient permissions",
  "requiredRoles": ["director", "accountant"]
}
```

### Not Found (404 Not Found)
```json
{
  "message": "Resource not found",
  "resource": "Student",
  "id": "stu123"
}
```

### Business Logic Error (400 Bad Request)
```json
{
  "message": "Insufficient funds in registry",
  "available": 100000,
  "required": 250000
}
```

### Server Error (500 Internal Server Error)
```json
{
  "message": "Internal server error",
  "requestId": "req-abc123"  // For debugging
}
```

---

## Authentication

All endpoints require authentication via session cookie or JWT token.

### Session-Based Auth
```typescript
const { session, error } = await requireSession()
if (error) return error  // Returns 401 response

// Use session.user.id for operations
```

### Role-Based Auth
```typescript
const { session, error } = await requireRole(["director", "accountant"])
if (error) return error  // Returns 403 response if wrong role
```

### Role Permissions Matrix

| Endpoint | Director | Accountant | Secretary | Teacher | Parent |
|----------|----------|------------|-----------|---------|--------|
| POST /api/payments | ✅ | ✅ | ✅ | ❌ | ❌ |
| POST /api/expenses/:id/pay | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/treasury/balance | ✅ | ✅ | ✅ | ❌ | ❌ |
| POST /api/treasury/daily-opening | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /api/treasury/daily-closing | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/students/search | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/treasury/daily-operations/status | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Testing Endpoints

### Using curl

**Record Payment:**
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=xxx" \
  -d '{
    "enrollmentId": "enr123",
    "amount": 2500000,
    "method": "cash",
    "receiptNumber": "CAISSE-20260111-REC-0001"
  }'
```

**Daily Opening:**
```bash
curl -X POST http://localhost:8000/api/treasury/daily-opening \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=xxx" \
  -d '{
    "countedSafeBalance": 15000000,
    "floatAmount": 2000000
  }'
```

**Student Search:**
```bash
curl -X GET "http://localhost:8000/api/students/search?q=John&limit=5" \
  -H "Cookie: next-auth.session-token=xxx"
```

### Using Postman

Import collection with:
- Base URL: `http://localhost:8000`
- Authentication: Session cookie or JWT
- Environment variables for testing

---

## Rate Limiting

Consider adding rate limiting to prevent abuse:

| Endpoint | Rate Limit |
|----------|------------|
| POST /api/payments | 60 requests/minute |
| GET /api/students/search | 100 requests/minute |
| POST /api/treasury/daily-opening | 10 requests/hour |
| POST /api/treasury/daily-closing | 10 requests/hour |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-11 | Initial API specification |

---

**END OF API SPECIFICATION**
