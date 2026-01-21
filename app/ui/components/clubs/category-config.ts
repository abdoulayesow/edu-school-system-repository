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
  gradient: string
  gradientHover: string
  bgLight: string
  accent: string
  ring: string
  borderColor: string
}

// Category visual configuration based on slug/name patterns
export const categoryConfigs: Record<string, CategoryConfig> = {
  // Academic Excellence
  academic: {
    icon: GraduationCap,
    gradient: "from-amber-500 to-orange-600",
    gradientHover: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50",
    accent: "text-amber-700",
    ring: "ring-amber-200",
    borderColor: "border-amber-300",
  },
  excellence: {
    icon: GraduationCap,
    gradient: "from-amber-500 to-orange-600",
    gradientHover: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50",
    accent: "text-amber-700",
    ring: "ring-amber-200",
    borderColor: "border-amber-300",
  },
  // Technology & Innovation
  technology: {
    icon: Cpu,
    gradient: "from-blue-500 to-indigo-600",
    gradientHover: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50",
    accent: "text-blue-700",
    ring: "ring-blue-200",
    borderColor: "border-blue-300",
  },
  innovation: {
    icon: Cpu,
    gradient: "from-blue-500 to-indigo-600",
    gradientHover: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50",
    accent: "text-blue-700",
    ring: "ring-blue-200",
    borderColor: "border-blue-300",
  },
  informatique: {
    icon: Cpu,
    gradient: "from-blue-500 to-indigo-600",
    gradientHover: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50",
    accent: "text-blue-700",
    ring: "ring-blue-200",
    borderColor: "border-blue-300",
  },
  // Sports & Athletics
  sports: {
    icon: Trophy,
    gradient: "from-emerald-500 to-teal-600",
    gradientHover: "from-emerald-600 to-teal-700",
    bgLight: "bg-emerald-50",
    accent: "text-emerald-700",
    ring: "ring-emerald-200",
    borderColor: "border-emerald-300",
  },
  athletisme: {
    icon: Trophy,
    gradient: "from-emerald-500 to-teal-600",
    gradientHover: "from-emerald-600 to-teal-700",
    bgLight: "bg-emerald-50",
    accent: "text-emerald-700",
    ring: "ring-emerald-200",
    borderColor: "border-emerald-300",
  },
  // Arts & Creativity
  arts: {
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    gradientHover: "from-pink-600 to-rose-700",
    bgLight: "bg-pink-50",
    accent: "text-pink-700",
    ring: "ring-pink-200",
    borderColor: "border-pink-300",
  },
  creativite: {
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    gradientHover: "from-pink-600 to-rose-700",
    bgLight: "bg-pink-50",
    accent: "text-pink-700",
    ring: "ring-pink-200",
    borderColor: "border-pink-300",
  },
  // Music & Performance
  music: {
    icon: Music,
    gradient: "from-violet-500 to-purple-600",
    gradientHover: "from-violet-600 to-purple-700",
    bgLight: "bg-violet-50",
    accent: "text-violet-700",
    ring: "ring-violet-200",
    borderColor: "border-violet-300",
  },
  musique: {
    icon: Music,
    gradient: "from-violet-500 to-purple-600",
    gradientHover: "from-violet-600 to-purple-700",
    bgLight: "bg-violet-50",
    accent: "text-violet-700",
    ring: "ring-violet-200",
    borderColor: "border-violet-300",
  },
  spectacle: {
    icon: Music,
    gradient: "from-violet-500 to-purple-600",
    gradientHover: "from-violet-600 to-purple-700",
    bgLight: "bg-violet-50",
    accent: "text-violet-700",
    ring: "ring-violet-200",
    borderColor: "border-violet-300",
  },
  // Science & Discovery
  science: {
    icon: FlaskConical,
    gradient: "from-cyan-500 to-sky-600",
    gradientHover: "from-cyan-600 to-sky-700",
    bgLight: "bg-cyan-50",
    accent: "text-cyan-700",
    ring: "ring-cyan-200",
    borderColor: "border-cyan-300",
  },
  decouverte: {
    icon: FlaskConical,
    gradient: "from-cyan-500 to-sky-600",
    gradientHover: "from-cyan-600 to-sky-700",
    bgLight: "bg-cyan-50",
    accent: "text-cyan-700",
    ring: "ring-cyan-200",
    borderColor: "border-cyan-300",
  },
}

// Default config for unknown categories
export const defaultCategoryConfig: CategoryConfig = {
  icon: Layers,
  gradient: "from-gray-500 to-slate-600",
  gradientHover: "from-gray-600 to-slate-700",
  bgLight: "bg-gray-50",
  accent: "text-gray-700",
  ring: "ring-gray-200",
  borderColor: "border-gray-300",
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
