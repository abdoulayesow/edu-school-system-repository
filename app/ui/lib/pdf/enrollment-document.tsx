/**
 * Enrollment Document PDF Template
 *
 * Generates a printable enrollment form with all student and payment information.
 * Redesigned for single-page compact layout.
 */

import React from "react"
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import { Letterhead } from "./letterhead"
import { styles, colors } from "./styles"
import type { EnrollmentSummary, PaymentSchedule, Payment, EnrollmentStatus } from "../enrollment/types"

interface EnrollmentDocumentProps {
  data: EnrollmentSummary
  language?: "en" | "fr"
}

// Compact styles for single-page layout
const compactStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 25,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textAlign: "center",
  },
  infoRow: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  infoRowThird: {
    width: "33.33%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  infoRowFull: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 70,
    fontSize: 8,
    color: colors.textLight,
    fontFamily: "Helvetica-Bold",
  },
  infoLabelWide: {
    width: 55,
    fontSize: 8,
    color: colors.textLight,
    fontFamily: "Helvetica-Bold",
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    color: colors.text,
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    flex: 1,
  },
  tableCellHeader: {
    padding: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    flex: 1,
  },
  signatureSection: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: colors.text,
    paddingTop: 3,
  },
  signatureText: {
    fontSize: 8,
    color: colors.textLight,
    textAlign: "center",
  },
})

// Format currency in GNF (compact)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " GNF"
}

