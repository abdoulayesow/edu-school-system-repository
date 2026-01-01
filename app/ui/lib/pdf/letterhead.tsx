/**
 * School Letterhead Component for PDF Documents
 *
 * This component renders the school header with logo, name, and contact info.
 * Supports compact mode for single-page documents.
 */

import React from "react"
import { View, Text, Image } from "@react-pdf/renderer"
import { styles, colors } from "./styles"

interface LetterheadProps {
  schoolYear?: string
  documentDate?: string
  compact?: boolean
}

export function Letterhead({ schoolYear, documentDate, compact = false }: LetterheadProps) {
  const today = documentDate || new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  if (compact) {
    // Compact single-line letterhead
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
      }}>
        {/* Small logo */}
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: colors.primary,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        }}>
          <Text style={{ color: "white", fontSize: 12, fontFamily: "Helvetica-Bold" }}>
            GSPN
          </Text>
        </View>

        {/* School name and info inline */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.primary }}>
            Groupe Scolaire Privé N&apos;Diolou
          </Text>
          <Text style={{ fontSize: 8, color: colors.textLight }}>
            Quartier de Tata, Labe | groupescolaireprivendioloulabe@gmail.com
          </Text>
        </View>

        {/* Year badge */}
        {schoolYear && (
          <View style={{
            backgroundColor: colors.primary,
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 4,
          }}>
            <Text style={{ color: "white", fontSize: 9, fontFamily: "Helvetica-Bold" }}>
              {schoolYear}
            </Text>
          </View>
        )}
      </View>
    )
  }

  // Standard letterhead
  return (
    <View style={styles.header}>
      {/* Left: Logo */}
      <View style={styles.logoContainer}>
        <View style={{
          width: 70,
          height: 70,
          backgroundColor: colors.primary,
          borderRadius: 35,
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Text style={{ color: "white", fontSize: 20, fontFamily: "Helvetica-Bold" }}>
            GSPN
          </Text>
        </View>
      </View>

      {/* Center: School info */}
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>
          Groupe Scolaire Privé N&apos;Diolou
        </Text>
        <Text style={styles.schoolNameAr}>
          GSPN - Établissement Privé d&apos;Enseignement
        </Text>
        <Text style={styles.schoolAddress}>
          Quartier de Tata, Ville Labe - Guinee
        </Text>
        <Text style={styles.schoolContact}>
          Email: groupescolaireprivendioloulabe@gmail.com
        </Text>
      </View>

      {/* Right: Year badge and date */}
      <View style={styles.headerRight}>
        {schoolYear && (
          <View style={styles.yearBadge}>
            <Text>{schoolYear}</Text>
          </View>
        )}
        <Text style={{ fontSize: 9, marginTop: 8, color: "#6b7280" }}>
          {today}
        </Text>
      </View>
    </View>
  )
}
