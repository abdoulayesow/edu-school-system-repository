import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Banknote, CreditCard, Loader2 } from "lucide-react"
import { typography } from "@/lib/design-tokens"
import type { StaffMember } from "@/hooks/use-active-staff"

// ---------------------------------------------------------------------------
// StatCard — reusable stat display for salary tabs
// ---------------------------------------------------------------------------

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: "maroon" | "gray" | "blue" | "emerald" | "red"
}) {
  const accentColors: Record<string, string> = {
    maroon: "bg-gspn-maroon-500",
    gray: "bg-gray-400",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
  }

  return (
    <Card className="border shadow-sm overflow-hidden">
      <div className={`h-1 ${accentColors[accent]}`} />
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className={`${typography.stat.sm} mt-1`}>{value}</p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Role label helper — uses i18n role translations
// ---------------------------------------------------------------------------

type RoleTranslations = Record<string, string>

/**
 * Get the i18n label for a staff role.
 * Usage: `getRoleLabel(t.roleManagement.roles, user.role)`
 */
export function getRoleLabel(
  roleTranslations: RoleTranslations,
  role: string | null | undefined
): string {
  if (!role) return "—"
  return roleTranslations[role] ?? role
}

// ---------------------------------------------------------------------------
// Status style maps — badge color classes per status
// ---------------------------------------------------------------------------

/** Hours record statuses */
export const HOURS_STATUS_STYLES: Record<string, string> = {
  draft: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  submitted: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  rejected: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
}

/** Payment statuses */
export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  approved: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
}

/** Advance statuses */
export const ADVANCE_STATUS_STYLES: Record<string, string> = {
  active: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  fully_recouped: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
}

// ---------------------------------------------------------------------------
// PaymentMethodSelect — cash / orange_money picker with icons
// ---------------------------------------------------------------------------

export function PaymentMethodSelect({
  value,
  onValueChange,
  cashLabel,
  orangeMoneyLabel,
}: {
  value: string
  onValueChange: (v: "cash" | "orange_money") => void
  cashLabel: string
  orangeMoneyLabel: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as "cash" | "orange_money")}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="cash">
          <span className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            {cashLabel}
          </span>
        </SelectItem>
        <SelectItem value="orange_money">
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {orangeMoneyLabel}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

// ---------------------------------------------------------------------------
// StaffMemberSelect — staff picker with role label
// ---------------------------------------------------------------------------

export function StaffMemberSelect({
  value,
  onValueChange,
  staffList,
  isLoading,
  placeholder,
  loadingLabel,
  roleTranslations,
}: {
  value: string
  onValueChange: (v: string) => void
  staffList: StaffMember[]
  isLoading: boolean
  placeholder: string
  loadingLabel: string
  roleTranslations: Record<string, string>
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {staffList.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <span className="flex items-center gap-2">
              <span>{user.name ?? user.email}</span>
              <span className="text-xs text-muted-foreground">
                ({getRoleLabel(roleTranslations, user.staffRole)})
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
