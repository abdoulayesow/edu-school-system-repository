# Payment Wizard Component Specification

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

The Payment Wizard is a 3-step component for recording student tuition and activity payments. It replaces the current simple payment form with a guided, user-friendly wizard experience that leverages the enrollment wizard patterns and the frontend-design-gspn skill for modern UI.

### Key Requirements

- **Direct to Registry**: Cash payments go directly to `registryBalance` (not safe), considered immediately paid
- **No Validation Required**: Payments are confirmed instantly without approval workflow
- **Student Search**: Quick search by student number, grade, or full name
- **Payment Progress**: Visual progress bar showing tuition payment completion
- **PDF Receipt**: Auto-generate and print receipt for parents
- **Consistent UX**: Match enrollment wizard visual design and logic

## User Flows

### Flow 1: Payment from Student Page

1. User clicks "Record Payment" on student profile
2. Wizard opens with student pre-selected (Step 1 auto-completed)
3. User enters payment details (Step 2)
4. User reviews and submits (Step 3)
5. Success screen shows recap + PDF receipt download

### Flow 2: Payment from Standalone Page

1. User navigates to `/payments/new`
2. Step 1: Search and select student
3. Step 2: Enter payment details
4. Step 3: Review and submit
5. Success screen with PDF receipt

## Wizard Steps

### Step 1: Student Selection

**Purpose**: Identify the student for payment

**UI Elements**:
- If coming from student page: Display student card with confirmation
- If standalone: Search interface with filters

**Student Card** (pre-selected):
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center gap-4">
      <Avatar size="lg">
        {student.photoUrl ? <img src={student.photoUrl} /> : <User />}
      </Avatar>
      <div>
        <h3 className="font-semibold">{student.fullName}</h3>
        <p className="text-sm text-muted-foreground">
          Student #{student.studentNumber}
        </p>
        <Badge>{student.gradeName}</Badge>
      </div>
    </div>
    <Button variant="ghost" onClick={changeStudent}>
      Change Student
    </Button>
  </CardContent>
</Card>
```

**Search Interface** (standalone):
```tsx
<div className="space-y-4">
  <div className="flex gap-2">
    <Input
      placeholder="Search by name or student number..."
      value={searchQuery}
      onChange={handleSearch}
      icon={<Search />}
    />
  </div>

  <div className="flex gap-2">
    <Select placeholder="All Grades" onValueChange={setGradeFilter}>
      {grades.map(g => <SelectItem value={g.id}>{g.name}</SelectItem>)}
    </Select>
    <Select placeholder="All Levels" onValueChange={setLevelFilter}>
      <SelectItem value="kindergarten">Kindergarten</SelectItem>
      <SelectItem value="primary">Primary</SelectItem>
      <SelectItem value="middle">Middle School</SelectItem>
      <SelectItem value="high">High School</SelectItem>
    </Select>
  </div>

  <div className="grid gap-2 max-h-96 overflow-y-auto">
    {searchResults.map(student => (
      <StudentSearchCard
        student={student}
        onClick={() => selectStudent(student)}
      />
    ))}
  </div>
</div>
```

**Validation**:
- Must have a student selected to proceed

### Step 2: Payment Details

**Purpose**: Collect payment information and show progress

**UI Sections**:

1. **Payment Type Selector** (Tuition vs Activities)
```tsx
<RadioGroup value={paymentType} onValueChange={setPaymentType}>
  <Label className="border rounded-lg p-4 cursor-pointer">
    <RadioGroupItem value="tuition" />
    <div>
      <span className="font-medium">Tuition Payment</span>
      <p className="text-sm text-muted-foreground">
        Regular school year tuition
      </p>
    </div>
  </Label>
  <Label className="border rounded-lg p-4 cursor-pointer">
    <RadioGroupItem value="activity" />
    <div>
      <span className="font-medium">Activity Payment</span>
      <p className="text-sm text-muted-foreground">
        Extra-curricular activities
      </p>
    </div>
  </Label>
