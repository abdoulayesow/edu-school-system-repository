# Expense Wizard Component Specification

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

The Expense Wizard is a multi-step component for recording and paying school expenses. It provides a guided workflow for creating expense records, reviewing them, and executing payments from the registry cash box.

### Key Requirements

- **Pay from Registry**: Cash expenses deduct from `registryBalance` (not safe)
- **Category-Based**: Organize expenses by type (Salary, Utilities, Maintenance, etc.)
- **Approval Workflow**: Expenses can be created as draft, then approved before payment
- **Receipt Upload**: Attach receipts/invoices for audit trail
- **PDF Export**: Generate expense vouchers for record keeping

## User Flows

### Flow 1: Create and Pay Expense (Single Session)

1. User clicks "Record Expense"
2. Step 1: Select expense category and vendor
3. Step 2: Enter expense details and amount
4. Step 3: Upload receipt/invoice (optional)
5. Step 4: Review and submit
6. Step 5: Immediate payment (if approved)
7. Success screen with PDF voucher

### Flow 2: Create Draft for Later Approval

1. User creates expense (Steps 1-3)
2. Saves as draft (no payment)
3. Later: Director/Accountant reviews and approves
4. Then: Payment is executed (Step 5)

### Flow 3: Scheduled/Recurring Expenses

1. User creates expense with future date
2. System holds until scheduled date
3. Auto-prompts for payment on due date

## Wizard Steps

### Step 1: Category and Vendor

**Purpose**: Classify the expense and identify payee

**UI Elements**:

1. **Expense Category Selector**
```tsx
<div className="space-y-4">
  <Label>Expense Category</Label>
  <RadioGroup value={category} onValueChange={setCategory}>
    {EXPENSE_CATEGORIES.map(cat => (
      <Label
        key={cat.id}
        className={cn(
          "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
          category === cat.id && "border-maroon-500 bg-maroon-50 dark:bg-maroon-950/30"
        )}
      >
        <RadioGroupItem value={cat.id} />
        <div className="flex items-center gap-3 flex-1">
          {cat.icon}
          <div>
            <p className="font-medium">{cat.name}</p>
            <p className="text-sm text-muted-foreground">{cat.description}</p>
          </div>
        </div>
      </Label>
    ))}
  </RadioGroup>
</div>
```

**Expense Categories**:
- **Salary** (Users, DollarSign icon) - Staff salaries and wages
- **Utilities** (Zap, Droplets icons) - Electricity, water, internet
- **Maintenance** (Wrench icon) - Repairs and maintenance
- **Supplies** (Package icon) - School supplies and materials
- **Transport** (Car icon) - Transportation costs
- **Food** (UtensilsCrossed icon) - Cafeteria supplies
- **Administrative** (FileText icon) - Office expenses
- **Other** (MoreHorizontal icon) - Miscellaneous expenses

2. **Vendor Information**
```tsx
<div className="space-y-4">
  <Label>Vendor/Payee</Label>

  {/* Existing vendor selector */}
  <Select
    value={selectedVendor}
    onValueChange={handleVendorSelect}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select existing vendor" />
    </SelectTrigger>
    <SelectContent>
      {vendors.map(vendor => (
        <SelectItem key={vendor.id} value={vendor.id}>
          {vendor.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Or new vendor */}
  <div className="flex items-center gap-2">
    <div className="flex-1 border-t" />
    <span className="text-xs text-muted-foreground">OR</span>
    <div className="flex-1 border-t" />
  </div>

  <div className="space-y-3">
    <Input
      placeholder="New vendor name"
      value={newVendorName}
      onChange={e => setNewVendorName(e.target.value)}
    />
    <Input
      placeholder="Vendor phone (optional)"
      value={newVendorPhone}
      onChange={e => setNewVendorPhone(e.target.value)}
    />
    <Input
      placeholder="Vendor email (optional)"
      value={newVendorEmail}
      onChange={e => setNewVendorEmail(e.target.value)}
    />
  </div>
</div>
```

**Validation**:
- Category required
- Either existing vendor selected OR new vendor name provided

### Step 2: Expense Details

**Purpose**: Capture amount, description, and payment details

