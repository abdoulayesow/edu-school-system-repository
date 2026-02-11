/**
 * Permission System v2 — Code-based Role-to-Permissions Mapping
 *
 * Design Principle: THE WALL
 * Academic staff has ZERO access to financial data.
 * Financial staff has ZERO access to academic data.
 * Only DG (proprietaire) and admin_systeme cross both branches.
 *
 * Based on GSPN Organisation v1.3
 */

import {
  StaffRole,
  PermissionResource,
  PermissionAction,
  PermissionScope,
} from "@prisma/client"

// ============================================================================
// TYPES
// ============================================================================

export type Branch = "transversal" | "academic" | "financial" | "none"
export type RoleScope = "all" | "all_secondary" | "all_primary" | "own_classes" | "limited" | "none"

export interface RolePermissionEntry {
  resource: PermissionResource
  action: PermissionAction
  scope: PermissionScope
}

export interface RoleConfig {
  branch: Branch
  roleScope: RoleScope
  /** '*' for wildcard (all permissions), or an explicit list */
  permissions: "*" | RolePermissionEntry[]
}

// ============================================================================
// PERMISSION GROUPS — Shared building blocks for DRY role definitions
// ============================================================================

// --- ACADEMIC ---

const STUDENT_VIEW: RolePermissionEntry[] = [
  { resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },
]

const STUDENT_MANAGE: RolePermissionEntry[] = [
  ...STUDENT_VIEW,
  { resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.delete, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.approve, scope: PermissionScope.all },
  { resource: PermissionResource.student_enrollment, action: PermissionAction.export, scope: PermissionScope.all },
]

const GRADE_MANAGE: RolePermissionEntry[] = [
  { resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.grades, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.grades, action: PermissionAction.delete, scope: PermissionScope.all },
  { resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.all },
]

const ATTENDANCE_MANAGE: RolePermissionEntry[] = [
  { resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.all },
]

const ACADEMIC_SETUP: RolePermissionEntry[] = [
  { resource: PermissionResource.academic_year, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.academic_year, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.academic_year, action: PermissionAction.delete, scope: PermissionScope.all },
  { resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.teachers_assignment, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.teachers_assignment, action: PermissionAction.delete, scope: PermissionScope.all },
  { resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.schedule, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.staff_assignment, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.club_enrollment, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.classes, action: PermissionAction.update, scope: PermissionScope.all },
]

const ACADEMIC_REPORTS: RolePermissionEntry[] = [
  { resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.all },
]

// --- FINANCIAL ---

const FINANCIAL_CAISSE: RolePermissionEntry[] = [
  { resource: PermissionResource.payment_recording, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.safe_expense, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.receipts, action: PermissionAction.export, scope: PermissionScope.all },
  { resource: PermissionResource.safe_balance, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.safe_balance, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.daily_verification, action: PermissionAction.create, scope: PermissionScope.all },
]

const FINANCIAL_REPORTS: RolePermissionEntry[] = [
  { resource: PermissionResource.financial_reports, action: PermissionAction.view, scope: PermissionScope.all },
]

// --- SALARY ---

const SALARY_HOURS_SUBMIT: RolePermissionEntry[] = [
  { resource: PermissionResource.salary_hours, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.salary_hours, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.salary_hours, action: PermissionAction.update, scope: PermissionScope.all },
]

const FINANCIAL_SALARY: RolePermissionEntry[] = [
  { resource: PermissionResource.salary_hours, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.salary_hours, action: PermissionAction.approve, scope: PermissionScope.all },
  { resource: PermissionResource.salary_payments, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.salary_payments, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.salary_payments, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.salary_payments, action: PermissionAction.approve, scope: PermissionScope.all },
  { resource: PermissionResource.salary_advances, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.salary_advances, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.salary_advances, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.salary_rates, action: PermissionAction.view, scope: PermissionScope.all },
]

const SALARY_RATES_ADMIN: RolePermissionEntry[] = [
  { resource: PermissionResource.salary_rates, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.salary_rates, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.salary_rates, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.salary_rates, action: PermissionAction.delete, scope: PermissionScope.all },
]

// --- ADMIN ---

