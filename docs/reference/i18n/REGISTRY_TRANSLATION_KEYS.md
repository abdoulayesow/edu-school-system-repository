# Registry-Based Cash Management - i18n Translation Keys

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

This document catalogs all translation keys required for the registry-based cash management feature. All keys must be added to both `app/ui/lib/i18n/en.ts` (English) and `app/ui/lib/i18n/fr.ts` (French).

## Translation Key Structure

Keys are organized by feature area:
- `treasury.*` - Treasury/Registry management
- `paymentWizard.*` - Payment wizard component
- `expenseWizard.*` - Expense wizard component
- `receipts.*` - Receipt-related messages
- `errors.*` - Error messages

## Required Translation Keys

### 1. Treasury Management (treasury.*)

#### Navigation & Page Titles

```typescript
treasury: {
  // Page titles
  pageTitle: "Treasury Management",
  dashboard: "Treasury Dashboard",
  dailyOperations: "Daily Operations",
  transactions: "Transactions",

  // Navigation
  overview: "Overview",
  registry: "Registry",
  safe: "Safe",
  bank: "Bank",
  mobileMoney: "Mobile Money",
}
```

**French translations**:
```typescript
treasury: {
  pageTitle: "Gestion de la Trésorerie",
  dashboard: "Tableau de Bord Trésorerie",
  dailyOperations: "Opérations Quotidiennes",
  transactions: "Transactions",

  overview: "Aperçu",
  registry: "Caisse",
  safe: "Coffre",
  bank: "Banque",
  mobileMoney: "Mobile Money",
}
```

#### Balance Display

```typescript
treasury: {
  // Balance labels
  currentBalance: "Current Balance",
  registryBalance: "Registry Balance",
  safeBalance: "Safe Balance",
  bankBalance: "Bank Balance",
  mobileMoneyBalance: "Mobile Money Balance",
  totalCash: "Total Cash",
  totalAssets: "Total Assets",

  // Float
  registryFloat: "Registry Float",
  standardFloat: "Standard Float",
  floatAmount: "Float Amount",
}
```

**French**:
```typescript
treasury: {
  currentBalance: "Solde Actuel",
  registryBalance: "Solde Caisse",
  safeBalance: "Solde Coffre",
  bankBalance: "Solde Banque",
  mobileMoneyBalance: "Solde Mobile Money",
  totalCash: "Total Espèces",
  totalAssets: "Total Actifs",

  registryFloat: "Fond de Caisse",
  standardFloat: "Fond Standard",
  floatAmount: "Montant du Fond",
}
```

#### Daily Opening

```typescript
treasury: {
  // Daily opening
  dailyOpening: "Daily Opening",
  openRegistry: "Open Registry",
  registryOpening: "Registry Opening",
  openingProcedure: "Opening Procedure",

  // Fields
  countedSafeBalance: "Counted Safe Balance",
  expectedSafeBalance: "Expected Safe Balance",
  floatToWithdraw: "Float to Withdraw",
  openingNotes: "Opening Notes",

  // Status
  notOpenedToday: "Registry not opened today",
  alreadyOpened: "Registry already opened today",
  openedAt: "Opened at",
  openedBy: "Opened by",

  // Messages
  openingSuccess: "Registry opened successfully!",
  openingInstructions: "Count the safe balance and enter the amount below. The system will transfer the float to the registry.",
  discrepancyDetected: "Discrepancy detected",
  safeShort: "Safe is short by",
  safeOver: "Safe has excess of",
}
```

**French**:
```typescript
treasury: {
  dailyOpening: "Ouverture Journalière",
  openRegistry: "Ouvrir la Caisse",
  registryOpening: "Ouverture de la Caisse",
  openingProcedure: "Procédure d'Ouverture",

  countedSafeBalance: "Solde Coffre Compté",
  expectedSafeBalance: "Solde Coffre Attendu",
  floatToWithdraw: "Fond à Retirer",
  openingNotes: "Notes d'Ouverture",

  notOpenedToday: "Caisse non ouverte aujourd'hui",
  alreadyOpened: "Caisse déjà ouverte aujourd'hui",
  openedAt: "Ouvert à",
  openedBy: "Ouvert par",

  openingSuccess: "Caisse ouverte avec succès !",
  openingInstructions: "Comptez le solde du coffre et entrez le montant ci-dessous. Le système transférera le fond à la caisse.",
  discrepancyDetected: "Écart détecté",
  safeShort: "Le coffre manque de",
  safeOver: "Le coffre a un excédent de",
}
```

#### Daily Closing

