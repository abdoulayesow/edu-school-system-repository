import {
  GraduationCap,
  Cpu,
  Trophy,
  Palette,
  Music,
  FlaskConical,
  Layers,
  type LucideIcon,
} from "lucide-react"

export interface CategoryConfig {
  icon: LucideIcon
  /** Subtle background tint for category differentiation */
  bgTint: string
  /** Text color for category badge */
  badgeText: string
  /** Background for category badge */
  badgeBg: string
}

// Category visual configuration based on slug/name patterns
// Uses GSPN brand colors with category-specific icons for differentiation
export const categoryConfigs: Record<string, CategoryConfig> = {
  // Academic Excellence
  academic: {
    icon: GraduationCap,
    bgTint: "bg-gspn-gold-50/50",
    badgeText: "text-gspn-maroon-700",
    badgeBg: "bg-gspn-maroon-50",
  },
  excellence: {
    icon: GraduationCap,
    bgTint: "bg-gspn-gold-50/50",
    badgeText: "text-gspn-maroon-700",
    badgeBg: "bg-gspn-maroon-50",
  },
  // Technology & Innovation
  technology: {
    icon: Cpu,
    bgTint: "bg-blue-50/50",
    badgeText: "text-blue-700",
    badgeBg: "bg-blue-50",
  },
  innovation: {
    icon: Cpu,
    bgTint: "bg-blue-50/50",
    badgeText: "text-blue-700",
    badgeBg: "bg-blue-50",
  },
  informatique: {
    icon: Cpu,
    bgTint: "bg-blue-50/50",
    badgeText: "text-blue-700",
    badgeBg: "bg-blue-50",
  },
  // Sports & Athletics
  sports: {
    icon: Trophy,
    bgTint: "bg-emerald-50/50",
    badgeText: "text-emerald-700",
    badgeBg: "bg-emerald-50",
  },
  athletisme: {
    icon: Trophy,
    bgTint: "bg-emerald-50/50",
    badgeText: "text-emerald-700",
    badgeBg: "bg-emerald-50",
  },
  // Arts & Creativity
  arts: {
    icon: Palette,
    bgTint: "bg-rose-50/50",
    badgeText: "text-rose-700",
    badgeBg: "bg-rose-50",
  },
  creativite: {
    icon: Palette,
    bgTint: "bg-rose-50/50",
    badgeText: "text-rose-700",
    badgeBg: "bg-rose-50",
  },
  // Music & Performance
  music: {
    icon: Music,
    bgTint: "bg-violet-50/50",
    badgeText: "text-violet-700",
    badgeBg: "bg-violet-50",
  },
  musique: {
    icon: Music,
    bgTint: "bg-violet-50/50",
    badgeText: "text-violet-700",
    badgeBg: "bg-violet-50",
  },
  spectacle: {
    icon: Music,
    bgTint: "bg-violet-50/50",
    badgeText: "text-violet-700",
    badgeBg: "bg-violet-50",
  },
  // Science & Discovery
  science: {
    icon: FlaskConical,
    bgTint: "bg-cyan-50/50",
    badgeText: "text-cyan-700",
    badgeBg: "bg-cyan-50",
  },
  decouverte: {
    icon: FlaskConical,
    bgTint: "bg-cyan-50/50",
    badgeText: "text-cyan-700",
    badgeBg: "bg-cyan-50",
  },
}

// Default config for unknown categories
export const defaultCategoryConfig: CategoryConfig = {
  icon: Layers,
  bgTint: "bg-gray-50/50",
  badgeText: "text-gray-700",
  badgeBg: "bg-gray-50",
}

/**
 * Get category configuration based on category name
 * Matches against slugified versions of common category keywords
 */
export function getCategoryConfig(categoryName: string | null | undefined): CategoryConfig {
  if (!categoryName) return defaultCategoryConfig

  // Normalize the category name for matching
  const normalized = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, " ") // Replace non-alphanumeric with spaces
    .trim()

  // Check for keyword matches
  for (const [keyword, config] of Object.entries(categoryConfigs)) {
    if (normalized.includes(keyword)) {
      return config
    }
  }

  return defaultCategoryConfig
}
