// English translations
export const en = {
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
    student: "student",
    teacher: "Teacher",
    level: "Level",
    online: "Online",
    offline: "Offline",
    onlineSynced: "Online - Synced",
    offlineMode: "Offline Mode",
    menu: "Menu",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    enrollments: "Enrollments",
    activities: "Activities",
    accounting: "Accounting",
    attendance: "Attendance",
    reports: "Reports",
    users: "Users",
    login: "Login",
    managementSystem: "Management System",
  },

  // Homepage
  home: {
    schoolName: "Groupe Scolaire GSN N'Diolou",
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

    // Tabs
    tabPayments: "Payment Recording",
    tabReconciliation: "Reconciliation",
    tabPeriodClose: "Period Close",

    // Payments section
    paymentTransactions: "Payment Transactions",
    registerAndValidate: "Register and validate student payments",
    recordPayment: "Record Payment",

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
  },

  // Users
  users: {
    title: "User Management",
    subtitle: "Manage user accounts and roles",
    allUsers: "All Users",
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
} as const;