**UI Sections**:

1. **Amount and Description**
```tsx
<div className="space-y-4">
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
  </div>

  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea
      id="description"
      value={description}
      onChange={e => setDescription(e.target.value)}
      placeholder="Brief description of the expense..."
      rows={3}
    />
  </div>
</div>
```

2. **Payment Method**
```tsx
<div className="space-y-2">
  <Label>Payment Method</Label>
  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
    <Label className={cn(
      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
      paymentMethod === "cash" && "border-maroon-500 bg-maroon-50"
    )}>
      <RadioGroupItem value="cash" />
      <Banknote className="w-5 h-5" />
      <div>
        <span className="font-medium">Cash from Registry</span>
        <p className="text-sm text-muted-foreground">
          Available: {formatCurrency(registryBalance)}
        </p>
      </div>
    </Label>
    <Label className={cn(
      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
      paymentMethod === "bank_transfer" && "border-maroon-500 bg-maroon-50"
    )}>
      <RadioGroupItem value="bank_transfer" />
      <Building className="w-5 h-5" />
      <div>
        <span className="font-medium">Bank Transfer</span>
        <p className="text-sm text-muted-foreground">
          Available: {formatCurrency(bankBalance)}
        </p>
      </div>
    </Label>
    <Label className={cn(
      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer",
      paymentMethod === "mobile_money" && "border-maroon-500 bg-maroon-50"
    )}>
      <RadioGroupItem value="mobile_money" />
      <Smartphone className="w-5 h-5" />
      <div>
        <span className="font-medium">Mobile Money</span>
        <p className="text-sm text-muted-foreground">
          Available: {formatCurrency(mobileMoneyBalance)}
        </p>
      </div>
    </Label>
  </RadioGroup>
</div>
```

3. **Balance Warning** (if insufficient)
```tsx
{paymentMethod === "cash" && amount > registryBalance && (
  <Alert variant="destructive">
    <AlertCircle className="w-4 h-4" />
    <AlertDescription>
      Insufficient registry balance. Available: {formatCurrency(registryBalance)}
      <br />
      You can still create this expense as pending and pay later when funds are available.
    </AlertDescription>
  </Alert>
)}
```

4. **Payment Date**
```tsx
<div className="space-y-2">
  <Label>Payment Date</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start text-left">
        <Calendar className="mr-2 h-4 w-4" />
        {paymentDate ? format(paymentDate, "PPP") : "Select date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <CalendarComponent
        mode="single"
        selected={paymentDate}
        onSelect={setPaymentDate}
      />
    </PopoverContent>
  </Popover>
  <p className="text-xs text-muted-foreground">
    Leave as today to pay immediately, or schedule for future date
  </p>
</div>
```

5. **Invoice/Reference Number**
```tsx
<div className="space-y-2">
  <Label htmlFor="invoiceNumber">Invoice/Reference Number (Optional)</Label>
  <Input
    id="invoiceNumber"
    value={invoiceNumber}
    onChange={e => setInvoiceNumber(e.target.value)}
    placeholder="INV-2026-001"
  />
</div>
```

**Validation**:
- Amount > 0 required
- Description required (min 10 characters)
- Payment method required
- Payment date required

### Step 3: Receipt Upload

**Purpose**: Attach supporting documents

**UI Layout**:

```tsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-semibold">Attach Receipt or Invoice</h3>
    <p className="text-sm text-muted-foreground">
      Upload supporting documents for this expense (optional but recommended)
    </p>
  </div>

  {/* Upload Area */}
  <div className="border-2 border-dashed rounded-lg p-8 text-center">
    <Input
      type="file"
      id="receipt-upload"
      className="hidden"
      accept="image/*,.pdf"
      multiple
      onChange={handleFileUpload}
    />
    <Label
      htmlFor="receipt-upload"
      className="cursor-pointer flex flex-col items-center gap-4"
    >
      <div className="rounded-full bg-muted p-4">
        <Upload className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">Click to upload or drag and drop</p>
        <p className="text-sm text-muted-foreground">
          PDF, PNG, JPG up to 10MB
        </p>
      </div>
    </Label>
  </div>

  {/* Uploaded Files */}
  {uploadedFiles.length > 0 && (
    <div className="space-y-2">
      <Label>Uploaded Documents</Label>
      {uploadedFiles.map((file, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => previewFile(file)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )}

  {/* Notes */}
  <div className="space-y-2">
    <Label htmlFor="notes">Additional Notes (Optional)</Label>
    <Textarea
      id="notes"
      value={notes}
      onChange={e => setNotes(e.target.value)}
      placeholder="Any additional information about this expense..."
      rows={4}
    />
  </div>

  <Alert>
    <Info className="w-4 h-4" />
    <AlertDescription>
      Receipts are optional but help maintain accurate financial records.
    </AlertDescription>
  </Alert>
</div>
```

