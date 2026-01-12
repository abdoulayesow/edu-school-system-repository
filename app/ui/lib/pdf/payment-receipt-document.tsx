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

// Styles for receipt document
const receiptStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.text,
  },
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
    marginBottom: 20,
  },
  receiptNumber: {
    textAlign: "center",
    marginBottom: 25,
  },
  receiptNumberLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 4,
  },
  receiptNumberValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 10,
    marginTop: 20,
  },
  detailsTable: {
    marginBottom: 15,
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
  amountSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  amountLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  amountValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  amountPaid: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountPaidLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  amountPaidValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
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
  methodBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "4 8",
    borderRadius: 4,
    backgroundColor: "#e8f5e9",
  },
  methodBadgeText: {
    fontSize: 10,
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

        {/* Document Title */}
        <Text style={receiptStyles.title}>{t.title}</Text>
        <Text style={receiptStyles.titleAlt}>{t.titleAlt}</Text>

        {/* Receipt Number */}
        <View style={receiptStyles.receiptNumber}>
          <Text style={receiptStyles.receiptNumberLabel}>{t.receiptNumber}</Text>
          <Text style={receiptStyles.receiptNumberValue}>{data.receiptNumber}</Text>
        </View>

        {/* Student Details */}
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

        {/* Payment Details */}
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

        {/* Payer Details */}
        {data.payer && (
          <>
            <Text style={receiptStyles.sectionTitle}>{t.payerDetails}</Text>
            <View style={receiptStyles.detailsTable}>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>{t.payerName}</Text>
                <Text style={receiptStyles.detailValue}>{data.payer.name}</Text>
              </View>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>{t.payerRelation}</Text>
                <Text style={receiptStyles.detailValue}>
                  {getPayerTypeLabel(data.payer.type, language)}
                </Text>
              </View>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>{t.payerPhone}</Text>
                <Text style={receiptStyles.detailValue}>{data.payer.phone}</Text>
              </View>
            </View>
          </>
        )}

        {/* Amount Section */}
        <View style={receiptStyles.amountSection}>
          <View style={receiptStyles.amountRow}>
            <Text style={receiptStyles.amountLabel}>{t.tuitionFee}</Text>
            <Text style={receiptStyles.amountValue}>{formatCurrency(data.tuitionFee)}</Text>
          </View>
          <View style={receiptStyles.amountRow}>
            <Text style={receiptStyles.amountLabel}>{t.previousBalance}</Text>
            <Text style={receiptStyles.amountValue}>{formatCurrency(previousBalance)}</Text>
          </View>
          <View style={receiptStyles.amountPaid}>
            <Text style={receiptStyles.amountPaidLabel}>{t.amountPaid}</Text>
            <Text style={receiptStyles.amountPaidValue}>{formatCurrency(data.amount)}</Text>
          </View>
          <View style={receiptStyles.amountRow}>
            <Text style={receiptStyles.amountLabel}>{t.newBalance}</Text>
            <Text style={receiptStyles.amountValue}>{formatCurrency(data.remainingAfter)}</Text>
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
