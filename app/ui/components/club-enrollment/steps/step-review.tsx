"use client"

import {
  Users,
  GraduationCap,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Edit,
  FileText,
  UserCircle,
  Phone,
  Mail,
  Banknote,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { useClubEnrollmentWizard } from "../wizard-context"

export function StepReview() {
  const { locale } = useI18n()
  const { state, goToStep } = useClubEnrollmentWizard()
  const { data } = state

  const translations = {
    reviewEnrollment: locale === "fr" ? "Réviser l'Inscription" : "Review Enrollment",
    reviewDescription: locale === "fr"
      ? "Vérifiez tous les détails avant de soumettre l'inscription"
      : "Review all details before submitting the enrollment",
    clubInformation: locale === "fr" ? "Informations du Club" : "Club Information",
    studentInformation: locale === "fr" ? "Informations de l'Élève" : "Student Information",
    paymentSummary: locale === "fr" ? "Résumé des Frais" : "Payment Summary",
    paymentDetails: locale === "fr" ? "Détails du Paiement" : "Payment Details",
    edit: locale === "fr" ? "Modifier" : "Edit",
    clubName: locale === "fr" ? "Nom du Club" : "Club Name",
    category: locale === "fr" ? "Catégorie" : "Category",
    leader: locale === "fr" ? "Responsable" : "Leader",
    duration: locale === "fr" ? "Durée" : "Duration",
    capacity: locale === "fr" ? "Capacité" : "Capacity",
    students: locale === "fr" ? "élèves" : "students",
    studentName: locale === "fr" ? "Nom de l'Élève" : "Student Name",
    grade: locale === "fr" ? "Classe" : "Grade",
    dateOfBirth: locale === "fr" ? "Date de naissance" : "Date of Birth",
    gender: locale === "fr" ? "Genre" : "Gender",
    parentInfo: locale === "fr" ? "Informations Parentales" : "Parent Information",
    father: locale === "fr" ? "Père" : "Father",
    mother: locale === "fr" ? "Mère" : "Mother",
    enrollmentFee: locale === "fr" ? "Frais d'inscription" : "Enrollment Fee",
    monthlyFee: locale === "fr" ? "Frais mensuels" : "Monthly Fee",
    totalMonthlyFees: locale === "fr" ? "Total frais mensuels" : "Total Monthly Fees",
    totalAmount: locale === "fr" ? "Montant Total" : "Total Amount",
    prorated: locale === "fr" ? "Proratisé" : "Prorated",
    paymentAmount: locale === "fr" ? "Montant Payé" : "Amount Paid",
    paymentMethod: locale === "fr" ? "Mode de Paiement" : "Payment Method",
    receiptNumber: locale === "fr" ? "Numéro de Reçu" : "Receipt Number",
    transactionRef: locale === "fr" ? "Référence Transaction" : "Transaction Reference",
    payer: locale === "fr" ? "Payeur" : "Payer",
    cash: locale === "fr" ? "Espèces" : "Cash",
    orangeMoney: "Orange Money",
    notes: "Notes",
    noPaymentRecorded: locale === "fr" ? "Aucun paiement enregistré" : "No payment recorded",
    paymentPending: locale === "fr" ? "Paiement en attente" : "Payment pending",
    male: locale === "fr" ? "Masculin" : "Male",
    female: locale === "fr" ? "Féminin" : "Female",
    other: locale === "fr" ? "Autre" : "Other",
    months: locale === "fr" ? "mois" : "months",
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

  // Calculate totals
  const enrollmentFee = data.enrollmentFee || 0
  const monthlyFee = data.monthlyFee || 0
  const totalMonthlyFees = data.totalMonthlyFees || 0
  const totalOwed = data.customTotal ?? (enrollmentFee + totalMonthlyFees)
  const hasPayment = data.paymentAmount && data.paymentAmount > 0

  const initials = data.studentName
    ? data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{translations.reviewEnrollment}</h2>
        <p className="text-muted-foreground">{translations.reviewDescription}</p>
      </div>

      {/* Club Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className={sizing.icon.sm} />
              {translations.clubInformation}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
              className="gap-1"
            >
              <Edit className={sizing.icon.sm} />
              {translations.edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{translations.clubName}</p>
              <p className="font-medium">
                {locale === "fr" && data.clubNameFr ? data.clubNameFr : data.clubName}
              </p>
            </div>
            {data.categoryName && (
              <div>
                <p className="text-sm text-muted-foreground">{translations.category}</p>
                <Badge variant="secondary">{data.categoryName}</Badge>
              </div>
            )}
            {data.leaderName && (
              <div>
                <p className="text-sm text-muted-foreground">{translations.leader}</p>
                <p className="font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {data.leaderName}
                </p>
              </div>
            )}
            {data.startDate && data.endDate && (
              <div>
                <p className="text-sm text-muted-foreground">{translations.duration}</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(data.startDate)} - {formatDate(data.endDate)}
                </p>
              </div>
            )}
            {data.capacity && (
              <div>
                <p className="text-sm text-muted-foreground">{translations.capacity}</p>
                <p className="font-medium">
                  {data.currentEnrollments}/{data.capacity} {translations.students}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className={sizing.icon.sm} />
              {translations.studentInformation}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
              className="gap-1"
            >
              <Edit className={sizing.icon.sm} />
              {translations.edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-border">
              <AvatarImage src={data.studentPhoto || undefined} alt={data.studentName} />
              <AvatarFallback className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg">{data.studentName}</p>
              {data.studentGrade && (
                <Badge variant="outline">
                  <GraduationCap className={cn(sizing.icon.xs, "mr-1")} />
                  {data.studentGrade}
                </Badge>
              )}
            </div>
          </div>

          {/* Personal Details */}
          {(data.studentDateOfBirth || data.studentGender) && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {data.studentDateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">{translations.dateOfBirth}</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatDate(data.studentDateOfBirth)}
                  </p>
                </div>
              )}
              {data.studentGender && (
                <div>
                  <p className="text-sm text-muted-foreground">{translations.gender}</p>
                  <p className="font-medium">{formatGender(data.studentGender)}</p>
                </div>
              )}
            </div>
          )}

          {/* Parent Information */}
          {(data.studentParentInfo?.fatherName || data.studentParentInfo?.motherName) && (
            <>
              <Separator />
              <div>
                <h5 className="text-sm font-medium mb-3 flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  {translations.parentInfo}
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {data.studentParentInfo?.fatherName && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{translations.father}</p>
                      <p className="font-medium">{data.studentParentInfo.fatherName}</p>
                      {data.studentParentInfo?.fatherPhone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {data.studentParentInfo.fatherPhone}
                        </p>
                      )}
                    </div>
                  )}
                  {data.studentParentInfo?.motherName && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{translations.mother}</p>
                      <p className="font-medium">{data.studentParentInfo.motherName}</p>
                      {data.studentParentInfo?.motherPhone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {data.studentParentInfo.motherPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className={sizing.icon.sm} />
              {translations.paymentSummary}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(3)}
              className="gap-1"
            >
              <Edit className={sizing.icon.sm} />
              {translations.edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{translations.enrollmentFee}</span>
              <span className="font-medium">{formatCurrency(enrollmentFee)}</span>
            </div>

            {monthlyFee > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.monthlyFee}</span>
                  <span className="font-medium">{formatCurrency(monthlyFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {translations.totalMonthlyFees}
                    {data.remainingMonths && ` (${data.remainingMonths} ${translations.months})`}
                  </span>
                  <span className="font-medium">{formatCurrency(totalMonthlyFees)}</span>
                </div>
              </>
            )}

            {data.isProrated && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {translations.prorated}
              </Badge>
            )}

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">{translations.totalAmount}</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{formatCurrency(totalOwed)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className={sizing.icon.sm} />
              {translations.paymentDetails}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(4)}
              className="gap-1"
            >
              <Edit className={sizing.icon.sm} />
              {translations.edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasPayment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{translations.paymentAmount}</p>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(data.paymentAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translations.paymentMethod}</p>
                  <Badge variant="outline" className="mt-1">
                    {data.paymentMethod === "cash" ? (
                      <><Banknote className="w-3.5 h-3.5 mr-1" />{translations.cash}</>
                    ) : (
                      <><Smartphone className="w-3.5 h-3.5 mr-1" />{translations.orangeMoney}</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{translations.receiptNumber}</p>
                  <p className="font-mono text-sm">{data.receiptNumber}</p>
                </div>
                {data.transactionRef && (
                  <div>
                    <p className="text-sm text-muted-foreground">{translations.transactionRef}</p>
                    <p className="font-mono text-sm">{data.transactionRef}</p>
                  </div>
                )}
              </div>

              {data.payer && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{translations.payer}</p>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="font-medium">{data.payer.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {data.payer.phone}
                        </span>
                        {data.payer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {data.payer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                {translations.paymentPending}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {translations.noPaymentRecorded}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {data.notes && data.notes.trim() && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className={sizing.icon.sm} />
                {translations.notes}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(4)}
                className="gap-1"
              >
                <Edit className={sizing.icon.sm} />
                {translations.edit}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
