/**
 * Student Payment Summary PDF Template
 *
 * Generates a comprehensive payment summary showing all payment history,
 * balance information, and payment schedules for a student.
 */

import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { colors } from "./styles"
import { letterheadBase64 } from "./letterhead-base64"

interface PaymentHistoryItem {
  receiptNumber: string
  amount: number
  recordedAt: string
  method: string
  paymentType: "tuition" | "club"
  clubName?: string
}

interface PaymentSchedule {
  scheduleNumber: number
  amount: number
  months: string[]
  dueDate: string
  isPaid: boolean
  paidAmount: number
}

interface StudentPaymentSummaryData {
  // Student info
  studentNumber: string
  studentFirstName: string
  studentLastName: string
  gradeName?: string
  schoolYearName?: string

  // Balance info (tuition)
  tuitionFee?: number
  totalPaid: number
  remainingBalance?: number
  paymentPercentage?: number

  // Payment summaries
  tuitionPaid: number
  clubPaid: number
  cashTotal: number
  omTotal: number
  paymentCount: number

  // Payment history (all payments)
  payments: PaymentHistoryItem[]

  // Payment schedules
  schedules?: PaymentSchedule[]
}

interface StudentPaymentSummaryDocumentProps {
  data: StudentPaymentSummaryData
  language?: "en" | "fr"
}

