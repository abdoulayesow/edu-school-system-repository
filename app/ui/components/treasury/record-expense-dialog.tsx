"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowUpFromLine, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface RecordExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  currentBalance: number
}

type ExpenseCategoryKey = "salaires" | "fournituresScolaires" | "fournituresBureau" | "electriciteEau" | "entretien" | "transport" | "alimentation" | "evenements" | "autre"

const EXPENSE_CATEGORIES: { value: ExpenseCategoryKey; label: string }[] = [
  { value: "salaires", label: "Salaires" },
  { value: "fournituresScolaires", label: "Fournitures scolaires" },
  { value: "fournituresBureau", label: "Fournitures de bureau" },
  { value: "electriciteEau", label: "Électricité / Eau" },
  { value: "entretien", label: "Entretien / Réparations" },
  { value: "transport", label: "Transport" },
  { value: "alimentation", label: "Alimentation / Cantine" },
  { value: "evenements", label: "Événements" },
  { value: "autre", label: "Autre" },
]

// Format currency for Guinea (GNF)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function RecordExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
  currentBalance,
}: RecordExpenseDialogProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [category, setCategory] = useState("autre")
  const [amount, setAmount] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit() {
    setError(null)

    // Validation
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10)
    if (!amountNum || amountNum <= 0) {
      setError(t?.treasury?.invalidAmount || "Montant invalide")
      return
    }

    if (!description.trim()) {
      setError(t?.treasury?.descriptionRequired || "Description requise")
      return
    }

    // Check sufficient funds
    if (amountNum > currentBalance) {
      setError(t?.treasury?.insufficientFunds || "Fonds insuffisants dans la caisse")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/treasury/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense_payment",
          amount: amountNum,
          beneficiaryName: beneficiary.trim() || undefined,
          description: description.trim(),
          category,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to record expense")
      }

      // Reset form and close
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setCategory("autre")
    setAmount("")
    setBeneficiary("")
    setDescription("")
    setNotes("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  const amountNum = parseInt(amount.replace(/\s/g, ""), 10) || 0
  const insufficientFunds = amountNum > currentBalance
  const newBalance = currentBalance - amountNum

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowUpFromLine className="h-5 w-5 text-red-600" />
            </div>
            {t?.treasury?.recordExpense || "Enregistrer une dépense"}
          </DialogTitle>
          <DialogDescription>
            {t?.treasury?.recordExpenseDesc || "Enregistrer une sortie d'argent de la caisse"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Current Balance Display */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">{t?.treasury?.safeBalance || "Solde actuel"}</p>
            <p className="text-xl font-bold">{formatCurrency(currentBalance)} GNF</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t?.treasury?.expenseCategory || "Catégorie"}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {t?.treasury?.expenseCategories?.[cat.value] || cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{t?.common?.amount || "Montant"} (GNF)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                setAmount(raw ? formatCurrency(parseInt(raw, 10)) : "")
              }}
              className={`text-2xl font-bold h-14 ${insufficientFunds ? "border-red-500" : ""}`}
            />
            {amountNum > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t?.treasury?.balanceAfter || "Solde après"}:
                </span>
                <span className={insufficientFunds ? "text-red-600 font-medium" : "font-medium"}>
                  {formatCurrency(newBalance)} GNF
                </span>
              </div>
            )}
          </div>

          {/* Insufficient Funds Warning */}
          {insufficientFunds && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t?.treasury?.insufficientFunds || "Fonds insuffisants dans la caisse"}
              </AlertDescription>
            </Alert>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>{t?.common?.description || "Description"}</Label>
            <Input
              placeholder={t?.treasury?.expenseDescPlaceholder || "Ex: Achat de craies et cahiers"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Beneficiary */}
          <div className="space-y-2">
            <Label>{t?.treasury?.beneficiary || "Bénéficiaire"} ({t?.common?.optional || "optionnel"})</Label>
            <Input
              placeholder={t?.treasury?.beneficiaryPlaceholder || "Ex: Papeterie Central"}
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t?.common?.notes || "Notes"} ({t?.common?.optional || "optionnel"})</Label>
            <Textarea
              placeholder={t?.treasury?.notesPlaceholder || "Notes supplémentaires"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t?.common?.cancel || "Annuler"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amountNum || !description.trim() || insufficientFunds}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t?.treasury?.confirmTransaction || "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