```typescript
treasury: {
  // Daily closing
  dailyClosing: "Daily Closing",
  closeRegistry: "Close Registry",
  registryClosing: "Registry Closing",
  closingProcedure: "Closing Procedure",

  // Fields
  countedRegistryBalance: "Counted Registry Balance",
  expectedRegistryBalance: "Expected Registry Balance",
  amountToDeposit: "Amount to Deposit",
  closingNotes: "Closing Notes",

  // Status
  notClosedToday: "Registry not closed today",
  alreadyClosed: "Registry already closed today",
  closedAt: "Closed at",
  closedBy: "Closed by",

  // Messages
  closingSuccess: "Registry closed successfully!",
  closingInstructions: "Count the registry balance and enter the amount below. All cash will be transferred to the safe.",
  registryEmpty: "Registry is now empty",
  depositComplete: "Deposit completed",
}
```

**French**:
```typescript
treasury: {
  dailyClosing: "Fermeture Journalière",
  closeRegistry: "Fermer la Caisse",
  registryClosing: "Fermeture de la Caisse",
  closingProcedure: "Procédure de Fermeture",

  countedRegistryBalance: "Solde Caisse Compté",
  expectedRegistryBalance: "Solde Caisse Attendu",
  amountToDeposit: "Montant à Déposer",
  closingNotes: "Notes de Fermeture",

  notClosedToday: "Caisse non fermée aujourd'hui",
  alreadyClosed: "Caisse déjà fermée aujourd'hui",
  closedAt: "Fermé à",
  closedBy: "Fermé par",

  closingSuccess: "Caisse fermée avec succès !",
  closingInstructions: "Comptez le solde de la caisse et entrez le montant ci-dessous. Tous les espèces seront transférés au coffre.",
  registryEmpty: "La caisse est maintenant vide",
  depositComplete: "Dépôt effectué",
}
```

#### Transactions

```typescript
treasury: {
  // Transaction types
  transactionType: "Transaction Type",
  studentPayment: "Student Payment",
  expensePayment: "Expense Payment",
  safeToBank: "Safe to Bank",
  bankToSafe: "Bank to Safe",
  registryToSafe: "Registry to Safe",
  safeToRegistry: "Safe to Registry",
  registryAdjustment: "Registry Adjustment",

  // Transaction details
  transactionHistory: "Transaction History",
  recentTransactions: "Recent Transactions",
  viewAllTransactions: "View All Transactions",
  transactionDetails: "Transaction Details",
  transactionId: "Transaction ID",

  // Direction
  direction: "Direction",
  incoming: "Incoming",
  outgoing: "Outgoing",
  transferIn: "Transfer In",
  transferOut: "Transfer Out",
}
```

**French**:
```typescript
treasury: {
  transactionType: "Type de Transaction",
  studentPayment: "Paiement Étudiant",
  expensePayment: "Paiement Dépense",
  safeToBank: "Coffre vers Banque",
  bankToSafe: "Banque vers Coffre",
  registryToSafe: "Caisse vers Coffre",
  safeToRegistry: "Coffre vers Caisse",
  registryAdjustment: "Ajustement Caisse",

  transactionHistory: "Historique des Transactions",
  recentTransactions: "Transactions Récentes",
  viewAllTransactions: "Voir Toutes les Transactions",
  transactionDetails: "Détails de la Transaction",
  transactionId: "ID Transaction",

  direction: "Direction",
  incoming: "Entrée",
  outgoing: "Sortie",
  transferIn: "Transfert Entrant",
  transferOut: "Transfert Sortant",
}
```

### 2. Payment Wizard (paymentWizard.*)

#### Navigation & Steps

```typescript
paymentWizard: {
  // Wizard title
  title: "Record Payment",
  newPayment: "New Payment",

  // Step names
  step1: "Student",
  step2: "Details",
  step3: "Review",
  step4: "Success",

  // Step descriptions
  step1Description: "Select the student",
  step2Description: "Enter payment details",
  step3Description: "Review and confirm",
  step4Description: "Payment recorded",
}
```

**French**:
```typescript
paymentWizard: {
  title: "Enregistrer un Paiement",
  newPayment: "Nouveau Paiement",

  step1: "Étudiant",
  step2: "Détails",
  step3: "Révision",
  step4: "Succès",

  step1Description: "Sélectionner l'étudiant",
  step2Description: "Entrer les détails du paiement",
  step3Description: "Réviser et confirmer",
  step4Description: "Paiement enregistré",
}
```

#### Step 1: Student Selection

