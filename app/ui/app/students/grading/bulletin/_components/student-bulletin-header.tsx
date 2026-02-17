import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PermissionGuard } from "@/components/permission-guard"
import { useI18n } from "@/components/i18n-provider"
import {
  Loader2,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  Download,
} from "lucide-react"
import type { BulletinData } from "@/lib/types/grading"

interface StudentBulletinHeaderProps {
  bulletin: BulletinData
  locale: string
  downloadingPDF: boolean
  onDownloadPDF: () => void
}

export function StudentBulletinHeader({
  bulletin,
  locale,
  downloadingPDF,
  onDownloadPDF,
}: StudentBulletinHeaderProps) {
  const { t } = useI18n()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="size-20">
            <AvatarImage src={bulletin.student.photoUrl || undefined} />
            <AvatarFallback className="text-xl">
              {bulletin.student.firstName[0]}
              {bulletin.student.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {bulletin.student.lastName.toUpperCase()} {bulletin.student.firstName}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap className="size-4" />
                {bulletin.student.grade?.name}
              </span>
              <span className="flex items-center gap-1">
                <ClipboardCheck className="size-4" />
                {bulletin.student.studentNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {locale === "fr" ? bulletin.trimester.nameFr : bulletin.trimester.nameEn} -{" "}
                {bulletin.trimester.schoolYear.name}
              </span>
            </div>
          </div>

          {bulletin.summary && (
            <div className="text-right">
              <div className="text-4xl font-bold mb-1 text-primary">
                {bulletin.summary.generalAverage?.toFixed(2) || "-"}
                <span className="text-lg text-muted-foreground">/20</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t.grading.generalAverage}
              </div>
            </div>
          )}
        </div>

        {/* PDF Download Button */}
        <div className="mt-4 pt-4 border-t flex justify-end">
          <PermissionGuard resource="report_cards" action="export" inline>
            <Button
              onClick={onDownloadPDF}
              disabled={downloadingPDF}
              variant="outline"
            >
              {downloadingPDF ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {t.grading.downloadPDF}
            </Button>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  )
}
