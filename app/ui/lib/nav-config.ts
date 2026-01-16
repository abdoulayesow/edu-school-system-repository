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
  CalendarRange,
  Sparkles,
} from "lucide-react"
import type { UserRole } from "./nav-links"
import { isGradingFeaturesEnabled } from "./feature-flags"

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
        href: "/reports",
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
        href: "/enrollments",
        icon: UserPlus,
        roles: ["director", "secretary", "academic_director"],
      },
      {
        id: "timetable",
        name: "Timetable",
        translationKey: "timetable",
        href: "/timetable",
        icon: Calendar,
        roles: ["director", "academic_director"],
      },
      {
        id: "clubs",
        name: "Clubs",
        translationKey: "clubs",
        href: "/clubs",
        icon: Sparkles,
        roles: ["director", "academic_director", "teacher"],
      },
      {
        id: "attendance",
        name: "Attendance",
        translationKey: "attendance",
        href: "/attendance",
        icon: ClipboardCheck,
        roles: ["director", "teacher", "academic_director"],
      },
    ],
  },
  {
    id: "grading",
    name: "Grading",
    translationKey: "gradingSection",
    icon: BookMarked,
    roles: ["director", "academic_director", "teacher"],
    subItems: [
      {
        id: "grade-entry",
        name: "Grade Entry",
        translationKey: "gradeEntry",
        href: "/grades/entry",
        icon: PenLine,
        roles: ["director", "academic_director", "teacher"],
      },
      {
        id: "bulletins",
        name: "Bulletins",
        translationKey: "bulletins",
        href: "/grades/bulletin",
        icon: FileText,
        roles: ["director", "academic_director", "teacher"],
      },
      {
        id: "rankings",
        name: "Class Ranking",
        translationKey: "classRankingNav",
        href: "/grades/ranking",
        icon: Trophy,
        roles: ["director", "academic_director"],
      },
      {
        id: "remarks",
        name: "Teacher Remarks",
        translationKey: "teacherRemarks",
        href: "/grades/remarks",
        icon: MessageSquare,
        roles: ["director", "academic_director", "teacher"],
      },
      {
        id: "conduct",
        name: "Conduct & Attendance",
        translationKey: "conductEntry",
        href: "/grades/conduct",
        icon: ClipboardCheck,
        roles: ["director", "academic_director"],
      },
    ],
  },
  {
    id: "accounting",
    name: "Accounting",
    translationKey: "accountingSection",
    icon: Wallet,
    roles: ["director", "accountant"],
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
        href: "/expenses",
        icon: Wallet,
        roles: ["director", "accountant"],
      },
    ],
  },
  {
    id: "audit",
    name: "Audit",
    translationKey: "audit",
    icon: FileSearch,
    roles: ["director"],
    subItems: [
      {
        id: "financial-audit",
        name: "Financial Audit",
        translationKey: "financialAudit",
        href: "/audit/financial",
        icon: DollarSign,
        roles: ["director"],
      },
      {
        id: "data-history",
        name: "Data History",
        translationKey: "dataHistory",
        href: "/audit/history",
        icon: History,
        roles: ["director"],
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
        id: "users-config",
        name: "Users",
        translationKey: "usersManagement",
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
        id: "trimesters",
        name: "Trimesters",
        translationKey: "trimesters",
        href: "/admin/trimesters",
        icon: CalendarRange,
        roles: ["director", "academic_director"],
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