```typescript
paymentWizard: {
  // Student selection
  selectStudent: "Select Student",
  searchStudent: "Search by name or student number",
  studentNumber: "Student #",
  changeStudent: "Change Student",
  studentSelected: "Student Selected",

  // Filters
  allGrades: "All Grades",
  allLevels: "All Levels",
  kindergarten: "Kindergarten",
  primary: "Primary",
  middle: "Middle School",
  high: "High School",

  // Results
  noStudentsFound: "No students found",
  studentsFound: "{count} students found",
  searchResults: "Search Results",
}
```

**French**:
```typescript
paymentWizard: {
  selectStudent: "Sélectionner un Étudiant",
  searchStudent: "Rechercher par nom ou numéro d'étudiant",
  studentNumber: "Étudiant #",
  changeStudent: "Changer d'Étudiant",
  studentSelected: "Étudiant Sélectionné",

  allGrades: "Toutes les Classes",
  allLevels: "Tous les Niveaux",
  kindergarten: "Maternelle",
  primary: "Primaire",
  middle: "Collège",
  high: "Lycée",

  noStudentsFound: "Aucun étudiant trouvé",
  studentsFound: "{count} étudiants trouvés",
  searchResults: "Résultats de Recherche",
}
```

#### Step 2: Payment Details

```typescript
paymentWizard: {
  // Payment details
  paymentDetails: "Payment Details",
  paymentType: "Payment Type",
  paymentMethod: "Payment Method",

  // Payment types
  tuitionPayment: "Tuition Payment",
  tuitionPaymentDesc: "Regular school year tuition",
  activityPayment: "Activity Payment",
  activityPaymentDesc: "Extra-curricular activities",

  // Payment methods
  cashPayment: "Cash Payment",
  orangeMoneyPayment: "Orange Money",
  bankTransferPayment: "Bank Transfer",

  // Amount
  amount: "Amount",
  enterAmount: "Enter amount",
  payRemaining: "Pay Remaining",
  oneMonth: "One Month",

  // Tuition progress
  tuitionProgress: "Tuition Progress",
  percentPaid: "Percent Paid",
  coveredMonths: "Covered Months",
  remaining: "Remaining",
  totalYearlyAmount: "Total Yearly Amount",

  // Receipt
  receiptNumber: "Receipt Number",
  autoGenerated: "Auto-generated",
  uniqueReceiptId: "Unique receipt ID",
  generatingReceipt: "Generating receipt number...",
  pleaseWait: "Please wait...",

  // Transaction reference
  transactionRef: "Transaction Reference",
  transactionId: "Transaction ID",
  orangeMoneyRef: "Orange Money Transaction ID",

  // Activity
  selectActivity: "Select activity",
  activityName: "Activity Name",
  activityFee: "Activity Fee",

  // Notes
  notes: "Notes",
  notesPlaceholder: "Additional information...",
  additionalNotes: "Additional Notes (Optional)",
}
```

**French**:
```typescript
paymentWizard: {
  paymentDetails: "Détails du Paiement",
  paymentType: "Type de Paiement",
  paymentMethod: "Méthode de Paiement",

  tuitionPayment: "Paiement Scolarité",
  tuitionPaymentDesc: "Scolarité annuelle régulière",
  activityPayment: "Paiement Activité",
  activityPaymentDesc: "Activités extra-scolaires",

  cashPayment: "Paiement en Espèces",
  orangeMoneyPayment: "Orange Money",
  bankTransferPayment: "Virement Bancaire",

  amount: "Montant",
  enterAmount: "Entrer le montant",
  payRemaining: "Payer le Reste",
  oneMonth: "Un Mois",

  tuitionProgress: "Progrès Scolarité",
  percentPaid: "Pourcentage Payé",
  coveredMonths: "Mois Couverts",
  remaining: "Restant",
  totalYearlyAmount: "Montant Annuel Total",

  receiptNumber: "Numéro de Reçu",
  autoGenerated: "Auto-généré",
  uniqueReceiptId: "ID de reçu unique",
  generatingReceipt: "Génération du numéro de reçu...",
  pleaseWait: "Veuillez patienter...",

  transactionRef: "Référence Transaction",
  transactionId: "ID Transaction",
  orangeMoneyRef: "ID Transaction Orange Money",

  selectActivity: "Sélectionner une activité",
  activityName: "Nom de l'Activité",
  activityFee: "Frais d'Activité",

  notes: "Notes",
  notesPlaceholder: "Informations supplémentaires...",
  additionalNotes: "Notes Supplémentaires (Optionnel)",
}
```

#### Step 3: Review

