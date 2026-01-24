/**
 * Expense Receipt (Reçu de Dépense) PDF Template
 *
 * Generates a formal expense receipt matching the school's official template.
 * Single-page layout with school letterhead, expense details, and signatures.
 */

import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { colors } from "./styles"
import { letterheadBase64 } from "./letterhead-base64"

export interface ExpenseReceiptData {
  // Expense info
  expenseId: string
  category: string
  description: string
  amount: number
  method: "cash" | "orange_money"
  date: string
  transactionRef?: string

  // Supplier info
  supplier?: {
    name: string
    phone?: string
  }
  billingReferenceId?: string

  // People involved
  requester: { name: string }
  initiatedBy?: { name: string }
  approver?: { name: string }
  approvedAt?: string
  createdAt: string

  // Status
  status: string
}

interface ExpenseReceiptDocumentProps {
  data: ExpenseReceiptData
  language?: "en" | "fr"
}

// Styles for expense receipt document - Similar to payment receipt
const expenseStyles = StyleSheet.create({
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
    borderBottomColor: colors.border,
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
  expenseIdBlock: {
    alignItems: "flex-end",
  },
  expenseIdLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  expenseIdValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  // Compact info card
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
  // Two-column layout
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
  // Description section
  descriptionSection: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  descriptionText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.text,
  },
  // Amount section - prominent
  amountSection: {
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 3,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amountLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  amountValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  // Payment method badge
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
  // Approval section
  approvalSection: {
    marginBottom: 8,
  },
  approvalRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 1,
  },
  approvalItem: {
    flexDirection: "row",
    flex: 1,
    alignItems: "baseline",
  },
  approvalLabel: {
    fontSize: 7.5,
    color: colors.textLight,
    marginRight: 3,
  },
  approvalValue: {
    fontSize: 8.5,
    flex: 1,
  },
  // Signatures
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
  // Footer
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

// Get category label
function getCategoryLabel(category: string, language: "en" | "fr"): string {
  const labels: Record<string, Record<string, string>> = {
    supplies: { en: "Supplies", fr: "Fournitures" },
    maintenance: { en: "Maintenance", fr: "Maintenance" },
    utilities: { en: "Utilities", fr: "Services publics" },
    salary: { en: "Salary", fr: "Salaire" },
    transport: { en: "Transport", fr: "Transport" },
    communication: { en: "Communication", fr: "Communication" },
    other: { en: "Other", fr: "Autre" },
  }
  return labels[category]?.[language] || category
}

// Labels in both languages
const labels = {
  en: {
    title: "EXPENSE RECEIPT",
    titleAlt: "Reçu de Dépense",
    expenseId: "Expense ID",
    expenseDetails: "Expense Details",
    category: "Category",
    expenseDate: "Expense Date",
    paymentMethod: "Payment Method",
    transactionRef: "Transaction Reference",
    supplier: "Supplier",
    billingRef: "Billing Reference",
    description: "Description",
    totalAmount: "Total Amount",
    approvalDetails: "Approval Details",
    requestedBy: "Requested By",
    initiatedBy: "Initiated By",
    approvedBy: "Approved By",
    requestedOn: "Requested On",
    approvedOn: "Approved On",
    requesterSignature: "Requester",
    approverSignature: "Approver / Treasurer",
    printedOn: "Printed on",
    page: "Page",
    cash: "Cash",
    orangeMoney: "Orange Money",
    status: "Status",
    pending: "Pending",
    approved: "Approved",
    paid: "Paid",
    rejected: "Rejected",
  },
  fr: {
    title: "REÇU DE DÉPENSE",
    titleAlt: "Expense Receipt",
    expenseId: "ID Dépense",
    expenseDetails: "Détails de la Dépense",
    category: "Catégorie",
    expenseDate: "Date de Dépense",
    paymentMethod: "Mode de Paiement",
    transactionRef: "Référence Transaction",
    supplier: "Fournisseur",
    billingRef: "Référence de Facture",
    description: "Description",
    totalAmount: "Montant Total",
    approvalDetails: "Détails d'Approbation",
    requestedBy: "Demandé par",
    initiatedBy: "Initié par",
    approvedBy: "Approuvé par",
    requestedOn: "Demandé le",
    approvedOn: "Approuvé le",
    requesterSignature: "Le Demandeur",
    approverSignature: "L'Approbateur / Comptable",
    printedOn: "Imprimé le",
    page: "Page",
    cash: "Espèces",
    orangeMoney: "Orange Money",
    status: "Statut",
    pending: "En attente",
    approved: "Approuvé",
    paid: "Payé",
    rejected: "Rejeté",
  },
}

export function ExpenseReceiptDocument({ data, language = "fr" }: ExpenseReceiptDocumentProps) {
  const t = labels[language]

  return (
    <Document>
      <Page size="A4" style={expenseStyles.page}>
        {/* School Letterhead */}
        <View style={expenseStyles.letterhead}>
          <Image src={letterheadBase64} style={expenseStyles.letterheadImage} />
        </View>

        {/* Header: Title + Expense ID */}
        <View style={expenseStyles.headerRow}>
          <View style={expenseStyles.titleBlock}>
            <Text style={expenseStyles.title}>{t.title}</Text>
            <Text style={expenseStyles.titleAlt}>{t.titleAlt}</Text>
          </View>
          <View style={expenseStyles.expenseIdBlock}>
            <Text style={expenseStyles.expenseIdLabel}>{t.expenseId}</Text>
            <Text style={expenseStyles.expenseIdValue}>{data.expenseId.substring(0, 8)}</Text>
          </View>
        </View>

        {/* Two-column layout: Expense Details | Payment Details */}
        <View style={expenseStyles.twoColumnRow}>
          {/* Left column: Expense Details */}
          <View style={expenseStyles.column}>
            <View style={expenseStyles.infoCard}>
              <Text style={expenseStyles.cardTitle}>{t.expenseDetails}</Text>
              <View style={expenseStyles.detailsGrid}>
                <View style={expenseStyles.detailRow}>
                  <Text style={expenseStyles.detailLabel}>{t.category}</Text>
                  <Text style={expenseStyles.detailValueBold}>
                    {getCategoryLabel(data.category, language)}
                  </Text>
                </View>
                <View style={expenseStyles.detailRow}>
                  <Text style={expenseStyles.detailLabel}>{t.expenseDate}</Text>
                  <Text style={expenseStyles.detailValue}>
                    {formatDate(data.date, language)}
                  </Text>
                </View>
                {data.supplier && (
                  <View style={expenseStyles.detailRow}>
                    <Text style={expenseStyles.detailLabel}>{t.supplier}</Text>
                    <Text style={expenseStyles.detailValue}>{data.supplier.name}</Text>
                  </View>
                )}
                {data.billingReferenceId && (
                  <View style={expenseStyles.detailRow}>
                    <Text style={expenseStyles.detailLabel}>{t.billingRef}</Text>
                    <Text style={expenseStyles.detailValue}>{data.billingReferenceId}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Right column: Payment Details */}
          <View style={expenseStyles.column}>
            <View style={expenseStyles.infoCard}>
              <Text style={expenseStyles.cardTitle}>{t.approvalDetails}</Text>
              <View style={expenseStyles.detailsGrid}>
                <View style={expenseStyles.detailRow}>
                  <Text style={expenseStyles.detailLabel}>{t.paymentMethod}</Text>
                  <View style={expenseStyles.methodBadge}>
                    <Text style={expenseStyles.methodBadgeText}>
                      {data.method === "cash" ? t.cash : t.orangeMoney}
                    </Text>
                  </View>
                </View>
                {data.method === "orange_money" && data.transactionRef && (
                  <View style={expenseStyles.detailRow}>
                    <Text style={expenseStyles.detailLabel}>{t.transactionRef}</Text>
                    <Text style={expenseStyles.detailValue}>{data.transactionRef}</Text>
                  </View>
                )}
                <View style={expenseStyles.detailRow}>
                  <Text style={expenseStyles.detailLabel}>{t.status}</Text>
                  <Text style={expenseStyles.detailValueBold}>
                    {t[data.status as keyof typeof t] || data.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={expenseStyles.descriptionSection}>
          <Text style={expenseStyles.descriptionTitle}>{t.description}</Text>
          <Text style={expenseStyles.descriptionText}>{data.description}</Text>
        </View>

        {/* Amount - Prominent */}
        <View style={expenseStyles.amountSection}>
          <View style={expenseStyles.amountRow}>
            <Text style={expenseStyles.amountLabel}>{t.totalAmount}</Text>
            <Text style={expenseStyles.amountValue}>{formatCurrency(data.amount)}</Text>
          </View>
        </View>

        {/* Approval Details */}
        <View style={expenseStyles.approvalSection}>
          <View style={expenseStyles.infoCard}>
            <Text style={expenseStyles.cardTitle}>{t.approvalDetails}</Text>
            <View style={expenseStyles.approvalRow}>
              <View style={expenseStyles.approvalItem}>
                <Text style={expenseStyles.approvalLabel}>{t.requestedBy}:</Text>
                <Text style={expenseStyles.approvalValue}>{data.requester.name}</Text>
              </View>
              {data.initiatedBy && (
                <View style={expenseStyles.approvalItem}>
                  <Text style={expenseStyles.approvalLabel}>{t.initiatedBy}:</Text>
                  <Text style={expenseStyles.approvalValue}>{data.initiatedBy.name}</Text>
                </View>
              )}
            </View>
            <View style={expenseStyles.approvalRow}>
              <View style={expenseStyles.approvalItem}>
                <Text style={expenseStyles.approvalLabel}>{t.requestedOn}:</Text>
                <Text style={expenseStyles.approvalValue}>
                  {formatDate(data.createdAt, language)}
                </Text>
              </View>
              {data.approver && data.approvedAt && (
                <View style={expenseStyles.approvalItem}>
                  <Text style={expenseStyles.approvalLabel}>{t.approvedBy}:</Text>
                  <Text style={expenseStyles.approvalValue}>
                    {data.approver.name} ({formatDate(data.approvedAt, language)})
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={expenseStyles.signatureSection}>
          <View style={expenseStyles.signatureBox}>
            <Text style={expenseStyles.signatureLabel}>{t.requesterSignature}</Text>
            <View style={expenseStyles.signatureLine}>
              <Text style={expenseStyles.signatureText}> </Text>
            </View>
          </View>
          <View style={expenseStyles.signatureBox}>
            <Text style={expenseStyles.signatureLabel}>{t.approverSignature}</Text>
            <View style={expenseStyles.signatureLine}>
              <Text style={expenseStyles.signatureText}> </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={expenseStyles.footer}>
          <Text style={expenseStyles.footerText}>
            {t.printedOn}: {formatDate(new Date(), language)}
          </Text>
          <Text style={expenseStyles.footerText}>{t.page} 1/1</Text>
        </View>
      </Page>
    </Document>
  )
}
