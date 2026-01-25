/**
 * Payment Receipt (Reçu de Paiement) PDF Template
 *
 * Generates a formal payment receipt matching the school's official template.
 * Single-page layout with school letterhead, payment details, and signatures.
 */

import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { colors } from "./styles"
import { letterheadBase64 } from "./letterhead-base64"

interface PayerInfo {
  type: string
  name: string
  phone: string
  email?: string
}

interface PaymentHistoryItem {
  receiptNumber: string
  amount: number
  recordedAt: string
  method: string
}

interface PaymentReceiptData {
  // Payment info
  paymentId: string
  receiptNumber: string
  amount: number
  method: "cash" | "orange_money"
  transactionRef?: string
  recordedAt: string
  recorderName?: string

  // Student info
  studentNumber: string
  studentFirstName: string
  studentLastName: string
  gradeName?: string
  schoolYearName?: string
  clubName?: string

  // Payment type
  paymentType?: "tuition" | "club"

  // Balance info (tuition only)
  tuitionFee?: number
  totalPaidBefore?: number
  remainingAfter?: number

  // Payment history
  paymentHistory?: PaymentHistoryItem[]

  // Payer info
  payer?: PayerInfo
  notes?: string
}

interface PaymentReceiptDocumentProps {
  data: PaymentReceiptData
  language?: "en" | "fr"
}

