import { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Receipt,
  ClipboardCheck,
  BarChart3,
  Wallet,
  DollarSign,
  FileSearch,
  History,
  PieChart,
  UserPlus,
  Calendar,
  Settings,
  CalendarDays,
  UserCog,
  BookMarked,
  PenLine,
  FileText,
  Trophy,
  MessageSquare,
  Sparkles,
  Banknote,
  Calculator,
} from "lucide-react"
import { isGradingFeaturesEnabled } from "./feature-flags"

// Legacy role type used for navigation visibility.
// These map to simplified role categories, not the Prisma StaffRole enum.
export type UserRole =
  | "user"
  | "director"
  | "academic_director"
  | "secretary"
  | "accountant"
  | "teacher"
  | "parent"
  | "student"

export interface SubNavItem {
  id: string
  name: string
  translationKey: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export interface MainNavItem {
  id: string
  name: string
  translationKey: string
  icon: LucideIcon
  roles: UserRole[]
  subItems: SubNavItem[]
}

/**
 * Hierarchical navigation configuration
 * 4 main sections with expandable sub-items
 */
export const navigationConfig: MainNavItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    translationKey: "dashboard",
    icon: LayoutDashboard,
    roles: ["director", "academic_director", "secretary", "accountant", "teacher"],
    subItems: [
      {
        id: "overview",
        name: "Overview",
        translationKey: "overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["director", "academic_director", "secretary", "accountant"],
      },
      {
        id: "reports",
        name: "Reports",
        translationKey: "reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        roles: ["director", "academic_director"],
      },
      {
        id: "charts",
        name: "Charts",
        translationKey: "charts",
        href: "/dashboard/charts",
        icon: PieChart,
        roles: ["director", "academic_director"],
      },
    ],
  },
  {
    id: "students",
    name: "Students",
    translationKey: "studentsSection",
    icon: GraduationCap,
    roles: ["director", "academic_director", "secretary", "teacher"],
    subItems: [
      {
        id: "students-list",
        name: "Students",
        translationKey: "students",
        href: "/students",
        icon: Users,
        roles: ["director", "academic_director", "secretary", "teacher"],
      },
      {
        id: "grades-classes",
        name: "Grades & Classes",
        translationKey: "gradesClasses",
        href: "/students/grades",
        icon: School,
        roles: ["director", "academic_director", "secretary"],
      },
      {
        id: "enrollments",
        name: "Enrollments",
        translationKey: "enrollments",
        href: "/students/enrollments",
        icon: UserPlus,
        roles: ["director", "secretary", "academic_director"],
      },
      {
        id: "timetable",
        name: "Timetable",
        translationKey: "timetable",
        href: "/students/timetable",
        icon: Calendar,
        roles: ["director", "academic_director"],
      },
      {
        id: "clubs",
        name: "Clubs",
        translationKey: "clubs",
        href: "/students/clubs",
        icon: Sparkles,
        roles: ["director", "academic_director", "teacher"],
      },
      {
        id: "attendance",
        name: "Attendance",
        translationKey: "attendance",
        href: "/students/attendance",
        icon: ClipboardCheck,
        roles: ["director", "teacher", "academic_director"],
      },
      {
        id: "grading",
        name: "Grading",
        translationKey: "gradingSection",
        href: "/students/grading",
        icon: PenLine,
        roles: ["director", "academic_director", "teacher"],
      },
    ],
  },
  {
    id: "accounting",
    name: "Accounting",
    translationKey: "accountingSection",
    icon: Wallet,
    roles: ["director", "accountant", "academic_director"],
    subItems: [
      {
        id: "balance",
        name: "Balance",
        translationKey: "balance",
        href: "/accounting",
        icon: DollarSign,
        roles: ["director", "accountant"],
      },
      {
        id: "payments",
        name: "Payments",
        translationKey: "payments",
        href: "/accounting/payments",
        icon: Receipt,
        roles: ["director", "accountant"],
      },
      {
        id: "expenses",
        name: "Expenses",
        translationKey: "expenses",
        href: "/accounting/expenses",
        icon: Wallet,
        roles: ["director", "accountant"],
      },
      {
        id: "salaries",
        name: "Salaries",
        translationKey: "salaries",
        href: "/accounting/salaries",
        icon: Banknote,
        roles: ["director", "accountant", "academic_director"],
      },
    ],
  },
  {
    id: "administration",
    name: "Administration",
    translationKey: "administrationSection",
    icon: Settings,
    roles: ["director", "academic_director"],
    subItems: [
      {
        id: "school-years",
        name: "School Years",
        translationKey: "schoolYears",
        href: "/admin/school-years",
        icon: CalendarDays,
        roles: ["director", "academic_director"],
      },
      {
        id: "grades-config",
        name: "Grades & Rooms",
        translationKey: "gradesAndRooms",
        href: "/admin/grades",
        icon: School,
        roles: ["director", "academic_director"],
      },
      {
        id: "teachers-classes",
        name: "Teachers & Classes",
        translationKey: "teachersAndClasses",
        href: "/admin/teachers",
        icon: Users,
        roles: ["director", "academic_director"],
      },
      {
        id: "users-permissions",
        name: "Users & Permissions",
        translationKey: "usersAndPermissions",
        href: "/admin/users",
        icon: UserCog,
        roles: ["director"],
      },
      {
        id: "clubs-config",
        name: "Clubs",
        translationKey: "clubsManagement",
        href: "/admin/clubs",
        icon: Sparkles,
        roles: ["director", "academic_director"],
      },
      {
        id: "salary-rates",
        name: "Salary Rates",
        translationKey: "salaryRates",
        href: "/admin/salary-rates",
        icon: Calculator,
        roles: ["director"],
      },
    ],
  },
]

/**
 * Get navigation items filtered by user role
 */
export function getNavigationForRole(role: UserRole | undefined): MainNavItem[] {
  if (!role) return []

  return navigationConfig
    .filter((item) => item.roles.includes(role))
    .filter((item) => item.id !== "grading" || isGradingFeaturesEnabled)
    .map((item) => ({
      ...item,
      subItems: item.subItems.filter((sub) => sub.roles.includes(role)),
    }))
    .filter((item) => item.subItems.length > 0)
}

/**
 * Find which main nav section a path belongs to
 */
export function getActiveMainNav(pathname: string): string | null {
  for (const mainItem of navigationConfig) {
    for (const subItem of mainItem.subItems) {
      if (pathname === subItem.href || pathname.startsWith(subItem.href + "/")) {
        return mainItem.id
      }
    }
  }
  return null
}
