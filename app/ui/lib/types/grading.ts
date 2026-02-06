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
