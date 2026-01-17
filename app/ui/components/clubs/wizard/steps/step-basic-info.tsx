"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Sparkles, Trophy, Palette, Music, BookOpen, Code, Microscope } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { WizardStepProps, CategoryOption } from "../types"
import { useClubCategories } from "@/lib/hooks/use-api"

// Category icon mapping based on common category names
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase()
  if (name.includes("sport")) return Trophy
  if (name.includes("art")) return Palette
  if (name.includes("music")) return Music
  if (name.includes("academic") || name.includes("study")) return BookOpen
  if (name.includes("tech") || name.includes("coding")) return Code
  if (name.includes("science")) return Microscope
  return Sparkles // Default icon
}

export function StepBasicInfo({ data, updateData, errors }: WizardStepProps) {
  const { t, locale } = useI18n()
  const { data: categories = [], isLoading } = useClubCategories("active")

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Club Name */}
      <div className="space-y-2">
        <Label htmlFor="clubName" className="text-sm font-semibold">
          {t.clubWizard.clubName} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clubName"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder={t.clubWizard.clubNamePlaceholder}
          className={cn(
            "h-12 text-base",
            errors.name && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{String(t[errors.name as keyof typeof t])}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          {t.clubWizard.clubDescription}
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Enter a brief description of the club..."
          className="min-h-[100px] text-base resize-none"
          rows={4}
        />
      </div>

      {/* Category Selection - Animated Cards */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          {t.clubWizard.category} <span className="text-red-500">*</span>
        </Label>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No categories available. Please create categories first.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name)
              const isSelected = data.categoryId === category.id

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => updateData({ categoryId: category.id })}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg",
                    "animate-fade-in-up",
                    index === 0 && "stagger-1",
                    index === 1 && "stagger-2",
                    index === 2 && "stagger-3",
                    index === 3 && "stagger-4",
                    index === 4 && "stagger-5",
                    index === 5 && "stagger-6",
                    isSelected
                      ? "border-gspn-gold-500 bg-gspn-gold-50 dark:bg-gspn-gold-500/20 shadow-md"
                      : "border-border hover:border-gspn-gold-300"
                  )}
                >
                  {/* Category Icon */}
                  <div className="flex justify-center mb-2">
                    <Icon className="h-8 w-8 text-gspn-gold-600 dark:text-gspn-gold-400" />
                  </div>

                  {/* Category Name */}
                  <div className="font-semibold text-sm text-center">
                    {locale === "fr" ? category.nameFr : category.name}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-gspn-gold-600 dark:text-gspn-gold-400 animate-scale-in" />
                  )}
                </button>
              )
            })}
          </div>
        )}
        {errors.categoryId && (
          <p className="text-sm text-red-500 mt-2">
            {String(t[errors.categoryId as keyof typeof t])}
          </p>
        )}
      </div>
    </div>
  )
}
