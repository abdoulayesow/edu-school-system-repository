/**
 * Enrollment Certificate (Attestation d'Inscription) PDF Template
 *
 * Generates a formal enrollment certificate matching the official template.
 * Simplified single-page layout with greeting, confirmation, and payment summary.
 */

import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { colors } from "./styles"
import { letterheadBase64 } from "./letterhead-base64"
import type { EnrollmentSummary } from "../enrollment/types"

interface EnrollmentDocumentProps {
  data: EnrollmentSummary
  language?: "en" | "fr"
}

// Styles for attestation document
const attestationStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.text,
  },
  // Letterhead - using official template image
  letterhead: {
    marginBottom: 15,
  },
  letterheadImage: {
    width: "100%",
    height: "auto",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 5,
  },
  titleAlt: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 25,
  },
  greeting: {
    fontSize: 11,
    marginBottom: 15,
    lineHeight: 1.4,
  },
  confirmationText: {
    fontSize: 11,
    marginBottom: 25,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 10,
    marginTop: 20,
  },
  detailsTable: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  detailLabel: {
    width: 150,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.textLight,
  },
  detailValue: {
    flex: 1,
    fontSize: 11,
  },
  paymentTable: {
    marginTop: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: "row",
    backgroundColor: colors.navy,
    padding: 8,
  },
  paymentHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  paymentRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentCell: {
    flex: 1,
    fontSize: 10,
    textAlign: "center",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "40%",
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 35,
    textAlign: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.text,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: "center",
  },
  dateSection: {
    marginTop: 25,
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 10,
    color: colors.textLight,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.textLight,
  },
})

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

// Labels in both languages
const labels = {
  en: {
    title: "ENROLLMENT CERTIFICATE",
    titleAlt: "Attestation d'Inscription",
    greeting: (name: string) => `Dear ${name} (or Parents/Guardians),`,
    confirmation: (schoolYear: string, grade: string) =>
      `We confirm your enrollment at Groupe Scolaire Prive N'Diolou (GSPN) for the academic year ${schoolYear} in ${grade}. A place has been reserved for you.`,
    details: "Enrollment Details",
    studentId: "Student ID",
    grade: "Grade / Level",
    startDate: "Classes Start",
    paymentSummary: "Payment Summary",
    receiptNumber: "Receipt Number",
    totalTuition: "Total Tuition",
    paidToDate: "Paid to Date",
    balance: "Balance",
    treasurerSignature: "Treasurer / Secretary",
    parentSignature: "Parent / Guardian",
    date: "Date",
    printedOn: "Printed on",
    page: "Page",
  },
  fr: {
    title: "ATTESTATION D'INSCRIPTION",
    titleAlt: "Enrollment Certificate",
    greeting: (name: string) => `Cher/Chere ${name} (ou Parents/Tuteurs),`,
    confirmation: (schoolYear: string, grade: string) =>
      `Nous confirmons votre inscription au Groupe Scolaire Prive N'Diolou (GSPN) pour l'annee scolaire ${schoolYear} en ${grade}. Une place vous est reservee.`,
    details: "Details de l'inscription",
    studentId: "Identifiant",
    grade: "Niveau",
    startDate: "Debut des cours",
    paymentSummary: "Resume de paiement",
    receiptNumber: "Recu de paiement",
    totalTuition: "Total de la scolarite",
    paidToDate: "Paye au jour",
    balance: "Restant",
    treasurerSignature: "Le comptable / secretaire",
    parentSignature: "Parent / Tuteur d'eleve",
    date: "Date",
    printedOn: "Imprime le",
    page: "Page",
  },
}