</RadioGroup>
```

2. **Tuition Progress Card** (if tuition selected)
```tsx
<Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
  <CardHeader>
    <CardTitle>Tuition Progress</CardTitle>
    <CardDescription>
      {schoolYear.name} - {student.gradeName}
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Progress Bar */}
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>Paid</span>
        <span className="font-semibold">
          {formatCurrency(totalPaid)} / {formatCurrency(totalTuition)}
        </span>
      </div>
      <Progress value={percentPaid} className="h-3" />
      <p className="text-xs text-muted-foreground mt-1">
        {percentPaid.toFixed(1)}% complete
      </p>
    </div>

    {/* Month Coverage */}
    <div>
      <p className="text-sm font-medium mb-2">Covered Months</p>
      <div className="flex flex-wrap gap-2">
        {SCHOOL_MONTHS.map(month => (
          <Badge
            key={month}
            variant={coveredMonths.includes(month) ? "default" : "outline"}
            className={cn(
              coveredMonths.includes(month) &&
              "bg-green-600 text-white"
            )}
          >
            {coveredMonths.includes(month) && <Check className="w-3 h-3 mr-1" />}
            {month}
          </Badge>
        ))}
      </div>
    </div>

    {/* Remaining Balance */}
    <div className="flex justify-between items-center pt-2 border-t">
      <span className="text-sm text-muted-foreground">Remaining</span>
      <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
        {formatCurrency(remainingBalance)}
      </span>
    </div>
  </CardContent>
</Card>
```

3. **Activity Selector** (if activity selected)
```tsx
<Select placeholder="Select activity" onValueChange={setActivityId}>
  {activities.map(activity => (
    <SelectItem value={activity.id}>
      {activity.name} - {formatCurrency(activity.fee)}
    </SelectItem>
  ))}
</Select>
```

4. **Payment Method**
```tsx
<RadioGroup value={paymentMethod} onValueChange={handleMethodChange}>
  <Label className={cn(
    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
    paymentMethod === "cash" && "border-amber-500 bg-amber-50"
  )}>
    <RadioGroupItem value="cash" />
    <Banknote className="w-5 h-5" />
    <span>Cash Payment</span>
  </Label>
  <Label className={cn(
    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
    paymentMethod === "orange_money" && "border-amber-500 bg-amber-50"
  )}>
    <RadioGroupItem value="orange_money" />
    <Smartphone className="w-5 h-5" />
    <span>Orange Money</span>
  </Label>
  <Label className={cn(
    "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
    paymentMethod === "bank_transfer" && "border-amber-500 bg-amber-50"
  )}>
    <RadioGroupItem value="bank_transfer" />
    <Building className="w-5 h-5" />
    <span>Bank Transfer</span>
  </Label>
</RadioGroup>
```

5. **Amount Input**
```tsx
<div className="space-y-2">
  <Label htmlFor="amount">Amount (GNF)</Label>
  <Input
    id="amount"
    type="text"
    value={amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
    onChange={handleAmountChange}
    placeholder="500 000"
    className="text-lg"
  />
  {paymentType === "tuition" && (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAmount(remainingBalance)}
      >
        Pay Remaining ({formatCurrency(remainingBalance)})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAmount(monthlyAmount)}
      >
        One Month ({formatCurrency(monthlyAmount)})
      </Button>
    </div>
  )}
</div>
```

6. **Auto-Generated Receipt Number**
```tsx
<div className="space-y-2">
  <Label>Receipt Number</Label>
  <div className="relative">
    <Input
      value={receiptNumber}
      readOnly
      className="font-mono bg-amber-50 dark:bg-muted"
    />
    {isGenerating && (
      <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin" />
    )}
  </div>
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
    <span>Unique receipt ID</span>
  </div>
</div>
```

7. **Transaction Reference** (if Orange Money or Bank Transfer)
```tsx
{paymentMethod === "orange_money" && (
  <div className="space-y-2">
    <Label>Orange Money Transaction ID</Label>
    <Input
      value={transactionRef}
      onChange={e => setTransactionRef(e.target.value)}
      placeholder="MP20260111XXXXX"
    />
  </div>
)}
```

8. **Notes** (Optional)
```tsx
<div className="space-y-2">
  <Label htmlFor="notes">Notes (Optional)</Label>
  <Textarea
    id="notes"
    value={notes}
    onChange={e => setNotes(e.target.value)}
    placeholder="Additional information..."
    rows={3}
  />