// Styles for summary document
const summaryStyles = StyleSheet.create({
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
  dateBlock: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  // Student info card
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
  detailsGrid: {
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 1.5,
    alignItems: "flex-start",
  },
  detailLabel: {
    width: 75,
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
  // Balance summary section
  balanceSection: {
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 3,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 8,
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  balanceValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  balanceValueLarge: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  // Payment history table
  historySection: {
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  historyTable: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#000000",
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
  historyRowAlt: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 6,
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
    color: colors.text,
  },
  historyColDate: { width: "20%" },
  historyColReceipt: { width: "20%" },
  historyColType: { width: "20%" },
  historyColAmount: { width: "20%", textAlign: "right" },
  historyColMethod: { width: "20%", textAlign: "center" },
  // Summary totals row
  totalRow: {
    flexDirection: "row",
    backgroundColor: colors.text,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  totalCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  // Payment schedules section
  schedulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  scheduleCard: {
    width: "31%",
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  scheduleCardPaid: {
    width: "31%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 3,
    backgroundColor: "#f0fdf4",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scheduleNumber: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  scheduleBadge: {
    fontSize: 6,
    paddingVertical: 1,
    paddingHorizontal: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  scheduleBadgePaid: {
    fontSize: 6,
    paddingVertical: 1,
    paddingHorizontal: 4,
    backgroundColor: "#10b981",
    color: colors.white,
    borderRadius: 2,
  },
  scheduleAmount: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 2,
  },
  scheduleDetails: {
    fontSize: 6.5,
    color: colors.textLight,
  },
  // Statistics section
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  statLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
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

// Format date short
function formatDateShort(date: Date | string | undefined, language: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Labels in both languages
const labels = {
  en: {
    title: "PAYMENT SUMMARY",
    titleAlt: "Relevé des Paiements",
    generatedOn: "Generated on",
    studentDetails: "Student Details",
    studentId: "Student ID",
    studentName: "Student Name",
    grade: "Grade / Level",
    schoolYear: "School Year",
    balanceSummary: "Balance Summary",
    totalTuition: "Total Tuition",
    totalPaid: "Total Paid",
    remainingBalance: "Remaining Balance",
    paymentProgress: "Payment Progress",
    paymentHistory: "Payment History",
    date: "Date",
    receiptNo: "Receipt №",
    type: "Type",
    amount: "Amount",
    method: "Method",
    tuition: "Tuition",
    club: "Club",
    cash: "Cash",
    orangeMoney: "OM",
    totalPayments: "Total Payments",
    paymentSchedules: "Payment Schedules",
    schedule: "Schedule",
    paid: "Paid",
    pending: "Pending",
    dueDate: "Due",
    summaryStatistics: "Summary Statistics",
    cashPayments: "Cash Payments",
    omPayments: "Orange Money Payments",
    tuitionPayments: "Tuition Payments",
    clubPayments: "Club Payments",
    totalTransactions: "Total Transactions",
    printedOn: "Printed on",
    page: "Page",
  },
  fr: {
    title: "RELEVÉ DES PAIEMENTS",
    titleAlt: "Payment Summary",
    generatedOn: "Généré le",
    studentDetails: "Détails de l'Élève",
    studentId: "Matricule",
    studentName: "Nom de l'Élève",
    grade: "Niveau",
    schoolYear: "Année Scolaire",
    balanceSummary: "Résumé du Solde",
    totalTuition: "Scolarité Totale",
    totalPaid: "Total Payé",
    remainingBalance: "Solde Restant",
    paymentProgress: "Progression",
    paymentHistory: "Historique des Paiements",
    date: "Date",
    receiptNo: "Reçu №",
    type: "Type",
    amount: "Montant",
    method: "Mode",
    tuition: "Scolarité",
    club: "Club",
    cash: "Espèces",
    orangeMoney: "OM",
    totalPayments: "Total des Paiements",
    paymentSchedules: "Échéancier de Paiement",
    schedule: "Tranche",
    paid: "Payé",
    pending: "En attente",
    dueDate: "Échéance",
    summaryStatistics: "Statistiques Résumées",
    cashPayments: "Paiements Espèces",
    omPayments: "Paiements Orange Money",
    tuitionPayments: "Paiements Scolarité",
    clubPayments: "Paiements Club",
    totalTransactions: "Total Transactions",
    printedOn: "Imprimé le",
    page: "Page",
  },
}

export function StudentPaymentSummaryDocument({
  data,
  language = "fr",
}: StudentPaymentSummaryDocumentProps) {
  const t = labels[language]
  const studentName = `${data.studentFirstName} ${data.studentLastName}`

  return (
    <Document>
      <Page size="A4" style={summaryStyles.page}>
        {/* School Letterhead */}
        <View style={summaryStyles.letterhead}>
          <Image src={letterheadBase64} style={summaryStyles.letterheadImage} />
        </View>

        {/* Header: Title + Generated Date */}
        <View style={summaryStyles.headerRow}>
          <View style={summaryStyles.titleBlock}>
            <Text style={summaryStyles.title}>{t.title}</Text>
            <Text style={summaryStyles.titleAlt}>{t.titleAlt}</Text>
          </View>
          <View style={summaryStyles.dateBlock}>
            <Text style={summaryStyles.dateLabel}>{t.generatedOn}</Text>
            <Text style={summaryStyles.dateValue}>{formatDateShort(new Date(), language)}</Text>
          </View>
        </View>

        {/* Student Information Card */}
        <View style={summaryStyles.infoCard}>
          <Text style={summaryStyles.cardTitle}>{t.studentDetails}</Text>
          <View style={summaryStyles.detailsGrid}>
            <View style={summaryStyles.detailRow}>
              <Text style={summaryStyles.detailLabel}>{t.studentId}</Text>
              <Text style={summaryStyles.detailValueBold}>{data.studentNumber}</Text>
            </View>
            <View style={summaryStyles.detailRow}>
              <Text style={summaryStyles.detailLabel}>{t.studentName}</Text>
              <Text style={summaryStyles.detailValueBold}>{studentName}</Text>
            </View>
            {data.gradeName && (
              <View style={summaryStyles.detailRow}>
                <Text style={summaryStyles.detailLabel}>{t.grade}</Text>
                <Text style={summaryStyles.detailValue}>{data.gradeName}</Text>
              </View>
            )}
            {data.schoolYearName && (
              <View style={summaryStyles.detailRow}>
                <Text style={summaryStyles.detailLabel}>{t.schoolYear}</Text>
                <Text style={summaryStyles.detailValue}>{data.schoolYearName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance Summary Section (if tuition data available) */}
        {data.tuitionFee !== undefined && data.remainingBalance !== undefined && (
          <View style={summaryStyles.balanceSection}>
            <View style={summaryStyles.balanceGrid}>
              <View style={summaryStyles.balanceItem}>
                <Text style={summaryStyles.balanceLabel}>{t.totalTuition}</Text>
                <Text style={summaryStyles.balanceValue}>{formatCurrency(data.tuitionFee)}</Text>
              </View>
              <View style={summaryStyles.balanceItem}>
                <Text style={summaryStyles.balanceLabel}>{t.totalPaid}</Text>
                <Text style={summaryStyles.balanceValue}>
                  {formatCurrency(data.tuitionPaid)}
                </Text>
              </View>
              <View style={summaryStyles.balanceItem}>
                <Text style={summaryStyles.balanceLabel}>{t.remainingBalance}</Text>
                <Text style={summaryStyles.balanceValueLarge}>
                  {formatCurrency(data.remainingBalance)}
                </Text>
              </View>
              {data.paymentPercentage !== undefined && (
                <View style={summaryStyles.balanceItem}>
                  <Text style={summaryStyles.balanceLabel}>{t.paymentProgress}</Text>
                  <Text style={summaryStyles.balanceValue}>
                    {data.paymentPercentage.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Payment History Table */}
        <View style={summaryStyles.historySection}>
          <Text style={summaryStyles.sectionTitle}>{t.paymentHistory}</Text>
          {data.payments.length === 0 ? (
            <View style={summaryStyles.infoCard}>
              <Text style={{ fontSize: 8, color: colors.textLight, textAlign: "center" }}>
                {language === "fr" ? "Aucun paiement enregistré" : "No payments recorded"}
              </Text>
            </View>
          ) : (
            <View style={summaryStyles.historyTable}>
              {/* Table Header */}
              <View style={summaryStyles.historyHeaderRow}>
                <Text style={[summaryStyles.historyHeaderCell, summaryStyles.historyColDate]}>
                  {t.date}
                </Text>
                <Text style={[summaryStyles.historyHeaderCell, summaryStyles.historyColReceipt]}>
                  {t.receiptNo}
                </Text>
                <Text style={[summaryStyles.historyHeaderCell, summaryStyles.historyColType]}>
                  {t.type}
                </Text>
                <Text style={[summaryStyles.historyHeaderCell, summaryStyles.historyColAmount]}>
                  {t.amount}
                </Text>
                <Text style={[summaryStyles.historyHeaderCell, summaryStyles.historyColMethod]}>
                  {t.method}
                </Text>
              </View>

              {/* Table Rows */}
              {data.payments.map((payment, index) => {
                const rowStyle = index % 2 === 0 ? summaryStyles.historyRow : summaryStyles.historyRowAlt

                return (
                  <View key={index} style={rowStyle}>
                    <Text style={[summaryStyles.historyCell, summaryStyles.historyColDate]}>
                      {formatDateShort(payment.recordedAt, language)}
                    </Text>
                    <Text style={[summaryStyles.historyCell, summaryStyles.historyColReceipt]}>
                      {payment.receiptNumber}
                    </Text>
                    <Text style={[summaryStyles.historyCell, summaryStyles.historyColType]}>
                      {payment.paymentType === "tuition" ? t.tuition : (payment.clubName || t.club)}
                    </Text>
                    <Text style={[summaryStyles.historyCellBold, summaryStyles.historyColAmount]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[summaryStyles.historyCell, summaryStyles.historyColMethod]}>
                      {payment.method === "cash" ? t.cash : t.orangeMoney}
                    </Text>
                  </View>
                )
              })}

              {/* Total Row */}
              <View style={summaryStyles.totalRow}>
                <Text style={[summaryStyles.totalCell, summaryStyles.historyColDate]}></Text>
                <Text style={[summaryStyles.totalCell, summaryStyles.historyColReceipt]}></Text>
                <Text style={[summaryStyles.totalCell, summaryStyles.historyColType]}>
                  {t.totalPayments}
                </Text>
                <Text style={[summaryStyles.totalCell, summaryStyles.historyColAmount]}>
                  {formatCurrency(data.totalPaid)}
                </Text>
                <Text style={[summaryStyles.totalCell, summaryStyles.historyColMethod]}></Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Schedules (if available) */}
        {data.schedules && data.schedules.length > 0 && (
          <View style={summaryStyles.historySection}>
            <Text style={summaryStyles.sectionTitle}>{t.paymentSchedules}</Text>
            <View style={summaryStyles.schedulesGrid}>
              {data.schedules.map((schedule, index) => (
                <View
                  key={index}
                  style={schedule.isPaid ? summaryStyles.scheduleCardPaid : summaryStyles.scheduleCard}
                >
                  <View style={summaryStyles.scheduleHeader}>
                    <Text style={summaryStyles.scheduleNumber}>
                      {t.schedule} {schedule.scheduleNumber}
                    </Text>
                    <Text style={schedule.isPaid ? summaryStyles.scheduleBadgePaid : summaryStyles.scheduleBadge}>
                      {schedule.isPaid ? t.paid : t.pending}
                    </Text>
                  </View>
                  <Text style={summaryStyles.scheduleAmount}>{formatCurrency(schedule.amount)}</Text>
                  <Text style={summaryStyles.scheduleDetails}>
                    {schedule.months.join(", ")}
                  </Text>
                  <Text style={summaryStyles.scheduleDetails}>
                    {t.dueDate}: {formatDateShort(schedule.dueDate, language)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary Statistics */}
        <View style={summaryStyles.historySection}>
          <Text style={summaryStyles.sectionTitle}>{t.summaryStatistics}</Text>
          <View style={summaryStyles.statsGrid}>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.cashPayments}</Text>
              <Text style={summaryStyles.statValue}>{formatCurrency(data.cashTotal)}</Text>
            </View>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.omPayments}</Text>
              <Text style={summaryStyles.statValue}>{formatCurrency(data.omTotal)}</Text>
            </View>
          </View>
          <View style={summaryStyles.statsGrid}>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.tuitionPayments}</Text>
              <Text style={summaryStyles.statValue}>{formatCurrency(data.tuitionPaid)}</Text>
            </View>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.clubPayments}</Text>
              <Text style={summaryStyles.statValue}>{formatCurrency(data.clubPaid)}</Text>
            </View>
          </View>
          <View style={summaryStyles.statsGrid}>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.totalTransactions}</Text>
              <Text style={summaryStyles.statValue}>{data.paymentCount}</Text>
            </View>
            <View style={summaryStyles.statCard}>
              <Text style={summaryStyles.statLabel}>{t.totalPaid}</Text>
              <Text style={summaryStyles.statValue}>{formatCurrency(data.totalPaid)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={summaryStyles.footer}>
          <Text style={summaryStyles.footerText}>
            {t.printedOn}: {formatDate(new Date(), language)}
          </Text>
          <Text style={summaryStyles.footerText}>{t.page} 1/1</Text>
        </View>
      </Page>
    </Document>
  )
}