**Validation**:
- Step is always valid (uploads optional)

### Step 4: Review and Approval

**Purpose**: Final review before creating expense

**UI Layout**:

```tsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-semibold">Review Expense</h3>
    <p className="text-sm text-muted-foreground">
      Verify all details before submitting
    </p>
  </div>

  {/* Expense Summary */}
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Expense Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Category</span>
        <Badge variant="secondary" className="gap-2">
          {categoryIcon}
          {categoryName}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Vendor/Payee</span>
        <span className="font-medium">{vendorName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-xl font-bold text-red-600">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Payment Method</span>
        <span className="capitalize">{paymentMethod.replace("_", " ")}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Payment Date</span>
        <span>{format(paymentDate, "PPP")}</span>
      </div>
      {invoiceNumber && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Invoice Number</span>
          <span className="font-mono text-sm">{invoiceNumber}</span>
        </div>
      )}
      <div className="pt-2 border-t">
        <p className="text-sm font-medium mb-1">Description</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>

  {/* Attached Documents */}
  {uploadedFiles.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attached Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file, i) => (
            <Badge key={i} variant="outline" className="gap-1">
              <FileText className="w-3 h-3" />
              {file.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )}

  {/* Balance Impact */}
  {paymentMethod === "cash" && (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
      <CardHeader>
        <CardTitle className="text-base">Registry Balance Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current Balance</span>
          <span className="font-semibold">{formatCurrency(registryBalance)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Expense Amount</span>
          <span className="font-semibold">-{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t">
          <span>After Payment</span>
          <span className={cn(
            newBalance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(newBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  )}

  {/* Approval Status Selector (for Director/Accountant) */}
  {hasApprovalPermission && (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Approval Status</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={approvalStatus} onValueChange={setApprovalStatus}>
          <Label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
            <RadioGroupItem value="approved" />
            <div>
              <p className="font-medium">Approve and Pay Now</p>
              <p className="text-sm text-muted-foreground">
                Expense will be paid immediately
              </p>
            </div>
          </Label>
          <Label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
            <RadioGroupItem value="pending" />
            <div>
              <p className="font-medium">Save as Pending</p>
              <p className="text-sm text-muted-foreground">
                Require approval before payment
              </p>
            </div>
          </Label>
        </RadioGroup>
      </CardContent>
    </Card>
  )}

  {/* Warning for insufficient balance */}
  {paymentMethod === "cash" && newBalance < 0 && (
    <Alert variant="destructive">
      <AlertCircle className="w-4 h-4" />
      <AlertDescription>
        Insufficient registry balance for this payment.
        The expense will be created as pending until funds are available.
      </AlertDescription>
    </Alert>
  )}

  {/* Confirmation */}
  <Alert>
    <Info className="w-4 h-4" />
    <AlertDescription>
      {approvalStatus === "approved"
        ? "This expense will be recorded and paid immediately."
        : "This expense will be saved as pending and require approval before payment."}
    </AlertDescription>
  </Alert>
</div>
```

**Validation**:
- Always valid (just review)

### Step 5: Payment Execution (if approved)

**Purpose**: Execute payment and confirm

**UI Layout**:

```tsx
<div className="space-y-6">
  <div className="text-center">
    <div className="flex justify-center mb-4">
      <Loader2 className="w-12 h-12 animate-spin text-maroon-600" />
    </div>
    <h3 className="text-lg font-semibold">Processing Payment...</h3>
    <p className="text-sm text-muted-foreground">
      Please wait while we record this expense
    </p>
  </div>

  {/* Payment Details */}
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-2xl font-bold text-red-600">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Vendor</span>
        <span className="font-medium">{vendorName}</span>
      </div>
    </CardContent>
  </Card>

  {/* Progress indicator */}
  <div className="space-y-2">
    {paymentSteps.map((step, index) => (
      <div
        key={index}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          step.status === "completed" && "bg-green-50 dark:bg-green-950/30",
          step.status === "processing" && "bg-blue-50 dark:bg-blue-950/30",
          step.status === "pending" && "bg-muted"
        )}
      >
        {step.status === "completed" && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        {step.status === "processing" && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        )}
        {step.status === "pending" && (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
        <span className={cn(
          "text-sm",
          step.status === "completed" && "text-green-600 font-medium",
          step.status === "processing" && "text-blue-600 font-medium",
          step.status === "pending" && "text-muted-foreground"
        )}>
          {step.label}
        </span>
      </div>
    ))}
  </div>
</div>
```

**Payment Steps**:
1. Creating expense record
2. Updating registry balance
3. Creating safe transaction
4. Generating expense voucher
5. Complete

### Step 6: Success and Voucher

**Purpose**: Confirm success and provide voucher

**UI Layout**:

```tsx
<div className="space-y-6 text-center">
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="flex justify-center"
  >
    <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-6">
      <CheckCircle className="w-16 h-16 text-green-600" />
    </div>
  </motion.div>

  <div>
    <h3 className="text-2xl font-bold text-green-600">
      Expense Recorded Successfully!
    </h3>
    <p className="text-muted-foreground mt-2">
      Expense #{expenseNumber}
    </p>
  </div>

  {/* Expense Summary */}
  <Card className="text-left">
    <CardHeader>
      <CardTitle className="text-base">Expense Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Category</span>
        <Badge variant="secondary">{categoryName}</Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Vendor</span>
        <span className="font-medium">{vendorName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-xl font-bold text-red-600">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Method</span>
        <span className="capitalize">{paymentMethod.replace("_", " ")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Date</span>
        <span>{format(paymentDate, "PPP")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status</span>
        <Badge className="bg-green-600">Paid</Badge>
      </div>
    </CardContent>
  </Card>

  {/* Updated Balance */}
  {paymentMethod === "cash" && (
    <Card className="text-left bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
      <CardHeader>
        <CardTitle className="text-base">Updated Registry Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Previous Balance</span>
          <span>{formatCurrency(previousBalance)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Expense Paid</span>
          <span>-{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t">
          <span>Current Balance</span>
          <span className="text-lg">{formatCurrency(newBalance)}</span>
        </div>
      </CardContent>
    </Card>
  )}

  {/* Actions */}
  <div className="flex flex-col gap-3">
    <Button
      size="lg"
      onClick={handleDownloadVoucher}
      className="bg-maroon-600 hover:bg-maroon-700"
    >
      <Download className="w-5 h-5 mr-2" />
      Download Expense Voucher
    </Button>
    <Button
      variant="outline"
      onClick={handleRecordAnother}
    >
      Record Another Expense
    </Button>
    <Button
      variant="ghost"
      onClick={handleViewExpenses}
    >
      View All Expenses
    </Button>
  </div>
</div>
```

## Component Architecture

### File Structure

```
app/ui/components/expenses/
├── expense-wizard.tsx           # Main wizard component
├── wizard-context.tsx            # State management
├── wizard-progress.tsx           # Progress indicator
├── wizard-navigation.tsx         # Back/Next buttons
└── steps/
    ├── step-category-vendor.tsx
    ├── step-expense-details.tsx
    ├── step-receipt-upload.tsx
    ├── step-review.tsx
    ├── step-payment.tsx
    └── step-success.tsx
```

### State Management (wizard-context.tsx)