</div>
```

**Validation**:
- Payment type required
- Payment method required
- Amount > 0 required
- Receipt number auto-generated
- Transaction ref required for Orange Money
- If tuition: show live preview of updated progress

**Live Preview**:
As amount is entered, show real-time update of:
- New percent paid
- Newly covered months (highlighted)
- New remaining balance

### Step 3: Review and Submit

**Purpose**: Final confirmation before recording payment

**UI Layout**:

```tsx
<div className="space-y-6">
  <h3 className="text-lg font-semibold">Review Payment Details</h3>

  {/* Student Info */}
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Student Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Name</span>
        <span className="font-medium">{student.fullName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Student Number</span>
        <span className="font-mono">{student.studentNumber}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Grade</span>
        <Badge>{student.gradeName}</Badge>
      </div>
    </CardContent>
  </Card>

  {/* Payment Info */}
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Payment Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Type</span>
        <Badge variant="secondary">
          {paymentType === "tuition" ? "Tuition" : "Activity"}
        </Badge>
      </div>
      {paymentType === "activity" && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Activity</span>
          <span className="font-medium">{selectedActivity.name}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Method</span>
        <span className="font-medium capitalize">
          {paymentMethod.replace("_", " ")}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-lg font-bold text-green-600">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Receipt Number</span>
        <span className="font-mono text-sm">{receiptNumber}</span>
      </div>
      {transactionRef && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction Ref</span>
          <span className="font-mono text-sm">{transactionRef}</span>
        </div>
      )}
      {notes && (
        <div className="space-y-1">
          <span className="text-muted-foreground">Notes</span>
          <p className="text-sm">{notes}</p>
        </div>
      )}
    </CardContent>
  </Card>

  {/* Updated Progress (if tuition) */}
  {paymentType === "tuition" && (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Updated Tuition Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Previous</span>
          <span>{previousPercentPaid.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between font-bold text-green-600">
          <span>After Payment</span>
          <span>{newPercentPaid.toFixed(1)}%</span>
        </div>
        <Progress value={newPercentPaid} className="h-3" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-semibold">
            {formatCurrency(newRemainingBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  )}

  {/* Confirmation */}
  <Alert>
    <AlertCircle className="w-4 h-4" />
    <AlertDescription>
      This payment will be recorded immediately in the registry.
      Please ensure all information is correct.
    </AlertDescription>
  </Alert>
</div>
```

**Validation**:
- Review is always valid (just confirmation)

### Step 4: Success and PDF Receipt

**Purpose**: Confirm success and provide receipt

**UI Layout**:

```tsx
<div className="space-y-6 text-center">
  <div className="flex justify-center">
    <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-6">
      <CheckCircle className="w-16 h-16 text-green-600" />
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-green-600">
      Payment Recorded Successfully!
    </h3>
    <p className="text-muted-foreground mt-2">
      Receipt #{receiptNumber}
    </p>
  </div>

  {/* Payment Summary */}
  <Card className="text-left">
    <CardHeader>
      <CardTitle className="text-base">Payment Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Student</span>
        <span className="font-medium">{student.fullName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-lg font-bold text-green-600">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Date</span>
        <span>{formatDate(new Date())}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Receipt</span>
        <span className="font-mono text-sm">{receiptNumber}</span>
      </div>
    </CardContent>
  </Card>

  {/* Updated Progress (if tuition) */}
  {paymentType === "tuition" && (
    <Card className="text-left bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
      <CardHeader>
        <CardTitle className="text-base">Updated Tuition Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-semibold">
              {formatCurrency(newTotalPaid)} / {formatCurrency(totalTuition)}
            </span>
          </div>
          <Progress value={newPercentPaid} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {newPercentPaid.toFixed(1)}% complete
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Covered Months</p>
          <div className="flex flex-wrap gap-2">
            {SCHOOL_MONTHS.map(month => (
              <Badge
                key={month}
                variant={newCoveredMonths.includes(month) ? "default" : "outline"}
                className={cn(
                  newCoveredMonths.includes(month) &&
                  "bg-green-600 text-white",
                  // Highlight newly covered months
                  !coveredMonths.includes(month) &&
                  newCoveredMonths.includes(month) &&
                  "ring-2 ring-green-400 animate-pulse"
                )}
              >
                {newCoveredMonths.includes(month) && (
                  <Check className="w-3 h-3 mr-1" />
                )}
                {month}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className="text-lg font-bold">
            {formatCurrency(newRemainingBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  )}

  {/* Actions */}
  <div className="flex flex-col gap-3">
    <Button
      size="lg"
      onClick={handleDownloadPDF}
      className="bg-green-600 hover:bg-green-700"
    >
      <Download className="w-5 h-5 mr-2" />
      Download & Print Receipt
    </Button>
    <Button
      variant="outline"
      onClick={handleRecordAnother}
    >
      Record Another Payment
    </Button>
    <Button
      variant="ghost"
      onClick={handleViewStudent}
    >
      View Student Profile
    </Button>
  </div>
</div>
```

## Component Architecture

### File Structure

```
app/ui/components/payments/
├── payment-wizard.tsx           # Main wizard component
├── wizard-context.tsx            # State management
├── wizard-progress.tsx           # Progress indicator
├── wizard-navigation.tsx         # Back/Next buttons
└── steps/
    ├── step-student-selection.tsx
    ├── step-payment-details.tsx
    ├── step-review.tsx
    └── step-success.tsx
```

### State Management (wizard-context.tsx)

```tsx
export type PaymentWizardStep = 1 | 2 | 3 | 4

export type PaymentType = "tuition" | "activity"
export type PaymentMethod = "cash" | "orange_money" | "bank_transfer"

export interface PaymentWizardData {
  // Step 1: Student Selection
  studentId: string
  student?: {
    id: string
    studentNumber: string
    fullName: string
    firstName: string
    lastName: string
    gradeName: string
    level: string
    photoUrl?: string
    currentEnrollment?: {
      id: string
      schoolYearId: string
      schoolYearName: string
      tuitionFee: number
      totalPaid: number
      remainingBalance: number
      coveredMonths: string[]
    }
  }

  // Step 2: Payment Details
  paymentType: PaymentType
  activityId?: string
  activityName?: string
  activityFee?: number
  paymentMethod: PaymentMethod
  amount: number
  receiptNumber: string
  transactionRef?: string
  notes?: string

  // Computed/Preview
  newPercentPaid?: number
  newCoveredMonths?: string[]
  newRemainingBalance?: number

  // Step 4: Success
  paymentId?: string
  pdfUrl?: string
}

export interface PaymentWizardState {
  currentStep: PaymentWizardStep
  completedSteps: number[]
  data: Partial<PaymentWizardData>
  isSubmitting: boolean
  error?: string
}

// Actions
type PaymentWizardAction =
  | { type: "SET_STEP"; step: PaymentWizardStep }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<PaymentWizardData> }
  | { type: "MARK_STEP_COMPLETE"; step: number }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error?: string }
  | { type: "SET_PAYMENT_ID"; id: string }
  | { type: "RESET" }
```

### Props

**PaymentWizard Component**:
```tsx
interface PaymentWizardProps {
  studentId?: string           // Pre-select student (from student page)
  onSuccess?: (paymentId: string) => void
  onCancel?: () => void
}
```

### API Integration

**Student Search**:
```typescript
// GET /api/students/search?q={query}&gradeId={gradeId}&level={level}
const searchStudents = async (query: string, filters: SearchFilters) => {
  const params = new URLSearchParams({
    q: query,
    ...(filters.gradeId && { gradeId: filters.gradeId }),
    ...(filters.level && { level: filters.level }),
  })
  const res = await fetch(`/api/students/search?${params}`)
  return res.json()
}
```

**Student Details with Enrollment**:
```typescript
// GET /api/students/{id}/payment-info
const getStudentPaymentInfo = async (studentId: string) => {
  const res = await fetch(`/api/students/${studentId}/payment-info`)
  return res.json()
}
```

**Receipt Number Generation**:
```typescript
// GET /api/payments/next-receipt-number?method={method}
const getNextReceiptNumber = async (method: PaymentMethod) => {
  const res = await fetch(`/api/payments/next-receipt-number?method=${method}`)
  const data = await res.json()
  return data.receiptNumber
}
```

**Create Payment**:
```typescript
// POST /api/payments
const createPayment = async (paymentData: PaymentWizardData) => {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: paymentData.studentId,
      type: paymentData.paymentType,
      activityId: paymentData.activityId,
      method: paymentData.paymentMethod,
      amount: paymentData.amount,
      receiptNumber: paymentData.receiptNumber,
      transactionRef: paymentData.transactionRef,
      notes: paymentData.notes,
    }),
  })
  return res.json()
}
```

**Generate PDF Receipt**:
```typescript
// GET /api/payments/{id}/receipt.pdf
const downloadReceipt = (paymentId: string) => {
  window.open(`/api/payments/${paymentId}/receipt.pdf`, "_blank")
}
```

## PDF Receipt Template

The PDF receipt should include:

### Header
- School logo and name
- School address and contact
- Receipt number (large, prominent)
- Date and time

### Student Information
- Full name
- Student number
- Grade and level
- School year

### Payment Details
- Payment type (Tuition / Activity)
- Activity name (if applicable)
- Payment method
- Amount (large, bold)
- Transaction reference (if applicable)
- Notes

### Tuition Progress (if tuition payment)
- Total tuition fee
- Previous amount paid
- This payment amount
- New total paid
- Remaining balance
- Covered months list

### Footer
- Received by: (staff name)
- Signature line: ________________
- Date: ________________
- Parent signature line: ________________

### Styling
- Use school colors (maroon #800020, gold #E79908)
- Professional layout
- QR code with payment ID for verification

## Animation and UX

### Framer Motion Animations

**Step Transitions**:
```tsx
const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

<motion.div
  variants={stepVariants}
  initial="enter"
  animate="center"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  {renderCurrentStep()}
</motion.div>
```

**Progress Updates**:
```tsx
const progressVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300 }
  },
}

<motion.div
  variants={progressVariants}
  initial="hidden"
  animate="visible"
>
  <Progress value={newPercentPaid} />
</motion.div>
```

**Month Badge Highlights**:
```tsx
// Newly covered months pulse
{!previouslyCovered && nowCovered && (
  <motion.div
    initial={{ scale: 1 }}
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 0.5, repeat: 2 }}
  >
    <Badge className="bg-green-600">
      <Check className="w-3 h-3 mr-1" />
      {month}
    </Badge>
  </motion.div>
)}
```

**Success Checkmark**:
```tsx
const checkmarkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, delay: 0.2 }
  },
}

