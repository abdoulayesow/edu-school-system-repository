import { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  ClipboardCheck,
  BarChart3,
  LogIn,
} from "lucide-react";
// TODO: Replace with real RBAC roles once the domain model is finalized.
export type UserRole =
  | "user"
  | "director"
  | "academic_director"
  | "secretary"
  | "accountant"
  | "teacher"
  | "parent"
  | "student"



export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[]; // Roles that can see this link
}

export const mainNavigation: NavLink[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["director", "academic_director", "secretary", "accountant"],
  },
  {
    name: "Enrollments",
    href: "/enrollments",
    icon: Users,
    roles: ["director", "secretary", "academic_director"],
  },
  {
    name: "Activities",
    href: "/activities",
    icon: BookOpen,
    roles: ["director", "academic_director", "teacher"],
  },
  {
    name: "Accounting",
    href: "/accounting",
    icon: Receipt,
    roles: ["director", "accountant"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
    roles: ["director", "teacher", "academic_director"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["director", "academic_director"],
  },
];

export const bottomNavigation: NavLink[] = [
  { 
    name: "Users", 
    href: "/users", 
    icon: Users, 
    roles: ["director"] 
  },
  { 
    name: "Login", 
    href: "/login", 
    icon: LogIn,
    roles: ["user", "director", "academic_director", "secretary", "accountant", "teacher", "parent", "student"] // Everyone can see login
  },
];