// Format date (short format for compact layout)
function formatDate(date: Date | string | undefined, language: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get status display
function getStatusDisplay(status: EnrollmentStatus, language: "en" | "fr"): { label: string; color: string } {
  const statusMap: Record<EnrollmentStatus, { en: string; fr: string; color: string }> = {
    draft: { en: "Draft", fr: "Brouillon", color: colors.secondary },
    submitted: { en: "Submitted", fr: "Soumis", color: colors.warning },
    needs_review: { en: "Needs Review", fr: "En attente de validation", color: colors.warning },
    completed: { en: "Completed", fr: "Termine", color: colors.success },
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
  en: { kindergarten: "Kindergarten", elementary: "Elementary", college: "College", high_school: "High School" },
  fr: { kindergarten: "Maternelle", elementary: "Primaire", college: "Collège", high_school: "Lycée" },
}

export function EnrollmentDocument({ data, language = "fr" }: EnrollmentDocumentProps) {
  const t = labels[language]
  const { enrollment, schoolYear, grade, paymentSchedules, payments, totalPaid, totalOwed, studentNumber } = data

  const statusDisplay = getStatusDisplay(enrollment.status, language)
  const effectiveFee = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee

  return (
    <Document>
      <Page size="A4" style={compactStyles.page}>
        {/* Compact Letterhead */}
        <Letterhead schoolYear={schoolYear.name} compact />

        {/* Document Title + Enrollment Info (combined header) */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          padding: 8,
          backgroundColor: "#f3f4f6",
          borderRadius: 4,
        }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.primary, textAlign: "center" }}>
              {t.title}
            </Text>
            <Text style={{ fontSize: 9, color: colors.secondary, textAlign: "center" }}>{t.titleAlt}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: colors.textLight }}>{t.enrollmentNumber}: <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9 }}>{enrollment.enrollmentNumber || "-"}</Text></Text>
            <Text style={{ fontSize: 8, color: colors.textLight }}>{t.studentNumber}: <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9 }}>{studentNumber || "-"}</Text></Text>
            <Text style={{ fontSize: 8, color: statusDisplay.color, fontFamily: "Helvetica-Bold" }}>{statusDisplay.label}</Text>
          </View>
        </View>

        {/* Student + Academic Info (combined row) */}
        <View style={compactStyles.section}>
          <Text style={compactStyles.sectionTitle}>{t.studentInfo} / {t.academicInfo}</Text>
          <View style={styles.infoGrid}>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.lastName}:</Text>
              <Text style={compactStyles.infoValue}>{enrollment.lastName}</Text>
            </View>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.firstName}:</Text>
              <Text style={compactStyles.infoValue}>{enrollment.firstName}</Text>
            </View>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.dateOfBirth}:</Text>
              <Text style={compactStyles.infoValue}>{formatDate(enrollment.dateOfBirth, language)}</Text>
            </View>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.gender}:</Text>
              <Text style={compactStyles.infoValue}>
                {enrollment.gender === "male" ? t.male : enrollment.gender === "female" ? t.female : "-"}
              </Text>
            </View>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.grade}:</Text>
              <Text style={compactStyles.infoValue}>{grade.name}</Text>
            </View>
            <View style={compactStyles.infoRowThird}>
              <Text style={compactStyles.infoLabelWide}>{t.studentType}:</Text>
              <Text style={compactStyles.infoValue}>
                {enrollment.isReturningStudent ? t.returningStudent : t.newStudent}
              </Text>
            </View>
          </View>
        </View>

        {/* Parent Information (condensed 2-column layout) */}
        <View style={compactStyles.section}>
          <Text style={compactStyles.sectionTitle}>{t.parentInfo}</Text>
          <View style={{ flexDirection: "row" }}>
            {/* Father column */}
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.textLight, marginBottom: 2 }}>{t.fatherName}</Text>
              <Text style={{ fontSize: 9, marginBottom: 2 }}>{enrollment.fatherName || "-"}</Text>
              <Text style={{ fontSize: 8, color: colors.textLight }}>{enrollment.fatherPhone || "-"}</Text>
            </View>
            {/* Mother column */}
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.textLight, marginBottom: 2 }}>{t.motherName}</Text>
              <Text style={{ fontSize: 9, marginBottom: 2 }}>{enrollment.motherName || "-"}</Text>
              <Text style={{ fontSize: 8, color: colors.textLight }}>{enrollment.motherPhone || "-"}</Text>
            </View>
            {/* Address column */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: colors.textLight, marginBottom: 2 }}>{t.address}</Text>
              <Text style={{ fontSize: 9 }}>{enrollment.address || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Payment Schedule (compact) */}
        <View style={compactStyles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={compactStyles.sectionTitle}>{t.paymentSchedule}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 8, color: colors.textLight }}>{t.tuitionFee}: </Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{formatCurrency(effectiveFee)}</Text>
              {enrollment.adjustedTuitionFee && enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee && (
                <Text style={{ fontSize: 7, color: colors.textLight, marginLeft: 4 }}>
                  ({t.originalFee}: {formatCurrency(enrollment.originalTuitionFee)})
                </Text>
              )}
            </View>
          </View>

          {/* Schedule table (compact) */}
          <View style={[styles.table, { marginTop: 4 }]}>
            <View style={styles.tableHeader}>
              <Text style={[compactStyles.tableCellHeader, { width: 50 }]}>#</Text>
              <Text style={[compactStyles.tableCellHeader, { flex: 2 }]}>{t.months}</Text>
              <Text style={[compactStyles.tableCellHeader, { width: 80, textAlign: "right" }]}>{t.amount}</Text>
              <Text style={[compactStyles.tableCellHeader, { width: 80 }]}>{t.dueDate}</Text>
              <Text style={[compactStyles.tableCellHeader, { width: 50 }]}>{t.paymentStatus}</Text>
            </View>
            {paymentSchedules.map((schedule, idx) => (
              <View key={schedule.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[compactStyles.tableCell, { width: 50 }]}>
                  {schedule.scheduleNumber}
                </Text>
                <Text style={[compactStyles.tableCell, { flex: 2 }]}>
                  {schedule.months.join(", ")}
                </Text>
                <Text style={[compactStyles.tableCell, { width: 80, textAlign: "right" }]}>
                  {formatCurrency(schedule.amount)}
                </Text>
                <Text style={[compactStyles.tableCell, { width: 80 }]}>
                  {formatDate(schedule.dueDate, language)}
                </Text>
                <Text style={[
                  compactStyles.tableCell,
                  { width: 50, color: schedule.isPaid ? colors.success : colors.warning, fontFamily: "Helvetica-Bold" }
                ]}>
                  {schedule.isPaid ? "✓" : "○"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment History + Summary (combined row if payments exist) */}
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {/* Payment History (left side - only if payments exist) */}
          {payments.length > 0 && (
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={compactStyles.sectionTitle}>{t.paymentHistory}</Text>
              <View style={[styles.table, { marginTop: 4 }]}>
                <View style={styles.tableHeader}>
                  <Text style={[compactStyles.tableCellHeader, { flex: 1 }]}>{t.receiptNo}</Text>
                  <Text style={[compactStyles.tableCellHeader, { width: 70, textAlign: "right" }]}>{t.amount}</Text>
                  <Text style={[compactStyles.tableCellHeader, { width: 50 }]}>{t.method}</Text>
                  <Text style={[compactStyles.tableCellHeader, { width: 70 }]}>{t.date}</Text>
                </View>
                {payments.slice(0, 4).map((payment, idx) => (
                  <View key={payment.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={[compactStyles.tableCell, { flex: 1 }]}>{payment.receiptNumber}</Text>
                    <Text style={[compactStyles.tableCell, { width: 70, textAlign: "right" }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[compactStyles.tableCell, { width: 50 }]}>
                      {payment.method === "cash" ? "💵" : "📱"}
                    </Text>
                    <Text style={[compactStyles.tableCell, { width: 70 }]}>
                      {formatDate(payment.recordedAt, language)}
                    </Text>
                  </View>
                ))}
              </View>
              {payments.length > 4 && (
                <Text style={{ fontSize: 7, color: colors.textLight, marginTop: 2 }}>
                  +{payments.length - 4} more payments
                </Text>
              )}
            </View>
          )}

          {/* Summary (right side or full width) */}
          <View style={{
            flex: payments.length > 0 ? 0.6 : 1,
            padding: 10,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 4,
          }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.primary, marginBottom: 6 }}>{t.summary}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: colors.textLight }}>{t.totalFee}:</Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{formatCurrency(effectiveFee)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: colors.textLight }}>{t.totalPaid}:</Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.success }}>{formatCurrency(totalPaid)}</Text>
            </View>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 6,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.primary }}>{t.balance}:</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: totalOwed > 0 ? colors.danger : colors.success }}>
                {formatCurrency(totalOwed)}
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures (compact) */}
        <View style={compactStyles.signatureSection}>
          <View style={compactStyles.signatureBox}>
            <Text style={compactStyles.signatureLabel}>{t.guardianSignature}</Text>
            <View style={compactStyles.signatureLine}>
              <Text style={compactStyles.signatureText}>{t.date}: ________________</Text>
            </View>
          </View>
          <View style={compactStyles.signatureBox}>
            <Text style={compactStyles.signatureLabel}>{t.schoolSignature}</Text>
            <View style={compactStyles.signatureLine}>
              <Text style={compactStyles.signatureText}>{t.date}: ________________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { bottom: 20, left: 25, right: 25 }]}>
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