// Styles for receipt document - Ultra-compact, refined single-page layout
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
  // Header row with subtle border
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.border, // Neutral gray border
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
  // Compact info card with neutral style
  infoCard: {
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
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
  // Two-column layout for student + payment details
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
    width: 68,
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
  // Payer section - ultra compact
  payerSection: {
    marginBottom: 6,
  },
  payerRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 1,
  },
  payerItem: {
    flexDirection: "row",
    flex: 1,
    alignItems: "baseline",
  },
  payerLabel: {
    fontSize: 7.5,
    color: colors.textLight,
    marginRight: 3,
  },
  payerValue: {
    fontSize: 8.5,
    flex: 1,
  },
  // Financial summary - elegant bordered section
  financialSection: {
    marginTop: 4,
    marginBottom: 8,
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
  // Prominent amount paid with neutral style
  amountPaidRow: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
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
  // Compact signatures
  signatureSection: {
    marginTop: 12,
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
    marginBottom: 16,
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
  // Minimal footer
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
  // Payment method badge - neutral
  methodBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 2,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  // Payment history table - sober editorial style
  historySection: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  historyTable: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#000000", // Black header like enrollment PDF
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  historyRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  historyRowCurrent: {
    flexDirection: "row",
    backgroundColor: colors.background,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderTopWidth: 2,
    borderTopColor: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  historyHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  historyCell: {
    fontSize: 7.5,
    color: colors.text,
  },
  historyCellBold: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  historyColReceipt: { width: "25%" },
  historyColDate: { width: "35%" },
  historyColAmount: { width: "25%", textAlign: "right" },
  historyColMethod: { width: "15%", textAlign: "center" },
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

// Get payer type label
function getPayerTypeLabel(type: string, language: "en" | "fr"): string {
  const labels: Record<string, Record<string, string>> = {
    father: { en: "Father", fr: "Père" },
    mother: { en: "Mother", fr: "Mère" },
    enrolling_person: { en: "Enrolling Person", fr: "Personne inscrivante" },
    other: { en: "Other", fr: "Autre" },
  }
  return labels[type]?.[language] || type
}

// Labels in both languages
const labels = {
  en: {
    title: "PAYMENT RECEIPT",
    titleAlt: "Reçu de Paiement",
    receiptNumber: "Receipt Number",
    studentDetails: "Student Details",
    studentId: "Student ID",
    studentName: "Student Name",
    grade: "Grade / Level",
    schoolYear: "School Year",
    paymentDetails: "Payment Details",
    paymentMethod: "Payment Method",
    transactionRef: "Transaction Reference",
    paymentDate: "Payment Date",
    recordedBy: "Recorded By",
    payerDetails: "Payer Details",
    payerName: "Name",
    payerRelation: "Relationship",
    payerPhone: "Phone",
    previousBalance: "Previous Balance",
    amountPaid: "Amount Paid",
    newBalance: "New Balance",
    tuitionFee: "Total Tuition",
    cash: "Cash",
    orangeMoney: "Orange Money",
    treasurerSignature: "Treasurer / Secretary",
    payerSignature: "Payer",
    printedOn: "Printed on",
    page: "Page",
    paymentHistory: "Payment History",
    historyReceipt: "Receipt #",
    historyDate: "Date",
    historyAmount: "Amount",
    historyMethod: "Method",
    club: "Club",
    totalPaid: "Total Paid",
  },
  fr: {
    title: "REÇU DE PAIEMENT",
    titleAlt: "Payment Receipt",
    receiptNumber: "Numéro de Reçu",
    studentDetails: "Détails de l'Élève",
    studentId: "Matricule",
    studentName: "Nom de l'Élève",
    grade: "Niveau",
    schoolYear: "Année Scolaire",
    paymentDetails: "Détails du Paiement",
    paymentMethod: "Mode de Paiement",
    transactionRef: "Référence Transaction",
    paymentDate: "Date du Paiement",
    recordedBy: "Enregistré par",
    payerDetails: "Détails du Payeur",
    payerName: "Nom",
    payerRelation: "Relation",
    payerPhone: "Téléphone",
    previousBalance: "Solde Précédent",
    amountPaid: "Montant Payé",
    newBalance: "Nouveau Solde",
    tuitionFee: "Scolarité Totale",
    cash: "Espèces",
    orangeMoney: "Orange Money",
    treasurerSignature: "Le Comptable / Secrétaire",
    payerSignature: "Le Payeur",
    printedOn: "Imprimé le",
    page: "Page",
    paymentHistory: "Historique des Paiements",
    historyReceipt: "Reçu №",
    historyDate: "Date",
    historyAmount: "Montant",
    historyMethod: "Mode",
    club: "Club",
    totalPaid: "Total Payé",
  },
}

export function PaymentReceiptDocument({ data, language = "fr" }: PaymentReceiptDocumentProps) {
  const t = labels[language]
  const studentName = `${data.studentFirstName} ${data.studentLastName}`
  const previousBalance = data.tuitionFee && data.totalPaidBefore
    ? data.tuitionFee - data.totalPaidBefore
    : 0
  const isClubPayment = data.paymentType === "club"

  return (
    <Document>
      <Page size="A4" style={receiptStyles.page}>
        {/* School Letterhead - Compact */}
        <View style={receiptStyles.letterhead}>
          <Image src={letterheadBase64} style={receiptStyles.letterheadImage} />
        </View>

        {/* Header: Title + Receipt Number with gold accent bar */}
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

        {/* Two-column layout: Student Details | Payment Details */}
        <View style={receiptStyles.twoColumnRow}>
          {/* Left column: Student Details */}
          <View style={receiptStyles.column}>
            <View style={receiptStyles.infoCard}>
              <Text style={receiptStyles.cardTitle}>{t.studentDetails}</Text>
              <View style={receiptStyles.detailsGrid}>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.studentId}</Text>
                  <Text style={receiptStyles.detailValueBold}>{data.studentNumber}</Text>
                </View>
                <View style={receiptStyles.detailRow}>
                  <Text style={receiptStyles.detailLabel}>{t.studentName}</Text>
                  <Text style={receiptStyles.detailValueBold}>{studentName}</Text>
                </View>
                {data.gradeName && (
                  <View style={receiptStyles.detailRow}>
                    <Text style={receiptStyles.detailLabel}>{t.grade}</Text>
                    <Text style={receiptStyles.detailValue}>{data.gradeName}</Text>
                  </View>
                )}
                {data.schoolYearName && (
                  <View style={receiptStyles.detailRow}>
                    <Text style={receiptStyles.detailLabel}>{t.schoolYear}</Text>
                    <Text style={receiptStyles.detailValue}>{data.schoolYearName}</Text>
                  </View>
                )}
                {data.clubName && (
                  <View style={receiptStyles.detailRow}>
                    <Text style={receiptStyles.detailLabel}>{t.club}</Text>
                    <Text style={receiptStyles.detailValue}>{data.clubName}</Text>
                  </View>
                )}
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
                {data.method === "orange_money" && data.transactionRef && (
                  <View style={receiptStyles.detailRow}>
                    <Text style={receiptStyles.detailLabel}>{t.transactionRef}</Text>
                    <Text style={receiptStyles.detailValue}>{data.transactionRef}</Text>
                  </View>
                )}
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

        {/* Payer Details - ultra compact single row */}
        {data.payer && (
          <View style={receiptStyles.payerSection}>
            <View style={receiptStyles.infoCard}>
              <Text style={receiptStyles.cardTitle}>{t.payerDetails}</Text>
              <View style={receiptStyles.payerRow}>
                <View style={receiptStyles.payerItem}>
                  <Text style={receiptStyles.payerLabel}>{t.payerName}:</Text>
                  <Text style={receiptStyles.payerValue}>{data.payer.name}</Text>
                </View>
                <View style={receiptStyles.payerItem}>
                  <Text style={receiptStyles.payerLabel}>{t.payerRelation}:</Text>
                  <Text style={receiptStyles.payerValue}>
                    {getPayerTypeLabel(data.payer.type, language)}
                  </Text>
                </View>
                <View style={receiptStyles.payerItem}>
                  <Text style={receiptStyles.payerLabel}>{t.payerPhone}:</Text>
                  <Text style={receiptStyles.payerValue}>{data.payer.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Payment History Table - Editorial style */}
        {data.paymentHistory && data.paymentHistory.length > 0 && (
          <View style={receiptStyles.historySection}>
            <Text style={receiptStyles.historyTitle}>{t.paymentHistory}</Text>
            <View style={receiptStyles.historyTable}>
              {/* Table Header */}
              <View style={receiptStyles.historyHeaderRow}>
                <Text style={[receiptStyles.historyHeaderCell, receiptStyles.historyColReceipt]}>
                  {t.historyReceipt}
                </Text>
                <Text style={[receiptStyles.historyHeaderCell, receiptStyles.historyColDate]}>
                  {t.historyDate}
                </Text>
                <Text style={[receiptStyles.historyHeaderCell, receiptStyles.historyColAmount]}>
                  {t.historyAmount}
                </Text>
                <Text style={[receiptStyles.historyHeaderCell, receiptStyles.historyColMethod]}>
                  {t.historyMethod}
                </Text>
              </View>

              {/* Table Rows */}
              {data.paymentHistory.map((item, index) => {
                const isCurrent = item.receiptNumber === data.receiptNumber
                const rowStyle = isCurrent ? receiptStyles.historyRowCurrent : receiptStyles.historyRow
                const textStyle = isCurrent ? receiptStyles.historyCellBold : receiptStyles.historyCell

                return (
                  <View key={index} style={rowStyle}>
                    <Text style={[textStyle, receiptStyles.historyColReceipt]}>
                      {item.receiptNumber}
                    </Text>
                    <Text style={[textStyle, receiptStyles.historyColDate]}>
                      {formatDate(item.recordedAt, language)}
                    </Text>
                    <Text style={[textStyle, receiptStyles.historyColAmount]}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text style={[textStyle, receiptStyles.historyColMethod]}>
                      {item.method === "cash" ? t.cash : "OM"}
                    </Text>
                  </View>
                )
              })}

              {/* Total Row */}
              {data.paymentHistory.length > 1 && (
                <View style={receiptStyles.historyRowCurrent}>
                  <Text style={[receiptStyles.historyCellBold, receiptStyles.historyColReceipt]}>
                    {t.totalPaid}
                  </Text>
                  <Text style={[receiptStyles.historyCellBold, receiptStyles.historyColDate]}></Text>
                  <Text style={[receiptStyles.historyCellBold, receiptStyles.historyColAmount]}>
                    {formatCurrency(
                      data.paymentHistory.reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </Text>
                  <Text style={[receiptStyles.historyCellBold, receiptStyles.historyColMethod]}></Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Financial Summary - Only for tuition payments */}
        {!isClubPayment && data.tuitionFee && (
          <View style={receiptStyles.financialSection}>
          <View style={receiptStyles.financialGrid}>
            <View style={receiptStyles.financialItem}>
              <Text style={receiptStyles.financialLabel}>{t.tuitionFee}</Text>
              <Text style={receiptStyles.financialValue}>{formatCurrency(data.tuitionFee)}</Text>
            </View>
            <View style={receiptStyles.financialItem}>
              <Text style={receiptStyles.financialLabel}>{t.previousBalance}</Text>
              <Text style={receiptStyles.financialValue}>{formatCurrency(previousBalance)}</Text>
            </View>
            <View style={receiptStyles.financialItem}>
              <Text style={receiptStyles.financialLabel}>{t.newBalance}</Text>
              <Text style={receiptStyles.financialValue}>{formatCurrency(data.remainingAfter ?? 0)}</Text>
            </View>
          </View>
          <View style={receiptStyles.amountPaidRow}>
            <Text style={receiptStyles.amountPaidLabel}>{t.amountPaid}</Text>
            <Text style={receiptStyles.amountPaidValue}>{formatCurrency(data.amount)}</Text>
          </View>
          </View>
        )}

        {/* Signatures - Compact */}
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

        {/* Footer - Minimal */}
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
