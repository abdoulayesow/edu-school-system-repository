"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { formatCurrency } from "@/lib/format"
import { formatDate } from "@/lib/utils"
import {
  BookOpen,
  User,
  Users,
  Calculator,
  CreditCard,
  FileText,
  Edit2,
  AlertTriangle,
} from "lucide-react"
import { sizing } from "@/lib/design-tokens"

export function StepReview() {
  const { t, locale } = useI18n()
  const { state, goToStep } = useEnrollmentWizard()
  const { data } = state


  const hasAdjustment =
    data.adjustedTuitionFee !== undefined &&
    data.adjustedTuitionFee !== data.originalTuitionFee

  // Derive payment status from actual data to ensure consistency
  const hasPayment = data.paymentAmount && data.paymentAmount > 0 && data.paymentMethod

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t.enrollmentWizard.reviewEnrollment}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.enrollmentWizard.reviewDescription}
        </p>
      </div>

      {/* Warning for adjusted fee */}
      {hasAdjustment && (
        <Alert variant="destructive">
          <AlertTriangle className={sizing.icon.sm} />
          <AlertTitle>{t.enrollmentWizard.statusReviewRequired}</AlertTitle>
          <AlertDescription>
            {t.enrollmentWizard.requiresApproval}
          </AlertDescription>
        </Alert>
      )}

      {/* Grade Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className={sizing.icon.sm} />
              {t.enrollmentWizard.gradeInfo}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
            >
              <Edit2 className={sizing.icon.sm + " mr-1"} />
              {t.enrollmentWizard.editSection}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.selectGrade}
              </p>
              <p className="font-medium">{data.gradeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.yearlyTuition}
              </p>
              <p className="font-medium">
                {formatCurrency(data.adjustedTuitionFee || data.originalTuitionFee)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className={sizing.icon.sm} />
              {t.enrollmentWizard.studentDetails}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
            >
              <Edit2 className={sizing.icon.sm + " mr-1"} />
              {t.enrollmentWizard.editSection}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {data.isReturningStudent ? (
              <Badge variant="secondary">
                {t.enrollmentWizard.returningStudent}
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800">{t.enrollmentWizard.newStudent}</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.firstName}
              </p>
              <p className="font-medium">{data.firstName || "-"}</p>
            </div>
            {data.middleName && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.enrollmentWizard.middleName}
                </p>
                <p className="font-medium">{data.middleName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.lastName}
              </p>
              <p className="font-medium">{data.lastName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.dateOfBirth}
              </p>
              <p className="font-medium">
                {formatDate(data.dateOfBirth, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.gender}
              </p>
              <p className="font-medium">
                {data.gender
                  ? t.enrollmentWizard[data.gender as "male" | "female"]
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.phone}
              </p>
              <p className="font-medium">{data.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.email}
              </p>
              <p className="font-medium">{data.email || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Information */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className={sizing.icon.sm} />
              {t.enrollmentWizard.parentDetails}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
            >
              <Edit2 className={sizing.icon.sm + " mr-1"} />
              {t.enrollmentWizard.editSection}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Father */}
          {(data.fatherName || data.fatherPhone) && (
            <div>
              <h5 className="text-sm font-medium mb-2">
                {t.enrollmentWizard.fatherInfo}
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.fatherName}
                  </p>
                  <p className="font-medium">{data.fatherName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.fatherPhone}
                  </p>
                  <p className="font-medium">{data.fatherPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.fatherEmail}
                  </p>
                  <p className="font-medium">{data.fatherEmail || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mother */}
          {(data.motherName || data.motherPhone) && (
            <div>
              <h5 className="text-sm font-medium mb-2">
                {t.enrollmentWizard.motherInfo}
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.motherName}
                  </p>
                  <p className="font-medium">{data.motherName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.motherPhone}
                  </p>
                  <p className="font-medium">{data.motherPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.motherEmail}
                  </p>
                  <p className="font-medium">{data.motherEmail || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enrolling Person */}
          {data.enrollingPersonType && (
            <div>
              <Separator className="my-4" />
              <h5 className="text-sm font-medium mb-2">
                {t.enrollmentWizard.enrollingPerson}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Type
                  </p>
                  <p className="font-medium capitalize">
                    {data.enrollingPersonType === "father" && t.enrollmentWizard.enrollingAsFather}
                    {data.enrollingPersonType === "mother" && t.enrollmentWizard.enrollingAsMother}
                    {data.enrollingPersonType === "other" && t.enrollmentWizard.enrollingAsOther}
                  </p>
                </div>
                {data.enrollingPersonType === "other" && data.enrollingPersonName && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.enrollmentWizard.enrollingPersonName}
                      </p>
                      <p className="font-medium">{data.enrollingPersonName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.enrollmentWizard.enrollingPersonRelation}
                      </p>
                      <p className="font-medium">{data.enrollingPersonRelation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.enrollmentWizard.enrollingPersonPhone}
                      </p>
                      <p className="font-medium">{data.enrollingPersonPhone || "-"}</p>
                    </div>
                    {data.enrollingPersonEmail && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t.enrollmentWizard.enrollingPersonEmail}
                        </p>
                        <p className="font-medium">{data.enrollingPersonEmail}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          {data.address && (
            <div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.address}
              </p>
              <p className="font-medium">{data.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className={sizing.icon.sm} />
              {t.enrollmentWizard.paymentDetails}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(3)}
            >
              <Edit2 className={sizing.icon.sm + " mr-1"} />
              {t.enrollmentWizard.editSection}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Schedules */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {data.paymentSchedules.map((schedule) => (
              <div key={schedule.scheduleNumber} className="p-3 bg-amber-50 dark:bg-muted/50 rounded-lg border border-amber-200 dark:border-border">
                <p className="text-lg font-bold">
                  {formatCurrency(schedule.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.enrollmentWizard[`schedule${schedule.scheduleNumber}` as keyof typeof t.enrollmentWizard]}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span>{t.enrollmentWizard.totalYearlyAmount}</span>
            <span className="text-xl font-bold text-nav-highlight dark:text-gspn-gold-200">
              {formatCurrency(data.adjustedTuitionFee || data.originalTuitionFee)}
            </span>
          </div>

          {/* Initial Payment */}
          {hasPayment && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Initial Payment
                  </span>
                  <span className="font-medium">
                    {formatCurrency(data.paymentAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.paymentMethod}
                  </span>
                  <Badge variant="outline">
                    {data.paymentMethod === "cash"
                      ? t.enrollmentWizard.cash
                      : t.enrollmentWizard.orangeMoney}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t.enrollmentWizard.receiptNumber}
                  </span>
                  <span className="font-mono text-sm">{data.receiptNumber}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {data.notes && data.notes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className={sizing.icon.sm} />
                {t.enrollmentWizard.notesSection}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(2)}
              >
                <Edit2 className={sizing.icon.sm + " mr-1"} />
                {t.enrollmentWizard.editSection}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.notes.map((note, index) => (
                <div key={index} className="p-3 bg-yellow-50 dark:bg-muted/50 rounded-lg">
                  <p className="font-medium">{note.title}</p>
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
