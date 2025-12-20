// French translations (Default language)
export const fr = {
  // Common
  common: {
    search: "Rechercher",
    cancel: "Annuler",
    save: "Enregistrer",
    submit: "Soumettre",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    add: "Ajouter",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    close: "Fermer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    required: "Obligatoire",
    optional: "Optionnel",
    yes: "Oui",
    no: "Non",
    all: "Tous",
    actions: "Actions",
    status: "Statut",
    date: "Date",
    amount: "Montant",
    students: "étudiants",
    student: "étudiant",
    teacher: "Enseignant",
    level: "Niveau",
    online: "En ligne",
    offline: "Hors ligne",
    onlineSynced: "En ligne - Synchronisé",
    offlineMode: "Mode hors ligne",
    menu: "Menu",
  },

  // Navigation
  nav: {
    dashboard: "Tableau de Bord",
    enrollments: "Inscriptions",
    activities: "Activités",
    accounting: "Comptabilité",
    attendance: "Présence",
    reports: "Rapports",
    users: "Utilisateurs",
    login: "Connexion",
    managementSystem: "Système de Gestion",
  },

  // Homepage
  home: {
    schoolName: "Groupe Scolaire GSN N'Diolou",
    managementSystem: "Système de Gestion",
    heroDescription: "Une plateforme complète de gestion scolaire construite pour l'excellence, la sécurité et la traçabilité dans l'éducation africaine.",
    goToDashboard: "Aller au Tableau de Bord",
    exploreSystem: "Explorer le Système",
    exploreDescription: "Naviguez vers les différentes sections de la plateforme conçues pour des rôles et flux de travail spécifiques",
    
    // Page descriptions
    dashboardDesc: "Vue de supervision du directeur avec KPIs, approbations en attente et éléments d'action",
    enrollmentsDesc: "Gérer les inscriptions, enregistrements et informations des étudiants",
    activitiesDesc: "Organiser les classes, clubs et activités extrascolaires",
    accountingDesc: "Suivre les paiements, réconciliations et contrôle financier avec traçabilité complète",
    attendanceDesc: "Suivi de présence mobile avec interface de marquage rapide",
    reportsDesc: "Supervision académique et analyses de participation pour des décisions basées sur les données",

    // Features section
    builtForAfricanSchools: "Conçu pour les Écoles Africaines",
    featuresDescription: "Conçu avec les besoins uniques des établissements d'enseignement ouest-africains à l'esprit",
    offlineFirstTitle: "Conception Hors-ligne d'Abord",
    offlineFirstDesc: "Travaillez sans interruption même avec une connectivité limitée. Toutes les données se synchronisent automatiquement en ligne.",
    securityTitle: "Sécurité et Traçabilité",
    securityDesc: "Chaque action est enregistrée avec des IDs de transaction et documents justificatifs pour une responsabilité totale.",
    roleBasedTitle: "Accès Basé sur les Rôles",
    roleBasedDesc: "Interfaces adaptées pour directeurs, secrétaires, comptables, enseignants et directeurs académiques.",

    // CTA section
    readyToStart: "Prêt à Commencer?",
    ctaDescription: "Accédez à la plateforme et commencez à gérer votre école en toute confiance",
    openDashboard: "Ouvrir le Tableau de Bord",
    manageEnrollments: "Gérer les Inscriptions",

    // Footer
    excellenceInEducation: "Excellence dans l'Éducation",
    footerCopyright: "© 2025 Système de Gestion GSPN. Construit avec excellence pour l'éducation africaine.",
  },

  // Dashboard
  dashboard: {
    title: "Tableau de Bord du Directeur",
    greeting: "Bonjour",
    
    // Summary cards
    totalEnrollment: "Inscription Totale",
    vsLastMonth: "vs mois dernier",
    revenue: "Revenu (Cette Période)",
    pending: "En attente",
    pendingApprovals: "Approbations en Attente",
    viewExceptions: "Voir les exceptions →",
    reconciliationFlags: "Drapeaux de Réconciliation",
    needsAttention: "Nécessite attention",

    // Exception tickets
    pendingExceptionTickets: "Tickets d'Exception en Attente",
    requestsNeedingApproval: "Demandes nécessitant votre approbation",
    approve: "Approuver",
    review: "Réviser",
    by: "Par",

    // Exception types
    paymentDiscount: "Remise de Paiement",
    lateEnrollment: "Inscription Tardive",
    feeWaiver: "Annulation de Frais",
    paymentPlan: "Plan de Paiement",
    activityModification: "Modification d'Activité",

    // Recent activity
    recentActivity: "Activité Récente",
    importantEvents: "Événements importants et actions du système",
    viewAllHistory: "Voir tout l'historique",
    hoursAgo: "Il y a {hours} heures",
    yesterdayAt: "Hier à {time}",

    // Activity actions
    financialPeriodClosed: "Période Financière Clôturée",
    bulkEnrollmentProcessed: "Inscription en Masse Traitée ({count} étudiants)",
    academicReportGenerated: "Rapport Académique Généré",
    bankDiscrepancyFlagged: "Discordance Bancaire Signalée",
    paymentValidation: "Validation de {count} Paiements",

    // Charts
    enrollmentByLevel: "Inscriptions par Niveau",
    studentDistribution: "Répartition des étudiants par classe",
    revenueByCategory: "Revenu par Catégorie",
    revenueDistribution: "Distribution des revenus par type",
    viewAllReports: "Voir tous les rapports",

    // Revenue categories
    tuition: "Scolarité",
    extraActivities: "Activités Extra",
    canteen: "Cantine",
    transport: "Transport",
  },

  // Enrollments
  enrollments: {
    title: "Gestion des Inscriptions",
    subtitle: "Gérer les inscriptions et profils des étudiants",
    allStudents: "Tous les Étudiants",
    studentsEnrolled: "{count} étudiants inscrits",
    newEnrollment: "Nouvelle Inscription",
    searchPlaceholder: "Rechercher par nom, ID étudiant...",

    // Table headers
    studentId: "ID Étudiant",
    fullName: "Nom Complet",
    enrollmentDate: "Date d'Inscription",
    paymentStatus: "Statut de Paiement",

    // Payment status
    paid: "Payé",
    pendingPayment: "En Attente",
    overdue: "En Retard",

    // New enrollment dialog
    newStudentEnrollment: "Nouvelle Inscription d'Étudiant",
    fillStudentInfo: "Remplissez les informations de l'étudiant pour créer une nouvelle inscription",

    // Personal info
    personalInfo: "Informations Personnelles",
    firstName: "Prénom",
    firstNamePlaceholder: "Prénom de l'étudiant",
    lastName: "Nom",
    lastNamePlaceholder: "Nom de famille",
    dateOfBirth: "Date de Naissance",
    gender: "Genre",
    selectGender: "Sélectionner",
    male: "Masculin",
    female: "Féminin",

    // Academic info
    academicInfo: "Informations Académiques",
    selectLevel: "Sélectionner le niveau",

    // Guardian info
    guardianInfo: "Informations du Tuteur",
    guardianName: "Nom Complet du Tuteur",
    guardianNamePlaceholder: "Nom du parent/tuteur",
    phone: "Téléphone",
    email: "Email",
    emailPlaceholder: "email@exemple.com",

    // Documents
    documents: "Documents",
    birthCertificate: "Acte de Naissance",
    fileUploadHint: "PDF, JPG ou PNG - Max 5MB",

    // Buttons
    createEnrollment: "Créer l'Inscription",
  },

  // Activities
  activities: {
    title: "Gestion des Activités",
    subtitle: "Gérer les activités scolaires et extrascolaires",
    
    // Tabs
    tabAll: "Toutes",
    tabAcademic: "Scolaires",
    tabExtra: "Extrascolaires",

    // Activity types
    academic: "Scolaire",
    extra: "Extra",

    // Card info
    assignStudent: "Assigner un Étudiant",

    // Assign dialog
    assignStudentTitle: "Assigner un Étudiant",
    searchAndAdd: "Recherchez et ajoutez un étudiant à",
    searchStudentPlaceholder: "Rechercher un étudiant par nom ou ID...",
    overduePayments: "Paiements en retard",

    // Activity names
    englishClub: "Club d'Anglais",
    advancedMath: "Mathématiques Avancées",
    football: "Football",
    physics: "Sciences Physiques",
    readingClub: "Club de Lecture",
    computerScience: "Informatique",
  },

  // Accounting
  accounting: {
    title: "Centre de Contrôle Financier",
    subtitle: "Gérer les paiements, validations et réconciliations",

    // Tabs
    tabPayments: "Enregistrement de Paiements",
    tabReconciliation: "Réconciliation",
    tabPeriodClose: "Clôture de Période",

    // Payments section
    paymentTransactions: "Transactions de Paiement",
    registerAndValidate: "Enregistrer et valider les paiements des étudiants",
    recordPayment: "Enregistrer un Paiement",

    // Payment status
    unvalidated: "Non Validé",
    validated: "Validé",
    reconciled: "Réconcilié",
    readyForReconciliation: "Prêt pour réconciliation",
    completed: "Complété",

    // Table headers
    transactionId: "ID Transaction",
    method: "Méthode",
    reference: "Référence",
    validate: "Valider",

    // Record payment dialog
    recordNewPayment: "Enregistrer un Nouveau Paiement",
    allFieldsRequired: "Tous les champs sont obligatoires. Un document justificatif est requis.",
    searchStudent: "Rechercher un étudiant...",
    amountGNF: "Montant (GNF)",
    paymentType: "Type de Paiement",
    cash: "Espèces (Cash)",
    mobileMoney: "Mobile Money (Orange/MTN)",
    bankTransfer: "Virement Bancaire",
    documentReference: "Référence de Document Justificatif",
    documentReferencePlaceholder: "Ex: OM-2024-123 ou CASH-2024-045",
    documentReferenceHint: "Référence du reçu Mobile Money, numéro de reçu cash, ou référence bancaire",
    supportingDocument: "Document Justificatif (Scan/Capture)",
    supportingDocumentHint: "Requis: Reçu Mobile Money, capture d'écran, ou document scanné",
    notes: "Notes",
    notesPlaceholder: "Informations supplémentaires...",

    // Reconciliation tab
    validatedPayments: "Paiements Validés",
    selectPaymentsToReconcile: "Sélectionner les paiements à réconcilier",
    totalSelected: "Total Sélectionné",
    bankDeposits: "Dépôts Bancaires",
    selectMatchingDeposit: "Sélectionner le dépôt correspondant",
    comparison: "Comparaison",
    selectedPayments: "Paiements Sélectionnés",
    vs: "vs",
    bankDeposit: "Dépôt Bancaire",
    discrepancyDetected: "Discordance détectée - Vérifier avant de réconcilier",
    flagDiscrepancy: "Signaler Discordance",
    reconcile: "Réconcilier",

    // Period close tab
    periodCloseWizard: "Assistant de Clôture de Période",
    closeCurrentPeriod: "Fermer la période financière actuelle et générer le rapport final",
    preCloseVerification: "Vérification Pré-Clôture",
    allPaymentsValidated: "Tous les paiements validés",
    unvalidatedPayments: "{count} paiements non validés",
    allReconciliationsDone: "Toutes les réconciliations effectuées",
    pendingReconciliations: "{count} réconciliations en attente",
    discrepanciesResolved: "Discordances résolues",
    discrepanciesNeedAttention: "{count} discordances nécessitent attention",
    summaryReview: "Révision du Résumé",
    availableAfterPreClose: "Disponible après résolution de toutes les vérifications pré-clôture",
    closePeriod: "Clôturer la Période",
    irreversibleAction: "Action Irréversible",
    closePeriodWarning: "La clôture de période verrouille toutes les transactions et empêche toute modification ultérieure. Assurez-vous que toutes les vérifications sont complètes.",
    closeFinancialPeriod: "Clôturer la Période Financière",
  },

  // Attendance
  attendance: {
    title: "Prise de Présence",
    welcome: "Bienvenue",

    // Activity list
    todaysActivities: "Activités d'Aujourd'hui",
    takeAttendance: "Prendre Présence",

    // Taking attendance
    tapToChange: "Tapez sur un étudiant pour changer le statut de présence",

    // Summary
    present: "Présents",
    absent: "Absents",
    excused: "Excusés",

    // Status labels
    statusPresent: "Présent",
    statusAbsent: "Absent",
    statusExcused: "Excusé",

    // Student list
    studentList: "Liste des Étudiants",
    allMarkedPresent: "Tous les étudiants sont marqués présents par défaut",
    overduePayment: "Paiement en retard",

    // Submit
    submitAttendance: "Soumettre la Présence",

    // Instructions
    instructions: "Instructions",
    instruction1: "Tapez sur un étudiant pour changer son statut",
    instruction2: "Présent (vert) → Absent (rouge) → Excusé (orange) → Présent",
    instruction3: "Les étudiants avec paiements en retard sont marqués d'un badge",
    instruction4: "Cliquez sur \"Soumettre\" pour enregistrer la présence",
  },

  // Reports
  reports: {
    title: "Rapports Académiques",
    subtitle: "Supervision des activités et participation",

    // Tabs
    tabOverview: "Vue d'Ensemble",
    tabParticipation: "Rapports de Participation",

    // Summary cards
    totalActivities: "Total Activités",
    academicActivities: "scolaires",
    extraActivities: "extra",
    enrolledStudents: "Étudiants Inscrits",
    totalEnrollments: "Total d'inscriptions",
    averageAttendance: "Taux de Présence Moyen",
    satisfactoryPerformance: "Performance satisfaisante",
    atRiskStudents: "Étudiants à Risque",
    lowParticipation: "Faible participation",

    // Filters
    allTeachers: "Tous les enseignants",
    allLevels: "Tous les niveaux",

    // Activities list
    allActivities: "Toutes les Activités",
    activitiesShown: "activité(s) affichée(s)",
    averageAttendanceRate: "Présence moyenne",

    // Participation tab
    attendanceTrend: "Tendance de Présence",
    weeklyAttendanceRate: "Taux de présence hebdomadaire pour",
    ratePercent: "Taux (%)",

    // Low participation
    lowParticipationStudents: "Étudiants avec Faible Participation",
    studentsNeedingFollowup: "Étudiants nécessitant un suivi pour faible taux de participation (<60%)",
    activitiesEnrolled: "activités inscrites",

    // Student reasons
    lowFrequency: "Fréquence faible",
    repeatedAbsences: "Absences répétées",
    veryLowParticipation: "Très faible participation",
    needsFollowup: "Besoin de suivi",

    // Chart
    attendanceByActivity: "Présence par Activité",
    attendanceComparison: "Comparaison des taux de présence entre activités",
  },

  // Login
  login: {
    title: "Système de Gestion Scolaire",
    subtitle: "Connectez-vous à votre compte",
    email: "Adresse e-mail",
    emailPlaceholder: "votre.email@ecole.gn",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    signIn: "Se connecter",
    connected: "Connecté",
    workingOffline: "Mode hors ligne",
    tagline: "Pour les écoles africaines, par les africains",
    simulateOffline: "Simuler mode hors ligne",
    simulateOnline: "Simuler mode en ligne",
  },

  // Users
  users: {
    title: "Gestion des Utilisateurs",
    subtitle: "Gérer les comptes utilisateurs et les rôles",
    allUsers: "Tous les Utilisateurs",
    addUser: "Ajouter un Utilisateur",
    searchPlaceholder: "Rechercher par nom, email...",
    
    // Table headers
    name: "Nom",
    role: "Rôle",
    lastLogin: "Dernière Connexion",
    
    // Roles
    director: "Directeur",
    academicDirector: "Directeur Académique",
    secretary: "Secrétaire",
    accountant: "Comptable",
    teacher: "Enseignant",
  },

  // Levels
  levels: {
    cp1: "CP1",
    cp2: "CP2",
    ce1: "CE1",
    ce2: "CE2",
    cm1: "CM1",
    cm2: "CM2",
    "6eme": "6ème",
    "5eme": "5ème",
    "4eme": "4ème",
    "3eme": "3ème",
  },
} as const;

export type TranslationKeys = typeof fr;
