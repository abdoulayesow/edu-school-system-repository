"use client"

import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer"

// Register fonts for better rendering
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-400-normal.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-700-normal.woff", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1a365d",
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 4,
  },
  bulletinTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a365d",
    marginBottom: 4,
  },
  trimesterInfo: {
    fontSize: 12,
    textAlign: "center",
    color: "#4a5568",
    marginBottom: 20,
  },
  studentInfoSection: {
    flexDirection: "row",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f7fafc",
    borderRadius: 4,
  },
  studentInfoColumn: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 10,
    color: "#4a5568",
    marginBottom: 2,
  },
  summaryBox: {
    padding: 10,
    backgroundColor: "#ebf8ff",
    borderRadius: 4,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#4a5568",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2b6cb0",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a365d",
    padding: 8,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
    backgroundColor: "#f7fafc",
  },
  tableCell: {
    fontSize: 9,
    textAlign: "center",
  },
  tableCellLeft: {
    fontSize: 9,
    textAlign: "left",
  },
  subjectCol: { width: "25%" },
  coefCol: { width: "8%" },
  scoreCol: { width: "12%" },
  avgCol: { width: "12%" },
  remarkCol: { width: "19%" },
  statsSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f7fafc",
    borderRadius: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 8,
    color: "#718096",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  decisionSection: {
    marginTop: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: "#1a365d",
    borderRadius: 4,
    alignItems: "center",
  },
  decisionLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  decisionValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  decisionAdmis: {
    color: "#38a169",
  },
  decisionRattrapage: {
    color: "#d69e2e",
  },
  decisionRedouble: {
    color: "#e53e3e",
  },
  remarkSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f7fafc",
    borderRadius: 4,
  },
  remarkLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  remarkText: {
    fontSize: 9,
    color: "#4a5568",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#718096",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#4a5568",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#4a5568",
  },
})

interface SubjectEvaluation {
  id: string
  score: number
  maxScore: number
}

interface Subject {
  code: string
  nameFr: string
  nameEn: string
  coefficient: number
  average: number | null
  teacherRemark: string | null
  evaluations: {
    interrogations: SubjectEvaluation[]
    devoirsSurveilles: SubjectEvaluation[]
    compositions: SubjectEvaluation[]
  }
}

interface BulletinData {
  student: {
    firstName: string
    lastName: string
    studentNumber: string
    grade: { name: string } | null
  }
  trimester: {
    nameFr: string
    nameEn: string
    schoolYear: { name: string }
  }
  subjects: Subject[]
  totalCoefficient: number
  summary: {
    generalAverage: number | null
    rank: number | null
    totalStudents: number | null
    conduct: number | null
    decision: string
    decisionOverride: boolean
    generalRemark: string | null
    absences: number | null
    lates: number | null
  } | null
  classStats: {
    classAverage: number | null
    highestAverage: number | null
    lowestAverage: number | null
    passRate: number | null
  } | null
}

interface BulletinPDFProps {
  data: BulletinData
  locale: "fr" | "en"
}

const getDecisionStyle = (decision: string) => {
  switch (decision) {
    case "admis":
      return styles.decisionAdmis
    case "rattrapage":
      return styles.decisionRattrapage
    case "redouble":
      return styles.decisionRedouble
    default:
      return {}
  }
}

const getDecisionLabel = (decision: string, locale: "fr" | "en") => {
  const labels: Record<string, Record<string, string>> = {
    admis: { fr: "ADMIS", en: "PROMOTED" },
    rattrapage: { fr: "RATTRAPAGE", en: "REMEDIATION" },
    redouble: { fr: "REDOUBLE", en: "REPEAT YEAR" },
    pending: { fr: "EN ATTENTE", en: "PENDING" },
  }
  return labels[decision]?.[locale] || decision.toUpperCase()
}

const formatScores = (evaluations: SubjectEvaluation[]): string => {
  if (evaluations.length === 0) return "-"
  return evaluations.map((e) => `${e.score}/${e.maxScore}`).join(", ")
}

