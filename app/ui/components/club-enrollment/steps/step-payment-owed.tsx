"use client"

import { useState, useMemo } from "react"
import {
  Users,
  GraduationCap,
  User,
  Calendar,
  DollarSign,
  Edit,
  CalendarClock,
  Calculator,
  UserCircle,
  Check,
  Phone,
  ChevronDown,
  Clock,
  CircleDot,
  ArrowRight,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { sizing, spacing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { useClubEnrollmentWizard } from "../wizard-context"

interface MonthInfo {
  month: string
  year: number
  isPast: boolean
  isToday: boolean
}

export function StepPaymentOwed() {
  const { t, locale } = useI18n()
  const { state, setFeeBreakdown, goToStep } = useClubEnrollmentWizard()

  const [isEditingTotal, setIsEditingTotal] = useState(false)
  const [customTotal, setCustomTotal] = useState<string>("")
  const [hasAppliedProration, setHasAppliedProration] = useState(state.data.isProrated || false)

  const translations = {
    paymentOwed: locale === "fr" ? "Frais Dus" : "Payment Owed",
    paymentOwedDescription: locale === "fr"
      ? "Vérifiez le détail des frais pour cette inscription"
      : "Review the fee breakdown for this enrollment",
    clubDetails: locale === "fr" ? "Détails du Club" : "Club Details",
    studentDetails: locale === "fr" ? "Détails de l'Élève" : "Student Details",
    changeStudent: locale === "fr" ? "Changer d'élève" : "Change Student",
    changeClub: locale === "fr" ? "Changer de club" : "Change Club",
    clubName: locale === "fr" ? "Nom du Club" : "Club Name",
    leader: locale === "fr" ? "Responsable" : "Leader",
    duration: locale === "fr" ? "Durée" : "Duration",
    enrollment: locale === "fr" ? "Inscriptions" : "Enrollment",
    students: locale === "fr" ? "élèves" : "students",
    personalInfo: locale === "fr" ? "Informations Personnelles" : "Personal Information",
    dateOfBirth: locale === "fr" ? "Date de naissance" : "Date of Birth",
    gender: locale === "fr" ? "Genre" : "Gender",
    parentInfo: locale === "fr" ? "Informations Parentales" : "Parent Information",
    father: locale === "fr" ? "Père" : "Father",
    mother: locale === "fr" ? "Mère" : "Mother",
    feeBreakdown: locale === "fr" ? "Détail des Frais" : "Fee Breakdown",
    enrollmentFee: locale === "fr" ? "Frais d'inscription (unique)" : "Enrollment Fee (One-time)",
    monthlyFee: locale === "fr" ? "Frais mensuels" : "Monthly Fee",
    totalMonthlyFees: locale === "fr" ? "Total frais mensuels" : "Total Monthly Fees",
    totalAmount: locale === "fr" ? "Montant Total" : "Total Amount",
    fullYear: locale === "fr" ? "(Année complète)" : "(Full Year)",
    adjustTotal: locale === "fr" ? "Ajuster le Total" : "Adjust Total",
    reset: locale === "fr" ? "Réinitialiser" : "Reset",
    adjustedTotalAmount: locale === "fr" ? "Montant total ajusté" : "Adjusted Total Amount",
    originalTotal: locale === "fr" ? "Total d'origine" : "Original total",
    prorated: locale === "fr" ? "Proratisé" : "Prorated",
    midYearEnrollment: locale === "fr" ? "Inscription en Cours d'Année" : "Mid-Year Enrollment",
    midYearDescription: locale === "fr"
      ? "Ce club a commencé avant aujourd'hui. Voulez-vous appliquer un tarif proratisé ?"
      : "This club started before today. Would you like to apply a prorated rate?",
    monthsRemaining: locale === "fr" ? "mois restants" : "months remaining",
    monthsPassed: locale === "fr" ? "mois passés" : "months passed",
    applyProration: locale === "fr" ? "Appliquer le Prorata" : "Apply Proration",
    keepFullAmount: locale === "fr" ? "Garder le Montant Complet" : "Keep Full Amount",
    viewMonthlyBreakdown: locale === "fr" ? "Voir le détail mensuel" : "View Monthly Breakdown",
    months: locale === "fr" ? "mois" : "months",
    current: locale === "fr" ? "Actuel" : "Current",
    past: locale === "fr" ? "Passé" : "Past",
    male: locale === "fr" ? "Masculin" : "Male",
    female: locale === "fr" ? "Féminin" : "Female",
    other: locale === "fr" ? "Autre" : "Other",
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateOfBirth = (dateStr: string | null | undefined) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return null
    }
  }

  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return null
    const genderMap: Record<string, string> = {
      male: translations.male,
      female: translations.female,
      other: translations.other,
    }
    const normalized = gender.toLowerCase()
    return genderMap[normalized] || gender
  }

  const monthlyCalculation = useMemo(() => {
    if (!state.data.startDate || !state.data.endDate || !state.data.monthlyFee) {
      return {
        months: [],
        totalMonths: 0,
        totalMonthlyFees: 0,
        remainingMonths: 0,
        proratedMonthlyFees: 0,
        isMidYear: false,
      }
    }

    const start = new Date(state.data.startDate)
    const end = new Date(state.data.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const months: MonthInfo[] = []
    const current = new Date(start)

    while (current <= end) {
      const monthDate = new Date(current)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const isToday = today >= monthStart && today < new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
      const isPast = today > new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      months.push({
        month: monthDate.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
          month: "long",
          year: "numeric",
        }),
        year: monthDate.getFullYear(),
        isPast,
        isToday,
      })

      current.setMonth(current.getMonth() + 1)
    }

    const totalMonths = months.length
    const remainingMonths = months.filter(m => !m.isPast).length
    const isMidYear = remainingMonths < totalMonths && remainingMonths > 0

    return {
      months,
      totalMonths,
      totalMonthlyFees: totalMonths * (state.data.monthlyFee || 0),
      remainingMonths,
      proratedMonthlyFees: remainingMonths * (state.data.monthlyFee || 0),
      isMidYear,
    }
  }, [state.data.startDate, state.data.endDate, state.data.monthlyFee, locale])

  const fullYearTotal = (state.data.enrollmentFee || 0) + monthlyCalculation.totalMonthlyFees
  const proratedTotal = (state.data.enrollmentFee || 0) + monthlyCalculation.proratedMonthlyFees
  const displayTotal = state.data.customTotal ?? (isEditingTotal && customTotal ? parseInt(customTotal) || 0 : fullYearTotal)

  const handleApplyProration = () => {
    setCustomTotal(proratedTotal.toString())
    setIsEditingTotal(true)
    setHasAppliedProration(true)
    setFeeBreakdown({
      customTotal: proratedTotal,
      isProrated: true,
      totalMonthlyFees: monthlyCalculation.totalMonthlyFees,
      remainingMonths: monthlyCalculation.remainingMonths,
      proratedMonthlyFees: monthlyCalculation.proratedMonthlyFees,
    })
  }

  const handleToggleEditTotal = () => {
    if (!isEditingTotal) {
      setCustomTotal(fullYearTotal.toString())
      setIsEditingTotal(true)
    } else {
      setCustomTotal("")
      setIsEditingTotal(false)
      setHasAppliedProration(false)
      setFeeBreakdown({
        customTotal: null,
        isProrated: false,
      })
    }
  }

  const handleCustomTotalChange = (value: string) => {
    setCustomTotal(value)
    const parsed = parseInt(value) || 0
    setFeeBreakdown({ customTotal: parsed })
  }

  const initials = state.data.studentName
    ? state.data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{translations.paymentOwed}</h2>
        <p className="text-muted-foreground">{translations.paymentOwedDescription}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Club Summary */}
        <div className={cn(spacing.card.md, "bg-white border-2 border-border rounded-xl space-y-4")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">{translations.clubDetails}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
              className="gap-1 text-primary hover:text-primary/90 hover:bg-primary/5 min-h-[44px]"
              aria-label={translations.changeClub}
            >
              <Edit className={sizing.icon.xs} />
              {translations.changeClub}
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">{translations.clubName}</div>
              <div className="font-semibold text-foreground">
                {locale === "fr" && state.data.clubNameFr
                  ? state.data.clubNameFr
                  : state.data.clubName}
              </div>
              {state.data.categoryName && (
                <Badge variant="secondary" className="mt-1">
                  {state.data.categoryName}
                </Badge>
              )}
            </div>

            {state.data.leaderName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className={sizing.icon.xs} />
                <span>{state.data.leaderName}</span>
              </div>
            )}

            {state.data.startDate && state.data.endDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">{translations.duration}</div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className={sizing.icon.xs} />
                  <span>
                    {formatDate(state.data.startDate)} - {formatDate(state.data.endDate)}
                  </span>
                </div>
              </div>
            )}

            {state.data.capacity && (
              <div>
                <div className="text-sm text-gray-500 mb-1">{translations.enrollment}</div>
                <div className="text-sm text-gray-700">
                  {state.data.currentEnrollments}/{state.data.capacity} {translations.students}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Summary */}
        <div className={cn(spacing.card.md, "bg-white border-2 border-border rounded-xl space-y-4")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">{translations.studentDetails}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
              className="gap-1 text-primary hover:text-primary/90 hover:bg-primary/5 min-h-[44px]"
              aria-label={translations.changeStudent}
            >
              <Edit className={sizing.icon.xs} />
              {translations.changeStudent}
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarImage src={state.data.studentPhoto || undefined} alt={state.data.studentName} />
              <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="font-bold text-foreground mb-2">{state.data.studentName}</div>
              {state.data.studentGrade && (
                <Badge variant="outline">
                  <GraduationCap className={cn(sizing.icon.xs, "mr-1")} />
                  {state.data.studentGrade}
                </Badge>
              )}
            </div>
          </div>

          {(state.data.studentDateOfBirth || state.data.studentGender) && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                <UserCircle className="w-3.5 h-3.5" />
                {translations.personalInfo}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {state.data.studentDateOfBirth && (
                  <div>
                    <span className="text-gray-500">{translations.dateOfBirth}:</span>
                    <div className="font-medium text-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {formatDateOfBirth(state.data.studentDateOfBirth)}
                    </div>
                  </div>
                )}
                {state.data.studentGender && (
                  <div>
                    <span className="text-gray-500">{translations.gender}:</span>
                    <div className="font-medium text-foreground">
                      {formatGender(state.data.studentGender)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(state.data.studentParentInfo?.fatherName || state.data.studentParentInfo?.motherName) && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {translations.parentInfo}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {state.data.studentParentInfo?.fatherName && (
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">{translations.father}</div>
                    <div className="font-medium text-foreground">{state.data.studentParentInfo.fatherName}</div>
                    {state.data.studentParentInfo?.fatherPhone && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {state.data.studentParentInfo.fatherPhone}
                      </div>
                    )}
                  </div>
                )}
                {state.data.studentParentInfo?.motherName && (
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">{translations.mother}</div>
                    <div className="font-medium text-foreground">{state.data.studentParentInfo.motherName}</div>
                    {state.data.studentParentInfo?.motherPhone && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {state.data.studentParentInfo.motherPhone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <DollarSign className={sizing.icon.sm} />
              {translations.feeBreakdown}
            </h3>
            {state.data.monthlyFee && state.data.monthlyFee > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleEditTotal}
                className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Calculator className={sizing.icon.xs} />
                {isEditingTotal ? translations.reset : translations.adjustTotal}
              </Button>
            )}
          </div>

          {/* Mid-Year Proration Alert */}
          {monthlyCalculation.isMidYear && !hasAppliedProration && !isEditingTotal && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <CalendarClock className={cn(sizing.icon.md, "text-blue-700")} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">{translations.midYearEnrollment}</h4>
                  <p className="text-sm text-blue-700 mt-1">{translations.midYearDescription}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-white/70 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.monthsPassed}:</span>
                  <span className="font-semibold">{monthlyCalculation.totalMonths - monthlyCalculation.remainingMonths}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.monthsRemaining}:</span>
                  <span className="font-semibold text-blue-700">{monthlyCalculation.remainingMonths}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApplyProration}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Check className={cn(sizing.icon.xs, "mr-1")} />
                  {translations.applyProration} ({formatCurrency(proratedTotal)})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setHasAppliedProration(true)}
                  className="flex-1"
                  size="sm"
                >
                  {translations.keepFullAmount}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Enrollment Fee */}
            <div className="flex justify-between text-gray-700">
              <span>{translations.enrollmentFee}</span>
              <span className="font-semibold">{formatCurrency(state.data.enrollmentFee || 0)}</span>
            </div>

            {/* Monthly Fee Info */}
            {state.data.monthlyFee && state.data.monthlyFee > 0 && (
              <>
                <div className="flex justify-between text-gray-700">
                  <span>{translations.monthlyFee}</span>
                  <span className="font-semibold">{formatCurrency(state.data.monthlyFee)}</span>
                </div>

                {monthlyCalculation.totalMonths > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className={sizing.icon.xs} />
                      <span>
                        {monthlyCalculation.totalMonths} {translations.months}
                        {state.data.startDate && state.data.endDate && (
                          <> ({formatDate(state.data.startDate)} - {formatDate(state.data.endDate)})</>
                        )}
                      </span>
                    </div>

                    {monthlyCalculation.isMidYear && hasAppliedProration && (
                      <Alert className="bg-green-50 border-green-200 py-2">
                        <Check className={cn(sizing.icon.sm, "text-green-600")} />
                        <AlertDescription className="text-sm text-green-700">
                          {translations.prorated}: {monthlyCalculation.remainingMonths} {translations.monthsRemaining}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{translations.totalMonthlyFees} ({monthlyCalculation.totalMonths} × {formatCurrency(state.data.monthlyFee)})</span>
                      <span className="font-semibold">{formatCurrency(monthlyCalculation.totalMonthlyFees)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Custom Total Field */}
            {isEditingTotal && (
              <div className="pt-3 border-t-2 border-amber-300 space-y-2">
                <Label htmlFor="customTotal" className="text-sm font-medium text-gray-700">
                  {translations.adjustedTotalAmount}
                </Label>
                <Input
                  id="customTotal"
                  type="number"
                  value={customTotal}
                  onChange={(e) => handleCustomTotalChange(e.target.value)}
                  className="h-11 text-lg font-bold"
                  placeholder={fullYearTotal.toString()}
                />
                <p className="text-xs text-gray-500">
                  {translations.originalTotal}: {formatCurrency(fullYearTotal)}
                  {monthlyCalculation.isMidYear && ` • ${translations.prorated}: ${formatCurrency(proratedTotal)}`}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t-2 border-amber-300 flex justify-between text-lg font-bold text-foreground">
              <span>
                {translations.totalAmount}
                {monthlyCalculation.isMidYear && !isEditingTotal && (
                  <span className="ml-2 text-xs font-normal text-gray-500">{translations.fullYear}</span>
                )}
              </span>
              <span className="text-amber-700">{formatCurrency(displayTotal)}</span>
            </div>
          </div>
        </div>

        {/* Month-by-Month Breakdown (Collapsible) */}
        {monthlyCalculation.months.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-white via-white to-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-300 group-open:rounded-b-none group-open:border-b-0 group-open:shadow-none">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-orange-400 rounded-l-xl" />

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner">
                      <CalendarClock className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">
                        {translations.viewMonthlyBreakdown}
                      </span>
                      <span className="text-sm text-gray-500">
                        {monthlyCalculation.totalMonths} {translations.months} • {monthlyCalculation.remainingMonths} {translations.monthsRemaining}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {monthlyCalculation.totalMonths - monthlyCalculation.remainingMonths}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" />
                        {monthlyCalculation.remainingMonths}
                      </span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                  </div>
                </div>
              </div>
            </summary>

            <div className="rounded-b-xl border border-t-0 border-border bg-white overflow-hidden">
              <div className="relative">
                <div className="absolute left-[29px] top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-amber-300 to-emerald-300" />

                <div className="divide-y divide-gray-100">
                  {monthlyCalculation.months.map((m, idx) => {
                    const isPast = m.isPast
                    const isCurrent = m.isToday
                    const isFuture = !m.isPast && !m.isToday

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "relative flex items-center justify-between py-3 px-4 transition-colors duration-200",
                          isPast && "bg-muted/50/50",
                          isCurrent && "bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent",
                          isFuture && "bg-white hover:bg-emerald-50/30"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                            isPast && "bg-gray-200 border-gray-300",
                            isCurrent && "bg-amber-400 border-amber-500 shadow-lg shadow-amber-200 ring-4 ring-amber-100",
                            isFuture && "bg-emerald-100 border-emerald-300"
                          )}>
                            {isPast && <Check className="h-3 w-3 text-gray-500" />}
                            {isCurrent && <CircleDot className="h-3 w-3 text-white" />}
                            {isFuture && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-sm font-medium capitalize truncate",
                              isPast && "text-gray-400",
                              isCurrent && "text-amber-900 font-semibold",
                              isFuture && "text-gray-700"
                            )}>
                              {m.month}
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                </span>
                                {translations.current}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={cn(
                          "flex items-center gap-2 shrink-0",
                          isPast && "opacity-50"
                        )}>
                          {isPast && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-gray-300 text-gray-400 font-normal">
                              {translations.past}
                            </Badge>
                          )}
                          <span className={cn(
                            "text-sm font-semibold tabular-nums",
                            isPast && "text-gray-400 line-through decoration-gray-300",
                            isCurrent && "text-amber-700",
                            isFuture && "text-foreground"
                          )}>
                            {formatCurrency(state.data.monthlyFee || 0)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    {translations.totalMonthlyFees}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(monthlyCalculation.totalMonthlyFees)}
                  </span>
                </div>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
