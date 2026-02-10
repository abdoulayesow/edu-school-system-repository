// ============================================================================
// GRADING TYPES
// Shared type definitions for grading-related pages and components
// ============================================================================

/**
 * Active trimester information
 */
export interface ActiveTrimester {
  id: string
  number: number
  nameFr: string
  nameEn: string
  schoolYear: {
    id: string
    name: string
  }
}

/**
 * Grade (class) information
 */
export interface Grade {
  id: string
  name: string
  code: string
  level?: string
}

/**
 * Decision types for student trimester outcomes
 */
export type DecisionType = "pending" | "admis" | "rattrapage" | "redouble"

/**
 * Student summary for conduct, remarks, and decisions
 */
export interface StudentSummary {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  conduct: number | null
  absences: number | null
  lates: number | null
  generalAverage: number | null
  rank: number | null
  totalStudents: number | null
  decision: DecisionType | null
  decisionOverride: boolean
  generalRemark: string | null
}

/**
 * Subject progress within a grade
 */
export interface SubjectProgress {
  id: string
  subjectId: string
  code: string
  nameFr: string
  nameEn: string
  coefficient: number
  interrogations: number
  devoirsSurveilles: number
  compositions: number
  compositionProgress: number
  hasComposition: boolean
  compositionComplete: boolean
  averagesCalculated: number
  hasAverages: boolean
}

/**
 * Grade-level progress for the overview dashboard
 */
export interface GradeProgress {
  id: string
  name: string
  code: string
  level: string
  studentCount: number
  totalSubjects: number
  subjectsWithComposition: number
  subjectsComplete: number
  compositionProgress: number
  completionProgress: number
  studentsWithRankings: number
  rankingsCalculated: boolean
  subjects: SubjectProgress[]
}

/**
 * Overall progress data for the trimester
 */
export interface ProgressData {
  trimesterId: string
  summary: {
    totalGrades: number
    gradesWithAllCompositions: number
    gradesComplete: number
    gradesWithRankings: number
    overallProgress: number
  }
  grades: GradeProgress[]
}

// ============================================================================
// CONDUCT PAGE TYPES
// ============================================================================

/**
 * Conduct entry for a student (scores and attendance)
 */
export interface ConductEntry {
  conduct: string
  absences: string
  lates: string
  hasChanges: boolean
}

/**
 * Remark entry for a student
 */
export interface RemarkEntry {
  remark: string
  hasChanges: boolean
}

/**
 * Decision entry for a student
 */
export interface DecisionEntry {
  decision: DecisionType | null
  hasChanges: boolean
}

/**
 * Tab identifiers for conduct page
 */
export type ConductTabId = "conduct" | "remarks" | "decisions"

// ============================================================================
// ENTRY PAGE TYPES
// ============================================================================

/**
 * Subject assignment for a grade with coefficient
 */
export interface GradeSubject {
  id: string
  subjectId: string
  subjectCode: string
  subjectNameFr: string
  subjectNameEn: string
  coefficient: number
}

/**
 * Evaluation type identifiers
 */
export type EvaluationType = "interrogation" | "devoir_surveille" | "composition"

/**
 * Get the localized label for an evaluation type
 */
export function getEvaluationTypeLabel(
  type: EvaluationType,
  t: { grading: { interrogation: string; devoirSurveille: string; composition: string } }
): string {
  switch (type) {
    case "interrogation":
      return t.grading.interrogation
    case "devoir_surveille":
      return t.grading.devoirSurveille
    case "composition":
      return t.grading.composition
  }
}

/**
 * Student enrolled in a grade
 */
export interface GradeStudent {
  id: string
  studentProfileId: string
  firstName: string
  lastName: string
  studentNumber: string
}

/**
 * Score input entry for grade entry form
 */
export interface GradeEntry {
  studentProfileId: string
  score: string
  notes: string
  hasChanges: boolean
}

/**
 * Full evaluation record
 */
