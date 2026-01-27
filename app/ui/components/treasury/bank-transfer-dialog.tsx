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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, ArrowRight, AlertTriangle, Wallet } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface BankTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  safeBalance: number
  bankBalance: number
}

// Format currency for Guinea (GNF)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BankTransferDialog({
  open,
  onOpenChange,
  onSuccess,
  safeBalance,
  bankBalance,
}: BankTransferDialogProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transferType, setTransferType] = useState<"deposit" | "withdrawal">("deposit")

  // Form state
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankReference, setBankReference] = useState("")
  const [carriedBy, setCarriedBy] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit() {
    setError(null)

    // Validation
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10)
    if (!amountNum || amountNum <= 0) {
      setError(t?.treasury?.invalidAmount || "Montant invalide")
      return
    }

    // Check sufficient funds
    if (transferType === "deposit" && amountNum > safeBalance) {
      setError(t?.treasury?.insufficientFundsSafe || "Fonds insuffisants dans la caisse")
      return
    }
    if (transferType === "withdrawal" && amountNum > bankBalance) {
      setError(t?.treasury?.insufficientFundsBank || "Fonds insuffisants en banque")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/treasury/bank-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transferType,
          amount: amountNum,
          bankName: bankName.trim() || undefined,
          bankReference: bankReference.trim() || undefined,
          carriedBy: carriedBy.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to record transfer")
      }

      // Reset form and close
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record transfer")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setAmount("")
    setBankName("")
    setBankReference("")
    setCarriedBy("")
    setNotes("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  const amountNum = parseInt(amount.replace(/\s/g, ""), 10) || 0
  const insufficientFunds =
    (transferType === "deposit" && amountNum > safeBalance) ||
    (transferType === "withdrawal" && amountNum > bankBalance)

  const newSafeBalance = transferType === "deposit"
    ? safeBalance - amountNum
    : safeBalance + amountNum

  const newBankBalance = transferType === "deposit"
    ? bankBalance + amountNum
    : bankBalance - amountNum

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Blue accent bar for bank transfers */}
        <div className="h-1 bg-blue-500" />

        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                "bg-blue-100 dark:bg-blue-900/30",
                "ring-2 ring-blue-200 dark:ring-blue-800"
              )}>
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-blue-700 dark:text-blue-300">
                {t?.treasury?.bankTransfer || "Transfert bancaire"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t?.treasury?.bankTransferDesc || "Transférer de l'argent entre la caisse et la banque"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={transferType} onValueChange={(v) => setTransferType(v as "deposit" | "withdrawal")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="deposit"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                {t?.treasury?.depositToBank || "Dépôt en banque"}
              </TabsTrigger>
              <TabsTrigger
                value="withdrawal"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                {t?.treasury?.withdrawFromBank || "Retrait de banque"}
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {/* Current Balances - Enhanced */}
              <div className="grid grid-cols-2 gap-3">
                {/* Safe Balance Card */}
                <div className={cn(
                  "rounded-xl border p-3 relative overflow-hidden transition-all",
                  transferType === "deposit"
                    ? "border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10 ring-1 ring-amber-200 dark:ring-amber-800"
                    : "border-border bg-muted/50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className={cn(
                      "h-4 w-4",
                      transferType === "deposit" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    )} />
                    <p className="text-xs font-medium text-muted-foreground">{t?.treasury?.safeBalance || "Caisse"}</p>
                  </div>
                  <p className={cn(
                    "text-lg font-bold",
                    transferType === "deposit" && "text-amber-700 dark:text-amber-300"
                  )}>
                    {formatCurrency(safeBalance)} <span className="text-sm font-medium">GNF</span>
                  </p>
                </div>

                {/* Bank Balance Card */}
                <div className={cn(
                  "rounded-xl border p-3 relative overflow-hidden transition-all",
                  transferType === "withdrawal"
                    ? "border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "border-border bg-muted/50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={cn(
                      "h-4 w-4",
                      transferType === "withdrawal" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )} />
                    <p className="text-xs font-medium text-muted-foreground">{t?.treasury?.bankBalance || "Banque"}</p>
                  </div>
                  <p className={cn(
                    "text-lg font-bold",
                    transferType === "withdrawal" && "text-blue-700 dark:text-blue-300"
                  )}>
                    {formatCurrency(bankBalance)} <span className="text-sm font-medium">GNF</span>
                  </p>
                </div>
              </div>

              {/* Transfer Direction Indicator - Enhanced */}
              <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  transferType === "deposit"
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                )}>
                  {transferType === "deposit" ? "Caisse" : "Banque"}
                </div>
                <ArrowRight className="h-5 w-5 text-blue-500" />
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  transferType === "deposit"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                )}>
                  {transferType === "deposit" ? "Banque" : "Caisse"}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t?.common?.amount || "Montant"} (GNF)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "")
                    setAmount(raw ? formatCurrency(parseInt(raw, 10)) : "")
                  }}
                  className={cn(
                    "text-2xl font-bold h-14 text-center",
                    "focus-visible:ring-blue-500 focus-visible:border-blue-500",
                    insufficientFunds && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>

              {/* Balance Preview */}
              {amountNum > 0 && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-dashed">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t?.treasury?.newSafeBalance || "Nouvelle caisse"}</p>
                    <p className={cn(
                      "text-sm font-semibold",
                      transferType === "deposit" && insufficientFunds ? "text-red-600" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {formatCurrency(newSafeBalance)} GNF
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t?.treasury?.newBankBalance || "Nouvelle banque"}</p>
                    <p className={cn(
                      "text-sm font-semibold",
                      transferType === "withdrawal" && insufficientFunds ? "text-red-600" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {formatCurrency(newBankBalance)} GNF
                    </p>
                  </div>
                </div>
              )}

              {/* Insufficient Funds Warning */}
              {insufficientFunds && (
                <Alert variant="destructive" className="border-red-300 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {transferType === "deposit"
                      ? (t?.treasury?.insufficientFundsSafe || "Fonds insuffisants dans la caisse")
                      : (t?.treasury?.insufficientFundsBank || "Fonds insuffisants en banque")}
                  </AlertDescription>
                </Alert>
              )}

              {/* Bank Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t?.treasury?.bankName || "Nom de la banque"}{" "}
                  <span className="text-muted-foreground font-normal">({t?.common?.optional || "optionnel"})</span>
                </Label>
                <Input
                  placeholder="Ex: BICIGUI, ECOBANK..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              {/* Carried By (only for deposits) */}
              {transferType === "deposit" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t?.treasury?.carriedBy || "Effectué par"}{" "}
                    <span className="text-muted-foreground font-normal">({t?.common?.optional || "optionnel"})</span>
                  </Label>
                  <Input
                    placeholder={t?.treasury?.carriedByPlaceholder || "Qui va déposer ?"}
                    value={carriedBy}
                    onChange={(e) => setCarriedBy(e.target.value)}
                    className="focus-visible:ring-blue-500"
                  />
                </div>
              )}

              {/* Bank Reference */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t?.treasury?.bankReference || "Référence bancaire"}{" "}
                  <span className="text-muted-foreground font-normal">({t?.common?.optional || "optionnel"})</span>
                </Label>
                <Input
                  placeholder={t?.treasury?.bankRefPlaceholder || "Numéro de bordereau"}
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t?.common?.notes || "Notes"}{" "}
                  <span className="text-muted-foreground font-normal">({t?.common?.optional || "optionnel"})</span>
                </Label>
                <Textarea
                  placeholder={t?.treasury?.notesPlaceholder || "Notes supplémentaires"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="focus-visible:ring-blue-500 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </div>
          </Tabs>

          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t?.common?.cancel || "Annuler"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !amountNum || insufficientFunds}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Building2 className="mr-2 h-4 w-4" />
              {t?.treasury?.confirmTransaction || "Confirmer"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