export const BulletinPDFDocument = ({ data, locale }: BulletinPDFProps) => {
  const t = {
    schoolName: "Groupe Scolaire Priv\u00e9 N'Diolou",
    title: locale === "fr" ? "BULLETIN DE NOTES" : "REPORT CARD",
    student: locale === "fr" ? "\u00c9l\u00e8ve" : "Student",
    class: locale === "fr" ? "Classe" : "Class",
    number: locale === "fr" ? "Matricule" : "Number",
    subject: locale === "fr" ? "Mati\u00e8re" : "Subject",
    coef: "Coef",
    interro: locale === "fr" ? "Interro" : "Quiz",
    ds: "DS",
    compo: locale === "fr" ? "Compo" : "Exam",
    average: locale === "fr" ? "Moyenne" : "Average",
    remark: locale === "fr" ? "Observation" : "Remark",
    generalAverage: locale === "fr" ? "Moyenne G\u00e9n\u00e9rale" : "General Average",
    rank: locale === "fr" ? "Rang" : "Rank",
    conduct: locale === "fr" ? "Conduite" : "Conduct",
    absences: locale === "fr" ? "Absences" : "Absences",
    lates: locale === "fr" ? "Retards" : "Lates",
    decision: locale === "fr" ? "D\u00e9cision" : "Decision",
    classAverage: locale === "fr" ? "Moy. Classe" : "Class Avg",
    highestAverage: locale === "fr" ? "Meilleure" : "Highest",
    lowestAverage: locale === "fr" ? "Plus Basse" : "Lowest",
    passRate: locale === "fr" ? "Taux R\u00e9ussite" : "Pass Rate",
    generalRemark: locale === "fr" ? "Appr\u00e9ciation G\u00e9n\u00e9rale" : "General Remark",
    parentSignature: locale === "fr" ? "Signature Parent" : "Parent Signature",
    teacherSignature: locale === "fr" ? "Professeur Principal" : "Head Teacher",
    directorSignature: locale === "fr" ? "Le Directeur" : "Director",
    printedOn: locale === "fr" ? "Imprim\u00e9 le" : "Printed on",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{t.schoolName}</Text>
            <Text style={{ fontSize: 8, color: "#718096" }}>
              {locale === "fr" ? "Excellence - Discipline - R\u00e9ussite" : "Excellence - Discipline - Success"}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.bulletinTitle}>{t.title}</Text>
        <Text style={styles.trimesterInfo}>
          {locale === "fr" ? data.trimester.nameFr : data.trimester.nameEn} -{" "}
          {data.trimester.schoolYear.name}
        </Text>

        {/* Student Info */}
        <View style={styles.studentInfoSection}>
          <View style={styles.studentInfoColumn}>
            <Text style={styles.studentName}>
              {data.student.lastName.toUpperCase()} {data.student.firstName}
            </Text>
            <Text style={styles.studentDetail}>
              {t.class}: {data.student.grade?.name || "-"}
            </Text>
            <Text style={styles.studentDetail}>
              {t.number}: {data.student.studentNumber}
            </Text>
          </View>
          {data.summary && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>{t.generalAverage}</Text>
              <Text style={styles.summaryValue}>
                {data.summary.generalAverage?.toFixed(2) || "-"}/20
              </Text>
            </View>
          )}
        </View>

        {/* Grades Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.subjectCol]}>{t.subject}</Text>
            <Text style={[styles.tableHeaderCell, styles.coefCol]}>{t.coef}</Text>
            <Text style={[styles.tableHeaderCell, styles.scoreCol]}>{t.interro}</Text>
            <Text style={[styles.tableHeaderCell, styles.scoreCol]}>{t.ds}</Text>
            <Text style={[styles.tableHeaderCell, styles.scoreCol]}>{t.compo}</Text>
            <Text style={[styles.tableHeaderCell, styles.avgCol]}>{t.average}</Text>
            <Text style={[styles.tableHeaderCell, styles.remarkCol]}>{t.remark}</Text>
          </View>
          {data.subjects.map((subject, index) => (
            <View key={subject.code} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCellLeft, styles.subjectCol]}>
                {locale === "fr" ? subject.nameFr : subject.nameEn}
              </Text>
              <Text style={[styles.tableCell, styles.coefCol]}>{subject.coefficient}</Text>
              <Text style={[styles.tableCell, styles.scoreCol]}>
                {formatScores(subject.evaluations.interrogations)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreCol]}>
                {formatScores(subject.evaluations.devoirsSurveilles)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreCol]}>
                {formatScores(subject.evaluations.compositions)}
              </Text>
              <Text style={[styles.tableCell, styles.avgCol, { fontWeight: "bold" }]}>
                {subject.average?.toFixed(2) || "-"}
              </Text>
              <Text style={[styles.tableCellLeft, styles.remarkCol, { fontSize: 7 }]}>
                {subject.teacherRemark || "-"}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        {data.summary && (
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.rank}</Text>
              <Text style={styles.statValue}>
                {data.summary.rank || "-"}/{data.summary.totalStudents || "-"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.conduct}</Text>
              <Text style={styles.statValue}>{data.summary.conduct?.toFixed(1) || "-"}/20</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.absences}</Text>
              <Text style={styles.statValue}>{data.summary.absences ?? "-"}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.lates}</Text>
              <Text style={styles.statValue}>{data.summary.lates ?? "-"}</Text>
            </View>
          </View>
        )}

        {/* Class Stats */}
        {data.classStats && (
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.classAverage}</Text>
              <Text style={styles.statValue}>{data.classStats.classAverage?.toFixed(2) || "-"}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.highestAverage}</Text>
              <Text style={[styles.statValue, { color: "#38a169" }]}>
                {data.classStats.highestAverage?.toFixed(2) || "-"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.lowestAverage}</Text>
              <Text style={[styles.statValue, { color: "#e53e3e" }]}>
                {data.classStats.lowestAverage?.toFixed(2) || "-"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.passRate}</Text>
              <Text style={styles.statValue}>{data.classStats.passRate?.toFixed(1) || 0}%</Text>
            </View>
          </View>
        )}

        {/* Decision */}
        {data.summary && (
          <View style={styles.decisionSection}>
            <Text style={styles.decisionLabel}>{t.decision}</Text>
            <Text style={[styles.decisionValue, getDecisionStyle(data.summary.decision)]}>
              {getDecisionLabel(data.summary.decision, locale)}
            </Text>
          </View>
        )}

        {/* General Remark */}
        {data.summary?.generalRemark && (
          <View style={styles.remarkSection}>
            <Text style={styles.remarkLabel}>{t.generalRemark}:</Text>
            <Text style={styles.remarkText}>{data.summary.generalRemark}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{t.parentSignature}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{t.teacherSignature}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{t.directorSignature}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.schoolName}</Text>
          <Text style={styles.footerText}>
            {t.printedOn}: {new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Function to generate and download PDF
export async function downloadBulletinPDF(data: BulletinData, locale: "fr" | "en") {
  const blob = await pdf(<BulletinPDFDocument data={data} locale={locale} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `bulletin_${data.student.lastName}_${data.student.firstName}_${data.trimester.schoolYear.name.replace("/", "-")}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