```typescript
paymentWizard: {
  // Review
  reviewPayment: "Review Payment Details",
  reviewAndConfirm: "Review and Confirm",

  // Information sections
  studentInfo: "Student Information",
  paymentInfo: "Payment Information",
  updatedProgress: "Updated Tuition Progress",

  // Labels
  name: "Name",
  grade: "Grade",
  type: "Type",
  method: "Method",
  previous: "Previous",
  afterPayment: "After Payment",
  progress: "Progress",

  // Confirmation
  confirmationMessage: "This payment will be recorded immediately in the registry. Please ensure all information is correct.",
  readyToSubmit: "Ready to submit",
  verifyDetails: "Please verify all details before submitting",
}
```

**French**:
```typescript
paymentWizard: {
  reviewPayment: "Réviser les Détails du Paiement",
  reviewAndConfirm: "Réviser et Confirmer",

  studentInfo: "Informations Étudiant",
  paymentInfo: "Informations Paiement",
  updatedProgress: "Progrès Scolarité Mis à Jour",

  name: "Nom",
  grade: "Classe",
  type: "Type",
  method: "Méthode",
  previous: "Précédent",
  afterPayment: "Après Paiement",
  progress: "Progrès",

  confirmationMessage: "Ce paiement sera enregistré immédiatement dans la caisse. Veuillez vous assurer que toutes les informations sont correctes.",
  readyToSubmit: "Prêt à soumettre",
  verifyDetails: "Veuillez vérifier tous les détails avant de soumettre",
}
```

#### Step 4: Success

```typescript
paymentWizard: {
  // Success
  paymentRecorded: "Payment Recorded Successfully!",
  paymentSuccess: "Payment Successful",

  // Summary
  paymentSummary: "Payment Summary",
  updatedStatus: "Updated Tuition Status",

  // Actions
  downloadReceipt: "Download & Print Receipt",
  printReceipt: "Print Receipt",
  recordAnother: "Record Another Payment",
  viewStudent: "View Student Profile",
  viewPayments: "View All Payments",
  done: "Done",

  // Messages
  receiptGenerated: "Receipt generated successfully",
  registryUpdated: "Registry balance updated",
}
```

**French**:
```typescript
paymentWizard: {
  paymentRecorded: "Paiement Enregistré avec Succès !",
  paymentSuccess: "Paiement Réussi",

  paymentSummary: "Résumé du Paiement",
  updatedStatus: "Statut Scolarité Mis à Jour",

  downloadReceipt: "Télécharger & Imprimer le Reçu",
  printReceipt: "Imprimer le Reçu",
  recordAnother: "Enregistrer un Autre Paiement",
  viewStudent: "Voir le Profil de l'Étudiant",
  viewPayments: "Voir Tous les Paiements",
  done: "Terminé",

  receiptGenerated: "Reçu généré avec succès",
  registryUpdated: "Solde de la caisse mis à jour",
}
```

#### Common Actions

```typescript
paymentWizard: {
  // Navigation
  next: "Next",
  back: "Back",
  submit: "Record Payment",
  cancel: "Cancel",
  close: "Close",

  // Loading
  loading: "Loading...",
  processing: "Processing payment...",
  saving: "Saving...",

  // Errors
  errorLoadingStudent: "Failed to load student information",
  errorGeneratingReceipt: "Failed to generate receipt number",
  errorSubmitting: "Failed to record payment",
  tryAgain: "Try Again",
  invalidAmount: "Invalid amount",
  requiredField: "This field is required",
}
```

**French**:
```typescript
paymentWizard: {
  next: "Suivant",
  back: "Retour",
  submit: "Enregistrer le Paiement",
  cancel: "Annuler",
  close: "Fermer",

  loading: "Chargement...",
  processing: "Traitement du paiement...",
  saving: "Enregistrement...",

  errorLoadingStudent: "Échec du chargement des informations de l'étudiant",
  errorGeneratingReceipt: "Échec de la génération du numéro de reçu",
  errorSubmitting: "Échec de l'enregistrement du paiement",
  tryAgain: "Réessayer",
  invalidAmount: "Montant invalide",
  requiredField: "Ce champ est obligatoire",
}
```

### 3. Expense Wizard (expenseWizard.*)

#### Navigation & Steps

```typescript
expenseWizard: {
  // Wizard title
  title: "Record Expense",
  newExpense: "New Expense",

  // Step names
  step1: "Category",
  step2: "Details",
  step3: "Receipt",
  step4: "Review",
  step5: "Payment",
  step6: "Success",
}
```

