"use client"

import { useEffect, useState } from "react"
import { useExpenseWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, FileText, User, Store, Users } from "lucide-react"
import { useSession } from "next-auth/react"

interface Supplier {
  id: string
  name: string
  category: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

interface StaffMember {
  id: string
  name: string
  email: string
}

export function StepDetails() {
  const { state, updateData } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data } = state
  const { data: session } = useSession()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [showCustomSupplier, setShowCustomSupplier] = useState(false)

  // Fetch suppliers when category changes
  useEffect(() => {
    if (!data.category) return

    async function fetchSuppliers() {
      setIsLoadingSuppliers(true)
      try {
        const res = await fetch(`/api/suppliers?category=${data.category}`)
        if (res.ok) {
          const result = await res.json()
          setSuppliers(result.suppliers || [])
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error)
      } finally {
        setIsLoadingSuppliers(false)
      }
    }

    fetchSuppliers()
  }, [data.category])

  // Fetch staff members on mount
  useEffect(() => {
    async function fetchStaff() {
      setIsLoadingStaff(true)
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const result = await res.json()
          setStaffMembers(result.users || [])
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error)
      } finally {
        setIsLoadingStaff(false)
      }
    }

    fetchStaff()
  }, [])

  // Handle supplier selection
  const handleSupplierChange = (value: string) => {
    if (value === "other") {
      setShowCustomSupplier(true)
      updateData({ supplierId: undefined, supplierName: "" })
    } else {
      setShowCustomSupplier(false)
      updateData({ supplierId: value, supplierName: undefined })
    }
  }

  // Handle initiator selection
  const handleInitiatorChange = (value: string) => {
    if (value === "self") {
      updateData({ initiatedById: session?.user?.id })
    } else {
      updateData({ initiatedById: value })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {t.expenseWizard?.expenseDetails || "Expense Details"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Fournissez les informations détaillées sur cette dépense"
            : "Provide detailed information about this expense"}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Supplier Selection */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "100ms" }}>
          <Label htmlFor="supplier" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            {t.expenses?.supplier || "Supplier"} *
          </Label>
          <Select
            value={showCustomSupplier ? "other" : data.supplierId || ""}
            onValueChange={handleSupplierChange}
            disabled={isLoadingSuppliers}
          >
            <SelectTrigger className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors">
              <SelectValue placeholder={
                isLoadingSuppliers
                  ? (locale === "fr" ? "Chargement..." : "Loading...")
                  : (t.expenses?.selectSupplier || "Select supplier")
              } />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.phone && <span className="text-xs text-slate-500 ml-2">({supplier.phone})</span>}
                </SelectItem>
              ))}
              <SelectItem value="other" className="font-semibold text-orange-600 dark:text-orange-400">
                {t.expenses?.otherSupplier || "Other (custom)"}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "Sélectionnez le fournisseur ou choisissez 'Autre' pour un fournisseur personnalisé"
              : "Select the supplier or choose 'Other' for a custom supplier"}
          </p>
        </div>

        {/* Custom Supplier Name (shown when "Other" is selected) */}
        {showCustomSupplier && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="customSupplierName" className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              {t.expenses?.customSupplierName || "Custom Supplier Name"} *
            </Label>
            <Input
              id="customSupplierName"
              value={data.supplierName || ""}
              onChange={(e) => updateData({ supplierName: e.target.value })}
              placeholder={t.expenses?.supplierPlaceholder || "Enter supplier name"}
              className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "200ms" }}>
          <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            {t.expenses?.description || "Description"} *
          </Label>
          <Textarea
            id="description"
            value={data.description || ""}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder={
              locale === "fr"
                ? "Décrivez la nature de cette dépense..."
                : "Describe the nature of this expense..."
            }
            rows={4}
            className="resize-none border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "Incluez les détails pertinents comme la raison, l'objet acheté, etc."
              : "Include relevant details like reason, items purchased, etc."}
          </p>
        </div>

        {/* Initiator Selection */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "300ms" }}>
          <Label htmlFor="initiator" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            {t.expenses?.initiatedBy || "Initiated by"}
          </Label>
          <Select
            value={data.initiatedById || ""}
            onValueChange={handleInitiatorChange}
            disabled={isLoadingStaff}
          >
            <SelectTrigger className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors">
              <SelectValue placeholder={
                isLoadingStaff
                  ? (locale === "fr" ? "Chargement..." : "Loading...")
                  : (t.expenses?.selectInitiator || "Select who initiated this expense")
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self" className="font-semibold">
                {t.expenses?.self || "Self"} {session?.user?.name && `(${session.user.name})`}
              </SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                  <span className="text-xs text-slate-500 ml-2">({staff.email})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "Sélectionnez la personne qui a initié cette dépense"
              : "Select the person who initiated this expense"}
          </p>
        </div>

        {/* Expense Date */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "400ms" }}>
          <Label htmlFor="date" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            {t.expenses?.expenseDate || "Expense Date"} *
          </Label>
          <Input
            id="date"
            type="date"
            value={data.date || ""}
            onChange={(e) => updateData({ date: e.target.value })}
            max={new Date().toISOString().split('T')[0]} // Can't select future dates
            className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "La date à laquelle la dépense a été effectuée"
              : "The date when the expense occurred"}
          </p>
        </div>
      </div>

      {/* Visual separator */}
      <div className="flex items-center gap-4 max-w-2xl mx-auto pt-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
        <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">
          {locale === "fr" ? "Informations requises" : "Required information"}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
      </div>
    </div>
  )
}