<motion.div
  variants={checkmarkVariants}
  initial="hidden"
  animate="visible"
>
  <CheckCircle className="w-16 h-16 text-green-600" />
</motion.div>
```

### Loading States

- Student search: Skeleton cards while loading
- Receipt generation: Spinner in receipt number input
- Form submission: Disabled buttons with spinner
- PDF generation: Progress indicator

### Error Handling

```tsx
<Alert variant="destructive">
  <AlertCircle className="w-4 h-4" />
  <AlertDescription>
    {error}
  </AlertDescription>
  <Button variant="ghost" onClick={retry}>
    Try Again
  </Button>
</Alert>
```

## Responsive Design

### Desktop (≥768px)
- Full wizard with side-by-side cards
- Wide progress bar
- Two-column form layouts

### Mobile (<768px)
- Stacked layout
- Compact progress bar (Step X/4)
- Single-column forms
- Bottom sheet for student search

## i18n Keys Required

All keys should be added to both `app/ui/lib/i18n/en.ts` and `fr.ts`:

```typescript
paymentWizard: {
  // Navigation
  step1: "Student",
  step2: "Details",
  step3: "Review",
  step4: "Success",

  // Step 1: Student Selection
  selectStudent: "Select Student",
  searchStudent: "Search by name or student number",
  studentNumber: "Student #",
  changeStudent: "Change Student",
  allGrades: "All Grades",
  allLevels: "All Levels",
  noStudentsFound: "No students found",

  // Step 2: Payment Details
  paymentDetails: "Payment Details",
  paymentType: "Payment Type",
  tuitionPayment: "Tuition Payment",
  tuitionPaymentDesc: "Regular school year tuition",
  activityPayment: "Activity Payment",
  activityPaymentDesc: "Extra-curricular activities",
  selectActivity: "Select activity",

  // Progress Card
  tuitionProgress: "Tuition Progress",
  percentPaid: "Percent Paid",
  coveredMonths: "Covered Months",
  remaining: "Remaining",

  // Payment Method
  paymentMethod: "Payment Method",
  cashPayment: "Cash Payment",
  orangeMoneyPayment: "Orange Money",
  bankTransferPayment: "Bank Transfer",

  // Amount
  amount: "Amount",
  payRemaining: "Pay Remaining",
  oneMonth: "One Month",

  // Receipt
  receiptNumber: "Receipt Number",
  autoGenerated: "Auto-generated",
  uniqueReceiptId: "Unique receipt ID",
  generatingReceipt: "Generating...",
  transactionRef: "Transaction Reference",

  // Notes
  notes: "Notes",
  notesPlaceholder: "Additional information...",

  // Step 3: Review
  reviewPayment: "Review Payment Details",
  studentInfo: "Student Information",
  paymentInfo: "Payment Information",
  updatedProgress: "Updated Tuition Progress",
  previous: "Previous",
  afterPayment: "After Payment",
  confirmationMessage: "This payment will be recorded immediately in the registry. Please ensure all information is correct.",

  // Step 4: Success
  paymentRecorded: "Payment Recorded Successfully!",
  paymentSummary: "Payment Summary",
  updatedStatus: "Updated Tuition Status",
  downloadReceipt: "Download & Print Receipt",
  recordAnother: "Record Another Payment",
  viewStudent: "View Student Profile",

  // Actions
  next: "Next",
  back: "Back",
  submit: "Record Payment",
  cancel: "Cancel",

  // Errors
  errorLoadingStudent: "Failed to load student information",
  errorGeneratingReceipt: "Failed to generate receipt number",
  errorSubmitting: "Failed to record payment",
  tryAgain: "Try Again",
}
```

## Accessibility

- Keyboard navigation through steps (Tab, Enter, Arrow keys)
- Focus management on step transitions
- ARIA labels for progress indicators
- Screen reader announcements for success/errors
- High contrast support
- Form field labels properly associated

## Testing Checklist

### Unit Tests
- [ ] Student search filtering
- [ ] Receipt number generation
- [ ] Payment amount validation
- [ ] Progress calculation (tuition)
- [ ] Month coverage calculation
- [ ] Form state management

### Integration Tests
- [ ] Complete wizard flow (tuition payment)
- [ ] Complete wizard flow (activity payment)
- [ ] Pre-selected student flow
- [ ] Standalone search flow
- [ ] PDF generation
- [ ] Error handling

### E2E Tests
- [ ] Record cash tuition payment
- [ ] Record Orange Money payment
- [ ] Record bank transfer
- [ ] Download PDF receipt
- [ ] Navigate back and forth between steps
- [ ] Cancel mid-flow

### Accessibility Tests
- [ ] Keyboard-only navigation
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Color contrast (WCAG AA)

## Implementation Notes

### Phase 3 Implementation Order

1. **Wizard Context** (wizard-context.tsx)
   - State management
   - Validation logic
   - Step navigation

2. **Progress Component** (wizard-progress.tsx)
   - Visual progress indicator
   - Step labels
   - Responsive design

3. **Step 1: Student Selection** (steps/step-student-selection.tsx)
   - Student search API integration
   - Pre-selected student display
   - Filter dropdowns

4. **Step 2: Payment Details** (steps/step-payment-details.tsx)
   - Tuition progress card
   - Payment method selector
   - Receipt number generation
   - Live progress preview

5. **Step 3: Review** (steps/step-review.tsx)
   - Summary display
   - Updated progress preview
   - Submit logic

6. **Step 4: Success** (steps/step-success.tsx)
   - Success animation
   - PDF generation
   - Action buttons

7. **Main Wizard Component** (payment-wizard.tsx)
   - Wizard layout
   - Navigation
   - Error handling

8. **PDF Receipt Generation**
   - Backend API endpoint
   - PDF template
   - Download/print logic

### Dependencies

**Required shadcn/ui components**:
- Button
- Card
- Input
- Label
- Select
- RadioGroup
- Progress
- Badge
- Alert
- Avatar
- Textarea
- Skeleton (loading states)

**Required Lucide icons**:
- Search
- User
- Banknote
- Smartphone
- Building
- TrendingUp
- Check
- CheckCircle
- AlertCircle
- Download
- Loader2
- Edit
- X

**Required libraries**:
- framer-motion (animations)
- react-to-print or jsPDF (PDF generation)
- date-fns (date formatting)

### Design Tokens Usage

Leverage design tokens from `app/ui/lib/design-tokens.ts`:
- Colors: `colors.gspn.maroon`, `colors.gspn.gold`
- Spacing: `sizing.spacing`
- Icons: `sizing.icon.sm`, `sizing.icon.md`, etc.
- Animation: `animations.fade`, `animations.scale`

### Frontend-Design-GSPN Skill

When implementing the wizard, use the `/frontend-design-gspn` skill to:
- Create modern, polished UI components
- Apply consistent theming (light/dark mode)
- Implement smooth animations
- Ensure responsive design
- Follow GSPN visual identity

## Future Enhancements (Post-MVP)

- **Bulk Payments**: Record multiple payments at once
- **Payment Plans**: Set up custom payment schedules
- **Reminders**: Auto-generate payment reminders
- **SMS Receipts**: Send receipt via SMS to parent
- **Receipt History**: View all receipts for a student
- **Payment Analytics**: Dashboard showing payment trends
- **Discounts/Scholarships**: Apply adjustments during payment
- **Partial Payments**: Split payment across multiple methods
