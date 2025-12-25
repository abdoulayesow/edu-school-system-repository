/**
 * Enrollment Document PDF Template
 *
 * Generates a printable enrollment form with all student and payment information.
 */

import React from "react"
import { Document, Page, View, Text } from "@react-pdf/renderer"
import { Letterhead } from "./letterhead"
import { styles, colors } from "./styles"
import type { EnrollmentSummary, PaymentSchedule, Payment, EnrollmentStatus } from "../enrollment/types"

interface EnrollmentDocumentProps {
  data: EnrollmentSummary
  language?: "en" | "fr"
}

// Format currency in GNF
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " GNF"
}

// Format date
function formatDate(date: Date | string | undefined, language: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Get status display
function getStatusDisplay(status: EnrollmentStatus, language: "en" | "fr"): { label: string; color: string } {
  const statusMap: Record<EnrollmentStatus, { en: string; fr: string; color: string }> = {
    draft: { en: "Draft", fr: "Brouillon", color: colors.secondary },
    submitted: { en: "Submitted", fr: "Soumis", color: colors.warning },
    review_required: { en: "Review Required", fr: "Revision requise", color: colors.warning },
    approved: { en: "Approved", fr: "Approuve", color: colors.success },
    rejected: { en: "Rejected", fr: "Rejete", color: colors.danger },
    cancelled: { en: "Cancelled", fr: "Annule", color: colors.danger },
  }
  const s = statusMap[status]
  return {
    label: language === "fr" ? s.fr : s.en,
    color: s.color,
  }
}

// Labels in both languages
const labels = {
  en: {
    title: "Enrollment Form",
    titleAlt: "Fiche d'Inscription",
    enrollmentNumber: "Enrollment No.",
    studentNumber: "Student No.",
    status: "Status",
    studentInfo: "Student Information",
    firstName: "First Name",
    lastName: "Last Name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    phone: "Phone",
    email: "Email",
    male: "Male",
    female: "Female",
    parentInfo: "Parent/Guardian Information",
    fatherName: "Father's Name",
    fatherPhone: "Father's Phone",
    fatherEmail: "Father's Email",
    motherName: "Mother's Name",
    motherPhone: "Mother's Phone",
    motherEmail: "Mother's Email",
    address: "Address",
    academicInfo: "Academic Information",
    schoolYear: "School Year",
    grade: "Grade",
    level: "Level",
    studentType: "Student Type",
    newStudent: "New Student",
    returningStudent: "Returning Student",
    paymentInfo: "Payment Information",
    tuitionFee: "Tuition Fee",
    originalFee: "Original Fee",
    adjustedFee: "Adjusted Fee",
    adjustmentReason: "Reason",
    paymentSchedule: "Payment Schedule",
    schedule: "Schedule",
    months: "Months",
    amount: "Amount",
    dueDate: "Due Date",
    paymentStatus: "Status",
    paid: "Paid",
    pending: "Pending",
    paymentHistory: "Payment History",
    receiptNo: "Receipt No.",
    method: "Method",
    date: "Date",
    cash: "Cash",
    orangeMoney: "Orange Money",
    summary: "Summary",
    totalFee: "Total Fee",
    totalPaid: "Total Paid",
    balance: "Balance",
    signatures: "Signatures",
    guardianSignature: "Parent/Guardian Signature",
    schoolSignature: "School Administration",
    printDate: "Printed on",
    page: "Page",
  },
  fr: {
    title: "Fiche d'Inscription",
    titleAlt: "Enrollment Form",
    enrollmentNumber: "No. Inscription",
    studentNumber: "No. Eleve",
    status: "Statut",
    studentInfo: "Informations de l'Eleve",
    firstName: "Prenom",
    lastName: "Nom",
    dateOfBirth: "Date de Naissance",
    gender: "Sexe",
    phone: "Telephone",
    email: "Email",
    male: "Masculin",
    female: "Feminin",
    parentInfo: "Informations des Parents/Tuteurs",
    fatherName: "Nom du Pere",
    fatherPhone: "Tel. du Pere",
    fatherEmail: "Email du Pere",
    motherName: "Nom de la Mere",
    motherPhone: "Tel. de la Mere",
    motherEmail: "Email de la Mere",
    address: "Adresse",
    academicInfo: "Informations Academiques",
    schoolYear: "Annee Scolaire",
    grade: "Classe",
    level: "Niveau",
    studentType: "Type d'Eleve",
    newStudent: "Nouvel Eleve",
    returningStudent: "Ancien Eleve",
    paymentInfo: "Informations de Paiement",
    tuitionFee: "Frais de Scolarite",
    originalFee: "Frais Original",
    adjustedFee: "Frais Ajuste",
    adjustmentReason: "Raison",
    paymentSchedule: "Echeancier de Paiement",
    schedule: "Echeance",
    months: "Mois",
    amount: "Montant",
    dueDate: "Date Limite",
    paymentStatus: "Statut",
    paid: "Paye",
    pending: "En attente",
    paymentHistory: "Historique des Paiements",
    receiptNo: "No. Recu",
    method: "Mode",
    date: "Date",
    cash: "Especes",
    orangeMoney: "Orange Money",
    summary: "Resume",
    totalFee: "Total Frais",
    totalPaid: "Total Paye",
    balance: "Solde",
    signatures: "Signatures",
    guardianSignature: "Signature Parent/Tuteur",
    schoolSignature: "Administration Scolaire",
    printDate: "Imprime le",
    page: "Page",
  },
}

// Level labels
const levelLabels = {
  en: { elementary: "Elementary", college: "College", high_school: "High School" },
  fr: { elementary: "Primaire", college: "College", high_school: "Lycee" },
}

export function EnrollmentDocument({ data, language = "fr" }: EnrollmentDocumentProps) {
  const t = labels[language]
  const { enrollment, schoolYear, grade, paymentSchedules, payments, totalPaid, totalOwed } = data

  const statusDisplay = getStatusDisplay(enrollment.status, language)
  const effectiveFee = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead */}
        <Letterhead schoolYear={schoolYear.name} />

        {/* Document Title */}
        <Text style={styles.documentTitle}>{t.title}</Text>
        <Text style={styles.documentTitleFr}>{t.titleAlt}</Text>

        {/* Enrollment Info Bar */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
          padding: 10,
          backgroundColor: "#f3f4f6",
          borderRadius: 4,
        }}>
          <View>
            <Text style={{ fontSize: 9, color: colors.textLight }}>{t.enrollmentNumber}</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>
              {enrollment.enrollmentNumber || "-"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: colors.textLight }}>{t.studentNumber}</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>
              {enrollment.studentId || "-"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: colors.textLight }}>{t.status}</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: statusDisplay.color }}>
              {statusDisplay.label}
            </Text>
          </View>
        </View>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.studentInfo}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.firstName}:</Text>
              <Text style={styles.infoValue}>{enrollment.firstName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.lastName}:</Text>
              <Text style={styles.infoValue}>{enrollment.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.dateOfBirth}:</Text>
              <Text style={styles.infoValue}>{formatDate(enrollment.dateOfBirth, language)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.gender}:</Text>
              <Text style={styles.infoValue}>
                {enrollment.gender === "male" ? t.male : enrollment.gender === "female" ? t.female : "-"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.phone}:</Text>
              <Text style={styles.infoValue}>{enrollment.phone || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.email}:</Text>
              <Text style={styles.infoValue}>{enrollment.email || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Parent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.parentInfo}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.fatherName}:</Text>
              <Text style={styles.infoValue}>{enrollment.fatherName || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.fatherPhone}:</Text>
              <Text style={styles.infoValue}>{enrollment.fatherPhone || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.motherName}:</Text>
              <Text style={styles.infoValue}>{enrollment.motherName || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.motherPhone}:</Text>
              <Text style={styles.infoValue}>{enrollment.motherPhone || "-"}</Text>
            </View>
            <View style={styles.infoRowFull}>
              <Text style={styles.infoLabel}>{t.address}:</Text>
              <Text style={styles.infoValue}>{enrollment.address || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.academicInfo}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.schoolYear}:</Text>
              <Text style={styles.infoValue}>{schoolYear.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.grade}:</Text>
              <Text style={styles.infoValue}>{grade.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.level}:</Text>
              <Text style={styles.infoValue}>
                {levelLabels[language][grade.level as keyof typeof levelLabels.en]}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.studentType}:</Text>
              <Text style={styles.infoValue}>
                {enrollment.isReturningStudent ? t.returningStudent : t.newStudent}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.paymentSchedule}</Text>

          {/* Tuition info */}
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: colors.textLight, width: 100 }}>{t.originalFee}:</Text>
              <Text style={{ fontSize: 10 }}>{formatCurrency(enrollment.originalTuitionFee)}</Text>
            </View>
            {enrollment.adjustedTuitionFee && enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee && (
              <>
                <View style={{ flexDirection: "row", marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, color: colors.textLight, width: 100 }}>{t.adjustedFee}:</Text>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                    {formatCurrency(enrollment.adjustedTuitionFee)}
                  </Text>
                </View>
                {enrollment.adjustmentReason && (
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 9, color: colors.textLight, width: 100 }}>{t.adjustmentReason}:</Text>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Oblique" }}>
                      {enrollment.adjustmentReason}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Schedule table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { width: 80 }]}>{t.schedule}</Text>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>{t.months}</Text>
              <Text style={[styles.tableCellHeader, { width: 100, textAlign: "right" }]}>{t.amount}</Text>
              <Text style={[styles.tableCellHeader, { width: 100 }]}>{t.dueDate}</Text>
              <Text style={[styles.tableCellHeader, { width: 60 }]}>{t.paymentStatus}</Text>
            </View>
            {paymentSchedules.map((schedule, idx) => (
              <View key={schedule.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { width: 80 }]}>
                  {t.schedule} {schedule.scheduleNumber}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {schedule.months.join(", ")}
                </Text>
                <Text style={[styles.tableCell, { width: 100, textAlign: "right" }]}>
                  {formatCurrency(schedule.amount)}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {formatDate(schedule.dueDate, language)}
                </Text>
                <Text style={[
                  styles.tableCell,
                  { width: 60, color: schedule.isPaid ? colors.success : colors.warning }
                ]}>
                  {schedule.isPaid ? t.paid : t.pending}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment History (if any payments) */}
        {payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.paymentHistory}</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { width: 100 }]}>{t.receiptNo}</Text>
                <Text style={[styles.tableCellHeader, { width: 100, textAlign: "right" }]}>{t.amount}</Text>
                <Text style={[styles.tableCellHeader, { width: 80 }]}>{t.method}</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>{t.date}</Text>
              </View>
              {payments.map((payment, idx) => (
                <View key={payment.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { width: 100 }]}>{payment.receiptNumber}</Text>
                  <Text style={[styles.tableCell, { width: 100, textAlign: "right" }]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>
                    {payment.method === "cash" ? t.cash : t.orangeMoney}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {formatDate(payment.recordedAt, language)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.totalFee}:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(effectiveFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.totalPaid}:</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalLabel}>{t.balance}:</Text>
            <Text style={[styles.summaryTotalValue, { color: totalOwed > 0 ? colors.danger : colors.success }]}>
              {formatCurrency(totalOwed)}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>{t.guardianSignature}</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{t.date}: ________________</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>{t.schoolSignature}</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{t.date}: ________________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t.printDate}: {formatDate(new Date(), language)}
          </Text>
          <Text style={styles.footerPage}>
            {t.page} 1/1
          </Text>
        </View>
      </Page>
    </Document>
  )
}