```tsx
export type ExpenseWizardStep = 1 | 2 | 3 | 4 | 5 | 6

export type ExpenseCategory =
  | "salary"
  | "utilities"
  | "maintenance"
  | "supplies"
  | "transport"
  | "food"
  | "administrative"
  | "other"

export type PaymentMethod = "cash" | "bank_transfer" | "mobile_money"
export type ApprovalStatus = "approved" | "pending" | "rejected"

export interface ExpenseWizardData {
  // Step 1: Category & Vendor
  category: ExpenseCategory
  vendorId?: string
  vendorName: string
  vendorPhone?: string
  vendorEmail?: string

  // Step 2: Details
  amount: number
  description: string
  paymentMethod: PaymentMethod
  paymentDate: Date
  invoiceNumber?: string

  // Step 3: Receipt Upload
  uploadedFiles: File[]
  receiptUrls: string[]
  notes?: string

  // Step 4: Review & Approval
  approvalStatus: ApprovalStatus
  approvedBy?: string

  // Step 5-6: Payment & Success
  expenseId?: string
  expenseNumber?: string
  voucherUrl?: string
  previousBalance?: number
  newBalance?: number
}

export interface ExpenseWizardState {
  currentStep: ExpenseWizardStep
  completedSteps: number[]
  data: Partial<ExpenseWizardData>
  isSubmitting: boolean
  error?: string
}
```

### Props

**ExpenseWizard Component**:
```tsx
interface ExpenseWizardProps {
  onSuccess?: (expenseId: string) => void
  onCancel?: () => void
}
```

### API Integration

**Vendor Search**:
```typescript
// GET /api/vendors?search={query}
const searchVendors = async (query: string) => {
  const res = await fetch(`/api/vendors?search=${query}`)
  return res.json()
}
```

**Treasury Balance**:
```typescript
// GET /api/treasury/balance
const getTreasuryBalance = async () => {
  const res = await fetch("/api/treasury/balance")
  return res.json()
}
```

**Create Expense**:
```typescript
// POST /api/expenses
const createExpense = async (expenseData: ExpenseWizardData) => {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expenseData),
  })
  return res.json()
}
```