export interface Evaluation {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  gradeSubjectId: string
  subjectName: string
  type: EvaluationType
  score: number
  maxScore: number
  date: string
  notes: string | null
  trimesterId: string
  gradeName: string
}

// ============================================================================
// REMARKS PAGE TYPES
// ============================================================================

/**
 * Student average with teacher remark for a subject
 */
export interface SubjectAverage {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  average: number | null
  teacherRemark: string | null
}

// ============================================================================
// BULLETIN PAGE TYPES
// ============================================================================

/**
 * Trimester with active status (extends ActiveTrimester)
 */
export interface Trimester {
  id: string
  number: number
  name: string
  nameFr: string
  nameEn: string
  isActive: boolean
  schoolYear: {
    id: string
    name: string
  }
}

/**
 * Subject-level evaluation detail for bulletin
 */
export interface SubjectEvaluation {
  id: string
  score: number
  maxScore: number
  date: string
}

/**
 * Subject data within a bulletin
 */
export interface BulletinSubject {
  id: string
  subjectId: string
  code: string
  nameFr: string
  nameEn: string
  coefficient: number
  average: number | null
  teacherRemark: string | null
  evaluations: {
    interrogations: SubjectEvaluation[]
    devoirsSurveilles: SubjectEvaluation[]
    compositions: SubjectEvaluation[]
  }
}

/**
 * Full bulletin response data
 */
export interface BulletinData {
  student: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string | null
    photoUrl: string | null
    studentNumber: string
    grade: { id: string; name: string; level: string } | null
  }
  trimester: {
    id: string
    number: number
    name: string
    nameFr: string
    nameEn: string
    schoolYear: { id: string; name: string }
  }
  subjects: BulletinSubject[]
  totalCoefficient: number
  summary: {
    generalAverage: number | null
    rank: number | null
    totalStudents: number | null
    conduct: number | null
    decision: string
    decisionOverride: boolean
    generalRemark: string | null
    absences: number | null
    lates: number | null
    calculatedAt: string | null
  } | null
  classStats: {
    classAverage: number | null
    highestAverage: number | null
    lowestAverage: number | null
    passCount: number
    passRate: number | null
    totalStudents: number
  } | null
}

// ============================================================================
// RANKING PAGE TYPES
// ============================================================================

/**
 * Student with rank and general average
 */
export interface RankedStudent {
  id: string
  studentProfileId: string
  studentName: string
  gradeId: string
  gradeName: string
  generalAverage: number | null
  rank: number | null
  totalStudents: number | null
  conduct: number | null
  decision: string
  decisionOverride: boolean
  absences: number | null
  lates: number | null
}

// ============================================================================
// RAW API RESPONSE TYPES (for replacing `any` casts in data transforms)
// ============================================================================

export interface RawStudentSummaryResponse {
  id: string
  studentProfileId: string
  studentName?: string
  studentNumber?: string
  studentProfile?: { firstName: string; lastName: string; studentNumber?: string }
  conduct: number | null
  absences: number | null
  lates: number | null
  generalAverage: number | null
  rank: number | null
  totalStudents: number | null
  decision: DecisionType | null
  decisionOverride?: boolean
  generalRemark?: string | null
}

export interface RawEvaluationResponse {
  id: string
  studentProfileId: string
  studentProfile?: { firstName: string; lastName: string; studentNumber?: string }
  gradeSubjectId: string
  gradeSubject?: {
    subject?: { nameFr: string; nameEn: string }
    grade?: { name: string }
  }
  type: EvaluationType
  score: number
  maxScore: number
  date: string
  notes: string | null
  trimesterId: string
}

export interface RawSubjectAverageResponse {
  id: string
  studentProfileId: string
  studentName?: string
  studentNumber?: string
  average: number | null
  teacherRemark: string | null
}

/**
 * Aggregate class statistics
 */
export interface ClassStats {
  classAverage: number | null
  highestAverage: number | null
  lowestAverage: number | null
  passCount: number
  passRate: number | null
  totalStudents: number
}
