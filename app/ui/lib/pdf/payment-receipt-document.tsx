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
  gradeName: string
  schoolYearName: string

  // Balance info
  tuitionFee: number
  totalPaidBefore: number
  remainingAfter: number

  // Payer info
  payer?: PayerInfo
  notes?: string
}

interface PaymentReceiptDocumentProps {
  data: PaymentReceiptData
  language?: "en" | "fr"
}

// Styles for receipt document - Compact single-page layout
const receiptStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
  },
  letterhead: {
    marginBottom: 6,
  },
  letterheadImage: {
    width: "100%",
    maxHeight: 65,
    objectFit: "contain",
  },
  // Header row with title and receipt number side by side
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  titleAlt: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 1,
  },
  receiptNumberBlock: {
    alignItems: "flex-end",
  },
  receiptNumberLabel: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 2,
  },
  receiptNumberValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f0f4f8",
    borderRadius: 3,
  },
  // Two-column layout for student + payment details
  twoColumnRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsTable: {
    marginBottom: 0,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  detailLabel: {
    width: 70,
    fontSize: 8,
    color: colors.textLight,
  },
  detailValue: {
    flex: 1,
    fontSize: 9,
  },
  // Payer section - compact inline
  payerSection: {
    marginBottom: 8,
  },
  payerRow: {
    flexDirection: "row",
    paddingVertical: 2,
    gap: 16,
  },
  payerItem: {
    flexDirection: "row",
    flex: 1,
  },
  payerLabel: {
    fontSize: 8,
    color: colors.textLight,
    marginRight: 4,
  },
  payerValue: {
    fontSize: 9,
  },
  // Amount section - prominent but compact
  amountSection: {
    marginTop: 4,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountGrid: {
    flexDirection: "row",
    marginBottom: 6,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 1,
  },
  amountValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  amountPaid: {
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountPaidLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  amountPaidValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  // Signatures - compact
  signatureSection: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "42%",
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.text,
    paddingTop: 3,
  },
  signatureText: {
    fontSize: 7,
    color: colors.textLight,
    textAlign: "center",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: colors.textLight,
  },
  // Payment method badge
  methodBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    backgroundColor: "#e8f5e9",
  },
  methodBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#2e7d32",
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
  },
}

export function PaymentReceiptDocument({ data, language = "fr" }: PaymentReceiptDocumentProps) {
  const t = labels[language]
  const studentName = `${data.studentFirstName} ${data.studentLastName}`
  const previousBalance = data.tuitionFee - data.totalPaidBefore

  return (
    <Document>
      <Page size="A4" style={receiptStyles.page}>
        {/* School Letterhead */}
        <View style={receiptStyles.letterhead}>
          <Image src={letterheadBase64} style={receiptStyles.letterheadImage} />
        </View>

        {/* Header: Title + Receipt Number side by side */}
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
            <Text style={receiptStyles.sectionTitle}>{t.studentDetails}</Text>
            <View style={receiptStyles.detailsTable}>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>{t.studentId}</Text>
                <Text style={receiptStyles.detailValue}>{data.studentNumber}</Text>
              </View>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>{t.studentName}</Text>
                <Text style={receiptStyles.detailValue}>{studentName}</Text>
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

          {/* Right column: Payment Details */}
          <View style={receiptStyles.column}>
            <Text style={receiptStyles.sectionTitle}>{t.paymentDetails}</Text>
            <View style={receiptStyles.detailsTable}>
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

        {/* Payer Details - compact horizontal layout */}
        {data.payer && (
          <View style={receiptStyles.payerSection}>
            <Text style={receiptStyles.sectionTitle}>{t.payerDetails}</Text>
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
        )}

        {/* Amount Section - grid layout */}
        <View style={receiptStyles.amountSection}>
          <View style={receiptStyles.amountGrid}>
            <View style={receiptStyles.amountItem}>
              <Text style={receiptStyles.amountLabel}>{t.tuitionFee}</Text>
              <Text style={receiptStyles.amountValue}>{formatCurrency(data.tuitionFee)}</Text>
            </View>
            <View style={receiptStyles.amountItem}>
              <Text style={receiptStyles.amountLabel}>{t.previousBalance}</Text>
              <Text style={receiptStyles.amountValue}>{formatCurrency(previousBalance)}</Text>
            </View>
            <View style={receiptStyles.amountItem}>
              <Text style={receiptStyles.amountLabel}>{t.newBalance}</Text>
              <Text style={receiptStyles.amountValue}>{formatCurrency(data.remainingAfter)}</Text>
            </View>
          </View>
          <View style={receiptStyles.amountPaid}>
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
