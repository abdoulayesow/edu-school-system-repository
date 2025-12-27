# Enrollment Status Definitions

This document defines the enrollment statuses used in the GSPN enrollment system.

## Status Overview

| Status | French Label | Description |
|--------|--------------|-------------|
| `draft` | Brouillon | In-progress enrollment, not yet submitted |
| `submitted` | Soumis | Submitted for review, auto-approves in 3 days |
| `needs_review` | En attente de validation | Requires director review (fee was adjusted) |
| `completed` | Termine | Approved and finalized |
| `rejected` | Rejete | Rejected by director (returned for changes) |
| `cancelled` | Annule | Cancelled by user |

---

## Status Lifecycle

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    v                                     │
┌─────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
│  draft  │───>│ submitted │───>│  completed   │    │ rejected │
└─────────┘    └───────────┘    └──────────────┘    └──────────┘
     │              │                   ^                 ^
     │              │                   │                 │
     │              v                   │                 │
     │        ┌──────────────┐          │                 │
     │        │ needs_review │──────────┴─────────────────┘
     │        └──────────────┘
     │
     v
┌───────────┐
│ cancelled │
└───────────┘
```

---

## Detailed Status Descriptions

### Draft (`draft`)

- **When**: Enrollment is being created or edited
- **Who**: Secretary, Accountant, or Director
- **Actions available**:
  - Edit enrollment details
  - Cancel enrollment (requires comment)
  - Submit enrollment
- **Auto behavior**:
  - Draft expires after 10 days of inactivity
  - Draft expiration resets on each save

### Submitted (`submitted`)

- **When**: Enrollment is submitted without tuition fee changes
- **Who**: System (after user submits)
- **Actions available**:
  - Director can complete (approve) with comment
  - Director can reject with reason
  - View details
- **Auto behavior**:
  - Auto-completes after 3 days if no action taken
  - `autoApproveAt` timestamp is set

### Needs Review (`needs_review`)

- **When**: Enrollment is submitted WITH tuition fee adjustment
- **Who**: System (when `adjustedTuitionFee` differs from `originalTuitionFee`)
- **Actions available**:
  - Director can complete (approve) with comment
  - Director can reject with reason
  - View details
- **Auto behavior**:
  - Does NOT auto-approve
  - Requires manual director action

### Completed (`completed`)

- **When**: Enrollment is approved by director or auto-approved
- **Who**: Director (manual) or System (auto)
- **Actions available**:
  - View details
  - Record payments
  - Download PDF
  - Add notes
- **Required data**:
  - `statusComment` - Approval comment
  - `statusChangedAt` - When approved
  - `statusChangedBy` - Who approved

### Rejected (`rejected`)

- **When**: Director rejects the enrollment
- **Who**: Director only
- **Actions available**:
  - View details
  - View rejection reason
- **Required data**:
  - `statusComment` - Rejection reason (required)
  - `statusChangedAt` - When rejected
  - `statusChangedBy` - Who rejected
- **Notes**:
  - Creates an `EnrollmentNote` with the rejection reason
  - User can start a new enrollment if needed

### Cancelled (`cancelled`)

- **When**: User cancels a draft enrollment
- **Who**: Creator or Director
- **Actions available**:
  - View details
  - View cancellation reason
- **Required data**:
  - `statusComment` - Cancellation reason (required)
  - `statusChangedAt` - When cancelled
  - `statusChangedBy` - Who cancelled

---

## Status Change Fields

When status changes to `completed`, `rejected`, or `cancelled`, these fields are populated:

| Field | Type | Description |
|-------|------|-------------|
| `statusComment` | String | Required comment/reason for the status change |
| `statusChangedAt` | DateTime | When the status was changed |
| `statusChangedBy` | String | User ID who changed the status |

---

## API Endpoints by Status

### Transition: draft → submitted
```
POST /api/enrollments/[id]/submit
```

### Transition: submitted/needs_review → completed
```
POST /api/enrollments/[id]/approve
Body: { "comment": "Approval reason" }
```

### Transition: submitted/needs_review → rejected
```
DELETE /api/enrollments/[id]/approve
Body: { "reason": "Rejection reason" }
```

### Transition: draft → cancelled
```
POST /api/enrollments/[id]/cancel
Body: { "reason": "Cancellation reason" }
```

---

## Badge Styling

| Status | Color | Icon |
|--------|-------|------|
| `draft` | Gray (secondary) | FileText |
| `submitted` | Blue (default) | Clock |
| `needs_review` | Yellow (outline) | AlertCircle |
| `completed` | Green (default) | CheckCircle |
| `rejected` | Red (destructive) | XCircle |
| `cancelled` | Gray (secondary) | XCircle |

---

## Permission Matrix

| Action | Secretary | Accountant | Director |
|--------|-----------|------------|----------|
| Create enrollment | Yes | Yes | Yes |
| Edit draft | Creator only | Creator only | All |
| Submit enrollment | Creator only | Creator only | All |
| Complete (approve) | No | No | Yes |
| Reject | No | No | Yes |
| Cancel draft | Creator only | Creator only | All |
| View all | Yes | Yes | Yes |
| Record payments | Yes | Yes | Yes |

---

## Related Documentation

- [README](./README.md) - Enrollment system overview
- [API Reference](./api-reference.md) - Full API documentation
- [Database Schema](./database-schema.md) - Data model