**French**:
```typescript
expenseWizard: {
  title: "Enregistrer une Dépense",
  newExpense: "Nouvelle Dépense",

  step1: "Catégorie",
  step2: "Détails",
  step3: "Reçu",
  step4: "Révision",
  step5: "Paiement",
  step6: "Succès",
}
```

#### Step 1: Category & Vendor

```typescript
expenseWizard: {
  // Category selection
  selectCategory: "Select Expense Category",
  expenseCategory: "Expense Category",

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

  // Vendor
  selectVendor: "Select Vendor",
  vendor: "Vendor",
  vendorPayee: "Vendor/Payee",
  newVendor: "New Vendor",
  existingVendor: "Existing Vendor",
  vendorName: "Vendor Name",
  vendorPhone: "Vendor Phone",
  vendorEmail: "Vendor Email",
}
```

**French**:
```typescript
expenseWizard: {
  selectCategory: "Sélectionner la Catégorie de Dépense",
  expenseCategory: "Catégorie de Dépense",

  categorySalary: "Salaire",
  categorySalaryDesc: "Salaires et rémunérations du personnel",
  categoryUtilities: "Services Publics",
  categoryUtilitiesDesc: "Électricité, eau, internet",
  categoryMaintenance: "Maintenance",
  categoryMaintenanceDesc: "Réparations et maintenance",
  categorySupplies: "Fournitures",
  categorySuppliesDesc: "Fournitures scolaires et matériels",
  categoryTransport: "Transport",
  categoryTransportDesc: "Frais de transport",
  categoryFood: "Nourriture",
  categoryFoodDesc: "Fournitures cafétéria",
  categoryAdministrative: "Administratif",
  categoryAdministrativeDesc: "Dépenses de bureau",
  categoryOther: "Autre",
  categoryOtherDesc: "Dépenses diverses",

  selectVendor: "Sélectionner un Fournisseur",
  vendor: "Fournisseur",
  vendorPayee: "Fournisseur/Bénéficiaire",
  newVendor: "Nouveau Fournisseur",
  existingVendor: "Fournisseur Existant",
  vendorName: "Nom du Fournisseur",
  vendorPhone: "Téléphone Fournisseur",
  vendorEmail: "Email Fournisseur",
}
```

#### Step 2: Details

```typescript
expenseWizard: {
  // Expense details
  expenseDetails: "Expense Details",
  amount: "Amount",
  description: "Description",
  descriptionPlaceholder: "Brief description of the expense...",

  // Payment method
  paymentMethod: "Payment Method",
  cashFromRegistry: "Cash from Registry",
  bankTransfer: "Bank Transfer",
  mobileMoney: "Mobile Money",
  available: "Available",

  // Payment date
  paymentDate: "Payment Date",
  selectDate: "Select date",
  payNow: "Pay Now",
  scheduleForLater: "Schedule for Later",

  // Invoice
  invoiceNumber: "Invoice/Reference Number",
  invoiceNumberOptional: "Invoice Number (Optional)",

  // Balance warnings
  insufficientBalance: "Insufficient balance",
  insufficientRegistryMessage: "Insufficient registry balance. Available: {available}. You can still create this expense as pending.",
}
```

**French**:
```typescript
expenseWizard: {
  expenseDetails: "Détails de la Dépense",
  amount: "Montant",
  description: "Description",
  descriptionPlaceholder: "Brève description de la dépense...",

  paymentMethod: "Méthode de Paiement",
  cashFromRegistry: "Espèces de la Caisse",
  bankTransfer: "Virement Bancaire",
  mobileMoney: "Mobile Money",
  available: "Disponible",

  paymentDate: "Date de Paiement",
  selectDate: "Sélectionner la date",
  payNow: "Payer Maintenant",
  scheduleForLater: "Planifier pour Plus Tard",

  invoiceNumber: "Numéro de Facture/Référence",
  invoiceNumberOptional: "Numéro de Facture (Optionnel)",

  insufficientBalance: "Solde insuffisant",
  insufficientRegistryMessage: "Solde de caisse insuffisant. Disponible: {available}. Vous pouvez toujours créer cette dépense en attente.",
}
```

#### Step 3: Receipt Upload

```typescript
expenseWizard: {
  // Receipt upload
  attachReceipt: "Attach Receipt or Invoice",
  uploadDocuments: "Upload supporting documents",
  uploadedDocuments: "Uploaded Documents",
  clickToUpload: "Click to upload or drag and drop",
  fileFormats: "PDF, PNG, JPG up to 10MB",

  // File management
  removeFile: "Remove file",
  previewFile: "Preview file",
  fileUploaded: "File uploaded",
  uploadFailed: "Upload failed",

  // Notes
  additionalNotes: "Additional Notes (Optional)",
  notesPlaceholder: "Any additional information about this expense...",
  receiptOptional: "Receipts are optional but help maintain accurate financial records.",
}
```

