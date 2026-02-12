import { CalendarCheck } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function AttendanceHeader() {
  const { t, locale } = useI18n()

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* GSPN Maroon accent bar */}
      <div className="h-1 bg-gradient-to-r from-gspn-maroon-500 via-gspn-maroon-600 to-gspn-maroon-500" />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          {/* Icon container with GSPN branding */}
          <div className="p-2.5 bg-gradient-to-br from-gspn-maroon-500/10 to-gspn-gold-500/5 rounded-xl border border-gspn-maroon-500/20">
            <CalendarCheck className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t.attendance.title}
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {locale === "fr" ? "Suivi de présence par classe" : "Attendance tracking by class"}
        </p>
      </div>
    </div>
  )
}
