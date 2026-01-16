/**
 * Club Payment Receipt PDF Template
 *
 * Generates a formal payment receipt for club monthly payments.
 * Single-page layout with school letterhead, club info, and payment details.
 */

import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { colors } from "./styles"
import { letterheadBase64 } from "./letterhead-base64"

interface ClubPaymentReceiptData {
  // Payment info
  paymentId: string
  receiptNumber: string
  amount: number
  method: "cash" | "orange_money"
  recordedAt: string
  recorderName?: string

  // Club info
  clubName: string
  clubNameFr?: string
  categoryName?: string

  // Month info
  month: number
  year: number

  // Student info
  studentFirstName: string
  studentLastName: string
  gradeName: string
  schoolYearName: string

  // Optional: enrollment summary
  totalMonths?: number
  monthsPaid?: number
  monthlyFee?: number
}

interface ClubPaymentReceiptDocumentProps {
  data: ClubPaymentReceiptData
  language?: "en" | "fr"
}

// Styles for receipt document
const receiptStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: colors.white,
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
  },
  letterhead: {
    marginBottom: 4,
  },
  letterheadImage: {
    width: "100%",
    maxHeight: 58,
    objectFit: "contain",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  titleAlt: {
    fontSize: 8,
    color: colors.textLight,
    marginTop: 1,
    fontStyle: "italic",
  },
  receiptNumberBlock: {
    alignItems: "flex-end",
  },
  receiptNumberLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  receiptNumberValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  infoCard: {
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  column: {
    flex: 1,
  },
  detailsGrid: {
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 1.5,
    alignItems: "flex-start",
  },
  detailLabel: {
    width: 80,
    fontSize: 7.5,
    color: colors.textLight,
    paddingTop: 0.5,
  },
  detailValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  detailValueBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  // Club badge styling
  clubBadge: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f3e8ff", // Light purple
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6", // Purple
  },
  clubName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#6b21a8",
    marginBottom: 2,
  },
  clubCategory: {
    fontSize: 8,
    color: "#7c3aed",
  },
  // Financial summary
  financialSection: {
    marginTop: 8,
    marginBottom: 10,
    padding: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 3,
  },
  financialGrid: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  financialItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  financialLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  financialValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  amountPaidRow: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffef8",
    paddingHorizontal: 8,
    paddingBottom: 4,
    marginHorizontal: -4,
    borderRadius: 2,
  },
  amountPaidLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  amountPaidValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  // Month highlight
  monthHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginTop: 4,
  },
  monthText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  // Signatures
  signatureSection: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  signatureLine: {
    width: "85%",
    borderTopWidth: 1,
    borderTopColor: colors.textLight,
    paddingTop: 2,
  },
  signatureText: {
    fontSize: 6,
    color: colors.textLight,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6.5,
    color: colors.textLight,
  },
  methodBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 2,
    backgroundColor: "#e8f5e9",
  },
  methodBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.success,
  },
})

