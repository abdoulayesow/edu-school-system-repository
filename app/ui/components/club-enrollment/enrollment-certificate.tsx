import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  Circle,
  G,
} from "@react-pdf/renderer"

// Register custom fonts using CDN URLs
Font.register({
  family: "Playfair",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.18/files/playfair-display-latin-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.18/files/playfair-display-latin-700-normal.woff",
      fontWeight: 700,
    },
  ],
})

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.0.18/files/montserrat-latin-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.0.18/files/montserrat-latin-500-normal.woff",
      fontWeight: 500,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.0.18/files/montserrat-latin-600-normal.woff",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.0.18/files/montserrat-latin-700-normal.woff",
      fontWeight: 700,
    },
  ],
})

// GSPN brand colors
const colors = {
  gold: "#D4A853",
  goldDark: "#B8941F",
  goldLight: "#F5E6C4",
  navy: "#1A2B4A",
  charcoal: "#2D3748",
  slate: "#4A5568",
  cream: "#FDF8F0",
  white: "#FFFFFF",
  accent: "#C17F24",
}

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.cream,
    padding: 0,
  },
  container: {
    flex: 1,
    padding: 40,
  },
  // Outer decorative border
  outerBorder: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 3,
    borderColor: colors.gold,
    borderStyle: "solid",
  },
  // Inner decorative border
  innerBorder: {
    position: "absolute",
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderWidth: 1,
    borderColor: colors.goldDark,
    borderStyle: "solid",
  },
  // Corner decorations container
  cornerTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  cornerTopRight: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  // Header section
  header: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  schoolName: {
    fontFamily: "Montserrat",
    fontSize: 12,
    fontWeight: 600,
    color: colors.navy,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  certificateTitle: {
    fontFamily: "Playfair",
    fontSize: 36,
    fontWeight: 700,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  certificateSubtitle: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: 500,
    color: colors.slate,
    letterSpacing: 6,
    textTransform: "uppercase",
    marginTop: 4,
  },
  // Divider line
  divider: {
    width: 120,
    height: 2,
    backgroundColor: colors.gold,
    marginVertical: 20,
    alignSelf: "center",
  },
  dividerThin: {
    width: 80,
    height: 1,
    backgroundColor: colors.goldDark,
    marginVertical: 12,
    alignSelf: "center",
    opacity: 0.5,
  },
  // Main content
  mainContent: {
    alignItems: "center",
    paddingHorizontal: 50,
  },
  presentedTo: {
    fontFamily: "Montserrat",
    fontSize: 11,
    color: colors.slate,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  studentName: {
    fontFamily: "Playfair",
    fontSize: 32,
    fontWeight: 700,
    color: colors.navy,
    marginBottom: 8,
    textAlign: "center",
  },
  studentGrade: {
    fontFamily: "Montserrat",
    fontSize: 12,
    color: colors.slate,
    marginBottom: 24,
  },
  enrollmentText: {
    fontFamily: "Montserrat",
    fontSize: 12,
    color: colors.charcoal,
    textAlign: "center",
    lineHeight: 1.8,
    marginBottom: 20,
  },
  clubNameContainer: {
    backgroundColor: colors.goldLight,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 16,
  },
  clubName: {
    fontFamily: "Playfair",
    fontSize: 22,
    fontWeight: 700,
    color: colors.navy,
    textAlign: "center",
  },
  categoryBadge: {
    fontFamily: "Montserrat",
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 6,
    textAlign: "center",
  },
  // Details section
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontFamily: "Montserrat",
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  detailValue: {
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: 600,
    color: colors.navy,
  },
  detailValueLarge: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: 700,
    color: colors.goldDark,
    letterSpacing: 1,
  },
  // Footer section
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    paddingHorizontal: 50,
    paddingBottom: 20,
  },
  signatureBlock: {
    alignItems: "center",
    width: 150,
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: colors.charcoal,
    marginBottom: 8,
  },
  signatureLabel: {
    fontFamily: "Montserrat",
    fontSize: 9,
    color: colors.slate,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateBlock: {
    alignItems: "center",
  },
  dateValue: {
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: 500,
    color: colors.navy,
    marginBottom: 4,
  },
  dateLabel: {
    fontFamily: "Montserrat",
    fontSize: 9,
    color: colors.slate,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Seal/badge
  sealContainer: {
    position: "absolute",
    bottom: 80,
    right: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  // Enrollment number
  enrollmentNumberContainer: {
    position: "absolute",
    bottom: 40,
    left: 60,
  },
  enrollmentNumberLabel: {
    fontFamily: "Montserrat",
    fontSize: 8,
    color: colors.slate,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  enrollmentNumber: {
    fontFamily: "Montserrat",
    fontSize: 12,
    fontWeight: 700,
    color: colors.gold,
    letterSpacing: 2,
  },
  // Watermark text
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontFamily: "Playfair",
    fontSize: 120,
    color: colors.goldLight,
    opacity: 0.15,
  },
})

// Corner decoration SVG component
function CornerDecoration({ rotation = 0 }: { rotation?: number }) {
  return (
    <Svg width={50} height={50} viewBox="0 0 50 50" style={{ transform: `rotate(${rotation}deg)` }}>
      <G fill={colors.gold}>
        <Path d="M0 0 L20 0 L20 3 L3 3 L3 20 L0 20 Z" />
        <Circle cx="8" cy="8" r="3" />
        <Path d="M15 0 L18 0 L18 8 L15 8 Z" opacity="0.5" />
        <Path d="M0 15 L8 15 L8 18 L0 18 Z" opacity="0.5" />
      </G>
    </Svg>
  )
}

// Official seal SVG component
function OfficialSeal() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      {/* Outer ring */}
      <Circle cx="40" cy="40" r="38" fill="none" stroke={colors.gold} strokeWidth="2" />
      <Circle cx="40" cy="40" r="35" fill="none" stroke={colors.gold} strokeWidth="1" />
      {/* Inner decorative ring */}
      <Circle cx="40" cy="40" r="30" fill={colors.goldLight} />
      <Circle cx="40" cy="40" r="28" fill="none" stroke={colors.goldDark} strokeWidth="0.5" />
      {/* Star pattern */}
      <Path
        d="M40 15 L43 30 L55 25 L47 35 L60 40 L47 45 L55 55 L43 50 L40 65 L37 50 L25 55 L33 45 L20 40 L33 35 L25 25 L37 30 Z"
        fill={colors.gold}
        opacity="0.8"
      />
      {/* Center circle */}
      <Circle cx="40" cy="40" r="12" fill={colors.navy} />
      {/* Small decorative star in center */}
      <Path
        d="M40 32 L41.5 38 L48 38 L43 42 L45 48 L40 45 L35 48 L37 42 L32 38 L38.5 38 Z"
        fill={colors.gold}
      />
    </Svg>
  )
}

