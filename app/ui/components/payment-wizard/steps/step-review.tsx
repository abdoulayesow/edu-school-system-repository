"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  GraduationCap,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  Receipt,
  Users,
  Phone,
  Mail,
  Pencil,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { usePaymentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import { sizing, typography, interactive, gradients } from "@/lib/design-tokens"

export function StepReview() {
  const { t, locale } = useI18n()
  const { state, goToStep } = usePaymentWizard()
  const { data } = state

  const studentName = `${data.studentFirstName} ${data.studentLastName}`
  const paymentAmount = data.paymentAmount || 0
  const willBeFullyPaid = data.remainingBalance === paymentAmount

  // Payer type label
  const getPayerTypeLabel = (type?: string) => {
    switch (type) {
      case "father":
        return locale === "fr" ? "Père" : "Father"
      case "mother":
        return locale === "fr" ? "Mère" : "Mother"
      case "enrolling_person":
        return locale === "fr" ? "Personne inscrivante" : "Enrolling Person"
      case "other":
        return locale === "fr" ? "Autre" : "Other"
      default:
        return "-"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {t?.paymentWizard?.reviewTitle || "Review Payment Details"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {locale === "fr"
            ? "Vérifiez les informations avant de soumettre"
            : "Please verify the information before submitting"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4">
        {/* Student Card */}
        <Card className={cn("border", interactive.card)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className={sizing.icon.sm} />
                {t?.paymentWizard?.student || "Student"}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(1)}
                className="h-8 text-xs"
              >
                <Pencil className={cn(sizing.icon.xs, "mr-1")} />
                {t?.common?.edit || "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className={sizing.avatar.lg}>
                <AvatarImage src={data.studentPhotoUrl} alt={studentName} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {data.studentFirstName?.[0]}{data.studentLastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{studentName}</h4>
                  <Badge variant="outline" className="font-mono shrink-0">
                    {data.studentNumber}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <GraduationCap className={sizing.icon.xs} />
                  <span>{data.gradeName}</span>
                  <span>•</span>
                  <span>{data.schoolYearName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card className={cn(
          "border-2",
          willBeFullyPaid
            ? cn(gradients.safe.light, gradients.safe.dark, gradients.safe.border)
            : "border-primary/30",
          interactive.card
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className={sizing.icon.sm} />
                {t?.paymentWizard?.payment || "Payment"}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(3)}
                className="h-8 text-xs"
              >
                <Pencil className={cn(sizing.icon.xs, "mr-1")} />
                {t?.common?.edit || "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.amount || "Amount"}
              </span>
              <span className={cn(
                typography.currency.lg,
                willBeFullyPaid
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-primary"
              )}>
                {formatCurrency(paymentAmount)}
              </span>
            </div>

            <Separator />

            {/* Method */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.paymentMethod || "Method"}
              </span>
              <Badge className={cn(
                "gap-1",
                data.paymentMethod === "cash"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              )}>
                {data.paymentMethod === "cash" ? (
                  <>
                    <Banknote className={sizing.icon.xs} />
                    {locale === "fr" ? "Espèces" : "Cash"}
                  </>
                ) : (
                  <>
                    <Smartphone className={sizing.icon.xs} />
                    Orange Money
                  </>
                )}
              </Badge>
            </div>

            {/* Receipt Number */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.receiptNumber || "Receipt Number"}
              </span>
              <Badge variant="outline" className="font-mono">
                <Receipt className={cn(sizing.icon.xs, "mr-1")} />
                {data.receiptNumber}
              </Badge>
            </div>

            {/* Transaction Reference (Orange Money) */}
            {data.paymentMethod === "orange_money" && data.transactionRef && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t?.paymentWizard?.transactionRef || "Transaction Ref"}
                </span>
                <span className="font-mono text-sm">{data.transactionRef}</span>
              </div>
            )}

            <Separator />

            {/* Balance Update Preview */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {locale === "fr" ? "Solde actuel" : "Current balance"}
                </span>
                <span className={typography.currency.sm}>
                  {formatCurrency(data.remainingBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {locale === "fr" ? "Ce paiement" : "This payment"}
                </span>
                <span className={cn(typography.currency.sm, "text-emerald-600 dark:text-emerald-400")}>
                  -{formatCurrency(paymentAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {locale === "fr" ? "Nouveau solde" : "New balance"}
                </span>
                <span className={cn(
                  typography.currency.md,
                  willBeFullyPaid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground"
                )}>
                  {willBeFullyPaid ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className={sizing.icon.sm} />
                      {locale === "fr" ? "Soldé" : "Paid"}
                    </span>
                  ) : (
                    formatCurrency(data.remainingBalance - paymentAmount)
                  )}
                </span>
              </div>
            </div>

            {willBeFullyPaid && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                <CheckCircle2 className={sizing.icon.sm} />
                <span className="text-sm font-medium">
                  {locale === "fr"
                    ? "Ce paiement soldera entièrement la scolarité"
                    : "This payment will fully settle the tuition"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payer Card */}
        <Card className={cn("border", interactive.card)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className={sizing.icon.sm} />
                {t?.paymentWizard?.payer || "Payer"}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(3)}
                className="h-8 text-xs"
              >
                <Pencil className={cn(sizing.icon.xs, "mr-1")} />
                {t?.common?.edit || "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.payer ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t?.paymentWizard?.payerType || "Relationship"}
                  </span>
                  <Badge variant="secondary">
                    {getPayerTypeLabel(data.payer.type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t?.paymentWizard?.payerName || "Name"}
                  </span>
                  <span className="font-medium">{data.payer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone className={sizing.icon.xs} />
                    {t?.paymentWizard?.payerPhone || "Phone"}
                  </span>
                  <span className="font-mono text-sm">{data.payer.phone}</span>
                </div>
                {data.payer.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mail className={sizing.icon.xs} />
                      {t?.paymentWizard?.payerEmail || "Email"}
                    </span>
                    <span className="text-sm">{data.payer.email}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                <AlertTriangle className={sizing.icon.sm} />
                <span className="text-sm">
                  {locale === "fr"
                    ? "Informations du payeur manquantes"
                    : "Payer information missing"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes (if any) */}
        {data.notes && (
          <Card className={cn("border", interactive.card)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t?.paymentWizard?.notes || "Notes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Treasury Update Info */}
      <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
        <div className="flex items-start gap-3">
          <Wallet className={cn(sizing.icon.md, "text-muted-foreground shrink-0 mt-0.5")} />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              {locale === "fr" ? "Mise à jour de la trésorerie" : "Treasury Update"}
            </p>
            <p>
              {data.paymentMethod === "cash" ? (
                locale === "fr"
                  ? "Ce paiement sera ajouté au solde de la caisse."
                  : "This payment will be added to the registry balance."
              ) : (
                locale === "fr"
                  ? "Ce paiement sera ajouté au solde Orange Money."
                  : "This payment will be added to the Orange Money balance."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
