import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

// =============================================================================
// CURRENCY FORMATTING
// =============================================================================
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return formatCurrency(amount) + " GNF"
}

// =============================================================================
// TRANSACTION TYPE LABELS
// =============================================================================
export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    student_payment: "Paiement scolarité",
    activity_payment: "Paiement activité",
    other_income: "Autre entrée",
    expense_payment: "Dépense",
    bank_deposit: "Dépôt en banque",
    bank_withdrawal: "Retrait de banque",
    adjustment: "Ajustement",
    mobile_money_income: "Reçu Orange Money",
    mobile_money_payment: "Dépense Orange Money",
    mobile_money_fee: "Frais Orange Money",
    reversal_student_payment: "Annulation paiement",
    reversal_expense_payment: "Annulation dépense",
    reversal_bank_deposit: "Annulation dépôt",
    reversal_mobile_money: "Annulation Orange Money",
    safe_to_registry: "Transfert coffre → caisse",
    registry_to_safe: "Transfert caisse → coffre",
    registry_adjustment: "Ajustement caisse",
  }
  return labels[type] || type
}

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================
export const statusConfig = {
  critical: {
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    label: "Critique",
    icon: XCircle,
  },
  warning: {
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    label: "Attention",
    icon: AlertTriangle,
  },
  optimal: {
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    label: "Niveau optimal",
    icon: CheckCircle2,
  },
  excess: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Excédent",
    icon: AlertTriangle,
  },
}

// =============================================================================
// CUSTOM HOOKS
// =============================================================================
export function useCountUp(target: number, duration: number = 800, enabled: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target)
      return
    }

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.floor(startValue + (target - startValue) * eased)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, enabled])

  return count
}
