"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Search, Banknote, User, CheckCircle2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface Student {
  id: string
  firstName: string
  lastName: string
  studentNumber: string | null
}

type PaymentTypeKey = "scolarite" | "activites" | "autre"

const PAYMENT_TYPES: { value: string; labelKey: PaymentTypeKey; label: string }[] = [
  { value: "student_payment", labelKey: "scolarite", label: "Scolarité" },
  { value: "activity_payment", labelKey: "activites", label: "Activités" },
  { value: "other_income", labelKey: "autre", label: "Autre" },
]

export function RecordPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [paymentType, setPaymentType] = useState("student_payment")
  const [amount, setAmount] = useState("")
  const [payerName, setPayerName] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchResults, setSearchResults] = useState<Student[]>([])

  async function handleStudentSearch() {
    if (!studentSearch.trim() || studentSearch.length < 2) return
    setIsSearching(true)
    try {
      const response = await fetch(`/api/students?search=${encodeURIComponent(studentSearch)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.students || [])
      }
    } catch (err) {
      console.error("Error searching students:", err)
    } finally {
      setIsSearching(false)
    }
  }

  function selectStudent(student: Student) {
    setSelectedStudent(student)
    setStudentSearch(`${student.firstName} ${student.lastName}`)
    setSearchResults([])
  }

  async function handleSubmit() {
    setError(null)
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10)
    if (!amountNum || amountNum <= 0) {
      setError(t?.treasury?.invalidAmount || "Montant invalide")
      return
    }
    if (!payerName.trim()) {
      setError(t?.treasury?.payerNameRequired || "Nom du payeur requis")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/treasury/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: paymentType,
          amount: amountNum,
          payerName: payerName.trim(),
          studentId: selectedStudent?.id,
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to record payment")
      }
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setPaymentType("student_payment")
    setAmount("")
    setPayerName("")
    setDescription("")
    setNotes("")
    setStudentSearch("")
    setSelectedStudent(null)
    setSearchResults([])
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  const amountNum = parseInt(amount.replace(/\s/g, ""), 10) || 0

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t?.treasury?.recordPayment || "Enregistrer un paiement"}
      description={t?.treasury?.recordPaymentDesc || "Enregistrer une entrée d'argent dans la caisse"}
      icon={Banknote}
      accentColor="emerald"
      submitLabel={t?.treasury?.confirmTransaction || "Confirmer"}
      submitIcon={Banknote}
      cancelLabel={t?.common?.cancel || "Annuler"}
      onSubmit={handleSubmit}
      onCancel={() => handleOpenChange(false)}
      isSubmitting={isSubmitting}
      isDisabled={!amountNum || !payerName.trim()}
      error={error}
    >
      {/* Payment Type */}
      <FormField label={t?.treasury?.paymentType || "Type de paiement"}>
        <Select value={paymentType} onValueChange={setPaymentType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t?.treasury?.paymentTypes?.[type.labelKey] || type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Student Search */}
      {paymentType === "student_payment" && (
        <FormField label={t?.treasury?.selectStudent || "Sélectionner un élève"}>
          <div className="relative">
            <Input
              placeholder={t?.common?.search || "Rechercher..."}
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              onClick={handleStudentSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="border rounded-xl max-h-32 overflow-y-auto">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm flex items-center gap-2"
                  onClick={() => selectStudent(student)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  {student.firstName} {student.lastName}
                  {student.studentNumber && (
                    <span className="text-muted-foreground ml-auto">
                      ({student.studentNumber})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedStudent && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
            </div>
          )}
        </FormField>
      )}

      {/* Amount */}
      <FormField label={`${t?.common?.amount || "Montant"} (GNF)`}>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "")
            setAmount(raw ? formatCurrency(parseInt(raw, 10)) : "")
          }}
          className="text-2xl font-bold h-14 text-center"
        />
        {amountNum > 0 && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center">
            {formatCurrency(amountNum)} GNF
          </p>
        )}
      </FormField>

      {/* Payer Name */}
      <FormField label={t?.treasury?.payerName || "Nom du payeur"} required>
        <Input
          placeholder={t?.treasury?.payerNamePlaceholder || "Qui a remis l'argent ?"}
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
        />
      </FormField>

      {/* Description */}
      <FormField label={t?.common?.description || "Description"} optional>
        <Input
          placeholder={t?.treasury?.descriptionPlaceholder || "Description du paiement"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>

      {/* Notes */}
      <FormField label={t?.common?.notes || "Notes"} optional>
        <Textarea
          placeholder={t?.treasury?.notesPlaceholder || "Notes supplémentaires"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </FormField>
    </FormDialog>
  )
}
