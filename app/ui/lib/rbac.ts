export type AppRole =
  | "user"
  | "director"
  | "academic_director"
  | "secretary"
  | "accountant"
  | "teacher"
  | "parent"
  | "student";

export const VALID_ROLES: AppRole[] = [
  "user",
  "director",
  "academic_director",
  "secretary",
  "accountant",
  "teacher",
  "parent",
  "student",
];

export function normalizeRole(role?: string | null): AppRole {
  // Always return a safe role for RBAC decisions.
  if (!role) return "user";

  // Prisma enum values serialize to strings already.
  const normalized = role.toLowerCase();
  switch (normalized) {
    case "user":
    case "director":
    case "academic_director":
    case "secretary":
    case "accountant":
    case "teacher":
    case "parent":
    case "student":
      return normalized as AppRole;

    default:
      return "user";
  }
}

// Minimal route-prefix RBAC. Expand as the domain model solidifies.
const routeRoleRules: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/users", roles: ["director"] },
  { prefix: "/accounting", roles: ["director", "accountant"] },
  { prefix: "/dashboard/reports", roles: ["director", "academic_director"] },
  { prefix: "/students/attendance", roles: ["director", "teacher", "academic_director"] },
  { prefix: "/activities", roles: ["director", "academic_director", "teacher"] },
  { prefix: "/students/enrollments", roles: ["director", "secretary", "academic_director"] },
  // Students module - view for teachers, edit for director/secretary
  { prefix: "/students", roles: ["director", "academic_director", "secretary", "teacher"] },
  // Expenses module - director and accountant only
  { prefix: "/accounting/expenses", roles: ["director", "accountant"] },
  // Default dashboard: allow all authenticated roles for now
  { prefix: "/dashboard", roles: ["user", "director", "academic_director", "secretary", "accountant", "teacher", "parent", "student"] },
  // Administration module
  { prefix: "/admin/school-years", roles: ["director", "academic_director"] },
  { prefix: "/admin/grades", roles: ["director", "academic_director"] },
  { prefix: "/admin/teachers", roles: ["director", "academic_director"] },
  { prefix: "/admin/users", roles: ["director"] },
];

// Action-level permissions for more granular control
export const actionPermissions = {
  // Students
  "students:view": ["director", "academic_director", "secretary", "teacher"],
  "students:edit": ["director", "secretary"],
  "students:uploadPhoto": ["director", "secretary"],

  // Payments
  "payments:view": ["director", "accountant", "secretary"],
  "payments:record": ["director", "accountant", "secretary"],
  "payments:recordDeposit": ["director", "accountant"],
  "payments:review": ["director"],

  // Attendance
  "attendance:view": ["director", "academic_director", "teacher"],
  "attendance:record": ["director", "academic_director", "teacher"],
  "attendance:editPast": ["director", "academic_director"],

  // Grades
  "grades:view": ["director", "academic_director", "teacher"],
  "grades:assignLeader": ["director", "academic_director"],
  "grades:assignTeacher": ["director", "academic_director"],

  // Expenses
  "expenses:view": ["director", "accountant"],
  "expenses:create": ["director", "accountant", "secretary"],
  "expenses:approve": ["director"],

  // School Years
  "schoolYears:view": ["director", "academic_director"],
  "schoolYears:create": ["director"],
  "schoolYears:edit": ["director"],
  "schoolYears:activate": ["director"],
  "schoolYears:copyConfig": ["director"],

  // Grades & Rooms (Admin)
  "admin:grades:view": ["director", "academic_director"],
  "admin:grades:create": ["director"],
  "admin:grades:edit": ["director", "academic_director"],
  "admin:grades:delete": ["director"],
  "admin:grades:toggle": ["director"],
  "admin:rooms:manage": ["director", "academic_director"],
  "admin:rooms:assignStudents": ["director", "secretary"],

  // Teachers & Class Assignments
  "classAssignments:view": ["director", "academic_director"],
  "classAssignments:manage": ["director", "academic_director"],

  // User Invitations
  "users:invite": ["director"],
  "users:resendInvitation": ["director"],
} as const;

export type ActionPermission = keyof typeof actionPermissions;

export function canPerformAction(action: ActionPermission, role?: string | null): boolean {
  const appRole = normalizeRole(role);
  const allowedRoles = actionPermissions[action] as readonly string[];
  return allowedRoles.includes(appRole);
}

export function isAllowedPathForRole(pathname: string, role?: string | null): boolean {
  const rule = routeRoleRules.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));

  // If the path is not explicitly restricted, allow any authenticated user.
  if (!rule) return true;

  const appRole = normalizeRole(role);
  if (!appRole) return false;

  return rule.roles.includes(appRole);
}