export function EnrollmentDocument({ data, language = "fr" }: EnrollmentDocumentProps) {
  const t = labels[language]
  const { enrollment, schoolYear, grade, payments, totalPaid, totalOwed, studentNumber } = data

  const effectiveFee = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee
  // Include middle name if present
  const studentName = enrollment.middleName
    ? `${enrollment.firstName} ${enrollment.middleName} ${enrollment.lastName}`
    : `${enrollment.firstName} ${enrollment.lastName}`

  // Get the most recent receipt number if available
  const latestReceipt = payments.length > 0 ? payments[0].receiptNumber : "-"

  return (
    <Document>
      <Page size="A4" style={attestationStyles.page}>
        {/* School Letterhead - Official template image */}
        <View style={attestationStyles.letterhead}>
          <Image src={letterheadBase64} style={attestationStyles.letterheadImage} />
        </View>

        {/* Document Title */}
        <Text style={attestationStyles.title}>{t.title}</Text>
        <Text style={attestationStyles.titleAlt}>{t.titleAlt}</Text>

        {/* Greeting */}
        <Text style={attestationStyles.greeting}>
          {t.greeting(studentName)}
        </Text>

        {/* Confirmation Paragraph */}
        <Text style={attestationStyles.confirmationText}>
          {t.confirmation(schoolYear.name, grade.name)}
        </Text>

        {/* Enrollment Details Table */}
        <Text style={attestationStyles.sectionTitle}>{t.details}</Text>
        <View style={attestationStyles.detailsTable}>
          <View style={attestationStyles.detailRow}>
            <Text style={attestationStyles.detailLabel}>{t.studentId}</Text>
            <Text style={attestationStyles.detailValue}>
              {studentNumber || enrollment.enrollmentNumber || "-"}
            </Text>
          </View>
          <View style={attestationStyles.detailRow}>
            <Text style={attestationStyles.detailLabel}>{t.grade}</Text>
            <Text style={attestationStyles.detailValue}>{grade.name}</Text>
          </View>
          <View style={attestationStyles.detailRow}>
            <Text style={attestationStyles.detailLabel}>{t.startDate}</Text>
            <Text style={attestationStyles.detailValue}>
              {formatDate(schoolYear.startDate, language)}
            </Text>
          </View>
        </View>

        {/* Payment Summary Table */}
        <Text style={attestationStyles.sectionTitle}>{t.paymentSummary}</Text>
        <View style={attestationStyles.paymentTable}>
          <View style={attestationStyles.paymentHeader}>
            <Text style={attestationStyles.paymentHeaderCell}>{t.receiptNumber}</Text>
            <Text style={attestationStyles.paymentHeaderCell}>{t.totalTuition}</Text>
            <Text style={attestationStyles.paymentHeaderCell}>{t.paidToDate}</Text>
            <Text style={attestationStyles.paymentHeaderCell}>{t.balance}</Text>
          </View>
          <View style={attestationStyles.paymentRow}>
            <Text style={attestationStyles.paymentCell}>{latestReceipt}</Text>
            <Text style={attestationStyles.paymentCell}>{formatCurrency(effectiveFee)}</Text>
            <Text style={[attestationStyles.paymentCell, { color: colors.success }]}>
              {formatCurrency(totalPaid)}
            </Text>
            <Text style={[attestationStyles.paymentCell, { color: totalOwed > 0 ? colors.danger : colors.success }]}>
              {formatCurrency(totalOwed)}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={attestationStyles.dateSection}>
          <Text style={attestationStyles.dateText}>
            {t.date}: ____________________
          </Text>
        </View>

        {/* Signatures */}
        <View style={attestationStyles.signatureSection}>
          <View style={attestationStyles.signatureBox}>
            <Text style={attestationStyles.signatureLabel}>{t.treasurerSignature}</Text>
            <View style={attestationStyles.signatureLine}>
              <Text style={attestationStyles.signatureText}> </Text>
            </View>
          </View>
          <View style={attestationStyles.signatureBox}>
            <Text style={attestationStyles.signatureLabel}>{t.parentSignature}</Text>
            <View style={attestationStyles.signatureLine}>
              <Text style={attestationStyles.signatureText}> </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={attestationStyles.footer}>
          <Text style={attestationStyles.footerText}>
            {t.printedOn}: {formatDate(new Date(), language)}
          </Text>
          <Text style={attestationStyles.footerText}>
            {t.page} 1/1
          </Text>
        </View>
      </Page>
    </Document>
  )
}
