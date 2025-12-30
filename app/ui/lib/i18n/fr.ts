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
    students: "élèves",
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
    classes: "Classes",
    timetable: "Emploi du temps",
    audit: "Audit",
    financialAudit: "Audit Financier",
    dataHistory: "Historique des Données",
    collapseMenu: "Réduire le menu",
    expandMenu: "Agrandir le menu",
    closeMenu: "Fermer le menu",
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
    review: "Réviser",
    by: "Par", 

    // Exception types
    paymentDiscount: "Remise de paiement",
    lateEnrollment: "Inscription tardive",
    feeWaiver: "Annulation de frais",
    paymentPlan: "Plan de paiement",
    activityModification: "Modification d'activité",

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
    fullName: "Nom complet",
    enrollmentDate: "Date d'inscription",
    paymentStatus: "Statut de paiement",

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
  },

  // Activities
  activities: {
    title: "Gestion des activités",
    subtitle: "Gérer les activités scolaires et extrascolaires",
    
    // Tabs
    tabAll: "Toutes",
    tabAcademic: "Scolaires",
    tabExtra: "Extrascolaires",

    // Activity types
    academic: "Scolaire",
    extra: "Extra",

    // Card info
    assignStudent: "Assigner un élève",

    // Assign dialog
    assignStudentTitle: "Assigner un élève",
    searchAndAdd: "Recherchez et ajoutez un élève à",
    searchStudentPlaceholder: "Rechercher un élève par nom ou ID...",
    overduePayments: "Paiements en retard",

    // Activity names
    englishClub: "Club d'anglais",
    advancedMath: "Mathématiques avancées",
    football: "Football",
    physics: "Sciences physiques",
    readingClub: "Club de lecture",
    computerScience: "Informatique",
  },

  // Accounting
  accounting: {
    title: "Centre de contrôle financier",
    subtitle: "Gérer les paiements, validations et réconciliations",
    subtitleWithName: "Gérer les paiements, validations et réconciliations - {personName}",

    // Tabs
    tabPayments: "Enregistrement de paiements",
    tabReconciliation: "Réconciliation",
    tabPeriodClose: "Clôture de période",

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
    selectDay: "Sélectionner un jour",
    scheduleForDay: "Emploi du temps - {day}",
    noCoursesForDay: "Aucun cours prévu pour ce jour",
    days: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
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
    selectGrade: "Sélectionner la classe",
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
    lastName: "Nom",
    dateOfBirth: "Date de naissance",
    gender: "Genre",
    male: "Masculin",
    female: "Féminin",
    phone: "Téléphone",
    email: "Email",
    photo: "Photo",
    birthCertificate: "Extrait de naissance",
    uploadPhoto: "Télécharger une photo",
    uploadDocument: "Télécharger le document",

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
    downloadPdf: "Télécharger le PDF",
    downloadingPdf: "Génération du PDF...",
    pdfDownloadError: "Échec du téléchargement du PDF. Veuillez réessayer.",
    printDocument: "Imprimer",
    statusSubmittedPendingReview: "Soumise - En attente de révision",
    statusReviewRequired: "Révision requise par le directeur",
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
  },

  // Students module
  students: {
    title: "Gestion des élèves",
    subtitle: "Visualiser et gérer les élèves inscrits",
    searchPlaceholder: "Rechercher par nom ou numéro...",
    filters: "Filtres",
    allGrades: "Toutes les classes",
    allStatuses: "Tous les statuts",

    // Status labels
    balanceStatus: "Statut de paiement",
    late: "En retard",
    onTime: "À jour",
    inAdvance: "En avance",
    complete: "Complet",
    goldMedal: "Paiement complet",

    // Attendance status
    attendanceGood: "Bonne présence",
    attendanceConcerning: "Présence préoccupante",
    attendanceCritical: "Présence critique",

    // Student detail
    personalInfo: "Informations personnelles",
    paymentHistory: "Historique des paiements",
    attendanceHistory: "Historique de présence",
    progressBar: "Progression",
    remainingBalance: "Solde restant",
    uploadPhoto: "Télécharger une photo",
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
} as const;

type TranslationTree = { [key: string]: string | TranslationTree };

type WidenStrings<T> = T extends string
  ? string
  : T extends Record<string, any>
    ? { [K in keyof T]: WidenStrings<T[K]> }
    : T;

export type TranslationKeys = WidenStrings<typeof fr>;