interface EnrollmentCertificateProps {
  studentName: string
  studentGrade: string
  clubName: string
  clubNameFr?: string | null
  categoryName: string | null
  enrollmentNumber: string
  enrollmentDate: string
  locale?: string
}

export function EnrollmentCertificate({
  studentName,
  studentGrade,
  clubName,
  clubNameFr,
  categoryName,
  enrollmentNumber,
  enrollmentDate,
  locale = "en",
}: EnrollmentCertificateProps) {
  const isFrench = locale === "fr"
  const displayClubName = isFrench && clubNameFr ? clubNameFr : clubName

  // Format the date
  const formattedDate = new Date(enrollmentDate).toLocaleDateString(
    isFrench ? "fr-FR" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )

  const translations = {
    schoolName: "Groupe Scolaire Privé La Nation",
    certificateTitle: isFrench ? "Certificat" : "Certificate",
    certificateSubtitle: isFrench ? "d'Inscription au Club" : "of Club Enrollment",
    presentedTo: isFrench ? "Décerné à" : "Presented to",
    enrollmentText: isFrench
      ? "a été officiellement inscrit(e) au club suivant pour l'année scolaire en cours"
      : "has been officially enrolled in the following club for the current academic year",
    enrollmentNumber: isFrench ? "N° d'inscription" : "Enrollment No.",
    enrollmentDate: isFrench ? "Date d'inscription" : "Enrollment Date",
    administrator: isFrench ? "Administrateur" : "Administrator",
    principal: isFrench ? "Directeur" : "Principal",
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Decorative borders */}
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        {/* Corner decorations */}
        <View style={styles.cornerTopLeft}>
          <CornerDecoration rotation={0} />
        </View>
        <View style={styles.cornerTopRight}>
          <CornerDecoration rotation={90} />
        </View>
        <View style={styles.cornerBottomLeft}>
          <CornerDecoration rotation={270} />
        </View>
        <View style={styles.cornerBottomRight}>
          <CornerDecoration rotation={180} />
        </View>

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.schoolName}>{translations.schoolName}</Text>
            <Text style={styles.certificateTitle}>{translations.certificateTitle}</Text>
            <Text style={styles.certificateSubtitle}>{translations.certificateSubtitle}</Text>
          </View>

          <View style={styles.divider} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.presentedTo}>{translations.presentedTo}</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.studentGrade}>{studentGrade}</Text>

            <View style={styles.dividerThin} />

            <Text style={styles.enrollmentText}>{translations.enrollmentText}</Text>

            <View style={styles.clubNameContainer}>
              <Text style={styles.clubName}>{displayClubName}</Text>
              {categoryName && <Text style={styles.categoryBadge}>{categoryName}</Text>}
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{translations.enrollmentNumber}</Text>
              <Text style={styles.detailValueLarge}>{enrollmentNumber}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{translations.enrollmentDate}</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          {/* Footer with signatures */}
          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{translations.administrator}</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{translations.principal}</Text>
            </View>
          </View>
        </View>

        {/* Official Seal */}
        <View style={styles.sealContainer}>
          <OfficialSeal />
        </View>

        {/* Enrollment number in corner */}
        <View style={styles.enrollmentNumberContainer}>
          <Text style={styles.enrollmentNumberLabel}>REF</Text>
          <Text style={styles.enrollmentNumber}>{enrollmentNumber}</Text>
        </View>
      </Page>
    </Document>
  )
}
