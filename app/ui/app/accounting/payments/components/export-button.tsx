"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { ApiPayment } from "@/lib/hooks/use-api"

interface ExportButtonProps {
  payments: ApiPayment[]
  disabled?: boolean
  className?: string
}

export function ExportButton({ payments, disabled, className }: ExportButtonProps) {
  const { t } = useI18n()
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      // Create CSV content
      const headers = [
        "Receipt Number",
        "Student Name",
        "Type",
        "Amount",
        "Method",
        "Date",
        "Status",
        "Reference",
      ]

      const rows = payments.map((payment) => {
        const isClubPayment = payment.paymentType === "club"
        const firstName = isClubPayment
          ? payment.clubEnrollment?.student?.firstName || ""
          : payment.enrollment?.student?.firstName || ""
        const lastName = isClubPayment
          ? payment.clubEnrollment?.student?.lastName || ""
          : payment.enrollment?.student?.lastName || ""
        const studentName = `${firstName} ${lastName}`.trim()

        return [
          payment.receiptNumber,
          studentName,
          payment.paymentType === "club" ? "Club" : "Tuition",
          payment.amount.toString(),
          payment.method,
          new Date(payment.recordedAt).toLocaleDateString(),
          payment.status,
          payment.transactionRef || "",
        ]
      })

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n")

      // Create download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `payments-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    // For now, export as CSV (Excel can open CSV files)
    // In future, could use libraries like xlsx to create proper Excel files
    await exportToCSV()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting || payments.length === 0}
          className={cn(
            "group transition-all duration-200",
            "hover:shadow-md hover:border-primary/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          suppressHydrationWarning
        >
          {isExporting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              {t.accounting.exporting}
            </>
          ) : (
            <>
              <Download className="size-4 mr-2 group-hover:scale-110 transition-transform" />
              {t.accounting.export}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 animate-in fade-in-80 slide-in-from-top-2 duration-200"
      >
        <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
          {t.accounting.export}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={exportToCSV}
          className="cursor-pointer group"
        >
          <FileSpreadsheet className="size-4 mr-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          <span>{t.accounting.exportCSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={exportToExcel}
          className="cursor-pointer group"
        >
          <FileSpreadsheet className="size-4 mr-2 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>{t.accounting.exportExcel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          className="opacity-50"
        >
          <FileText className="size-4 mr-2 text-red-600 dark:text-red-400" />
          <span>{t.accounting.exportPDF}</span>
          <span className="ml-auto text-xs text-muted-foreground">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
