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
  { prefix: "/reports", roles: ["director", "academic_director"] },
  { prefix: "/attendance", roles: ["director", "teacher", "academic_director"] },
  { prefix: "/activities", roles: ["director", "academic_director", "teacher"] },
  { prefix: "/enrollments", roles: ["director", "secretary", "academic_director"] },
  // Default dashboard: allow all authenticated roles for now
  { prefix: "/dashboard", roles: ["user", "director", "academic_director", "secretary", "accountant", "teacher", "parent", "student"] },
];

export function isAllowedPathForRole(pathname: string, role?: string | null): boolean {
  const rule = routeRoleRules.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));

  // If the path is not explicitly restricted, allow any authenticated user.
  if (!rule) return true;

  const appRole = normalizeRole(role);
  if (!appRole) return false;

  return rule.roles.includes(appRole);
}
