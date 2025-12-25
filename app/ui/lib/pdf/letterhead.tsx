/**
 * School Letterhead Component for PDF Documents
 *
 * This component renders the school header with logo, name, and contact info.
 */

import React from "react"
import { View, Text, Image } from "@react-pdf/renderer"
import { styles } from "./styles"

interface LetterheadProps {
  schoolYear?: string
  documentDate?: string
}

export function Letterhead({ schoolYear, documentDate }: LetterheadProps) {
  const today = documentDate || new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <View style={styles.header}>
      {/* Left: Logo placeholder */}
      <View style={styles.logoContainer}>
        {/* Placeholder for school logo - would use Image component with actual logo */}
        <View style={{
          width: 70,
          height: 70,
          backgroundColor: "#1e40af",
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
          Groupe Scolaire Prive de Nongo
        </Text>
        <Text style={styles.schoolNameAr}>
          GSPN - Etablissement Prive d&apos;Enseignement
        </Text>
        <Text style={styles.schoolAddress}>
          Nongo, Commune de Ratoma, Conakry, Republique de Guinee
        </Text>
        <Text style={styles.schoolContact}>
          Tel: +224 621 00 00 00 | Email: contact@gspn-guinee.com
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