**French**:
```typescript
expenseWizard: {
  attachReceipt: "Joindre un Reçu ou une Facture",
  uploadDocuments: "Télécharger les documents justificatifs",
  uploadedDocuments: "Documents Téléchargés",
  clickToUpload: "Cliquez pour télécharger ou glisser-déposer",
  fileFormats: "PDF, PNG, JPG jusqu'à 10MB",

  removeFile: "Supprimer le fichier",
  previewFile: "Prévisualiser le fichier",
  fileUploaded: "Fichier téléchargé",
  uploadFailed: "Échec du téléchargement",

  additionalNotes: "Notes Supplémentaires (Optionnel)",
  notesPlaceholder: "Toute information supplémentaire sur cette dépense...",
  receiptOptional: "Les reçus sont optionnels mais aident à maintenir des dossiers financiers précis.",
}
```

#### Step 4: Review

```typescript
expenseWizard: {
  // Review
  reviewExpense: "Review Expense",
  expenseDetails: "Expense Details",
  attachedDocuments: "Attached Documents",

  // Balance impact
  balanceImpact: "Balance Impact",
  registryBalanceImpact: "Registry Balance Impact",
  currentBalance: "Current Balance",
  expenseAmount: "Expense Amount",
  afterPayment: "After Payment",
  newBalance: "New Balance",

  // Approval
  approvalStatus: "Approval Status",
  approveAndPay: "Approve and Pay Now",
  approveAndPayDesc: "Expense will be paid immediately",
  saveAsPending: "Save as Pending",
  saveAsPendingDesc: "Require approval before payment",

  // Confirmation
  confirmationMessage: "This expense will be recorded and paid immediately.",
  pendingMessage: "This expense will be saved as pending and require approval before payment.",
}
```

**French**:
```typescript
expenseWizard: {
  reviewExpense: "Réviser la Dépense",
  expenseDetails: "Détails de la Dépense",
  attachedDocuments: "Documents Joints",

  balanceImpact: "Impact sur le Solde",
  registryBalanceImpact: "Impact sur le Solde de la Caisse",
  currentBalance: "Solde Actuel",
  expenseAmount: "Montant de la Dépense",
  afterPayment: "Après Paiement",
  newBalance: "Nouveau Solde",

  approvalStatus: "Statut d'Approbation",
  approveAndPay: "Approuver et Payer Maintenant",
  approveAndPayDesc: "La dépense sera payée immédiatement",
  saveAsPending: "Enregistrer en Attente",
  saveAsPendingDesc: "Nécessite une approbation avant le paiement",

  confirmationMessage: "Cette dépense sera enregistrée et payée immédiatement.",
  pendingMessage: "Cette dépense sera enregistrée en attente et nécessitera une approbation avant le paiement.",
}
```

#### Step 5: Payment

```typescript
expenseWizard: {
  // Payment processing
  processingPayment: "Processing Payment...",
  paymentInProgress: "Payment in progress",

  // Steps
  creatingRecord: "Creating expense record",
  updatingBalance: "Updating balance",
  creatingTransaction: "Creating transaction",
  generatingVoucher: "Generating voucher",
  complete: "Complete",
}
```

**French**:
```typescript
expenseWizard: {
  processingPayment: "Traitement du Paiement...",
  paymentInProgress: "Paiement en cours",

  creatingRecord: "Création de l'enregistrement de dépense",
  updatingBalance: "Mise à jour du solde",
  creatingTransaction: "Création de la transaction",
  generatingVoucher: "Génération du bon",
  complete: "Terminé",
}
```

#### Step 6: Success

```typescript
expenseWizard: {
  // Success
  expenseRecorded: "Expense Recorded Successfully!",
  expenseSuccess: "Expense Successful",

  // Summary
  expenseSummary: "Expense Summary",
  updatedBalance: "Updated Balance",
  previousBalance: "Previous Balance",
  expensePaid: "Expense Paid",

  // Status
  paid: "Paid",
  pending: "Pending",
  approved: "Approved",

  // Actions
  downloadVoucher: "Download Expense Voucher",
  printVoucher: "Print Voucher",
  recordAnother: "Record Another Expense",
  viewExpenses: "View All Expenses",

  // Messages
  voucherGenerated: "Voucher generated successfully",
  balanceUpdated: "Balance updated",
}
```