const ADMIN_OPS: RolePermissionEntry[] = [
  { resource: PermissionResource.user_accounts, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.user_accounts, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.role_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.role_assignment, action: PermissionAction.update, scope: PermissionScope.all },
  { resource: PermissionResource.permission_overrides, action: PermissionAction.view, scope: PermissionScope.all },
  { resource: PermissionResource.permission_overrides, action: PermissionAction.create, scope: PermissionScope.all },
  { resource: PermissionResource.permission_overrides, action: PermissionAction.delete, scope: PermissionScope.all },
  { resource: PermissionResource.audit_logs, action: PermissionAction.view, scope: PermissionScope.all },
]

// ============================================================================
// ROLE → PERMISSIONS MAPPING (v1.3 — Wall-enforced)
// ============================================================================

export const ROLE_PERMISSIONS: Record<StaffRole, RoleConfig> = {
  // ── TRANSVERSAL (crosses the wall) ──────────────────────────────────
  proprietaire: { branch: "transversal", roleScope: "all", permissions: "*" },
  admin_systeme: { branch: "transversal", roleScope: "all", permissions: "*" },

  // ── ACADEMIC BRANCH (ZERO financial) ────────────────────────────────

  // Proviseur — N°2 of the school, full academic for collège & lycée
  proviseur: {
    branch: "academic",
    roleScope: "all_secondary",
    permissions: [
      ...STUDENT_MANAGE,
      ...GRADE_MANAGE,
      ...ATTENDANCE_MANAGE,
      ...ACADEMIC_SETUP,
      ...ACADEMIC_REPORTS,
      ...SALARY_HOURS_SUBMIT,
    ],
  },

  // Censeur — pedagogy, collège & lycée
  censeur: {
    branch: "academic",
    roleScope: "all_secondary",
    permissions: [
      ...STUDENT_VIEW,
      ...GRADE_MANAGE,
      ...SALARY_HOURS_SUBMIT,
      { resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },
      { resource: PermissionResource.schedule, action: PermissionAction.create, scope: PermissionScope.all },
      { resource: PermissionResource.teachers_assignment, action: PermissionAction.create, scope: PermissionScope.all },
      { resource: PermissionResource.teachers_assignment, action: PermissionAction.delete, scope: PermissionScope.all },
      { resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.all },
      { resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.all },
    ],
  },

  // Surveillant Général — discipline, collège & lycée
  surveillant_general: {
    branch: "academic",
    roleScope: "all_secondary",
    permissions: [
      ...STUDENT_VIEW,
      ...ATTENDANCE_MANAGE,
      { resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.all },
    ],
  },

  // Directeur — maternelle & primaire
  directeur: {
    branch: "academic",
    roleScope: "all_primary",
    permissions: [
      ...STUDENT_MANAGE,
      ...GRADE_MANAGE,
      ...ATTENDANCE_MANAGE,
      ...ACADEMIC_SETUP,
      ...ACADEMIC_REPORTS,
      ...SALARY_HOURS_SUBMIT,
    ],
  },

  // Secrétariat — enrollments only, maternelle & primaire
  secretariat: {
    branch: "academic",
    roleScope: "all_primary",
    permissions: [
      ...STUDENT_VIEW,
      { resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.all },
      { resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.all },
      { resource: PermissionResource.student_enrollment, action: PermissionAction.export, scope: PermissionScope.all },
    ],
  },

  // Professeur Principal — extended teacher, own classes
  professeur_principal: {
    branch: "academic",
    roleScope: "own_classes",
    permissions: [
      { resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.create, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.delete, scope: PermissionScope.own_classes },
      { resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.own_classes },
      { resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_classes },
    ],
  },

  // Enseignant — teaching, own classes only
  enseignant: {
    branch: "academic",
    roleScope: "own_classes",
    permissions: [
      { resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.create, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.own_classes },
      { resource: PermissionResource.grades, action: PermissionAction.delete, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_classes },
      { resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.own_classes },
      { resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_classes },
    ],
  },

  // ── FINANCIAL BRANCH (ZERO academic) ────────────────────────────────

  // Coordinateur Général — finance head, bank + coffre
  coordinateur: {
    branch: "financial",
    roleScope: "all",
    permissions: [
      ...FINANCIAL_CAISSE,
      ...FINANCIAL_REPORTS,
      ...FINANCIAL_SALARY,
      ...SALARY_RATES_ADMIN,
      { resource: PermissionResource.bank_transfers, action: PermissionAction.view, scope: PermissionScope.all },
      { resource: PermissionResource.bank_transfers, action: PermissionAction.create, scope: PermissionScope.all },
      { resource: PermissionResource.audit_logs, action: PermissionAction.view, scope: PermissionScope.all },
      // Needs student view for payment context
      { resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
    ],
  },

  // Comptable — caisse + coffre, NO bank
  comptable: {
    branch: "financial",
    roleScope: "all",
    permissions: [
      ...FINANCIAL_CAISSE,
      ...FINANCIAL_REPORTS,
      ...FINANCIAL_SALARY,
      // Needs student balance view for payment context
      { resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
      // NO bank_transfers — only DG + Coordinateur
    ],
  },

  // ── OUTSIDE BRANCHES ────────────────────────────────────────────────

  // Agent de Recouvrement — minimal, late payments only
  agent_recouvrement: {
    branch: "none",
    roleScope: "limited",
    permissions: [
      { resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
      { resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },
    ],
  },

  // Gardien — no system access
  gardien: {
    branch: "none",
    roleScope: "none",
    permissions: [],
  },
}

// ============================================================================
// BRANCH DEFINITIONS — For route-level wall enforcement
// ============================================================================

export const ACADEMIC_ROLES: StaffRole[] = [
  StaffRole.proviseur,
  StaffRole.censeur,
  StaffRole.surveillant_general,
  StaffRole.directeur,
  StaffRole.secretariat,
  StaffRole.professeur_principal,
  StaffRole.enseignant,
]

export const FINANCIAL_ROLES: StaffRole[] = [
  StaffRole.coordinateur,
  StaffRole.comptable,
]

export const TRANSVERSAL_ROLES: StaffRole[] = [
  StaffRole.proprietaire,
  StaffRole.admin_systeme,
]

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if a role has a specific permission in the code-based mapping.
 * Returns the matching entry (with scope) or null.
 */
export function getRolePermissionFromMap(
  role: StaffRole,
  resource: PermissionResource,
  action: PermissionAction,
): RolePermissionEntry | null {
  const config = ROLE_PERMISSIONS[role]
  if (!config) return null

  // Wildcard: transversal roles have all permissions with 'all' scope
  if (config.permissions === "*") {
    return { resource, action, scope: PermissionScope.all }
  }

  // Search the explicit permission list
  return config.permissions.find(
    (p) => p.resource === resource && p.action === action
  ) ?? null
}

/**
 * Get the branch for a role.
 */
export function getRoleBranch(role: StaffRole): Branch {
  return ROLE_PERMISSIONS[role]?.branch ?? "none"
}

/**
 * Check if a role is allowed to access a route based on branch rules.
 */
export function isRoleAllowedForRoute(role: StaffRole, pathname: string): boolean {
  const config = ROLE_PERMISSIONS[role]
  if (!config) return false

  // Transversal roles can access everything
  if (config.branch === "transversal") return true

  // Route-to-branch mapping
  const isAccountingRoute = pathname.startsWith("/accounting")
  const isStudentsRoute = pathname.startsWith("/students")
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isAdminRoute = pathname.startsWith("/admin")

  // THE WALL: Financial routes blocked for academic roles
  if (isAccountingRoute) {
    // Special: academic directors can access salary hours submission (wall-crossing)
    if (pathname.startsWith("/accounting/salaries") && config.branch === "academic") {
      const salaryAcademicRoles: StaffRole[] = [StaffRole.proviseur, StaffRole.censeur, StaffRole.directeur]
      return salaryAcademicRoles.includes(role)
    }
    return config.branch === "financial"
  }

  // THE WALL: Academic routes blocked for financial roles
  if (isStudentsRoute) {
    return config.branch === "academic"
  }

  // Admin routes — only certain academic roles + transversal
  if (isAdminRoute) {
    if (pathname.startsWith("/admin/users")) {
      // User management: transversal only (already handled above)
      return false
    }
    // Salary rates: coordinateur can access
    if (pathname.startsWith("/admin/salary-rates")) {
      return role === StaffRole.coordinateur
    }
    // School config: proviseur, censeur, directeur
    if (config.branch === "academic") {
      const academicAdminRoles: StaffRole[] = [
        StaffRole.proviseur,
        StaffRole.censeur,
        StaffRole.directeur,
      ]
      return academicAdminRoles.includes(role)
    }
    return false
  }

  // Dashboard — both branches can see their reports
  if (isDashboardRoute) {
    return config.branch === "academic" || config.branch === "financial"
  }

  // Brand/style-guide and other non-restricted pages
  return true
}
