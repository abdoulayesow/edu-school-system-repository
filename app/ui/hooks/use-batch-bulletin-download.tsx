"use client"

import { useState, useCallback } from "react"
import { BulletinPDFDocument } from "@/components/bulletin-pdf"
import { pdf } from "@react-pdf/renderer"
import JSZip from "jszip"
import { useI18n } from "@/components/i18n-provider"

interface BatchDownloadStudent {
  id: string
  name: string
}

interface BatchDownloadOptions {
  trimesterId: string
  trimesterName: string
  gradeName: string
  students: BatchDownloadStudent[]
}

interface UseBatchBulletinDownloadReturn {
  isDownloading: boolean
  downloadProgress: string | null
  downloadAllBulletins: (options: BatchDownloadOptions) => Promise<{
    successCount: number
    errorCount: number
  }>
}

export function useBatchBulletinDownload(): UseBatchBulletinDownloadReturn {
  const { t, locale } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null)

  const downloadAllBulletins = useCallback(
    async ({
      trimesterId,
      trimesterName,
      gradeName,
      students,
    }: BatchDownloadOptions) => {
      setIsDownloading(true)
      setDownloadProgress(t.grading.generatingBulletins)

      const zip = new JSZip()
      let successCount = 0
      let errorCount = 0

      try {
        for (let i = 0; i < students.length; i++) {
          const student = students[i]
          setDownloadProgress(`${t.grading.generatingBulletins} (${i + 1}/${students.length})`)

          try {
            const bulletinRes = await fetch(
              `/api/evaluations/bulletin?studentProfileId=${student.id}&trimesterId=${trimesterId}`
            )

            if (!bulletinRes.ok) {
              errorCount++
              continue
            }

            const bulletinData = await bulletinRes.json()

            const pdfBlob = await pdf(
              <BulletinPDFDocument data={bulletinData} locale={locale as "fr" | "en"} />
            ).toBlob()

            const sanitizedName = student.name
              .replace(/[^a-zA-Z0-9\s]/g, "")
              .replace(/\s+/g, "_")
            zip.file(`bulletin_${sanitizedName}.pdf`, pdfBlob)
            successCount++
          } catch (err) {
            console.error(`Error generating bulletin for ${student.name}:`, err)
            errorCount++
          }
        }

        if (successCount > 0) {
          setDownloadProgress(t.grading.creatingArchive)
          const zipBlob = await zip.generateAsync({ type: "blob" })

          const url = URL.createObjectURL(zipBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `bulletins_${gradeName}_${trimesterName.replace(/\s+/g, "_")}.zip`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      } finally {
        setIsDownloading(false)
        setDownloadProgress(null)
      }

      return { successCount, errorCount }
    },
    [t, locale]
  )

  return { isDownloading, downloadProgress, downloadAllBulletins }
}