**French**:
```typescript
expenseWizard: {
  expenseRecorded: "Dépense Enregistrée avec Succès !",
  expenseSuccess: "Dépense Réussie",

  expenseSummary: "Résumé de la Dépense",
  updatedBalance: "Solde Mis à Jour",
  previousBalance: "Solde Précédent",
  expensePaid: "Dépense Payée",

  paid: "Payé",
  pending: "En Attente",
  approved: "Approuvé",

  downloadVoucher: "Télécharger le Bon de Dépense",
  printVoucher: "Imprimer le Bon",
  recordAnother: "Enregistrer une Autre Dépense",
  viewExpenses: "Voir Toutes les Dépenses",

  voucherGenerated: "Bon généré avec succès",
  balanceUpdated: "Solde mis à jour",
}
```

#### Common Actions

```typescript
expenseWizard: {
  // Navigation
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

**French**:
```typescript
expenseWizard: {
  next: "Suivant",
  back: "Retour",
  submit: "Enregistrer la Dépense",
  pay: "Payer Maintenant",
  cancel: "Annuler",

  errorLoadingBalance: "Échec du chargement du solde",
  errorCreating: "Échec de la création de la dépense",
  errorPayment: "Échec du traitement du paiement",
  tryAgain: "Réessayer",
}
```

### 4. Receipts & Documents (receipts.*)

```typescript
receipts: {
  // Receipt
  receipt: "Receipt",
  receiptNumber: "Receipt Number",
  paymentReceipt: "Payment Receipt",
  downloadReceipt: "Download Receipt",
  printReceipt: "Print Receipt",
  viewReceipt: "View Receipt",

  // Voucher
  expenseVoucher: "Expense Voucher",
  voucherNumber: "Voucher Number",
  downloadVoucher: "Download Voucher",
  printVoucher: "Print Voucher",

  // PDF content
  schoolName: "GSPN School",
  schoolAddress: "Conakry, Guinea",
  receivedBy: "Received by",
  signature: "Signature",
  parentSignature: "Parent Signature",
  date: "Date",
  issuedDate: "Issued Date",

  // Payment receipt content
  receivedFrom: "Received from",
  forPaymentOf: "For payment of",
  paymentFor: "Payment for",
  paymentDetails: "Payment Details",

  // Expense voucher content
  paidTo: "Paid to",
  expenseDetails: "Expense Details",
  approvedBy: "Approved by",

  // Footer
  generatedBy: "Generated by GSPN Management System",
  generatedAt: "Generated at",
  systemReference: "System Reference",
  verificationCode: "Verification Code",
}
```

**French**:
```typescript
receipts: {
  receipt: "Reçu",
  receiptNumber: "Numéro de Reçu",
  paymentReceipt: "Reçu de Paiement",
  downloadReceipt: "Télécharger le Reçu",
  printReceipt: "Imprimer le Reçu",
  viewReceipt: "Voir le Reçu",

  expenseVoucher: "Bon de Dépense",
  voucherNumber: "Numéro de Bon",
  downloadVoucher: "Télécharger le Bon",
  printVoucher: "Imprimer le Bon",

  schoolName: "École GSPN",
  schoolAddress: "Conakry, Guinée",
  receivedBy: "Reçu par",
  signature: "Signature",
  parentSignature: "Signature du Parent",
  date: "Date",
  issuedDate: "Date d'Émission",

  receivedFrom: "Reçu de",
  forPaymentOf: "Pour le paiement de",
  paymentFor: "Paiement pour",
  paymentDetails: "Détails du Paiement",

  paidTo: "Payé à",
  expenseDetails: "Détails de la Dépense",
  approvedBy: "Approuvé par",

  generatedBy: "Généré par le Système de Gestion GSPN",
  generatedAt: "Généré le",
  systemReference: "Référence Système",
  verificationCode: "Code de Vérification",
}
```

### 5. Error Messages (errors.*)

```typescript
errors: {
  // Treasury errors
  registryNotOpened: "Registry has not been opened today",
  registryAlreadyOpened: "Registry has already been opened today",
  registryNotClosed: "Registry has not been closed today",
  registryAlreadyClosed: "Registry has already been closed today",
  insufficientRegistryBalance: "Insufficient registry balance",
  insufficientSafeBalance: "Insufficient safe balance",

  // Payment errors
  invalidPaymentAmount: "Invalid payment amount",
  paymentAmountTooLow: "Payment amount must be greater than 0",
  studentNotFound: "Student not found",
  receiptGenerationFailed: "Failed to generate receipt number",
  paymentRecordingFailed: "Failed to record payment",

  // Expense errors
  invalidExpenseAmount: "Invalid expense amount",
  expenseAmountTooLow: "Expense amount must be greater than 0",
  vendorRequired: "Vendor is required",
  categoryRequired: "Category is required",
  descriptionRequired: "Description is required",
  expenseCreationFailed: "Failed to create expense",
  expensePaymentFailed: "Failed to pay expense",

  // Balance errors
  balanceCalculationError: "Balance calculation error",
  balanceMismatch: "Balance mismatch detected",
  negativeBalance: "Balance cannot be negative",

  // General errors
  networkError: "Network error. Please check your connection.",
  serverError: "Server error. Please try again later.",
  unauthorized: "You are not authorized to perform this action",
  sessionExpired: "Your session has expired. Please log in again.",

  // File upload errors
  fileUploadFailed: "File upload failed",
  fileTooLarge: "File is too large. Maximum size is 10MB.",
  invalidFileType: "Invalid file type. Only PDF, PNG, and JPG are allowed.",
}
```

**French**:
```typescript
errors: {
  registryNotOpened: "La caisse n'a pas été ouverte aujourd'hui",
  registryAlreadyOpened: "La caisse a déjà été ouverte aujourd'hui",
  registryNotClosed: "La caisse n'a pas été fermée aujourd'hui",
  registryAlreadyClosed: "La caisse a déjà été fermée aujourd'hui",
  insufficientRegistryBalance: "Solde de caisse insuffisant",
  insufficientSafeBalance: "Solde de coffre insuffisant",

  invalidPaymentAmount: "Montant de paiement invalide",
  paymentAmountTooLow: "Le montant du paiement doit être supérieur à 0",
  studentNotFound: "Étudiant non trouvé",
  receiptGenerationFailed: "Échec de la génération du numéro de reçu",
  paymentRecordingFailed: "Échec de l'enregistrement du paiement",

  invalidExpenseAmount: "Montant de dépense invalide",
  expenseAmountTooLow: "Le montant de la dépense doit être supérieur à 0",
  vendorRequired: "Le fournisseur est requis",
  categoryRequired: "La catégorie est requise",
  descriptionRequired: "La description est requise",
  expenseCreationFailed: "Échec de la création de la dépense",
  expensePaymentFailed: "Échec du paiement de la dépense",

  balanceCalculationError: "Erreur de calcul du solde",
  balanceMismatch: "Écart de solde détecté",
  negativeBalance: "Le solde ne peut pas être négatif",

  networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
  serverError: "Erreur serveur. Veuillez réessayer plus tard.",
  unauthorized: "Vous n'êtes pas autorisé à effectuer cette action",
  sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",

  fileUploadFailed: "Échec du téléchargement du fichier",
  fileTooLarge: "Le fichier est trop volumineux. La taille maximale est de 10MB.",
  invalidFileType: "Type de fichier invalide. Seuls PDF, PNG et JPG sont autorisés.",
}
```

## Implementation Checklist

### Phase 7: i18n Implementation

- [ ] Add all `treasury.*` keys to en.ts and fr.ts
- [ ] Add all `paymentWizard.*` keys to en.ts and fr.ts
- [ ] Add all `expenseWizard.*` keys to en.ts and fr.ts
- [ ] Add all `receipts.*` keys to en.ts and fr.ts
- [ ] Add all `errors.*` keys to en.ts and fr.ts
- [ ] Update existing `nav.*` keys if needed
- [ ] Test all keys in both languages
- [ ] Verify text fits in UI components
- [ ] Check for grammatical correctness
- [ ] Validate with native French speaker

## Translation Notes

### Currency Format

Use consistent currency formatting:
- English: "5,000,000 GNF" or "5 000 000 GNF"
- French: "5 000 000 GNF" (French uses spaces as thousand separators)

### Date Format

- English: "January 11, 2026" or "11/01/2026"
- French: "11 janvier 2026" or "11/01/2026"

### Formal vs Informal

Use formal "vous" form in French for all user-facing text (not "tu").

### Professional Terminology

Maintain professional financial terminology:
- Registry = Caisse (not "registre")
- Safe = Coffre (not "sûr")
- Receipt = Reçu (not "réception")
- Voucher = Bon (not "coupon")

## Total Key Count

- Treasury: ~60 keys
- Payment Wizard: ~80 keys
- Expense Wizard: ~70 keys
- Receipts: ~25 keys
- Errors: ~25 keys

**Total: ~260 new translation keys**

All keys must be added to both language files for feature completeness.