**Pay Expense**:
```typescript
// POST /api/expenses/{id}/pay
const payExpense = async (expenseId: string, method: PaymentMethod) => {
  const res = await fetch(`/api/expenses/${expenseId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method }),
  })
  return res.json()
}
```

**Upload Receipt**:
```typescript
// POST /api/uploads/receipt
const uploadReceipt = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/uploads/receipt", {
    method: "POST",
    body: formData,
  })
  return res.json()
}
```

**Download Voucher**:
```typescript
// GET /api/expenses/{id}/voucher.pdf
const downloadVoucher = (expenseId: string) => {
  window.open(`/api/expenses/${expenseId}/voucher.pdf`, "_blank")
}
```

## PDF Expense Voucher Template

### Header
- School logo and name
- "EXPENSE VOUCHER" title
- Voucher number (large, prominent)
- Date and time

### Expense Information
- Category (with icon)
- Vendor/Payee name and contact
- Amount (large, bold)
- Payment method
- Payment date
- Invoice/reference number
- Description

### Financial Summary
- Previous balance (by method)
- Expense amount
- New balance
- Balance verification checksum

### Approval Section
- Approved by: (name)
- Signature: ________________
- Date: ________________

### Attached Documents
- List of uploaded receipts/invoices
- QR code linking to digital copies

### Footer
- Recorded by: (staff name)
- System reference: (expense ID)
- Generated: (timestamp)

## i18n Keys Required

```typescript
expenseWizard: {
  // Navigation
  step1: "Category",
  step2: "Details",
  step3: "Receipt",
  step4: "Review",
  step5: "Payment",
  step6: "Success",

  // Step 1: Category & Vendor
  selectCategory: "Select Expense Category",
  selectVendor: "Select Vendor",
  newVendor: "New Vendor",
  vendorName: "Vendor Name",
  vendorPhone: "Vendor Phone",
  vendorEmail: "Vendor Email",

  // Categories
  categorySalary: "Salary",
  categorySalaryDesc: "Staff salaries and wages",
  categoryUtilities: "Utilities",
  categoryUtilitiesDesc: "Electricity, water, internet",
  categoryMaintenance: "Maintenance",
  categoryMaintenanceDesc: "Repairs and maintenance",
  categorySupplies: "Supplies",
  categorySuppliesDesc: "School supplies and materials",
  categoryTransport: "Transport",
  categoryTransportDesc: "Transportation costs",
  categoryFood: "Food",
  categoryFoodDesc: "Cafeteria supplies",
  categoryAdministrative: "Administrative",
  categoryAdministrativeDesc: "Office expenses",
  categoryOther: "Other",
  categoryOtherDesc: "Miscellaneous expenses",

  // Step 2: Details
  expenseDetails: "Expense Details",
  amount: "Amount",
  description: "Description",
  descriptionPlaceholder: "Brief description of the expense...",
  paymentMethod: "Payment Method",
  cashFromRegistry: "Cash from Registry",
  bankTransfer: "Bank Transfer",
  mobileMoney: "Mobile Money",
  available: "Available",
  paymentDate: "Payment Date",
  invoiceNumber: "Invoice Number",
  insufficientBalance: "Insufficient balance",

  // Step 3: Receipt
  attachReceipt: "Attach Receipt or Invoice",
  uploadDocuments: "Upload supporting documents",
  uploadedDocuments: "Uploaded Documents",
  clickToUpload: "Click to upload or drag and drop",
  additionalNotes: "Additional Notes",

  // Step 4: Review
  reviewExpense: "Review Expense",
  expenseDetails: "Expense Details",
  attachedDocuments: "Attached Documents",
  balanceImpact: "Balance Impact",
  currentBalance: "Current Balance",
  expenseAmount: "Expense Amount",
  afterPayment: "After Payment",
  approvalStatus: "Approval Status",
  approveAndPay: "Approve and Pay Now",
  saveAsPending: "Save as Pending",

  // Step 5: Payment
  processingPayment: "Processing Payment...",
  creatingRecord: "Creating expense record",
  updatingBalance: "Updating balance",
  generatingVoucher: "Generating voucher",

  // Step 6: Success
  expenseRecorded: "Expense Recorded Successfully!",
  expenseSummary: "Expense Summary",
  updatedBalance: "Updated Balance",
  previousBalance: "Previous Balance",
  expensePaid: "Expense Paid",
  downloadVoucher: "Download Expense Voucher",
  recordAnother: "Record Another Expense",
  viewExpenses: "View All Expenses",

  // Actions
  next: "Next",
  back: "Back",
  submit: "Record Expense",
  pay: "Pay Now",
  cancel: "Cancel",

  // Errors
  errorLoadingBalance: "Failed to load balance",
  errorCreating: "Failed to create expense",
  errorPayment: "Failed to process payment",
  tryAgain: "Try Again",
}
```

## Animation and UX

Similar to Payment Wizard:
- Step transitions with framer-motion
- Loading states for async operations
- Success animations
- Balance updates with smooth transitions
- File upload progress indicators

## Responsive Design

- Desktop: Side-by-side layouts
- Mobile: Stacked, single-column
- File upload: Touch-friendly on mobile

## Accessibility

- Keyboard navigation
- Screen reader support
- Focus management
- High contrast mode
- ARIA labels

## Testing Checklist

### Unit Tests
- [ ] Category selection
- [ ] Vendor creation/selection
- [ ] Amount validation
- [ ] Balance calculation
- [ ] File upload handling
- [ ] Form state management

### Integration Tests
- [ ] Complete wizard flow (approved)
- [ ] Complete wizard flow (pending)
- [ ] File upload and preview
- [ ] PDF voucher generation
- [ ] Balance updates

### E2E Tests
- [ ] Record and pay cash expense
- [ ] Record pending expense
- [ ] Upload multiple receipts
- [ ] Download voucher
- [ ] Insufficient balance handling

## Implementation Notes

Follow similar patterns to Payment Wizard for consistency.
Use frontend-design-gspn skill for modern UI implementation.

## Future Enhancements

- Recurring expenses (monthly salaries)
- Expense approval workflow (multi-level)
- Budget tracking and alerts
- Expense categories customization
- Bulk expense import
- Expense reports and analytics
- Integration with accounting software
