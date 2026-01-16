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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, ArrowRight, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-nav-highlight/10 dark:bg-gspn-gold-900/30">
              <Building2 className="h-5 w-5 text-nav-highlight dark:text-gspn-gold-200" />
            </div>
            {t?.treasury?.bankTransfer || "Transfert bancaire"}
          </DialogTitle>
          <DialogDescription>
            {t?.treasury?.bankTransferDesc || "Transférer de l'argent entre la caisse et la banque"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={transferType} onValueChange={(v) => setTransferType(v as "deposit" | "withdrawal")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">
              {t?.treasury?.depositToBank || "Dépôt en banque"}
            </TabsTrigger>
            <TabsTrigger value="withdrawal">
              {t?.treasury?.withdrawFromBank || "Retrait de banque"}
            </TabsTrigger>
          </TabsList>

          <div className="py-4 space-y-4">
            {/* Current Balances */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-md ${transferType === "deposit" ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200" : "bg-muted"}`}>
                <p className="text-xs text-muted-foreground">{t?.treasury?.safeBalance || "Caisse"}</p>
                <p className="text-lg font-bold">{formatCurrency(safeBalance)} GNF</p>
              </div>
              <div className={`p-3 rounded-md ${transferType === "withdrawal" ? "bg-nav-highlight/10 dark:bg-gspn-gold-900/20 border border-nav-highlight/30 dark:border-gspn-gold-700" : "bg-muted"}`}>
                <p className="text-xs text-muted-foreground">{t?.treasury?.bankBalance || "Banque"}</p>
                <p className="text-lg font-bold">{formatCurrency(bankBalance)} GNF</p>
              </div>
            </div>

            {/* Transfer Direction Indicator */}
            <div className="flex items-center justify-center gap-4 py-2">
              <span className="text-sm font-medium">
                {transferType === "deposit" ? "Caisse" : "Banque"}
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {transferType === "deposit" ? "Banque" : "Caisse"}
              </span>
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
            </div>

            {/* Balance Preview */}
            {amountNum > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t?.treasury?.newSafeBalance || "Nouvelle caisse"}</p>
                  <p className={`font-medium ${transferType === "deposit" && insufficientFunds ? "text-red-600" : ""}`}>
                    {formatCurrency(newSafeBalance)} GNF
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t?.treasury?.newBankBalance || "Nouvelle banque"}</p>
                  <p className={`font-medium ${transferType === "withdrawal" && insufficientFunds ? "text-red-600" : ""}`}>
                    {formatCurrency(newBankBalance)} GNF
                  </p>
                </div>
              </div>
            )}

            {/* Insufficient Funds Warning */}
            {insufficientFunds && (
              <Alert variant="destructive">
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
              <Label>{t?.treasury?.bankName || "Nom de la banque"} ({t?.common?.optional || "optionnel"})</Label>
              <Input
                placeholder="Ex: BICIGUI, ECOBANK..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            {/* Carried By (only for deposits) */}
            {transferType === "deposit" && (
              <div className="space-y-2">
                <Label>{t?.treasury?.carriedBy || "Effectué par"} ({t?.common?.optional || "optionnel"})</Label>
                <Input
                  placeholder={t?.treasury?.carriedByPlaceholder || "Qui va déposer ?"}
                  value={carriedBy}
                  onChange={(e) => setCarriedBy(e.target.value)}
                />
              </div>
            )}

            {/* Bank Reference */}
            <div className="space-y-2">
              <Label>{t?.treasury?.bankReference || "Référence bancaire"} ({t?.common?.optional || "optionnel"})</Label>
              <Input
                placeholder={t?.treasury?.bankRefPlaceholder || "Numéro de bordereau"}
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
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
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t?.common?.cancel || "Annuler"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amountNum || insufficientFunds}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t?.treasury?.confirmTransaction || "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