// Format currency in GNF
function formatCurrency(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${formatted} GNF`
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

// Get month name
function getMonthName(month: number, language: "en" | "fr"): string {
  const months = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  }
  return months[language][month - 1]
}

// Labels in both languages
const labels = {
  en: {
    title: "CLUB PAYMENT RECEIPT",
    titleAlt: "Reçu de Paiement Club",
    receiptNumber: "Receipt Number",
    clubDetails: "Club Details",
    clubName: "Club",
    category: "Category",
    studentDetails: "Student Details",
    studentName: "Student Name",
    grade: "Grade / Level",
    schoolYear: "School Year",
    paymentDetails: "Payment Details",
    paymentMethod: "Payment Method",
    paymentDate: "Payment Date",
    recordedBy: "Recorded By",
    monthlyFee: "Monthly Fee",
    monthPaid: "Month Paid",
    amountPaid: "Amount Paid",
    paymentProgress: "Payment Progress",
    cash: "Cash",
    orangeMoney: "Orange Money",
    treasurerSignature: "Treasurer / Secretary",
    payerSignature: "Payer",
    printedOn: "Printed on",
    page: "Page",
  },
  fr: {
    title: "REÇU DE PAIEMENT CLUB",
    titleAlt: "Club Payment Receipt",
    receiptNumber: "Numéro de Reçu",
    clubDetails: "Détails du Club",
    clubName: "Club",
    category: "Catégorie",
    studentDetails: "Détails de l'Élève",
    studentName: "Nom de l'Élève",
    grade: "Niveau",
    schoolYear: "Année Scolaire",
    paymentDetails: "Détails du Paiement",
    paymentMethod: "Mode de Paiement",
    paymentDate: "Date du Paiement",
    recordedBy: "Enregistré par",
    monthlyFee: "Frais Mensuel",
    monthPaid: "Mois Payé",
    amountPaid: "Montant Payé",
    paymentProgress: "Progression",
    cash: "Espèces",
    orangeMoney: "Orange Money",
    treasurerSignature: "Le Comptable / Secrétaire",
    payerSignature: "Le Payeur",
    printedOn: "Imprimé le",
    page: "Page",
  },
}

export function ClubPaymentReceiptDocument({ data, language = "fr" }: ClubPaymentReceiptDocumentProps) {
  const t = labels[language]
  const studentName = `${data.studentFirstName} ${data.studentLastName}`
  const clubDisplayName = language === "fr" && data.clubNameFr ? data.clubNameFr : data.clubName

  return (
    <Document>
      <Page size="A4" style={receiptStyles.page}>
        {/* School Letterhead */}
        <View style={receiptStyles.letterhead}>
          <Image src={letterheadBase64} style={receiptStyles.letterheadImage} />
        </View>

        {/* Header: Title + Receipt Number */}
        <View style={receiptStyles.headerRow}>
          <View style={receiptStyles.titleBlock}>
            <Text style={receiptStyles.title}>{t.title}</Text>
            <Text style={receiptStyles.titleAlt}>{t.titleAlt}</Text>
          </View>
          <View style={receiptStyles.receiptNumberBlock}>
            <Text style={receiptStyles.receiptNumberLabel}>{t.receiptNumber}</Text>
            <Text style={receiptStyles.receiptNumberValue}>{data.receiptNumber}</Text>
          </View>
        </View>

        {/* Club Badge */}
        <View style={receiptStyles.clubBadge}>
          <Text style={receiptStyles.clubName}>{clubDisplayName}</Text>
          {data.categoryName && (
            <Text style={receiptStyles.clubCategory}>{data.categoryName}</Text>
          )}
        </View>

        {/* Two-column layout: Student Details | Payment Details */}
        <View style={receiptStyles.twoColumnRow}>
          {/* Left column: Student Details */}
          <View style={receiptStyles.column}>
            <View style={receiptStyles.infoCard}>
              <Text style={receiptStyles.cardTitle}>{t.studentDetails}</Text>
              <View style={receiptStyles.detailsGrid}>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.studentName}</Text>
                  <Text style={receiptStyles.detailValueBold}>{studentName}</Text>
                </View>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.grade}</Text>
                  <Text style={receiptStyles.detailValue}>{data.gradeName}</Text>
                </View>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.schoolYear}</Text>
                  <Text style={receiptStyles.detailValue}>{data.schoolYearName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right column: Payment Details */}
          <View style={receiptStyles.column}>
            <View style={receiptStyles.infoCard}>
              <Text style={receiptStyles.cardTitle}>{t.paymentDetails}</Text>
              <View style={receiptStyles.detailsGrid}>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.paymentMethod}</Text>
                  <View style={receiptStyles.methodBadge}>
                    <Text style={receiptStyles.methodBadgeText}>
                      {data.method === "cash" ? t.cash : t.orangeMoney}
                    </Text>
                  </View>
                </View>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.paymentDate}</Text>
                  <Text style={receiptStyles.detailValue}>
                    {formatDate(data.recordedAt, language)}
                  </Text>
                </View>
                {data.recorderName && (
                  <View style={receiptStyles.detailRow}>
                    <Text style={receiptStyles.detailLabel}>{t.recordedBy}</Text>
                    <Text style={receiptStyles.detailValue}>{data.recorderName}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={receiptStyles.financialSection}>
          <View style={receiptStyles.financialGrid}>
            {data.monthlyFee && (
              <View style={receiptStyles.financialItem}>
                <Text style={receiptStyles.financialLabel}>{t.monthlyFee}</Text>
                <Text style={receiptStyles.financialValue}>{formatCurrency(data.monthlyFee)}</Text>
              </View>
            )}
            <View style={receiptStyles.financialItem}>
              <Text style={receiptStyles.financialLabel}>{t.monthPaid}</Text>
              <Text style={receiptStyles.financialValue}>
                {getMonthName(data.month, language)} {data.year}
              </Text>
            </View>
            {data.totalMonths && data.monthsPaid && (
              <View style={receiptStyles.financialItem}>
                <Text style={receiptStyles.financialLabel}>{t.paymentProgress}</Text>
                <Text style={receiptStyles.financialValue}>
                  {data.monthsPaid} / {data.totalMonths}
                </Text>
              </View>
            )}
          </View>
          <View style={receiptStyles.amountPaidRow}>
            <Text style={receiptStyles.amountPaidLabel}>{t.amountPaid}</Text>
            <Text style={receiptStyles.amountPaidValue}>{formatCurrency(data.amount)}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={receiptStyles.signatureSection}>
          <View style={receiptStyles.signatureBox}>
            <Text style={receiptStyles.signatureLabel}>{t.treasurerSignature}</Text>
            <View style={receiptStyles.signatureLine}>
              <Text style={receiptStyles.signatureText}> </Text>
            </View>
          </View>
          <View style={receiptStyles.signatureBox}>
            <Text style={receiptStyles.signatureLabel}>{t.payerSignature}</Text>
            <View style={receiptStyles.signatureLine}>
              <Text style={receiptStyles.signatureText}> </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={receiptStyles.footer}>
          <Text style={receiptStyles.footerText}>
            {t.printedOn}: {formatDate(new Date(), language)}
          </Text>
          <Text style={receiptStyles.footerText}>{t.page} 1/1</Text>
        </View>
      </Page>
    </Document>
  )
}
