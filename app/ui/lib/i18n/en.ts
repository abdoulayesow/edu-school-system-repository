// English translations
import type { TranslationKeys } from "./fr";

export const en: TranslationKeys = {
  // Common
  common: {
    search: "Search",
    cancel: "Cancel",
    save: "Save",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    add: "Add",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",
    all: "All",
    actions: "Actions",
    status: "Status",
    date: "Date",
    amount: "Amount",
    students: "students",
    student: "Student",
    teacher: "Teacher",
    user: "User",
    level: "Level",
    online: "Online",
    offline: "Offline",
    onlineSynced: "Online - Synced",
    offlineMode: "Offline Mode",
    menu: "Menu",
    select: "Select",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    enrollments: "Enrollments",
    students: "Students",
    grades: "Classes",
    activities: "Activities",
    accounting: "Accounting",
    attendance: "Attendance",
    reports: "Reports",
    users: "Users",
    login: "Login",
    signOut: "Sign Out",
    managementSystem: "Management System",
    profile: "Profile",
    myAccount: "My Account",
  },

  // Homepage
  home: {
    schoolName: "Groupe Scolaire Privé N'Diolou",
    managementSystem: "Management System",
    heroDescription: "A comprehensive school management platform built for excellence, security, and traceability in African education.",
    goToDashboard: "Go to Dashboard",
    exploreSystem: "Explore the System",
    exploreDescription: "Navigate to different sections of the platform designed for specific roles and workflows",
    
    // Page descriptions
    dashboardDesc: "Director's oversight view with KPIs, pending approvals, and action items",
    enrollmentsDesc: "Manage student enrollments, registration, and profile information",
    activitiesDesc: "Organize classes, clubs, and extracurricular activities",
    accountingDesc: "Track payments, reconciliations, and financial control with full traceability",
    attendanceDesc: "Mobile-first attendance tracking with quick tap-to-mark interface",
    reportsDesc: "Academic oversight and participation analytics for data-driven decisions",

    // Features section
    builtForAfricanSchools: "Built for African Schools",
    featuresDescription: "Designed with the unique needs of West African educational institutions in mind",
    offlineFirstTitle: "Offline-First Design",
    offlineFirstDesc: "Work seamlessly even with limited connectivity. All data syncs automatically when online.",
    securityTitle: "Security & Traceability",
    securityDesc: "Every action is logged with transaction IDs and supporting documentation for full accountability.",
    roleBasedTitle: "Role-Based Access",
    roleBasedDesc: "Tailored interfaces for directors, secretaries, accountants, teachers, and academic directors.",

    // CTA section
    readyToStart: "Ready to Get Started?",
    ctaDescription: "Access the platform and start managing your school with confidence",
    openDashboard: "Open Dashboard",
    manageEnrollments: "Manage Enrollments",

    // Footer
    excellenceInEducation: "Excellence in Education",
    footerCopyright: "© 2025 GSPN Management System. Built with excellence for African education.",
  },

  // Dashboard
  dashboard: {
    title: "Director's Dashboard",
    greeting: "Hello",
    greetingWithName: "Hello, {name}",
    
    // Summary cards
    totalEnrollment: "Total Enrollment",
    vsLastMonth: "vs last month",
    revenue: "Revenue (This Period)",
    pending: "Pending",
    pendingApprovals: "Pending Approvals",
    viewExceptions: "View exceptions →",
    reconciliationFlags: "Reconciliation Flags",
    needsAttention: "Needs attention",

    // Exception tickets
    pendingExceptionTickets: "Pending Exception Tickets",
    requestsNeedingApproval: "Requests needing your approval",
    requestType: "Request type",
    student: "Student",
    details: "Details",
    actions: "Actions",
    approve: "Approve",
    review: "Review",
    by: "By",

    // Exception types
    paymentDiscount: "Payment Discount",
    lateEnrollment: "Late Enrollment",
    feeWaiver: "Fee Waiver",
    paymentPlan: "Payment Plan",
    activityModification: "Activity Modification",

    // Recent activity
    recentActivity: "Recent Activity",
    importantEvents: "Important events and system actions",
    viewAllHistory: "View all history",
    hoursAgo: "{hours} hours ago",
    yesterdayAt: "Yesterday at {time}",

    // Activity actions
    financialPeriodClosed: "Financial Period Closed",
    bulkEnrollmentProcessed: "Bulk Enrollment Processed ({count} students)",
    academicReportGenerated: "Academic Report Generated",
    bankDiscrepancyFlagged: "Bank Discrepancy Flagged",
    paymentValidation: "Validation of {count} Payments",

    // Charts
    enrollmentByLevel: "Enrollment by Level",
    studentDistribution: "Student distribution by class",
    revenueByCategory: "Revenue by Category",
    revenueDistribution: "Revenue distribution by type",
    viewAllReports: "View all reports",

    // Revenue categories
    tuition: "Tuition",
    extraActivities: "Extra Activities",
    canteen: "Canteen",
    transport: "Transport",
    
    reasons: {
      familySituation: "Difficult family situation - 20% discount requested",
      schoolTransfer: "Transfer from another school - documents in order",
      billingError: "Billing error - double payment",
      paymentSpread: "Payment spread over 3 months requested",
      clubChange: "Change of sports club",
    },
  },

  // Enrollments
  enrollments: {
    title: "Enrollment Management",
    subtitle: "Manage student enrollments and profiles",
    allStudents: "All Students",
    studentsEnrolled: "{count} students enrolled",
    newEnrollment: "New Enrollment",
    searchPlaceholder: "Search by name, student ID...",

    // Table headers
    studentId: "Student ID",
    fullName: "Full Name",
    enrollmentDate: "Enrollment Date",
    paymentStatus: "Payment Status",

    // Payment status
    paid: "Paid",
    pendingPayment: "Pending",
    overdue: "Overdue",

    // New enrollment dialog
    newStudentEnrollment: "New Student Enrollment",
    fillStudentInfo: "Fill in the student information to create a new enrollment",

    // Personal info
    personalInfo: "Personal Information",
    firstName: "First Name",
    firstNamePlaceholder: "Student's first name",
    lastName: "Last Name",
    lastNamePlaceholder: "Last name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    selectGender: "Select",
    male: "Male",
    female: "Female",

    // Academic info
    academicInfo: "Academic Information",
    selectLevel: "Select level",

    // Guardian info
    guardianInfo: "Guardian Information",
    guardianName: "Guardian Full Name",
    guardianNamePlaceholder: "Parent/guardian name",
    phone: "Phone",
    email: "Email",
    emailPlaceholder: "email@example.com",

    // Documents
    documents: "Documents",
    birthCertificate: "Birth Certificate",
    fileUploadHint: "PDF, JPG or PNG - Max 5MB",

    // Buttons
    createEnrollment: "Create Enrollment",
  },

  // Activities
  activities: {
    title: "Activity Management",
    subtitle: "Manage academic and extracurricular activities",
    
    // Tabs
    tabAll: "All",
    tabAcademic: "Academic",
    tabExtra: "Extracurricular",

    // Activity types
    academic: "Academic",
    extra: "Extra",

    // Card info
    assignStudent: "Assign Student",

    // Assign dialog
    assignStudentTitle: "Assign Student",
    searchAndAdd: "Search and add a student to",
    searchStudentPlaceholder: "Search student by name or ID...",
    overduePayments: "Overdue payments",

    // Activity names
    englishClub: "English Club",
    advancedMath: "Advanced Mathematics",
    football: "Football",
    physics: "Physics",
    readingClub: "Reading Club",
    computerScience: "Computer Science",
  },

  // Accounting
  accounting: {
    title: "Financial Control Center",
    subtitle: "Manage payments, validations, and reconciliations",
    subtitleWithName: "Manage payments, validations, and reconciliations - {personName}",

    // Tabs
    tabPayments: "Payment Recording",
    tabReconciliation: "Reconciliation",
    tabPeriodClose: "Period Close",

    // Payments section
    paymentTransactions: "Payment Transactions",
    registerAndValidate: "Register and validate student payments",
    recordPayment: "Record Payment",
    savePayment: "Save Payment",

    // Payment status
    unvalidated: "Unvalidated",
    validated: "Validated",
    reconciled: "Reconciled",
    readyForReconciliation: "Ready for reconciliation",
    completed: "Completed",

    // Table headers
    transactionId: "Transaction ID",
    method: "Method",
    reference: "Reference",
    validate: "Validate",

    // Record payment dialog
    recordNewPayment: "Record New Payment",
    allFieldsRequired: "All fields are required. Supporting document is mandatory.",
    searchStudent: "Search for a student...",
    amountGNF: "Amount (GNF)",
    paymentType: "Payment Type",
    cash: "Cash",
    mobileMoney: "Mobile Money (Orange/MTN)",
    bankTransfer: "Bank Transfer",
    documentReference: "Supporting Document Reference",
    documentReferencePlaceholder: "e.g., OM-2024-123 or CASH-2024-045",
    documentReferenceHint: "Mobile Money receipt reference, cash receipt number, or bank reference",
    supportingDocument: "Supporting Document (Scan/Capture)",
    supportingDocumentHint: "Required: Mobile Money receipt, screenshot, or scanned document",
    notes: "Notes",
    notesOptional: "Notes (Optional)",
    notesPlaceholder: "Additional information...",

    // Reconciliation tab
    validatedPayments: "Validated Payments",
    selectPaymentsToReconcile: "Select payments to reconcile",
    totalSelected: "Total Selected",
    bankDeposits: "Bank Deposits",
    selectMatchingDeposit: "Select matching deposit",
    comparison: "Comparison",
    selectedPayments: "Selected Payments",
    vs: "vs",
    bankDeposit: "Bank Deposit",
    discrepancyDetected: "Discrepancy detected - Verify before reconciling",
    flagDiscrepancy: "Flag Discrepancy",
    reconcile: "Reconcile",

    // Period close tab
    periodCloseWizard: "Period Close Wizard",
    closeCurrentPeriod: "Close the current financial period and generate final report",
    preCloseVerification: "Pre-Close Verification",
    allPaymentsValidated: "All payments validated",
    unvalidatedPayments: "{count} unvalidated payments",
    allReconciliationsDone: "All reconciliations completed",
    pendingReconciliations: "{count} pending reconciliations",
    discrepanciesResolved: "Discrepancies resolved",
    discrepanciesNeedAttention: "{count} discrepancies need attention",
    summaryReview: "Summary Review",
    availableAfterPreClose: "Available after all pre-close verifications are resolved",
    closePeriod: "Close Period",
    irreversibleAction: "Irreversible Action",
    closePeriodWarning: "Closing the period locks all transactions and prevents any further modifications. Make sure all verifications are complete.",
    closeFinancialPeriod: "Close Financial Period",
  },

  // Attendance
  attendance: {
    title: "Take Attendance",
    welcome: "Welcome",

    // Activity list
    todaysActivities: "Today's Activities",
    takeAttendance: "Take Attendance",

    // Taking attendance
    tapToChange: "Tap on a student to change attendance status",

    // Summary
    present: "Present",
    absent: "Absent",
    excused: "Excused",

    // Status labels
    statusPresent: "Present",
    statusAbsent: "Absent",
    statusExcused: "Excused",

    // Student list
    studentList: "Student List",
    allMarkedPresent: "All students are marked present by default",
    overduePayment: "Overdue payment",

    // Submit
    submitAttendance: "Submit Attendance",

    // Instructions
    instructions: "Instructions",
    instruction1: "Tap on a student to change their status",
    instruction2: "Present (green) → Absent (red) → Excused (orange) → Present",
    instruction3: "Students with overdue payments are marked with a badge",
    instruction4: "Click \"Submit\" to save attendance",
  },

  // Reports
  reports: {
    title: "Academic Reports",
    subtitle: "Activity and participation oversight",

    // Tabs
    tabOverview: "Overview",
    tabParticipation: "Participation Reports",

    // Summary cards
    totalActivities: "Total Activities",
    academicActivities: "academic",
    extraActivities: "extra",
    enrolledStudents: "Enrolled Students",
    totalEnrollments: "Total enrollments",
    averageAttendance: "Average Attendance Rate",
    satisfactoryPerformance: "Satisfactory performance",
    atRiskStudents: "At-Risk Students",
    lowParticipation: "Low participation",

    // Filters
    allTeachers: "All teachers",
    allLevels: "All levels",

    // Activities list
    allActivities: "All Activities",
    activitiesShown: "activity(ies) shown",
    averageAttendanceRate: "Average attendance",

    // Participation tab
    attendanceTrend: "Attendance Trend",
    weeklyAttendanceRate: "Weekly attendance rate for",
    ratePercent: "Rate (%)",

    // Low participation
    lowParticipationStudents: "Students with Low Participation",
    studentsNeedingFollowup: "Students needing follow-up for low participation rate (<60%)",
    activitiesEnrolled: "activities enrolled",

    // Student reasons
    lowFrequency: "Low frequency",
    repeatedAbsences: "Repeated absences",
    veryLowParticipation: "Very low participation",
    needsFollowup: "Needs follow-up",

    // Chart
    attendanceByActivity: "Attendance by Activity",
    attendanceComparison: "Comparison of attendance rates between activities",
  },

  // Login
  login: {
    title: "School Management System",
    subtitle: "Sign in to your account",
    email: "Email address",
    emailPlaceholder: "your.email@school.gn",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    signIn: "Sign in",
    connected: "Connected",
    workingOffline: "Working offline",
    tagline: "For African schools, by Africans",
    simulateOffline: "Simulate offline mode",
    simulateOnline: "Simulate online mode",
    // Enhanced login page
    schoolName: "Groupe Scolaire Privé N'Diolou",
    schoolTagline: "Excellence in Education",
    welcomeTitle: "Welcome to the School Management System",
    welcomeSubtitle: "A comprehensive platform for managing enrollments, attendance, accounting, and more.",
    signInTitle: "Sign In",
    signInSubtitle: "Access the School Management System",
    signInButton: "Sign In",
    forgotPassword: "Forgot password?",
    orContinueWith: "Or continue with",
    signInWithGoogle: "Sign in with Google",
    invalidCredentials: "Invalid email or password",
    loginError: "An error occurred. Please try again.",
    // Feature cards
    featureOffline: "Offline Mode",
    featureOfflineDesc: "Work without internet. Data syncs automatically when online.",
    featureOfflineShort: "Works Offline",
    featureEnrollment: "Student Enrollment",
    featureEnrollmentDesc: "Easy 6-step enrollment wizard with payment tracking.",
    featureEnrollmentShort: "Easy Enrollment",
    featureAccounting: "Financial Control",
    featureAccountingDesc: "Full payment tracking with receipts and reconciliation.",
    featureAccountingShort: "Payment Tracking",
    featureAttendance: "Attendance",
    featureAttendanceDesc: "Mobile-first attendance tracking with reports.",
    featureAttendanceShort: "Attendance",
    securityNote: "Secure and trusted by schools across Guinea",
    footerText: "© 2025 GSPN. All rights reserved.",
  },

  // Users
  users: {
    title: "User Management",
    subtitle: "Invite and manage system users",
    inviteUser: "Invite User",
    inviteUserDescription: "Send an email invitation to add a new user to the system.",
    userEmailPlaceholder: "user@email.gn",
    selectRole: "Select a role",
    permissionsForRole: "Permissions for {role}",
    selectRoleToSeePermissions: "Select a role to see permissions",
    sendInvitation: "Send Invitation",
    filterByRole: "Filter by role",
    allRoles: "All roles",
    userList: "User List",
    usersFound: "{count} user(s) found",
    lastActivity: "Last Activity",
    neverConnected: "Never connected",
    active: "Active",
    invited: "Invited",
    inactive: "Inactive",
    sendEmail: "Send Email",
    editPermissions: "Edit Permissions",
    resendInvitation: "Resend Invitation",
    revokeAccess: "Revoke Access",
    parent: "Parent",
    permissions: {
      director: {
        p1: "Full access to the system",
        p2: "User management",
        p3: "Reports and statistics",
      },
      teacher: {
        p1: "Grade entry",
        p2: "Attendance management",
        p3: "View assigned classes",
      },
      accountant: {
        p1: "Invoice creation",
        p2: "Payment tracking",
        p3: "Financial reports",
      },
      parent: {
        p1: "View children's grades",
        p2: "Pay invoices",
        p3: "Receive notifications",
      },
      student: {
        p1: "View own grades",
        p2: "Consult schedule",
        p3: "Receive notifications",
      }
    },
    userCounts: {
      directors: "Directors",
      teachers: "Teachers",
      accountants: "Accountants",
      parents: "Parents",
      students: "Students",
    },
    addUser: "Add User",
    searchPlaceholder: "Search by name, email...",
    
    // Table headers
    name: "Name",
    role: "Role",
    lastLogin: "Last Login",
    
    // Roles
    director: "Director",
    academicDirector: "Academic Director",
    secretary: "Secretary",
    accountant: "Accountant",
    teacher: "Teacher",
  },

  // Grades
  grades: {
    title: "Grade Management",
    subtitle: "Prof. {teacherName} - {subjectName}",
    saveChanges: "Save ({count})",
    subject: "Subject",
    period: "Period",
    selectClass: "Select a class",
    selectSubject: "Select a subject",
    selectPeriod: "Select a period",
    classAverage: "Class Average",
    onNStudents: "On {count} students",
    top3Students: "Top 3 Students",
    needsAttention: "Needs Attention",
    studentsBelow10: "Students with grade < 10",
    pendingChanges: "{count} grades pending save",
    clickToSave: "- Click Save to record your changes",
    gradeEntry: "Grade Entry",
    gradeEntryDescription: "Enter grades out of 20. Changes are saved in real-time.",
    previousGrade: "Previous Grade",
    currentGrade: "Current Grade",
    trend: "Trend",
    synced: "Synced",
    pending: "Pending",
    subjects: {
      mathematics: "Mathematics",
      french: "French",
      english: "English",
      sciences: "Sciences",
    },
    terms: {
      term1: "Term 1",
      term2: "Term 2",
      term3: "Term 3",
    },
  },

  // Classes
  classes: {
    title: "Timetable",
    subtitle: "Manage schedules and classes",
    exportPdf: "Export PDF",
    addCourse: "Add Course",
    classes: "Classes",
    statistics: "Statistics",
    totalClasses: "Total Classes",
    totalStudents: "Total Students",
    coursesToday: "Courses Today",
    selectDay: "Select a day",
    scheduleForDay: "Timetable - {day}",
    noCoursesForDay: "No courses scheduled for this day",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
    },
  },

  // Levels
  levels: {
    cp1: "CP1",
    cp2: "CP2",
    ce1: "CE1",
    ce2: "CE2",
    cm1: "CM1",
    cm2: "CM2",
    "6eme": "6th Grade",
    "5eme": "7th Grade",
    "4eme": "8th Grade",
    "3eme": "9th Grade",
  },

  // Enrollment Wizard
  enrollmentWizard: {
    // Main
    title: "Student Enrollment",
    subtitle: "Enrollment process for the school year",

    // Steps
    step1: "Grade Selection",
    step2: "Student Information",
    step3: "Payment Schedule",
    step4: "Payment",
    step5: "Review",
    step6: "Confirmation",

    // Step 1 - Grade Selection
    selectGrade: "Select Grade",
    selectGradeDescription: "Choose the grade level for enrollment",
    schoolYear: "School Year",
    todayDate: "Today's Date",
    elementary: "Elementary",
    college: "College",
    highSchool: "High School",
    studentsEnrolled: "{count} students enrolled",
    yearlyTuition: "Yearly Tuition",
    perYear: "/year",

    // Step 2 - Student Info
    studentInfo: "Student Information",
    newStudent: "New Student",
    returningStudent: "Returning Student",
    searchStudent: "Search by student number, name, or date of birth",
    noStudentFound: "No student found",
    selectThisStudent: "Select this student",

    // Personal info
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    phone: "Phone",
    email: "Email",
    photo: "Photo",
    birthCertificate: "Birth Certificate",
    uploadPhoto: "Upload Photo",
    uploadDocument: "Upload Document",

    // Parent info
    parentInfo: "Parent Information",
    fatherInfo: "Father's Information",
    motherInfo: "Mother's Information",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    fatherPhone: "Father's Phone",
    motherPhone: "Mother's Phone",
    fatherEmail: "Father's Email",
    motherEmail: "Mother's Email",
    address: "Address",

    // Notes
    additionalNotes: "Additional Notes",
    addNote: "Add Note",
    noteTitle: "Title",
    noteContent: "Content",
    removeNote: "Remove",

    // Step 3 - Payment Breakdown
    paymentBreakdown: "Payment Schedule",
    totalYearlyAmount: "Total Yearly Amount",
    schedule1: "Schedule 1",
    schedule2: "Schedule 2",
    schedule3: "Schedule 3",
    schedule1Months: "September + October + May",
    schedule2Months: "November + December + January",
    schedule3Months: "February + March + April",
    dueBy: "Due by",
    adjustAmount: "Adjust Amount",
    adjustmentReason: "Adjustment Reason",
    requiresApproval: "This adjustment requires director approval",
    originalAmount: "Original Amount",
    adjustedAmount: "Adjusted Amount",

    // Step 4 - Payment Transaction
    paymentTransaction: "Record Payment",
    paymentOptional: "Payment is optional at this step",
    skipPayment: "Pay Later",
    makePayment: "Make Payment",
    paymentMethod: "Payment Method",
    cash: "Cash",
    orangeMoney: "Orange Money",
    amount: "Amount",
    receiptNumber: "Receipt Number",
    transactionRef: "Transaction Reference",
    uploadReceipt: "Upload Receipt",
    receiptRequired: "Receipt is required",
    paymentCoverage: "Payment Coverage",
    monthsCovered: "Months Covered",
    percentPaid: "Percent Paid",

    // Step 5 - Review
    reviewEnrollment: "Review Enrollment",
    reviewDescription: "Review all information before submitting",
    editSection: "Edit",
    gradeInfo: "Grade Information",
    studentDetails: "Student Details",
    parentDetails: "Parent Details",
    paymentDetails: "Payment Details",
    notesSection: "Notes",

    // Step 6 - Confirmation
    enrollmentComplete: "Enrollment Submitted!",
    enrollmentNumber: "Enrollment Number",
    studentNumber: "Student Number",
    downloadPdf: "Download PDF",
    downloadingPdf: "Generating PDF...",
    pdfDownloadError: "Failed to download PDF. Please try again.",
    printDocument: "Print",
    statusSubmittedPendingReview: "Submitted - Pending Review",
    statusReviewRequired: "Director Review Required",
    autoApproveIn: "Auto-approval in {days} days",

    // Status badges
    statusDraft: "Draft",
    statusSubmitted: "Submitted",
    statusNeedsReview: "Needs Review",
    statusCompleted: "Completed",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusCancelled: "Cancelled",

    // Suggested students
    suggestedStudents: "Suggested Students",
    suggestedStudentsDescription: "Students from the previous grade who can be re-enrolled",
    fromPreviousGrade: "Previous grade",
    noSuggestedStudents: "No suggested students available",
    orSearchManually: "or search manually",

    // Draft management
    draftSaved: "Draft saved",
    draftRecovered: "Draft recovered from {date}",
    draftExpires: "Draft expires in {days} days",
    continueDraft: "Continue Draft",
    discardDraft: "Discard Draft",

    // Validation errors
    selectGradeRequired: "Please select a grade",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    parentRequired: "At least one parent name is required",
    phoneRequired: "At least one phone number is required",
    receiptNumberRequired: "Receipt number is required",

    // Actions
    saveAndContinue: "Save and Continue",
    saveDraft: "Save Draft",
    submitEnrollment: "Submit Enrollment",
    goBack: "Go Back",

    // Confirmation page
    enrollmentSummary: "Enrollment Summary",
    backToEnrollments: "Back to Enrollments",
    startNewEnrollment: "Start New Enrollment",
  },

  // Students module
  students: {
    title: "Student Management",
    subtitle: "View and manage enrolled students",
    searchPlaceholder: "Search by name or number...",
    filters: "Filters",
    allGrades: "All grades",
    allStatuses: "All statuses",

    // Status labels
    balanceStatus: "Payment status",
    late: "Late",
    onTime: "On time",
    inAdvance: "In advance",
    complete: "Complete",
    goldMedal: "Payment complete",

    // Attendance status
    attendanceGood: "Good attendance",
    attendanceConcerning: "Concerning attendance",
    attendanceCritical: "Critical attendance",

    // Student detail
    personalInfo: "Personal information",
    paymentHistory: "Payment history",
    attendanceHistory: "Attendance history",
    progressBar: "Progress",
    remainingBalance: "Remaining balance",
    uploadPhoto: "Upload photo",
  },

  // Enhanced attendance
  attendanceEnhanced: {
    selectGrade: "Select a class",
    selectDate: "Select a date",
    entryMode: "Entry mode",
    checklistMode: "Full checklist",
    checklistModeDesc: "Mark each student individually",
    absencesOnlyMode: "Absences only",
    absencesOnlyModeDesc: "Mark only absences and late arrivals",
    markAllPresent: "Mark all present",
    sessionComplete: "Session complete",
    completeSession: "Complete session",
    late: "Late",
    attendanceRate: "Attendance rate",
    swipeLeft: "Swipe left = absent",
    swipeRight: "Swipe right = present",
  },

  // Enhanced accounting
  accountingEnhanced: {
    pendingDeposit: "Pending deposit",
    deposited: "Deposited",
    pendingReview: "Pending review",
    confirmed: "Confirmed",
    rejected: "Rejected",
    recordDeposit: "Record deposit",
    bankReference: "Bank reference",
    depositDate: "Deposit date",
    bankName: "Bank name",
    depositedBy: "Deposited by",
    reviewPayment: "Review payment",
    approvePayment: "Approve payment",
    rejectPayment: "Reject payment",
    reviewNotes: "Review notes",
    balance: "Balance",
    cashAvailable: "Cash available",
    cashPending: "Cash pending",
    margin: "Margin",
    orangeMoneyPayments: "Orange Money payments",
    cashPayments: "Cash payments",
  },

  // Grades module (enhanced)
  gradesEnhanced: {
    gradeLeader: "Class leader",
    assignLeader: "Assign leader",
    subjectsList: "Subjects list",
    teacherAssignment: "Assigned teacher",
    assignTeacher: "Assign teacher",
    attendanceRatio: "Attendance rate",
    paymentRatio: "Payment rate",
    studentsInGrade: "Students in class",
    coefficient: "Coefficient",
    hoursPerWeek: "Hours per week",
  },

  // Expenses
  expenses: {
    title: "Expense management",
    subtitle: "Record and track expenses",
    newExpense: "New expense",
    category: "Category",
    description: "Description",
    vendor: "Vendor",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    paid: "Paid",
    requestApproval: "Request approval",
    approveExpense: "Approve expense",
    rejectExpense: "Reject expense",
    markAsPaid: "Mark as paid",
    rejectionReason: "Rejection reason",
    receipt: "Receipt",
    uploadReceipt: "Upload receipt",
    categories: {
      supplies: "Supplies",
      maintenance: "Maintenance",
      utilities: "Utilities",
      salary: "Salary",
      transport: "Transport",
      communication: "Communication",
      other: "Other",
    },
  },

  // Grade names (Guinea format)
  gradeNames: {
    "1ere": "1st Year",
    "2eme": "2nd Year",
    "3eme": "3rd Year",
    "4eme": "4th Year",
    "5eme": "5th Year",
    "6eme": "6th Year",
    "7eme": "7th Year",
    "8eme": "8th Year",
    "9eme": "9th Year",
    "10eme": "10th Year",
    "11eme": "11th Year",
    "12eme": "12th Year",
    terminal: "Terminal",
  },
} as const;