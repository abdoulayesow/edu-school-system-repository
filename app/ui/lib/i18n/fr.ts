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
    reset: "Réinitialiser",
    actions: "Actions",
    status: "Statut",
    date: "Date",
    amount: "Montant",
    students: "Élèves",
    student: "Élève",
    teacher: "Enseignant",
    user: "Utilisateur",
    level: "Niveau",
    online: "En ligne",
    offline: "Hors ligne",
    onlineSynced: "En ligne - synchronisé",
    offlineMode: "Mode hors ligne",
    menu: "Menu",
    select: "Sélectionner",
    selected: "Sélectionné",
    viewDetails: "Voir les détails",
    noData: "Aucune donnée disponible",
    today: "aujourd'hui",
    refresh: "Actualiser",
    description: "Description",
    notes: "Notes",
    recordedBy: "Enregistré par",
    notAssigned: "Non assigné",
    week: "semaine",
    subjects: "Matières",
    pagination: {
      pageOf: "Page {current} sur {total} ({count} résultats)",
      itemsPerPage: "Éléments par page :",
      goToPage: "Aller à...",
      go: "Aller",
    },
  },

  // Permissions
  permissions: {
    noAccess: "Vous n'avez pas la permission pour cette action",
    accessDenied: "Accès refusé",
    noPaymentPermission: "Vous n'avez pas la permission d'enregistrer des paiements. Veuillez contacter votre administrateur si vous avez besoin d'accès.",
  },

  // Navigation
  nav: {
    dashboard: "Tableau de bord",
    enrollments: "Inscriptions",
    students: "Élèves",
    grades: "Classes",
    activities: "Activités",
    accounting: "Comptabilité",
    attendance: "Présence",
    reports: "Rapports",
    users: "Utilisateurs",
    login: "Connexion",
    signOut: "Déconnexion",
    managementSystem: "Système de gestion",
    profile: "Profil",
    myAccount: "Mon compte",
    // New hierarchical navigation keys
    overview: "Aperçu",
    charts: "Graphiques",
    studentsSection: "Élèves",
    accountingSection: "Comptabilité",
    balance: "Solde",
    payments: "Paiements",
    expenses: "Dépenses",
    treasury: "Caisse",
    classes: "Classes",
    timetable: "Emploi du temps",
    audit: "Audit",
    financialAudit: "Audit Financier",
    dataHistory: "Historique des Données",
    collapseMenu: "Réduire le menu",
    expandMenu: "Agrandir le menu",
    closeMenu: "Fermer le menu",
    gradesClasses: "Niveaux & Classes",
    // Grading navigation
    gradingSection: "Notes",
    bulletins: "Bulletins",
    classRankingNav: "Classement",
    teacherRemarks: "Appréciations",
    conductEntry: "Conduite & Assiduité",
    trimesters: "Trimestres",
  },

  // Homepage
  home: {
    schoolName: "Groupe Scolaire Privé N'Diolou",
    managementSystem: "Système de gestion",
    heroDescription: "Une plateforme complète de gestion scolaire construite pour l'excellence, la sécurité et la traçabilité dans l'éducation africaine.",
    goToDashboard: "Aller au tableau de bord",
    exploreSystem: "Explorer le système",
    exploreDescription: "Naviguez vers les différentes sections de la plateforme conçues pour des rôles et flux de travail spécifiques",
    
    // Page descriptions
    dashboardDesc: "Vue de supervision du directeur avec KPIs, approbations en attente et éléments d'action",
    enrollmentsDesc: "Gérer les inscriptions, enregistrements et informations des élèves",
    activitiesDesc: "Organiser les classes, clubs et activités extrascolaires",
    accountingDesc: "Suivre les paiements, réconciliations et contrôle financier avec traçabilité complète",
    attendanceDesc: "Suivi de présence mobile avec interface de marquage rapide",
    reportsDesc: "Supervision académique et analyses de participation pour des décisions basées sur les données",

    // Features section
    builtForAfricanSchools: "Conçu pour les écoles africaines",
    featuresDescription: "Conçu avec les besoins uniques des établissements d'enseignement ouest-africains à l'esprit",
    offlineFirstTitle: "Conception hors-ligne d'abord",
    offlineFirstDesc: "Travaillez sans interruption même avec une connectivité limitée. Toutes les données se synchronisent automatiquement en ligne.",
    securityTitle: "Sécurité et traçabilité",
    securityDesc: "Chaque action est enregistrée avec des IDs de transaction et documents justificatifs pour une responsabilité totale.",
    roleBasedTitle: "Accès basé sur les rôles",
    roleBasedDesc: "Interfaces adaptées pour directeurs, secrétaires, comptables, enseignants et directeurs académiques.",

    // CTA section
    readyToStart: "Prêt à commencer?",
    ctaDescription: "Accédez à la plateforme et commencez à gérer votre école en toute confiance",
    openDashboard: "Ouvrir le tableau de bord",
    manageEnrollments: "Gérer les inscriptions",

    // Footer
    excellenceInEducation: "Excellence dans l'éducation",
    footerCopyright: "© 2025 Système de gestion GSPN. Construit avec excellence pour l'éducation africaine.",
  },

  // Dashboard
  dashboard: {
    title: "Tableau de bord du directeur",
    greeting: "Bonjour",
    greetingWithName: "Bonjour, {name}",
    
    // Summary cards
    totalEnrollment: "Inscription totale",
    vsLastMonth: "vs mois dernier",
    revenue: "Revenu (cette période)",
    pending: "En attente",
    pendingApprovals: "Approbations en attente",
    viewExceptions: "Voir les exceptions →",
    reconciliationFlags: "Drapeaux de réconciliation",
    needsAttention: "Nécessite attention",

    // Exception tickets
    pendingExceptionTickets: "Tickets d'exception en attente",
    requestsNeedingApproval: "Demandes nécessitant votre approbation",
    requestType: "Type de demande",
    student: "Élève",
    details: "Détails",
    actions: "Actions",
    approve: "Approuver",
    review: "Revue",
    by: "Par", 

    // Exception types
    paymentDiscount: "Remise de paiement",
    lateEnrollment: "Inscription tardive",
    feeWaiver: "Annulation de frais",
    paymentPlan: "Plan de paiement",
    activityModification: "Modification d'activité",
    cashToDeposit: "Espèces à déposer",

    // Recent activity
    recentActivity: "Activité récente",
    importantEvents: "Événements importants et actions du système",
    viewAllHistory: "Voir tout l'historique",
    hoursAgo: "Il y a {hours} heures",
    yesterdayAt: "Hier à {time}",

    // Activity actions
    financialPeriodClosed: "Période financière clôturée",
    bulkEnrollmentProcessed: "Inscription en masse traitée ({count} élèves)",
    academicReportGenerated: "Rapport académique généré",
    bankDiscrepancyFlagged: "Discordance bancaire signalée",
    paymentValidation: "Validation de {count} paiements",

    // Charts
    enrollmentByLevel: "Inscriptions par niveau",
    studentDistribution: "Répartition des élèves par classe",
    revenueByCategory: "Revenu par catégorie",
    revenueDistribution: "Distribution des revenus par type",
    viewAllReports: "Voir tous les rapports",

    // Revenue categories
    tuition: "Scolarité",
    extraActivities: "Activités Extra",
    canteen: "Cantine",
    transport: "Transport",
    
    reasons: {
      familySituation: "Situation familiale difficile - demande 20% réduction",
      schoolTransfer: "Transfert d'une autre école - documents en règle",
      billingError: "Erreur de facturation - double paiement",
      paymentSpread: "Étalement sur 3 mois demandé",
      clubChange: "Changement de club sportif",
    },
  },

  // Enrollments
  enrollments: {
    title: "Gestion des inscriptions",
    subtitle: "Gérer les inscriptions et profils des élèves",
    allStudents: "Tous les élèves",
    studentsEnrolled: "{count} élèves inscrits",
    newEnrollment: "Nouvelle inscription",
    searchPlaceholder: "Rechercher par nom, ID élève...",

    // Table headers
    studentId: "ID élève",
    enrollmentId: "ID d'inscription",
    fullName: "Nom complet",
    enrollmentDate: "Date d'inscription",
    paymentStatus: "Statut de paiement",
    enrollmentStatus: "Statut d'inscription",

    // Payment status
    paid: "Payé",
    pendingPayment: "En attente",
    overdue: "En retard",

    // New enrollment dialog
    newStudentEnrollment: "Nouvelle inscription d'élève",
    fillStudentInfo: "Remplissez les informations de l'élève pour créer une nouvelle inscription",

    // Personal info
    personalInfo: "Informations personnelles",
    firstName: "Prénom",
    firstNamePlaceholder: "Prénom de l'élève",
    middleName: "Deuxième prénom",
    lastName: "Nom",
    lastNamePlaceholder: "Nom de famille",
    dateOfBirth: "Date de naissance",
    gender: "Genre",
    selectGender: "Sélectionner",
    male: "Masculin",
    female: "Féminin",

    // Academic info
    academicInfo: "Informations académiques",
    selectLevel: "Sélectionner le niveau",

    // Guardian info
    guardianInfo: "Informations du tuteur",
    guardianName: "Nom complet du tuteur",
    guardianNamePlaceholder: "Nom du parent/tuteur",
    phone: "Téléphone",
    email: "Email",
    emailPlaceholder: "email@exemple.com",

    // Documents
    documents: "Documents",
    birthCertificate: "Acte de naissance",
    fileUploadHint: "PDF, JPG ou PNG - Max 5MB",

    // Buttons
    createEnrollment: "Créer l'inscription",

    // Summary cards
    totalEnrollments: "Total des inscriptions",
    draftEnrollments: "Inscriptions en brouillon",
    submitted: "Soumis",
    completed: "Complété",
    allEnrollments: "Toutes les inscriptions",
    inProgress: "En cours",
    awaitingReview: "En attente de révision",
    approvedEnrollments: "Inscriptions approuvées",

    // Filters
    filterEnrollments: "Filtrer les inscriptions",
    allStatuses: "Tous les statuts",
    allGrades: "Toutes les classes",

    // Status labels
    draft: "Brouillon",
    needsReview: "En attente de validation",
    rejected: "Rejeté",
    cancelled: "Annulé",

    // Enrollment detail view
    parents: "Parents",
    enrolledBy: "Inscrit par",
    enrolledByFather: "Père",
    enrolledByMother: "Mère",
    continueEnrollment: "Continuer",
    relationship: "Lien",
  },

  // Activities
  activities: {
    title: "Gestion des activités",
    subtitle: "Gérer les activités scolaires et extrascolaires",
    adminTitle: "Administration des activités",
    adminSubtitle: "Créer et gérer les activités scolaires",

    // Tabs
    tabAll: "Toutes",
    tabAcademic: "Scolaires",
    tabExtra: "Extrascolaires",
    tabStudents: "Élèves",
    tabActivities: "Activités",
    tabEnrollments: "Inscriptions",
    tabPayments: "Paiements",

    // Activity types
    academic: "Scolaire",
    extra: "Extra",
    typeClub: "Club",
    typeSport: "Sport",
    typeArts: "Arts",
    typeAcademic: "Académique",
    typeOther: "Autre",

    // Activity status
    statusDraft: "Brouillon",
    statusActive: "Active",
    statusClosed: "Fermée",
    statusCompleted: "Terminée",
    statusCancelled: "Annulée",

    // CRUD
    addActivity: "Ajouter une activité",
    editActivity: "Modifier l'activité",
    deleteActivity: "Supprimer l'activité",
    createActivity: "Créer l'activité",
    updateActivity: "Mettre à jour l'activité",
    activityName: "Nom de l'activité",
    activityNameFr: "Nom de l'activité (Français)",
    activityDescription: "Description",
    activityType: "Type",
    activityFee: "Frais",
    activityCapacity: "Capacité",
    startDate: "Date de début",
    endDate: "Date de fin",
    selectType: "Sélectionner le type",
    selectStatus: "Sélectionner le statut",

    // Card info
    assignStudent: "Assigner un élève",
    enrollStudent: "Inscrire un élève",
    removeStudent: "Retirer l'élève",
    enrolled: "Inscrits",
    spotsLeft: "places restantes",
    noSpots: "complet",

    // Assign dialog
    assignStudentTitle: "Assigner un élève",
    enrollStudentTitle: "Inscrire un élève à l'activité",
    searchAndAdd: "Recherchez et ajoutez un élève à",
    searchStudentPlaceholder: "Rechercher un élève par nom ou ID...",
    overduePayments: "Paiements en retard",
    onlyCompletedEnrollments: "Seuls les élèves avec une inscription complète peuvent être inscrits",
    noEligibleStudents: "Aucun élève éligible trouvé",
    studentAlreadyEnrolled: "Élève déjà inscrit",

    // Activity names
    englishClub: "Club d'anglais",
    advancedMath: "Mathématiques avancées",
    football: "Football",
    physics: "Sciences physiques",
    readingClub: "Club de lecture",
    computerScience: "Informatique",

    // Summary cards
    totalActivities: "Total des activités",
    academicActivities: "Activités académiques",
    extraActivities: "Activités extrascolaires",
    enrolledStudents: "Élèves inscrits",
    allActivities: "Toutes les activités",
    curricularActivities: "Activités curriculaires",
    extracurricularActivities: "Activités extrascolaires",
    totalEnrollments: "Total des inscriptions",
    activeActivities: "Activités actives",

    // Filters
    filterActivities: "Filtrer les activités",
    allTypes: "Tous les types",
    allTeachers: "Tous les enseignants",
    allStatuses: "Tous les statuts",

    // Payment
    recordPayment: "Enregistrer le paiement",
    activityPayment: "Paiement d'activité",
    paymentRecorded: "Paiement enregistré avec succès",
    totalFee: "Frais total",
    amountPaid: "Montant payé",
    remainingBalance: "Solde restant",

    // Messages
    activityCreated: "Activité créée avec succès",
    activityUpdated: "Activité mise à jour avec succès",
    activityDeleted: "Activité supprimée avec succès",
    studentEnrolled: "Élève inscrit avec succès",
    studentRemoved: "Élève retiré de l'activité",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette activité ?",
    confirmRemoveStudent: "Êtes-vous sûr de vouloir retirer cet élève de l'activité ?",
    noActivities: "Aucune activité trouvée",
    noEnrollments: "Aucun élève inscrit à cette activité",
  },

  // Accounting
  accounting: {
    title: "Gestion comptable",
    subtitle: "Gérer les entrées et sorties d'argent",
    subtitleWithName: "Gérer les entrées et sorties d'argent - {personName}",

    // Tabs
    tabBalance: "Solde",
    tabPayments: "Enregistrement de paiements",
    tabReconciliation: "Réconciliation",
    tabPeriodClose: "Clôture de période",

    // Balance tab
    byMethod: "Par méthode",
    byGrade: "Par classe",
    byStatus: "Par statut",
    confirmedPayments: "Paiements confirmés",
    pendingPayments: "Paiements en attente",
    paidExpenses: "Dépenses payées",
    netMargin: "Marge nette",
    cashPayments: "Espèces",
    orangeMoneyPayments: "Orange Money",
    pendingDeposit: "En attente de dépôt",
    deposited: "Déposé",
    pendingReview: "En attente de validation",
    confirmed: "Confirmé",
    rejected: "Rejeté",
    reversed: "Annulé",
    failed: "Échoué",

    // Payments page
    paymentsPageTitle: "Gestion des paiements",
    paymentsPageSubtitle: "Voir et gérer toutes les transactions de paiement",
    viewAllPayments: "Voir tous les paiements",
    recentPayments: "Paiements récents",
    filterByStatus: "Filtrer par statut",
    filterByMethod: "Filtrer par méthode",
    filterByDate: "Filtrer par date",
    allStatuses: "Tous les statuts",
    allMethods: "Toutes les méthodes",
    noPaymentsFound: "Aucun paiement trouvé",
    deposit: "Dépôt",

    // Payments section
    paymentTransactions: "Transactions de paiement",
    registerAndValidate: "Enregistrer et valider les paiements des élèves",
    recordPayment: "Enregistrer un paiement",
    savePayment: "Enregistrer le paiement",

    // Payment status
    unvalidated: "Non validé",
    validated: "Validé",
    reconciled: "Réconcilié",
    readyForReconciliation: "Prêt pour réconciliation",
    completed: "Complété",

    // Table headers
    transactionId: "ID transaction",
    method: "Méthode",
    reference: "Référence",
    validate: "Valider",

    // Record payment dialog
    recordNewPayment: "Enregistrer un nouveau paiement",
    allFieldsRequired: "Tous les champs sont obligatoires. Un document justificatif est requis.",
    searchStudent: "Rechercher un élève...",
    amountGNF: "Montant (GNF)",
    paymentType: "Type de paiement",
    cash: "Espèces (Cash)",
    mobileMoney: "Mobile Money (Orange/MTN)",
    bankTransfer: "Virement bancaire",
    documentReference: "Référence de document justificatif",
    documentReferencePlaceholder: "Ex: OM-2024-123 ou CASH-2024-045",
    documentReferenceHint: "Référence du reçu Mobile Money, numéro de reçu cash, ou référence bancaire",
    supportingDocument: "Document justificatif (Scan/Capture)",
    supportingDocumentHint: "Requis: Reçu Mobile Money, capture d'écran, ou document scanné",
    notes: "Notes",
    notesOptional: "Notes (optionnel)",
    notesPlaceholder: "Informations supplémentaires...",

    // Reconciliation tab
    validatedPayments: "Paiements validés",
    selectPaymentsToReconcile: "Sélectionner les paiements à réconcilier",
    totalSelected: "Total sélectionné",
    bankDeposits: "Dépôts bancaires",
    selectMatchingDeposit: "Sélectionner le dépôt correspondant",
    comparison: "Comparaison",
    selectedPayments: "Paiements sélectionnés",
    vs: "vs",
    bankDeposit: "Dépôt bancaire",
    discrepancyDetected: "Discordance détectée - Vérifier avant de réconcilier",
    flagDiscrepancy: "Signaler discordance",
    reconcile: "Réconcilier",

    // Period close tab
    periodCloseWizard: "Assistant de clôture de période",
    closeCurrentPeriod: "Fermer la période financière actuelle et générer le rapport final",
    preCloseVerification: "Vérification pré-clôture",
    allPaymentsValidated: "Tous les paiements validés",
    unvalidatedPayments: "{count} paiements non validés",
    allReconciliationsDone: "Toutes les réconciliations effectuées",
    pendingReconciliations: "{count} réconciliations en attente",
    discrepanciesResolved: "Discordances résolues",
    discrepanciesNeedAttention: "{count} discordances nécessitent attention",
    summaryReview: "Révision du résumé",
    availableAfterPreClose: "Disponible après résolution de toutes les vérifications pré-clôture",
    closePeriod: "Clôturer la période",
    irreversibleAction: "Action irréversible",
    closePeriodWarning: "La clôture de période verrouille toutes les transactions et empêche toute modification ultérieure. Assurez-vous que toutes les vérifications sont complètes.",
    closeFinancialPeriod: "Clôturer la période financière",

    // New keys for Payments page redesign
    cashDeposit: "Dépôt en caisse",
    paymentsToday: "Paiements d'aujourd'hui",
    pendingConfirmation: "En attente de confirmation",
    confirmedThisWeek: "Confirmés cette semaine",
    filterByGrade: "Filtrer par classe",
    allGrades: "Toutes les classes",
    filterPayments: "Filtrer les paiements",
    paymentsCount: "paiements",
    confirmedPercent: "confirmés",

    // Transactions and Review tabs
    tabTransactions: "Transactions",
    tabReview: "Revue",
    filterByType: "Filtrer par type",
    allTypes: "Tous les types",
    itemsToReview: "éléments à revoir",
    noItemsToReview: "Aucun élément à revoir. Toutes les transactions sont à jour !",
    approve: "Approuver",

    // Mobile Money features
    mobileMoneyBalance: "Solde Orange Money",
    totalLiquidAssets: "Total Actifs Liquides",
    receivedToday: "Reçu aujourd'hui",
    spentToday: "Dépensé aujourd'hui",
    reverseTransaction: "Annuler la transaction",
    reversalReason: "Raison de l'annulation",
    confirmReversal: "Confirmer l'annulation",
    reversalSuccess: "Transaction annulée avec succès",
    reversalWarning: "Cette action créera une transaction d'annulation. L'opération est irréversible.",
    insufficientMobileMoneyBalance: "Solde Orange Money insuffisant",
    tabMobileMoney: "Mobile Money",
    noMobileMoneyTransactions: "Aucune transaction Orange Money",
    recordFee: "Enregistrer Frais",
    mobileMoneyFee: "Frais Orange Money",
    paymentMethodBreakdown: "Répartition par Méthode",
    safeLevel: "Niveau de Caisse",
    optimalLevel: "Niveau optimal",
  },

  // Attendance
  attendance: {
    title: "Prise de présence",
    welcome: "Bienvenue",

    // Activity list
    todaysActivities: "Activités d'aujourd'hui",
    takeAttendance: "Prendre présence",

    // Taking attendance
    tapToChange: "Tapez sur un élève pour changer le statut de présence",

    // Summary
    present: "Présents",
    absent: "Absents",
    excused: "Excusés",

    // Status labels
    statusPresent: "Présent",
    statusAbsent: "Absent",
    statusExcused: "Excusé",

    // Summary cards
    totalSessions: "Total des sessions",
    averageAttendanceRate: "Taux de présence moyen",
    presentToday: "Présents aujourd'hui",
    absentToday: "Absents aujourd'hui",
    attendanceSessions: "Sessions de présence",
    overallRate: "Taux global",
    studentsPresent: "Élèves présents",
    studentsAbsent: "Élèves absents",

    // Filters
    filterAttendance: "Filtrer la présence",

    // Student list
    studentList: "Liste des élèves",
    allMarkedPresent: "Tous les élèves sont marqués présents par défaut",
    overduePayment: "Paiement en retard",

    // Submit
    submitAttendance: "Soumettre la présence",

    // Instructions
    instructions: "Instructions",
    instruction1: "Tapez sur un élève pour changer son statut",
    instruction2: "Présent (vert) → Absent (rouge) → Excusé (orange) → Présent",
    instruction3: "Les élèves avec paiements en retard sont marqués d'un badge",
    instruction4: "Cliquez sur \"Soumettre\" pour enregistrer la présence",
  },

  // Reports
  reports: {
    title: "Rapports académiques",
    subtitle: "Supervision des activités et participation",

    // Tabs
    tabOverview: "Vue d'ensemble",
    tabParticipation: "Rapports de participation",

    // Summary cards
    totalActivities: "Total activités",
    academicActivities: "scolaires",
    extraActivities: "extra",
    enrolledStudents: "Élèves inscrits",
    totalEnrollments: "Total d'inscriptions",
    averageAttendance: "Taux de présence moyen",
    satisfactoryPerformance: "Performance satisfaisante",
    atRiskStudents: "Élèves à risque",
    lowParticipation: "Faible participation",

    // Filters
    allTeachers: "Tous les enseignants",
    allLevels: "Tous les niveaux",

    // Activities list
    allActivities: "Toutes les activités",
    activitiesShown: "activité(s) affichée(s)",
    averageAttendanceRate: "Présence moyenne",

    // Participation tab
    attendanceTrend: "Tendance de présence",
    weeklyAttendanceRate: "Taux de présence hebdomadaire pour",
    ratePercent: "Taux (%)",

    // Low participation
    lowParticipationStudents: "Élèves avec faible participation",
    studentsNeedingFollowup: "Élèves nécessitant un suivi pour faible taux de participation (<60%)",
    activitiesEnrolled: "activités inscrites",

    // Student reasons
    lowFrequency: "Fréquence faible",
    repeatedAbsences: "Absences répétées",
    veryLowParticipation: "Très faible participation",
    needsFollowup: "Besoin de suivi",

    // Chart
    attendanceByActivity: "Présence par activité",
    attendanceComparison: "Comparaison des taux de présence entre activités",
  },

  // Login
  login: {
    title: "Système de gestion scolaire",
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
    // Page de connexion améliorée
    schoolName: "Groupe Scolaire Privé N'Diolou",
    schoolTagline: "L'excellence dans l'éducation",
    welcomeTitle: "Bienvenue sur le système de gestion scolaire",
    welcomeSubtitle: "Une plateforme complète pour gérer les inscriptions, la présence, la comptabilité et plus encore.",
    signInTitle: "Connexion",
    signInSubtitle: "Accéder au système de gestion scolaire",
    signInButton: "Se connecter",
    forgotPassword: "Mot de passe oublié?",
    orContinueWith: "Ou continuer avec",
    signInWithGoogle: "Se connecter avec Google",
    invalidCredentials: "Email ou mot de passe invalide",
    loginError: "Une erreur s'est produite. Veuillez réessayer.",
    // Cartes de fonctionnalités
    featureOffline: "Mode hors ligne",
    featureOfflineDesc: "Travaillez sans internet. Les données se synchronisent automatiquement.",
    featureOfflineShort: "Fonctionne hors ligne",
    featureEnrollment: "Inscription des élèves",
    featureEnrollmentDesc: "Assistant d'inscription en 6 étapes avec suivi des paiements.",
    featureEnrollmentShort: "Inscription facile",
    featureAccounting: "Contrôle financier",
    featureAccountingDesc: "Suivi complet des paiements avec reçus et réconciliation.",
    featureAccountingShort: "Suivi des paiements",
    featureAttendance: "Présence",
    featureAttendanceDesc: "Suivi de présence mobile avec rapports.",
    featureAttendanceShort: "Présence",
    securityNote: "Sécurisé et approuvé par les écoles à travers la Guinée",
    footerText: "© 2025 GSPN. Tous droits réservés.",
  },

  // Forgot Password
  forgotPassword: {
    title: "Mot de passe oublié ?",
    subtitle: "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    emailRequired: "Email requis",
    enterEmail: "Veuillez entrer votre adresse email",
    sendResetLink: "Envoyer le lien",
    backToLogin: "Retour à la connexion",
    emailSent: "Vérifiez votre email",
    emailSentDescription: "Si un compte avec cet email existe, nous avons envoyé un lien de réinitialisation.",
    checkSpam: "Vous ne voyez pas l'email ? Vérifiez votre dossier spam.",
    linkExpiry: "Le lien expirera dans 24 heures.",
    tryDifferentEmail: "Essayer un autre email",
    errorSending: "Échec de l'envoi de l'email",
    networkError: "Veuillez vérifier votre connexion et réessayer",
  },

  // Users
  users: {
    title: "Gestion des utilisateurs",
    subtitle: "Inviter et gérer les utilisateurs du système",
    inviteUser: "Inviter un utilisateur",
    inviteUserDescription: "Envoyez une invitation par e-mail pour ajouter un nouvel utilisateur au système.",
    userEmailPlaceholder: "utilisateur@email.gn",
    selectRole: "Sélectionner un rôle",
    permissionsForRole: "Permissions pour {role}",
    selectRoleToSeePermissions: "Sélectionnez un rôle pour voir les permissions",
    sendInvitation: "Envoyer l'invitation",
    filterByRole: "Filtrer par rôle",
    allRoles: "Tous les rôles",
    userList: "Liste des utilisateurs",
    usersFound: "{count} utilisateur(s) trouvé(s)",
    lastActivity: "Dernière activité",
    neverConnected: "Jamais connecté",
    active: "Actif",
    invited: "Invité",
    inactive: "Inactif",
    sendEmail: "Envoyer un email",
    editPermissions: "Modifier les permissions",
    resendInvitation: "Renvoyer l'invitation",
    revokeAccess: "Révoquer l'accès",
    parent: "Parent",
    permissions: {
      director: {
        p1: "Accès complet au système",
        p2: "Gestion des utilisateurs",
        p3: "Rapports et statistiques",
      },
      teacher: {
        p1: "Saisie des notes",
        p2: "Gestion des présences",
        p3: "Voir les classes assignées",
      },
      accountant: {
        p1: "Création de factures",
        p2: "Suivi des paiements",
        p3: "Rapports financiers",
      },
      parent: {
        p1: "Voir les notes des enfants",
        p2: "Payer les factures",
        p3: "Recevoir les notifications",
      },
      student: {
        p1: "Voir ses propres notes",
        p2: "Consulter l'emploi du temps",
        p3: "Recevoir les notifications",
      }
    },
    userCounts: {
      directors: "Directeurs",
      teachers: "Enseignants",
      accountants: "Comptables",
      parents: "Parents",
      students: "Élèves",
    },
    addUser: "Ajouter un utilisateur",
    searchPlaceholder: "Rechercher par nom, email...",
    
    // Table headers
    name: "Nom",
    role: "Rôle",
    lastLogin: "Dernière connexion",
    
    // Roles
    director: "Directeur",
    academicDirector: "Directeur académique",
    secretary: "Secrétaire",
    accountant: "Comptable",
    teacher: "Enseignant",
  },

  // Grades
  grades: {
    title: "Gestion des notes",
    subtitle: "Prof. {teacherName} - {subjectName}",
    saveChanges: "Sauvegarder ({count})",
    subject: "Matière",
    period: "Période",
    selectClass: "Sélectionner une classe",
    selectSubject: "Sélectionner une matière",
    selectPeriod: "Sélectionner une période",
    classAverage: "Moyenne de classe",
    onNStudents: "Sur {count} élèves",
    top3Students: "Top 3 élèves",
    needsAttention: "Besoin d'attention",
    studentsBelow10: "Élèves avec note < 10",
    pendingChanges: "{count} notes en attente de sauvegarde",
    clickToSave: "- Cliquez sur Sauvegarder pour enregistrer vos modifications",
    gradeEntry: "Saisie des notes",
    gradeEntryDescription: "Entrez les notes sur 20. Les modifications sont sauvegardées en temps réel.",
    previousGrade: "Note précédente",
    currentGrade: "Note actuelle",
    trend: "Tendance",
    synced: "Synchronisé",
    pending: "En attente",
    subjects: {
      mathematics: "Mathématiques",
      french: "Français",
      english: "Anglais",
      sciences: "Sciences",
    },
    terms: {
      term1: "Trimestre 1",
      term2: "Trimestre 2",
      term3: "Trimestre 3",
    },
    levelLabels: {
      kindergarten: "Maternelle",
      elementary: "Primaire",
      college: "Collège",
      high_school: "Lycée",
    },
  },

  // Classes
  classes: {
    title: "Emploi du temps",
    subtitle: "Gestion des horaires et classes",
    exportPdf: "Exporter PDF",
    addCourse: "Ajouter un cours",
    classes: "Classes",
    statistics: "Statistiques",
    totalClasses: "Total classes",
    totalStudents: "Total élèves",
    coursesToday: "Cours aujourd'hui",
    allClasses: "Toutes les classes",
    acrossAllClasses: "Dans toutes les classes",
    scheduledToday: "Prévus aujourd'hui",
    selectDay: "Sélectionner un jour",
    scheduleForDay: "Emploi du temps - {day}",
    noCoursesForDay: "Aucun cours prévu pour ce jour",
    weeklySchedule: "Emploi du temps hebdomadaire",
    section: "Section",
    selectSection: "Sélectionner une section",
    noSectionsAvailable: "Aucune section disponible",
    timePeriods: "Périodes de Cours",
    timePeriod: "Période",
    period: "Période",
    createPeriod: "Créer une Période",
    editPeriod: "Modifier la Période",
    deletePeriod: "Supprimer la Période",
    periodName: "Nom de la Période",
    periodNameFr: "Nom de la Période (Français)",
    startTime: "Début",
    endTime: "Fin",
    periodOrder: "Ordre",
    noPeriodsDefinedSchedule: "Aucune période définie. Veuillez créer des périodes dans les paramètres.",
    noPeriodsDefinedCreate: "Aucune période définie. Créez-en une pour commencer.",
    scheduleSlot: "Créneau",
    addSlot: "Ajouter un Créneau",
    editSlot: "Modifier le Créneau",
    deleteSlot: "Supprimer le Créneau",
    clickSlotToEdit: "Cliquez sur un créneau pour modifier ou ajouter un cours",
    break: "Pause",
    breakRecess: "Pause / Récréation",
    room: "Salle",
    roomLocation: "Salle",
    notes: "Notes",
    scheduleConflict: "Conflit de Planning",
    conflictsDetected: "Conflits détectés",
    confirmDeletePeriod: "Êtes-vous sûr de vouloir supprimer \"{name}\"? Tous les créneaux associés seront également supprimés.",
    confirmDeleteSlot: "Supprimer ce créneau?",
    invalidTimeFormat: "Format d'heure invalide. Utilisez HH:MM (format 24h)",
    startBeforeEnd: "L'heure de début doit être avant l'heure de fin",
    periodOverlap: "La période chevauche une période existante : {name} ({start}-{end})",
    periodExists: "Une période avec cet ordre existe déjà pour cette année scolaire",
    subjects: "Matières",
    schedule: "Emploi du temps",
    days: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
    },
    daysShort: {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mer",
      thursday: "Jeu",
      friday: "Ven",
      saturday: "Sam",
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
    "6eme": "6ème",
    "5eme": "5ème",
    "4eme": "4ème",
    "3eme": "3ème",
  },

  // Enrollment Wizard
  enrollmentWizard: {
    // Main
    title: "Inscription d'élève",
    subtitle: "Processus d'inscription pour l'année scolaire",

    // Steps
    step1: "Sélection de classe",
    step2: "Information élève",
    step3: "Échéancier de paiement",
    step4: "Paiement",
    step5: "Révision",
    step6: "Confirmation",

    // Step 1 - Grade Selection
    selectGrade: "Sélectionner le niveau",
    selectGradeDescription: "Choisissez le niveau scolaire pour l'inscription",
    schoolYear: "Année scolaire",
    todayDate: "Date d'aujourd'hui",
    kindergarten: "Maternelle",
    elementary: "Primaire",
    college: "Collège",
    highSchool: "Lycée",
    studentsEnrolled: "{count} élèves inscrits",
    capacity: "Capacité",
    yearlyTuition: "Frais annuels",
    perYear: "/an",
    onlyGrandeSection: "Seule la Grande Section est disponible pour les nouvelles inscriptions",
    atCapacityWarning: "Limite de capacité atteinte (70 élèves)",

    // Step 2 - Student Info
    studentInfo: "Information de l'élève",
    newStudent: "Nouvel élève",
    returningStudent: "Élève existant",
    searchStudent: "Rechercher par numéro, nom ou date de naissance",
    noStudentFound: "Aucun élève trouvé",
    selectThisStudent: "Sélectionner cet élève",

    // Personal info
    personalInfo: "Informations personnelles",
    firstName: "Prénom",
    middleName: "Deuxième prénom",
    lastName: "Nom",
    dateOfBirth: "Date de naissance",
    dateFormatHint: "Format: JJ/MM/AAAA (ex: 15/03/2010)",
    gender: "Genre",
    male: "Masculin",
    female: "Féminin",
    phone: "Téléphone",
    phoneFormat: "Format: +224 XXX XX XX XX",
    email: "Email",
    photo: "Photo",
    birthCertificate: "Extrait de naissance",
    uploadPhoto: "Télécharger une photo",
    uploadDocument: "Télécharger le document",
    fileUploaded: "Fichier téléchargé",

    // Parent info
    parentInfo: "Information des parents",
    fatherInfo: "Informations du père",
    motherInfo: "Informations de la mère",
    fatherName: "Nom du père",
    motherName: "Nom de la mère",
    fatherPhone: "Téléphone du père",
    motherPhone: "Téléphone de la mère",
    fatherEmail: "Email du père",
    motherEmail: "Email de la mère",
    address: "Adresse",

    // Enrolling Person
    enrollingPerson: "Qui inscrit l'élève ?",
    enrollingPersonDescription: "Cette personne sera le contact principal pour la communication scolaire.",
    enrollingAsFather: "Père",
    enrollingAsMother: "Mère",
    enrollingAsOther: "Autre",
    otherEnrollingPersonInfo: "Coordonnées de la personne",
    enrollingPersonName: "Nom complet",
    enrollingPersonNamePlaceholder: "Entrez le nom complet",
    enrollingPersonRelation: "Lien avec l'élève",
    enrollingPersonRelationPlaceholder: "ex: Oncle, Tante, Tuteur",
    enrollingPersonPhone: "Numéro de téléphone",
    enrollingPersonEmail: "Email (Optionnel)",

    // Notes
    additionalNotes: "Notes additionnelles",
    addNote: "Ajouter une note",
    noteTitle: "Titre",
    noteContent: "Contenu",
    removeNote: "Supprimer",

    // Step 3 - Payment Breakdown
    paymentBreakdown: "Échéancier de paiement",
    totalYearlyAmount: "Montant total annuel",
    schedule1: "Échéance 1",
    schedule2: "Échéance 2",
    schedule3: "Échéance 3",
    schedule1Months: "Septembre + Octobre + Mai",
    schedule2Months: "Novembre + Décembre + Janvier",
    schedule3Months: "Février + Mars + Avril",
    dueBy: "Échéance le",
    adjustAmount: "Modifier le montant",
    adjustmentReason: "Raison de la modification",
    requiresApproval: "Cette modification nécessite une approbation du directeur",
    originalAmount: "Montant original",
    adjustedAmount: "Montant modifié",
    percentagePresets: "Pourcentages rapides",
    adjustPercentage: "Ajuster le pourcentage",

    // Step 4 - Payment Transaction
    paymentTransaction: "Enregistrer un paiement",
    paymentOptional: "Le paiement est optionnel à cette étape",
    skipPayment: "Payer plus tard",
    makePayment: "Effectuer un paiement",
    paymentMethod: "Mode de paiement",
    cash: "Espèces",
    orangeMoney: "Orange Money",
    amount: "Montant",
    receiptNumber: "Numéro de reçu",
    transactionRef: "Référence de transaction",
    uploadReceipt: "Télécharger le reçu",
    receiptRequired: "Le reçu est obligatoire",
    autoGenerated: "Généré automatiquement",
    receiptIdUnique: "Numéro de reçu unique",
    generatingReceipt: "Génération en cours...",
    pleaseWait: "Veuillez patienter...",
    paymentCoverage: "Couverture du paiement",
    monthsCovered: "Mois couverts",
    percentPaid: "Pourcentage payé",

    // Step 5 - Review
    reviewEnrollment: "Réviser l'inscription",
    reviewDescription: "Vérifiez toutes les informations avant de soumettre",
    editSection: "Modifier",
    gradeInfo: "Information de classe",
    studentDetails: "Détails de l'élève",
    parentDetails: "Détails des parents",
    paymentDetails: "Détails de paiement",
    notesSection: "Notes",

    // Step 6 - Confirmation
    enrollmentComplete: "Inscription soumise!",
    enrollmentNumber: "Numéro d'inscription",
    studentNumber: "Numéro d'élève",
    viewEnrollment: "Voir l'inscription",
    downloadPdf: "Télécharger le PDF",
    downloadingPdf: "Génération du PDF...",
    pdfDownloadError: "Échec du téléchargement du PDF. Veuillez réessayer.",
    printDocument: "Imprimer",
    statusSubmittedPendingReview: "Soumise - En attente de révision",
    statusReviewRequired: "Revue requise par le directeur",
    autoApproveIn: "Approbation automatique dans {days} jours",

    // Status badges
    statusDraft: "Brouillon",
    statusSubmitted: "Soumise",
    statusNeedsReview: "En attente de validation",
    statusCompleted: "Terminée",
    statusApproved: "Approuvée",
    statusRejected: "Rejetée",
    statusCancelled: "Annulée",

    // Suggested students
    suggestedStudents: "Élèves suggérés",
    suggestedStudentsDescription: "Élèves de la classe précédente qui peuvent être réinscrits",
    fromPreviousGrade: "Classe précédente",
    noSuggestedStudents: "Aucun élève suggéré disponible",
    orSearchManually: "ou rechercher manuellement",

    // Draft management
    draftSaved: "Brouillon enregistré",
    draftRecovered: "Brouillon récupéré du {date}",
    draftExpires: "Le brouillon expire dans {days} jours",
    continueDraft: "Continuer le brouillon",
    discardDraft: "Supprimer le brouillon",

    // Validation errors
    selectGradeRequired: "Veuillez sélectionner une classe",
    firstNameRequired: "Le prénom est obligatoire",
    lastNameRequired: "Le nom est obligatoire",
    parentRequired: "Au moins un nom de parent est obligatoire",
    phoneRequired: "Au moins un numéro de téléphone est obligatoire",
    receiptNumberRequired: "Le numéro de reçu est obligatoire",

    // Actions
    saveAndContinue: "Enregistrer et continuer",
    saveDraft: "Enregistrer le brouillon",
    submitEnrollment: "Soumettre l'inscription",
    goBack: "Retour",

    // Confirmation page
    enrollmentSummary: "Résumé de l'inscription",
    backToEnrollments: "Retour aux inscriptions",
    startNewEnrollment: "Nouvelle inscription",
    enrollmentApproved: "Votre inscription a été approuvée.",
  },

  // Students module
  students: {
    title: "Gestion des élèves",
    subtitle: "Visualiser et gérer les élèves inscrits",
    searchPlaceholder: "Rechercher par nom ou numéro...",
    filters: "Filtres",
    filterStudents: "Filtrer les élèves",
    allGrades: "Toutes les classes",
    allStatuses: "Tous les statuts",
    allPayments: "Tous les paiements",
    allAttendances: "Toutes les présences",

    // Status labels
    balanceStatus: "Statut de paiement",
    late: "en retard",
    onTime: "à jour",
    inAdvance: "en avance",
    complete: "complet",
    goldMedal: "Paiement complet",

    // Attendance status
    attendanceGood: "Bonne présence",
    attendanceConcerning: "Présence préoccupante",
    attendanceCritical: "Présence critique",
    missingData: "Données manquantes",

    // Student detail
    personalInfo: "Informations personnelles",
    paymentHistory: "Historique des paiements",
    attendanceHistory: "Historique de présence",
    progressBar: "Progression",
    remainingBalance: "Solde restant",
    uploadPhoto: "Télécharger une photo",

    // Grades & Classes page
    gradesClassesSubtitle: "Gérer les affectations de salles et voir les informations de classe",
    assigned: "Affectés",
    unassigned: "Non affectés",
    roomsAndStudents: "Salles & Élèves",
    room: "Salle",
    changeRoom: "Changer de Salle",
    noRoomsConfigured: "Aucune salle configurée pour ce niveau",
    // Empty states and display
    displayed: "affichés",
    noStudentsFound: "Aucun élève trouvé avec ces critères",
    noStudentsEnrolled: "Aucun élève inscrit",

    // New keys for improved pages
    needsAttention: "À surveiller",
    familyInfo: "Informations familiales",
    father: "Père",
    mother: "Mère",
    guardian: "Tuteur",
    enrollmentNumber: "N° Inscription",
    // Student detail page improvements
    managePayments: "Gérer les paiements",
    enrolledBy: "Inscrit par",
    createdBy: "Créé par",
    enrollingGuardian: "Tuteur inscripteur",
    enrollingSchoolStaff: "Personnel scolaire inscripteur",
    enrollmentNotes: "Notes d'inscription",
    middleName: "Deuxième prénom",
    viewEnrollment: "Voir l'inscription",
    editInfo: "Modifier les informations",
    noNotes: "Aucune note",
    paymentProgress: "Progression du paiement",

    // Student detail page - tabs and sections
    backToStudents: "Retour aux élèves",
    overview: "Vue d'ensemble",
    enrollmentsTab: "Inscriptions",
    paymentsTab: "Paiements",
    attendanceTab: "Présence",
    activitiesTab: "Activités",

    // Stats cards
    remainingBalanceLabel: "Solde restant",
    totalPaid: "Total payé",
    of: "sur",
    attendanceLabel: "Présence",
    paymentProgressLabel: "Progression paiement",

    // Personal info
    firstName: "Prénom",
    lastName: "Nom",
    dateOfBirth: "Date de naissance",
    gender: "Genre",
    male: "Masculin",
    female: "Féminin",
    phone: "Téléphone",
    email: "Email",
    address: "Adresse",
    familyInformation: "Informations familiales",

    // Attendance summary
    totalRecords: "enregistrements au total",
    present: "Présents",
    absent: "Absents",
    lateLabel: "En retard",
    excused: "Excusés",
    attendanceRate: "Taux de présence",

    // Enrollments table
    enrollmentHistory: "Historique des inscriptions",
    enrollmentCount: "inscription(s)",
    schoolYear: "Année scolaire",
    gradeLabel: "Classe",
    levelLabel: "Niveau",
    tuition: "Frais de scolarité",
    amountPaid: "Montant payé",
    status: "Statut",
    actions: "Actions",
    noEnrollments: "Aucune inscription",
    current: "Actuel",

    // Payment summary
    paidOf: "payé sur",
    tuitionFee: "Frais de scolarité",
    noPaymentsRecorded: "Aucun paiement enregistré",
    date: "Date",
    amount: "Montant",
    method: "Méthode",
    receiptNumber: "N° Reçu",
    recordedBy: "Enregistré par",
    paymentCount: "paiement(s)",

    // Attendance tab
    attendanceHistoryTitle: "Historique de présence",
    totalSessions: "Total séances",
    overallAttendanceRate: "Taux de présence global",

    // Activities tab
    enrolledActivities: "Activités inscrites",
    activityCount: "activité(s)",
    enrolledOn: "Inscrit le",
    fee: "Frais",
    noActivitiesEnrolled: "Aucune activité inscrite",
    noActivitiesDescription: "L'élève n'est inscrit à aucune activité pour l'année en cours",
    noAttendanceRecords: "Aucun enregistrement de présence disponible",
    noAttendanceDescription: "Les données de présence apparaîtront ici une fois enregistrées",
    activeStatus: "Actif",

    // Edit page
    backToProfile: "Retour au profil",
    editStudent: "Modifier l'élève",
    basicStudentInfo: "Informations de base de l'élève",
    parentInformation: "Informations des parents",
    parentContactDetails: "Coordonnées des parents ou tuteurs",
    fullName: "Nom complet",
    saving: "Enregistrement...",
    // Status options
    statusActive: "Actif",
    statusInactive: "Inactif",
    statusTransferred: "Transféré",
    statusGraduated: "Diplômé",

    // Actions
    makePayment: "Effectuer un paiement",
  },

  // Enhanced attendance
  attendanceEnhanced: {
    selectGrade: "Sélectionner une classe",
    selectDate: "Sélectionner une date",
    entryMode: "Mode de saisie",
    checklistMode: "Liste complète",
    checklistModeDesc: "Marquer chaque élève individuellement",
    absencesOnlyMode: "Absences seulement",
    absencesOnlyModeDesc: "Marquer uniquement les absents et retards",
    markAllPresent: "Tout marquer présent",
    sessionComplete: "Session complète",
    completeSession: "Terminer la session",
    late: "En retard",
    attendanceRate: "Taux de présence",
    swipeLeft: "Glisser gauche = absent",
    swipeRight: "Glisser droite = présent",
  },

  // Enhanced accounting
  accountingEnhanced: {
    pendingDeposit: "En attente de dépôt",
    deposited: "Déposé",
    pendingReview: "En attente de révision",
    confirmed: "Confirmé",
    rejected: "Rejeté",
    recordDeposit: "Enregistrer le dépôt",
    bankReference: "Référence bancaire",
    depositDate: "Date de dépôt",
    bankName: "Nom de la banque",
    depositedBy: "Déposé par",
    reviewPayment: "Réviser le paiement",
    approvePayment: "Approuver le paiement",
    rejectPayment: "Rejeter le paiement",
    reviewNotes: "Notes de révision",
    balance: "Solde",
    cashAvailable: "Espèces disponibles",
    cashPending: "Espèces en attente",
    margin: "Marge",
    orangeMoneyPayments: "Paiements Orange Money",
    cashPayments: "Paiements en espèces",
  },

  // Grades module (enhanced)
  gradesEnhanced: {
    gradeLeader: "Responsable de classe",
    assignLeader: "Assigner un responsable",
    subjectsList: "Liste des matières",
    teacherAssignment: "Enseignant assigné",
    assignTeacher: "Assigner un enseignant",
    attendanceRatio: "Taux de présence",
    paymentRatio: "Taux de paiement",
    studentsInGrade: "Élèves dans la classe",
    coefficient: "Coefficient",
    hoursPerWeek: "Heures par semaine",
    backToGrades: "Retour aux classes",
    students: "Élèves",
    subjects: "Matières",
    attendance: "Présence",
    payment: "Paiement",
    overview: "Vue d'ensemble",
    present: "Présents",
    absent: "Absents",
    excused: "Excusés",
    attendanceSummary: "Résumé de présence",
    totalRecords: "enregistrements au total",
    notAssigned: "Non assigné",
    subject: "Matière",
    teacher: "Enseignant",
    enrolledStudents: "élèves inscrits",
    subjectsTaught: "matières enseignées",
    noLeader: "Aucun responsable",
    overallProgress: "Progression globale",
    studentsCount: "élèves",
    paymentSummary: "Résumé des paiements",
    name: "Nom",
    number: "Numéro",
    noStudentsEnrolled: "Aucun élève inscrit",
    noSubjectsAssigned: "Aucune matière assignée",
    noLeaderAssigned: "Aucun responsable assigné",
    allLevels: "Tous les niveaux",
    noGradesFound: "Aucune classe trouvée",
    filterGrades: "Filtrer les classes",
    searchGradePlaceholder: "Rechercher par nom...",
  },

  // Expenses
  expenses: {
    title: "Gestion des dépenses",
    subtitle: "Enregistrer et suivre les dépenses",
    newExpense: "Nouvelle dépense",
    category: "Catégorie",
    description: "Description",
    vendor: "Fournisseur",
    pending: "En attente",
    approved: "Approuvée",
    rejected: "Rejetée",
    paid: "Payée",
    requestApproval: "Demander l'approbation",
    approveExpense: "Approuver la dépense",
    rejectExpense: "Rejeter la dépense",
    markAsPaid: "Marquer comme payée",
    rejectionReason: "Raison du rejet",
    receipt: "Reçu",
    uploadReceipt: "Télécharger le reçu",
    // Filter and list keys
    filterExpenses: "Filtrer les dépenses",
    filterByStatus: "Filtrer par statut",
    filterByCategory: "Filtrer par catégorie",
    allStatuses: "Tous les statuts",
    allCategories: "Toutes les catégories",
    selectCategory: "Sélectionner une catégorie",
    paymentMethod: "Méthode de paiement",
    expenseList: "Liste des dépenses",
    noExpensesFound: "Aucune dépense trouvée",
    totalExpenses: "Total des dépenses",
    expenseCount: "dépense(s)",
    cash: "Espèces",
    orangeMoney: "Orange Money",
    descriptionPlaceholder: "Description de la dépense...",
    vendorPlaceholder: "Nom du fournisseur",
    searchPlaceholder: "Rechercher par description, fournisseur...",
    method: "Méthode",
    requestedBy: "Demandeur",
    confirmApprove: "Approuver la dépense",
    confirmApproveMessage: "Êtes-vous sûr de vouloir approuver cette dépense ?",
    confirmReject: "Rejeter la dépense",
    confirmRejectMessage: "Êtes-vous sûr de vouloir rejeter cette dépense ?",
    confirmPaid: "Marquer comme payée",
    confirmPaidMessage: "Êtes-vous sûr de vouloir marquer cette dépense comme payée ?",
    // Dialog action keys
    deleteExpense: "Supprimer la dépense",
    confirmApproveExpenseAmount: "Voulez-vous approuver cette dépense de",
    confirmRejectExpenseQuestion: "Voulez-vous rejeter cette dépense ?",
    rejectionReasonPlaceholder: "Raison du rejet...",
    confirmMarkPaidExpenseAmount: "Confirmer que cette dépense de",
    confirmMarkPaidExpenseAmountEnd: "a été payée ?",
    confirmDeleteExpense: "Voulez-vous supprimer cette dépense ? Cette action est irréversible.",
    approve: "Approuver",
    reject: "Rejeter",
    markPaid: "Marquer payée",
    categories: {
      supplies: "Fournitures",
      maintenance: "Maintenance",
      utilities: "Services publics",
      salary: "Salaires",
      transport: "Transport",
      communication: "Communication",
      other: "Autre",
    },
  },

  // Teachers
  teachers: {
    title: "Enseignants",
    subtitle: "Gérer les profils et affectations des enseignants",
    addTeacher: "Ajouter un enseignant",
    filterTeachers: "Filtrer les enseignants",
    filterBySubject: "Filtrer par matière",
    allSubjects: "Toutes les matières",
    allTeachers: "Tous les enseignants",
    noTeachersFound: "Aucun enseignant trouvé",
    contact: "Contact",
    hireDate: "Date d'embauche",
    active: "Actif",
    inactive: "Inactif",
    searchPlaceholder: "Rechercher par nom, email...",
    subjects: {
      mathematics: "Mathématiques",
      french: "Français",
      english: "Anglais",
      physics: "Physique",
      chemistry: "Chimie",
      biology: "Biologie",
      history: "Histoire",
      geography: "Géographie",
      civics: "Éducation civique",
      arabic: "Arabe",
      physical_education: "Éducation physique",
      arts: "Arts plastiques",
      music: "Musique",
      sciences: "Sciences",
      reading: "Lecture",
      writing: "Écriture",
    },
  },

  // Grade names (Guinea format)
  gradeNames: {
    "1ere": "1ère Année",
    "2eme": "2ème Année",
    "3eme": "3ème Année",
    "4eme": "4ème Année",
    "5eme": "5ème Année",
    "6eme": "6ème Année",
    "7eme": "7ème Année",
    "8eme": "8ème Année",
    "9eme": "9ème Année",
    "10eme": "10ème Année",
    "11eme": "11ème Année",
    "12eme": "12ème Année",
    terminal: "Terminale",
  },

  // Administration module
  admin: {
    // Navigation
    administrationSection: "Administration",
    schoolYears: "Années Scolaires",
    gradesAndRooms: "Classes & Salles",
    teachersAndClasses: "Enseignants & Matières",
    usersManagement: "Gestion des Utilisateurs",
    activitiesManagement: "Activités",

    // School Years
    schoolYearsTitle: "Gestion des Années Scolaires",
    schoolYearsSubtitle: "Gérer les configurations des années académiques",
    createSchoolYear: "Créer une Année Scolaire",
    editSchoolYear: "Modifier l'Année Scolaire",
    schoolYearName: "Nom",
    schoolYearNamePlaceholder: "ex: 2025 - 2026",
    startDate: "Date de Début",
    endDate: "Date de Fin",
    enrollmentStartDate: "Début des Inscriptions",
    enrollmentEndDate: "Fin des Inscriptions",
    activateSchoolYear: "Activer l'Année Scolaire",
    activateConfirmation: "Êtes-vous sûr de vouloir activer cette année scolaire ? Cela désactivera l'année active actuelle.",
    copyFromPreviousYear: "Copier la Configuration",
    copyConfigDescription: "Copier les classes, matières et salles d'une année précédente",
    selectSourceYear: "Sélectionner l'année source",
    copyGrades: "Copier les Classes",
    copySubjects: "Copier les Matières",
    copyRooms: "Copier les Salles",
    configCopied: "Configuration copiée avec succès",
    activeYear: "Année Active",
    newYear: "Nouvelle Année",
    totalYears: "Total des Années",
    noActiveYear: "Aucune année active",
    noNewYear: "Aucune nouvelle année configurée",

    // School Year Status
    statusNew: "Nouvelle",
    statusActive: "Active",
    statusPassed: "Passée",

    // Grades & Rooms
    gradesRoomsTitle: "Gestion des Classes & Salles",
    gradesRoomsSubtitle: "Configurer les classes et sections pour chaque année scolaire",
    selectSchoolYear: "Sélectionner l'Année Scolaire",
    addGrade: "Ajouter une Classe",
    editGrade: "Modifier la Classe",
    deleteGrade: "Supprimer la Classe",
    deleteGradeConfirmation: "Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.",
    enableGrade: "Activer la Classe",
    disableGrade: "Désactiver la Classe",
    gradeEnabled: "Classe activée",
    gradeDisabled: "Classe désactivée",
    gradeName: "Nom de la Classe",
    gradeCode: "Code de la Classe",
    gradeLevel: "Niveau",
    gradeSeries: "Série (Lycée)",
    tuitionFee: "Frais de Scolarité",
    gradeCapacity: "Capacité",
    allocated: "Alloué",
    available: "Disponible",
    addRoom: "Ajouter une Salle",
    editRoom: "Modifier la Salle",
    deleteRoom: "Supprimer la Salle",
    roomName: "Nom de la Salle",
    roomDisplayName: "Nom Affiché",
    roomCapacity: "Capacité de la Salle",
    manageRooms: "Gérer les Salles",
    manageSubjects: "Gérer les Matières",
    assignToRoom: "Assigner à une Salle",
    unassignedStudents: "Élèves Non Assignés",
    assignStudents: "Assigner des Élèves",
    studentsInRoom: "élèves dans la salle",
    roomFull: "Salle pleine",
    moveStudents: "Déplacer les Élèves",
    moveStudentsTitle: "Déplacer les Élèves entre les Salles",
    sourceRoom: "De la Salle",
    targetRoom: "Vers la Salle",
    selectStudentsToMove: "Sélectionner les Élèves à Déplacer",
    moveSelected: "Déplacer la Sélection",
    studentsSelected: "élève(s) sélectionné(s)",
    confirmDeleteRoom: "Supprimer la Salle",
    deleteRoomWithStudents: "Cette salle contient {count} élève(s). Choisissez où les déplacer :",
    removeAllAssignments: "Supprimer toutes les affectations",
    moveAndDelete: "Déplacer & Supprimer",
    studentsMoved: "Élèves déplacés avec succès",
    roomDeleted: "Salle supprimée avec succès",

    // High School Series
    seriesSM: "Sciences Mathématiques (SM)",
    seriesSS: "Sciences Sociales (SS)",
    seriesSE: "Sciences Expérimentales (SE)",

    // Teachers & Classes
    teachersClassesTitle: "Enseignants & Affectations",
    teachersClassesSubtitle: "Assigner les enseignants aux matières pour chaque classe",
    bySubject: "Par Matière",
    byTeacher: "Par Enseignant",
    assignTeacher: "Assigner un Enseignant",
    removeAssignment: "Retirer l'Affectation",
    unassigned: "Non assigné",
    teacherWorkload: "Charge de travail",
    hoursPerWeek: "heures/semaine",
    noTeachersFound: "Aucun enseignant trouvé",
    noSubjectsFound: "Aucune matière trouvée",
    viewSchedule: "Voir l'Emploi du Temps",
    teacherSchedule: "Emploi du Temps de l'Enseignant",

    // User Invitations
    inviteUser: "Inviter un Utilisateur",
    sendInvitation: "Envoyer l'Invitation",
    invitationSent: "Invitation Envoyée",
    invitationPending: "Invitation en Attente",
    resendInvitation: "Renvoyer l'Invitation",
    invitationExpired: "Invitation Expirée",
    invitationAccepted: "Invitation Acceptée",
    copyInvitationLink: "Copier le Lien d'Invitation",
    linkCopied: "Lien copié dans le presse-papiers",
    invitationEmailSubject: "Invitation au Système de Gestion GSPN",
    inviteUserDescription: "Entrez l'adresse email de l'utilisateur à inviter",
    inviteeEmail: "Adresse Email",
    inviteeName: "Nom (Optionnel)",
    selectRole: "Sélectionner le Rôle",
    invitationExpiresIn: "L'invitation expire dans 7 jours",
    pendingInvitations: "Invitations en Attente",
    noPendingInvitations: "Aucune invitation en attente",

    // Users page additional keys
    usersPageSubtitle: "Gérer les utilisateurs et envoyer des invitations",
    totalUsers: "Total Utilisateurs",
    acceptedInvitations: "Acceptées",
    expiredInvitations: "Expirées",
    invitationsTab: "Invitations",
    usersTab: "Utilisateurs",
    manageInvitations: "Gérer les invitations en attente et passées",
    allUsers: "Tous les Utilisateurs",
    viewAllUsers: "Voir tous les utilisateurs enregistrés",
    noUsersFound: "Aucun utilisateur trouvé",
    emailColumn: "Email",
    nameColumn: "Nom",
    roleColumn: "Rôle",
    statusColumn: "Statut",
    expiresColumn: "Expire le",
    invitedByColumn: "Invité par",
    actionsColumn: "Actions",
    resend: "Renvoyer",
    unknown: "Inconnu",

    // Role labels
    roles: {
      director: "Directeur",
      academic_director: "Directeur Académique",
      secretary: "Secrétaire",
      accountant: "Comptable",
      teacher: "Enseignant",
    },

    // Accept invitation page
    acceptInvitation: {
      pageTitle: "Accepter l'Invitation",
      pageDescription: "Créez votre compte pour accéder au Système de Gestion GSPN",
      validatingInvitation: "Validation de l'invitation...",
      accountCreated: "Compte Créé !",
      accountCreatedDescription: "Votre compte a été créé avec succès. Vous serez redirigé vers la page de connexion.",
      goToLogin: "Aller à la Connexion",
      invalidInvitation: "Invitation Invalide",
      invalidInvitationDescription: "Ce lien d'invitation est invalide ou a expiré.",
      noTokenProvided: "Aucun jeton d'invitation fourni",
      failedToValidate: "Échec de la validation de l'invitation",
      fullName: "Nom Complet",
      password: "Mot de Passe",
      confirmPassword: "Confirmer le Mot de Passe",
      createAccount: "Créer le Compte",
      passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
      passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
      failedToCreateAccount: "Échec de la création du compte",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
    },

    // Room Assignments
    roomAssignments: {
      dialogTitle: "Assigner des Élèves à une Salle",
      dialogDescription: "Sélectionnez les élèves à assigner à {gradeName}",
      selectRoom: "Sélectionner une Salle",
      noRoomsAvailable: "Aucune salle disponible",
      roomCapacity: "{current}/{capacity} élèves",
      roomFull: "Complète",
      roomNearCapacity: "Presque complète",
      unassignedStudents: "Élèves Non Assignés",
      noUnassignedStudents: "Tous les élèves sont assignés à des salles",
      selectAll: "Tout Sélectionner",
      deselectAll: "Tout Désélectionner",
      selectedCount: "{count} sélectionné(s)",
      assignStudents: "Assigner les Élèves",
      assigningStudents: "Assignation...",
      assignmentSuccess: "{count} élève(s) assigné(s) avec succès",
      assignmentPartialSuccess: "{success} élève(s) assigné(s), {failed} échoué(s)",
      assignmentError: "Échec de l'assignation des élèves",
      studentName: "Nom de l'Élève",
      studentNumber: "Numéro de l'Élève",
      fetchError: "Échec du chargement des élèves non assignés",
      currentRoom: "Salle Actuelle",
      newRoom: "Nouvelle Salle",
      reassignSuccess: "Salle changée avec succès",

      // Auto-assignment
      autoAssign: "Attribution Auto",
      autoAssignDialogTitle: "Attribution Automatique des Élèves aux Salles",
      autoAssignDialogDescription: "Distribuer automatiquement les élèves avec des ratios équilibrés de genre et d'âge",
      selectRoomsToAutoAssign: "Sélectionner les salles pour l'attribution automatique",
      selectAllRooms: "Sélectionner Toutes",
      deselectAllRooms: "Désélectionner Tout",
      previewTitle: "Aperçu",
      studentsToAssign: "{count} élèves à assigner",
      roomsSelected: "{count} salle(s) sélectionnée(s)",
      studentsPerRoom: "~{min}-{max} élèves par salle",
      genderRatio: "Genre: {male}% garçons, {female}% filles",
      lockedStudentsExcluded: "{count} élève(s) verrouillé(s) (exclus)",
      noLockedStudents: "Aucun élève verrouillé",
      autoAssignButton: "Attribution Auto ({count})",
      autoAssigning: "Attribution en cours...",
      autoAssignSuccess: "{count} élève(s) assigné(s) automatiquement avec succès",
      autoAssignError: "Échec de l'attribution automatique",
      distributionSummary: "Résumé de la Distribution",
      roomDistribution: "{roomName}: {count} élèves ({male} garçons, {female} filles)",
      averageAge: "Âge moyen: {age} ans",
      balanceScore: "Score d'Équilibre: {score}/100",
      noRoomsSelected: "Veuillez sélectionner au moins une salle",

      // Lock functionality
      lockStudent: "Verrouiller l'élève (empêcher l'attribution auto)",
      unlockStudent: "Déverrouiller l'élève (permettre l'attribution auto)",
      locked: "Verrouillé",
      lockToggleError: "Échec du verrouillage/déverrouillage",
      lockedTooltip: "Cet élève est verrouillé et ne sera pas inclus dans l'attribution automatique",

      // View Grade & Navigation
      viewGrade: "Voir la classe",
      viewGradeTooltip: "Voir la gestion détaillée des salles de classe",
      autoAssignTooltip: "Assigner automatiquement avec distribution équilibrée",

      // Attendance
      takeAttendance: "Prendre les présences",
      attendanceForRoom: "Présences pour {roomName}",
      markPresent: "Présent",
      markAbsent: "Absent",
      markLate: "En retard",
      markExcused: "Excusé",
      saveAttendance: "Enregistrer les présences",
      attendanceSaved: "Présences enregistrées avec succès",
      attendanceDate: "Date",
      attendanceError: "Échec de l'enregistrement des présences",

      // Grade Room View Page
      inlineAssignment: "Affectation en ligne",
      dragToAssign: "Glisser l'élève vers la salle pour l'assigner",
      quickActions: "Actions rapides",
      bulkOperations: "Opérations groupées",
      moveToRoom: "Déplacer vers salle",
      removeAssignment: "Retirer l'affectation",
      filterByRoom: "Filtrer par salle",
      allRooms: "Toutes les salles",
      roomUtilization: "Utilisation des salles",
      attendanceRate: "Taux de présence",
      unassignedStudentsPanel: "Élèves non assignés",
      dropStudentHere: "Déposer l'élève ici pour l'assigner",
      moveStudent: "Déplacer l'élève",
      removeStudent: "Retirer l'élève",
      bulkMoveSuccess: "{count} élève(s) déplacé(s) avec succès",
      bulkRemoveSuccess: "{count} affectation(s) supprimée(s) avec succès",
      reassignError: "Échec de la réaffectation de l'élève",
    },

    // Common
    configuration: "Configuration",
    saveChanges: "Enregistrer les Modifications",
    discardChanges: "Annuler les Modifications",
    noDataFound: "Aucune donnée trouvée",
    loadingData: "Chargement des données...",

    // Additional labels for pages
    configured: "configuré(s)",
    passed: "passé(s)",
    teachers: "Enseignants",
    withAssignments: "avec affectations",
    classAssignments: "Affectations de Classes",
    acrossGrades: "Répartis sur {count} niveaux",
    subjectsNeedTeachers: "Matières sans enseignant",
    noClasses: "Aucune classe",
    classes: "Classes",
    selectTeacher: "Sélectionner un enseignant",
    grades: "Niveaux",
    noAssignmentsForYear: "Aucune affectation pour cette année scolaire",
    removeAssignmentConfirm: "Êtes-vous sûr de vouloir supprimer cette affectation ? Cette action est irréversible.",

    // Grade stats
    students: "Élèves",
    rooms: "Salles",
    subjects: "Matières",
    noRoomsConfigured: "Aucune salle configurée",

    // Grade levels
    levelKindergarten: "Maternelle",
    levelElementary: "Élémentaire",
    levelCollege: "Collège",
    levelHighSchool: "Lycée",

    // High school tracks (series)
    trackSM: "Sciences Mathématiques",
    trackSS: "Sciences Sociales",
    trackSE: "Sciences Expérimentales",
    trackSMShort: "SM",
    trackSSShort: "SS",
    trackSEShort: "SE",
    trackSMFull: "Sciences Mathématiques (SM)",
    trackSSFull: "Sciences Sociales (SS)",
    trackSEFull: "Sciences Expérimentales (SE)",
    selectTrack: "Sélectionner la série",
    trackRequired: "La sélection de série est obligatoire pour le lycée",

    // Grade form
    order: "Ordre",
    selectSeriesOptional: "Sélectionner une série (optionnel)",
    none: "Aucune",
    enabledForEnrollment: "Activé pour les inscriptions",
    roomNamePlaceholder: "A, B, C...",
    roomDisplayNamePlaceholder: "7A, 7B...",
    active: "Actif",
    assignedSubjects: "Matières Affectées",
    coefficient: "Coefficient",
    coefficientShort: "Coef",
    hoursWeek: "Heures/Semaine",
    hoursPerWeekShort: "h/sem",
    addSubject: "Ajouter Matière",
    removeSubjectConfirm: "Êtes-vous sûr de vouloir supprimer cette matière ?",

    // Bulk move dialog
    failedToFetchStudents: "Échec du chargement des élèves",
    failedToMoveStudents: "Échec du déplacement des élèves",
    noStudentsInRoom: "Aucun élève dans cette salle",

    // Placeholders
    emailPlaceholder: "utilisateur@exemple.com",
    namePlaceholder: "Jean Dupont",

    // Trimesters
    trimesters: "Trimestres",
    trimester: "Trimestre",
    trimestersTitle: "Gestion des Trimestres",
    trimestersSubtitle: "Gérer les trimestres académiques pour les périodes de notation",
    createTrimester: "Créer un Trimestre",
    editTrimester: "Modifier le Trimestre",
    deleteTrimester: "Supprimer le Trimestre",
    activateTrimester: "Activer le Trimestre",
    deactivateTrimester: "Désactiver le Trimestre",
    trimesterNumber: "Numéro du Trimestre",
    trimester1: "1er Trimestre",
    trimester2: "2ème Trimestre",
    trimester3: "3ème Trimestre",
    activeTrimester: "Trimestre Actif",
    noActiveTrimester: "Aucun trimestre actif",
    totalTrimesters: "Total des Trimestres",
    evaluationsCount: "Évaluations",
    trimesterActivated: "Trimestre activé avec succès",
    trimesterDeactivated: "Trimestre désactivé avec succès",
    deleteTrimesterConfirmation: "Êtes-vous sûr de vouloir supprimer ce trimestre ? Cette action est irréversible.",
    cannotDeleteActiveTrimester: "Impossible de supprimer le trimestre actif",
    cannotDeleteTrimesterWithEvaluations: "Impossible de supprimer un trimestre avec des évaluations existantes",
    activateTrimesterConfirmation: "Êtes-vous sûr de vouloir activer ce trimestre ? Cela désactivera tout trimestre actuellement actif.",
    selectTrimester: "Sélectionner un trimestre",
    noTrimesters: "Aucun trimestre configuré",
    configureTrimesters: "Configurer les trimestres pour activer la notation",
  },

  // Grading System
  grading: {
    // Page titles
    gradeEntry: "Saisie des Notes",
    gradeEntrySubtitle: "Saisir les notes des élèves pour le trimestre en cours",
    evaluations: "Évaluations",
    evaluationsSubtitle: "Consulter et gérer les évaluations des élèves",

    // Evaluation types
    evaluationType: "Type d'Évaluation",
    interrogation: "Interrogation",
    interrogationShort: "Interro",
    devoirSurveille: "Devoir Surveillé",
    devoirSurveilleShort: "DS",
    composition: "Composition",
    compositionShort: "Compo",

    // Grade entry
    enterGrades: "Saisir les Notes",
    score: "Note",
    maxScore: "Note Max",
    outOf: "sur",
    coefficient: "Coefficient",
    average: "Moyenne",
    classAverage: "Moyenne de Classe",
    studentAverage: "Moyenne de l'Élève",
    subjectAverage: "Moyenne par Matière",
    generalAverage: "Moyenne Générale",
    weightedAverage: "Moyenne Pondérée",

    // Evaluation management
    addEvaluation: "Ajouter une Évaluation",
    editEvaluation: "Modifier l'Évaluation",
    deleteEvaluation: "Supprimer l'Évaluation",
    deleteEvaluationConfirmation: "Êtes-vous sûr de vouloir supprimer cette évaluation ?",
    evaluationDate: "Date d'Évaluation",
    noEvaluations: "Aucune évaluation enregistrée",
    recordedBy: "Enregistré par",

    // Batch entry
    batchEntry: "Saisie en Lot",
    enterScoresForClass: "Saisir les notes pour la classe",
    saveAllGrades: "Enregistrer Toutes les Notes",
    gradesEntered: "notes saisies",
    gradesSaved: "Notes enregistrées avec succès",
    gradeSaved: "Note enregistrée",

    // Status and validation
    passed: "Admis",
    failed: "Refusé",
    pending: "En attente",
    invalidScore: "La note doit être entre 0 et {max}",
    scoreRequired: "La note est requise",
    allFieldsRequired: "Tous les champs sont requis",

    // Coefficients by type
    coefficientInterro: "×1",
    coefficientDS: "×2",
    coefficientCompo: "×2",

    // Summary
    totalEvaluations: "Total des Évaluations",
    studentsGraded: "Élèves Notés",
    averageScore: "Note Moyenne",
    passRate: "Taux de Réussite",
    passThreshold: "Seuil de réussite : 10/20",

    // Filters
    filterBySubject: "Filtrer par matière",
    filterByType: "Filtrer par type",
    filterByStudent: "Filtrer par élève",
    allSubjects: "Toutes les matières",
    allTypes: "Tous les types",
    allStudents: "Tous les élèves",

    // Select prompts
    selectSubject: "Sélectionner une matière",
    selectGrade: "Sélectionner une classe",
    selectStudent: "Sélectionner un élève",
    selectType: "Sélectionner un type",

    // Remarks
    teacherRemark: "Appréciation du Professeur",
    addRemark: "Ajouter une appréciation",
    remarkPlaceholder: "Saisir une observation pour cet élève...",

    // Conduct
    conduct: "Conduite",
    conductScore: "Note de Conduite",

    // Decisions
    decision: "Décision",
    admis: "Admis",
    rattrapage: "Rattrapage",
    redouble: "Redouble",
    decisionPending: "Décision en Attente",

    // Rankings
    rank: "Rang",
    classRank: "Rang de Classe",
    outOfStudents: "sur {total} élèves",

    // Absences
    absences: "Absences",
    lates: "Retards",

    // Actions
    calculateAverages: "Calculer les Moyennes",
    recalculate: "Recalculer",
    exportGrades: "Exporter les Notes",
    printBulletin: "Imprimer le Bulletin",
    downloadPDF: "Télécharger PDF",

    // Bulletin
    bulletin: "Bulletin de Notes",
    bulletinSubtitle: "Consulter le bulletin trimestriel d'un élève",
    subjectResults: "Résultats par Matière",
    noDataAvailable: "Aucune donnée disponible pour cet élève et ce trimestre",
    selectToView: "Sélectionnez un trimestre, une classe et un élève pour afficher le bulletin",
    generalRemark: "Appréciation Générale",
    classStatistics: "Statistiques de Classe",
    highest: "Meilleure",
    lowest: "Plus Basse",

    // Class Ranking
    classRanking: "Classement de la Classe",
    classRankingSubtitle: "Voir le classement des élèves par moyenne générale",
    studentsRanked: "élèves classés",
    noRankingAvailable: "Aucun classement disponible pour cette classe et ce trimestre",
    selectToViewRanking: "Sélectionnez un trimestre et une classe pour afficher le classement",
    progress: "Progression",

    // Decision Override
    overrideDecision: "Modifier la Décision",
    decisionOverridden: "Décision modifiée",
    overriddenBy: "Modifié par",
    updateDecision: "Mettre à jour la Décision",
    decisionUpdated: "Décision mise à jour avec succès",

    // Bulk Operations
    calculateSubjectAverages: "Calculer les Moyennes par Matière",
    calculateStudentSummaries: "Calculer les Bilans des Élèves",
    calculateAllNow: "Tout Calculer Maintenant",
    calculatingSubjectAverages: "Calcul des moyennes par matière...",
    calculatingStudentSummaries: "Calcul des bilans des élèves...",
    calculationComplete: "Calcul terminé",
    calculationsMenu: "Calculs",

    // Manage Evaluations
    manageEvaluations: "Gérer les Évaluations",
    viewEvaluations: "Voir les Évaluations",
    recalculateAverages: "Recalculer les Moyennes ?",
    recalculatePromptMessage: "Les données ont changé. Voulez-vous recalculer les moyennes ?",
    recalculateNow: "Recalculer Maintenant",
    skipRecalculate: "Passer",
    evaluationUpdated: "Évaluation mise à jour avec succès",
    evaluationDeleted: "Évaluation supprimée avec succès",
    noEvaluationsFound: "Aucune évaluation trouvée",

    // Teacher Remarks
    teacherRemarksSubtitle: "Ajouter des appréciations par matière pour les bulletins",
    remarksSaved: "Appréciations enregistrées avec succès",
    saveRemarks: "Enregistrer les Appréciations",
    unsavedChanges: "Vous avez des modifications non enregistrées",
    noAveragesFound: "Aucune moyenne trouvée. Calculez d'abord les moyennes.",

    // Conduct Entry
    conductEntrySubtitle: "Saisir les notes de conduite et les données d'assiduité",
    absencesCount: "Absences",
    latesCount: "Retards",
    conductSaved: "Données de conduite et d'assiduité enregistrées",
    saveConductData: "Enregistrer les Données",
    noStudentsFound: "Aucun élève trouvé pour cette classe",

    // Batch Bulletin PDF
    downloadAllBulletins: "Télécharger Tous les Bulletins",
    generatingBulletins: "Génération des bulletins...",
    bulletinsDownloaded: "Tous les bulletins téléchargés",
    generatingPdfFor: "Génération du PDF pour {name}...",
  },

  // Treasury / Caisse
  treasury: {
    // Navigation & titles
    title: "Gestion de la Caisse",
    subtitle: "Suivi des mouvements de trésorerie",
    safeBalance: "Solde Caisse",
    bankBalance: "Solde Banque",

    // Status levels
    statusOptimal: "Niveau optimal",
    statusWarning: "Attention",
    statusCritical: "Critique",
    statusExcess: "Excédent",

    // Verification
    lastVerification: "Dernière vérification",
    verifyNow: "Vérifier la caisse",
    verifyDesc: "Comptez l'argent physique dans la caisse et entrez le montant",
    expectedBalance: "Solde attendu",
    countedBalance: "Solde compté",
    discrepancy: "Écart",
    verificationMatch: "Conforme",
    verificationDiscrepancy: "Écart détecté",
    explanationRequired: "Explication requise",
    noVerificationToday: "Pas encore vérifiée aujourd'hui",
    confirmVerification: "Confirmer vérification",
    recordDiscrepancy: "Enregistrer l'écart",
    excessCash: "Il y a plus d'argent que prévu dans la caisse",
    missingCash: "Il manque de l'argent dans la caisse",
    discrepancyWarning: "Si vous confirmez, le solde de la caisse sera ajusté au montant compté.",
    explanationPlaceholder: "Expliquez la raison de cet écart...",

    // Actions
    recordPayment: "Enregistrer un paiement",
    recordPaymentDesc: "Enregistrer une entrée d'argent dans la caisse",
    recordExpense: "Enregistrer une dépense",
    recordExpenseDesc: "Enregistrer une sortie d'argent de la caisse",
    bankTransfer: "Transfert bancaire",
    bankTransferDesc: "Transférer de l'argent entre la caisse et la banque",

    // Payment types
    paymentType: "Type de paiement",
    paymentTypes: {
      scolarite: "Scolarité",
      inscription: "Inscription",
      activites: "Activités",
      remboursement: "Remboursement de dette",
      autre: "Autre",
    },

    // Expense categories
    expenseCategory: "Catégorie",
    expenseCategories: {
      salaires: "Salaires",
      fournituresScolaires: "Fournitures scolaires",
      fournituresBureau: "Fournitures de bureau",
      electriciteEau: "Électricité / Eau",
      entretien: "Entretien / Réparations",
      transport: "Transport",
      alimentation: "Alimentation / Cantine",
      evenements: "Événements",
      autre: "Autre",
    },

    // Bank transfers
    depositToBank: "Dépôt en banque",
    withdrawFromBank: "Retrait de banque",
    carriedBy: "Effectué par",
    carriedByPlaceholder: "Qui va déposer ?",
    bankReference: "Référence bancaire",
    bankRefPlaceholder: "Numéro de bordereau",
    bankName: "Nom de la banque",
    newSafeBalance: "Nouvelle caisse",
    newBankBalance: "Nouvelle banque",

    // Form fields
    payerName: "Nom du payeur",
    payerNamePlaceholder: "Qui a remis l'argent ?",
    payerNameRequired: "Nom du payeur requis",
    beneficiary: "Bénéficiaire",
    beneficiaryPlaceholder: "Ex: Papeterie Central",
    selectStudent: "Sélectionner un élève",
    receiptPhoto: "Photo du reçu",
    descriptionPlaceholder: "Description du paiement",
    descriptionRequired: "Description requise",
    expenseDescPlaceholder: "Ex: Achat de craies et cahiers",
    notesPlaceholder: "Notes supplémentaires",
    invalidAmount: "Montant invalide",

    // Validation
    insufficientFunds: "Fonds insuffisants dans la caisse",
    insufficientFundsSafe: "Fonds insuffisants dans la caisse",
    insufficientFundsBank: "Fonds insuffisants en banque",
    confirmTransaction: "Confirmer",
    balanceAfter: "Solde après",

    // Summary
    todaySummary: "Résumé du jour",
    moneyIn: "Entrées",
    moneyOut: "Sorties",
    netChange: "Variation nette",

    // History
    transactionHistory: "Historique des mouvements",
    recentTransactions: "Mouvements récents",
    allTransactions: "Voir tout",
    transactions: "transactions",

    // Reports
    dailyReport: "Rapport journalier",
    startingBalance: "Solde d'ouverture",
    endingBalance: "Solde de clôture",
    verificationStatus: "Statut de vérification",

    // Direction
    income: "Entrée",
    expense: "Sortie",

    // Errors
    verificationAlreadyDone: "La vérification d'aujourd'hui a déjà été effectuée",
    balanceNotInitialized: "Le solde de la caisse n'est pas initialisé",

    // Transaction reversal
    reverseTransaction: "Annuler la Transaction",
    reversalReason: "Raison de l'annulation",
    reversalReasonPlaceholder: "Expliquez pourquoi cette transaction doit être annulée...",
    reversalReasonTooShort: "La raison doit contenir au moins 10 caractères",
    reversalWarning: "Cela créera une transaction d'annulation. La transaction originale restera dans l'historique.",
    reversalSuccess: "Transaction annulée avec succès",
    reversalFailed: "Échec de l'annulation de la transaction",
    reversedBy: "Annulé par",
    reversing: "Annulation...",
    confirmReversal: "Confirmer l'annulation",
    includeCorrection: "Inclure une correction (ré-enregistrer avec le bon montant/méthode)",
    correctAmount: "Montant Correct",
    correctMethod: "Méthode de Paiement Correcte",
    keepOriginalMethod: "Garder la méthode originale",
    correctionExplanation: "Une nouvelle transaction sera créée avec le montant/méthode correct après l'annulation.",
    invalidCorrectionAmount: "Montant de correction invalide",
    minimumCharacters: "Minimum {count} caractères",

    // Transaction types
    transactionTypes: {
      studentPayment: "Paiement Scolarité",
      expensePayment: "Paiement Dépense",
      mobileMoneyIncome: "Entrée Orange Money",
      mobileMoneyPayment: "Paiement Orange Money",
      bankDeposit: "Dépôt Bancaire",
      bankWithdrawal: "Retrait Bancaire",
      adjustment: "Ajustement",
      otherIncome: "Autre Entrée",
    },

    // Direction labels
    amount: "Montant",
    direction: "Direction",
    incoming: "Entrée",
    outgoing: "Sortie",

    // Daily verification warning
    dailyVerificationNeeded: "Vérification Quotidienne Requise",
    dailyVerificationWarning: "La vérification quotidienne de la caisse n'a pas été effectuée aujourd'hui.",
    verificationRecommendation: "Il est recommandé de vérifier le solde de la caisse avant d'enregistrer des transactions.",
    continueAnyway: "Continuer Quand Même",

    // Registry (Caisse) - Daily Operations
    registry: {
      // Balance display
      registryBalance: "Solde Caisse",
      registryOfTheDay: "Caisse du jour",
      workingCash: "Fonds de roulement",
      floatAmount: "Fond de caisse",
      standardFloat: "Montant standard",
      registryClosed: "Caisse fermée - Ouvrir la journée",
      registryOpen: "Caisse ouverte",

      // Daily opening
      dailyOpening: "Ouverture journalière",
      dailyOpeningDesc: "Étape {step}/2 - {description}",
      stepSafeCounting: "Comptage du coffre",
      stepFloatTransfer: "Transfert du fond de caisse",
      expectedSafeBalance: "Solde coffre attendu",
      countedSafeAmount: "Montant compté dans le coffre",
      countedSafeAmountPlaceholder: "Entrez le montant compté",
      countedSafeAmountHint: "Comptez physiquement l'argent dans le coffre et entrez le montant exact",
      floatAmountLabel: "Montant du fond de caisse",
      floatAmountMustBePositive: "Le montant du fond de caisse doit être supérieur à zéro",
      insufficientFundsForFloat: "Fonds insuffisants dans le coffre pour le fond de caisse",
      enterCountedSafeAmount: "Veuillez entrer le montant compté dans le coffre",
      registryAlreadyHasBalance: "La caisse contient déjà {amount}. Veuillez d'abord effectuer la fermeture du jour précédent.",
      safeAfterTransfer: "Coffre après transfert",
      registryAfterTransfer: "Caisse après transfert",
      openTheDay: "Ouvrir la journée",
      opening: "Ouverture...",
      openingFailed: "Échec de l'ouverture journalière",

      // Daily closing
      dailyClosing: "Fermeture journalière",
      dailyClosingDesc: "Comptez la caisse et transférez tout au coffre",
      expectedRegistryBalance: "Solde caisse attendu",
      countedRegistryAmount: "Montant compté dans la caisse",
      countedRegistryAmountPlaceholder: "Entrez le montant compté",
      countedRegistryAmountHint: "Comptez physiquement l'argent dans la caisse et entrez le montant exact",
      registryAlreadyEmpty: "La caisse est déjà vide. Aucune fermeture nécessaire.",
      safeAfterClosing: "Coffre après fermeture",
      closeTheDay: "Fermer la journée",
      closing: "Fermeture...",
      closingFailed: "Échec de la fermeture journalière",
      alreadyOpen: "Déjà ouvert",
      alreadyClosed: "Déjà fermé",

      // Discrepancy
      surplus: "Surplus",
      shortage: "Manque",
      adjustmentWillBeCreated: "Un ajustement sera créé automatiquement.",
      noDiscrepancy: "Pas d'écart détecté",
      countMatchesExpected: "Le montant compté correspond au solde attendu.",

      // Safe Transfer
      safeTransfer: "Transfert Coffre ↔ Caisse",
      safeTransferDesc: "Transfert ad-hoc en dehors des opérations d'ouverture/fermeture",
      transferDirection: "Direction du transfert",
      safeToRegistry: "Coffre → Caisse",
      safeToRegistryDesc: "Retirer du coffre pour alimenter la caisse",
      registryToSafe: "Caisse → Coffre",
      registryToSafeDesc: "Déposer au coffre depuis la caisse",
      amountToTransfer: "Montant à transférer",
      available: "Disponible",
      previewAfterTransfer: "Aperçu après transfert",
      notesRequired: "Les notes sont obligatoires (minimum 10 caractères)",
      notesMinChars: "{count}/10 caractères minimum",
      adHocTransferNote: "Ce transfert est un mouvement ad-hoc qui sera enregistré dans l'historique des transactions. Utilisez les opérations d'ouverture/fermeture journalière pour les transferts quotidiens standards.",
      performTransfer: "Effectuer le transfert",
      transferring: "Transfert...",
      transferFailed: "Échec du transfert",
      insufficientFundsInRegistry: "Fonds insuffisants dans la caisse",

      // Notes
      notesOptional: "Notes (optionnel)",
      notesPlaceholder: "Remarques ou observations...",
      transferReasonPlaceholder: "Raison du transfert (minimum 10 caractères)...",

      // Buttons
      cancel: "Annuler",
      back: "Retour",
      next: "Suivant",

      // Accounting page labels
      openDay: "Ouvrir la journée",
      closeDay: "Fermer la journée",
      safeRegistryTransfer: "Transfert Coffre/Caisse",
      recordExpense: "Enregistrer une dépense",
      bankTransfer: "Transfert bancaire",
      verifyCash: "Vérifier la caisse",
      alreadyVerified: "Déjà vérifié",
      todaysEntries: "Entrées aujourd'hui",
      todaysExits: "Sorties aujourd'hui",
      todaysTransactions: "Transactions aujourd'hui",
      recentMovements: "Mouvements récents",
      noRecentTransactions: "Aucune transaction récente",
      viewAll: "Voir tout",
    },
  },

  // Navigation
  safe: "Caisse",

  // Payment Wizard
  paymentWizard: {
    // Page
    title: "Nouveau paiement",
    description: "Enregistrer un paiement de scolarité",

    // Steps
    step1: "Élève",
    step2: "Échéancier",
    step3: "Paiement",
    step4: "Vérification",
    step5: "Terminé",

    // Step 1 - Student Selection
    searchStudent: "Rechercher un élève",
    searchPlaceholder: "Entrez le nom ou le numéro de l'élève...",
    noStudentSelected: "Aucun élève sélectionné",
    searchToSelect: "Recherchez ci-dessus pour trouver et sélectionner un élève",
    remainingBalance: "Solde restant",
    totalPaid: "Total payé",

    // Step 2 - Payment Schedule
    paymentSchedules: "Échéancier de paiement",
    paymentHistory: "Historique des paiements",

    // Step 3 - Payment Entry
    paymentMethod: "Mode de paiement",
    amount: "Montant",
    receiptNumber: "Numéro de reçu",
    transactionRef: "Référence de transaction",
    payerInfo: "Informations du payeur",
    payerType: "Relation",
    payerName: "Nom du payeur",
    payerPhone: "Téléphone",
    payerEmail: "Email",
    notes: "Notes",

    // Step 4 - Review
    reviewTitle: "Vérification du paiement",
    student: "Élève",
    payment: "Paiement",
    payer: "Payeur",
    grade: "Classe",

    // Step 5 - Completion
    paymentSummary: "Résumé du paiement",
    newBalance: "Nouveau solde",
    downloadReceipt: "Télécharger le reçu",
    printReceipt: "Imprimer le reçu",
    recordAnother: "Enregistrer un autre paiement",
    viewStudent: "Voir le profil de l'élève",
    date: "Date",

    // Navigation
    back: "Retour",
    next: "Continuer",
    submit: "Soumettre le paiement",
    submitting: "Enregistrement...",
    cancel: "Annuler",
  },
} as const;

type TranslationTree = { [key: string]: string | TranslationTree };

type WidenStrings<T> = T extends string
  ? string
  : T extends Record<string, any>
    ? { [K in keyof T]: WidenStrings<T[K]> }
    : T;

export type TranslationKeys = WidenStrings<typeof fr>;
