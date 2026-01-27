"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  Loader2,
  BanknoteIcon,
  Smartphone,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { formatDate } from "@/lib/utils"
import { getPaymentRowStatus } from "@/lib/status-helpers"
import { formatAmount } from "./utils"
import type { Payment } from "./types"

interface ValidationTabProps {
  payments: Payment[]
  isLoadingPayments: boolean
  reviewTypeFilter: string
  onReviewTypeFilterChange: (value: string) => void
}

export function ValidationTab({
  payments,
  isLoadingPayments,
  reviewTypeFilter,
  onReviewTypeFilterChange,
}: ValidationTabProps) {
  const { t, locale } = useI18n()

  // Filter payments for validation (reversed/failed)
  const pendingReviewItems = useMemo(() => {
    return payments.filter((payment) => {
      const needsReview = ["reversed", "failed"].includes(payment.status)
      if (!needsReview) return false

      if (reviewTypeFilter === "all") return true
      if (reviewTypeFilter === "reversed" && payment.status === "reversed") return true
      if (reviewTypeFilter === "failed" && payment.status === "failed") return true

      return false
    })
  }, [payments, reviewTypeFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.confirmed}
          </Badge>
        )
      case "reversed":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <BanknoteIcon className="h-3 w-3 mr-1" />
            Espèces
          </Badge>
        )
      case "orange_money":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <Smartphone className="h-3 w-3 mr-1" />
            Orange Money
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-maroon-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              <div>
                <CardTitle>{locale === "fr" ? "Validation" : "Validation"}</CardTitle>
                <CardDescription>
                  {isLoadingPayments
                    ? (locale === "fr" ? "Chargement..." : "Loading...")
                    : `${pendingReviewItems.length} ${t.accounting.itemsToReview}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={reviewTypeFilter} onValueChange={onReviewTypeFilterChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t.accounting.filterByType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allTypes}</SelectItem>
                  <SelectItem value="reversed">{locale === "fr" ? "Annulé" : "Reversed"}</SelectItem>
                  <SelectItem value="failed">{locale === "fr" ? "Échoué" : "Failed"}</SelectItem>
                </SelectContent>
              </Select>
              {reviewTypeFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReviewTypeFilterChange("all")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {t.common.reset}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingReviewItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
              <p>{t.accounting.noItemsToReview}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-amber-50 dark:bg-gspn-gold-950/20">
                  <TableRow>
                    <TableHead>{t.accounting.transactionId}</TableHead>
                    <TableHead>{t.common.student}</TableHead>
                    <TableHead className="text-right">{t.common.amount}</TableHead>
                    <TableHead>{t.accounting.method}</TableHead>
                    <TableHead>{t.common.date}</TableHead>
                    <TableHead>{t.common.status}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviewItems.map((payment) => (
                    <TableRow key={payment.id} status={getPaymentRowStatus(payment.status)}>
                      <TableCell className="font-medium font-mono text-sm">
                        {payment.receiptNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payment.enrollment?.student?.firstName ?? "N/A"} {payment.enrollment?.student?.lastName ?? ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.enrollment?.grade?.name ?? "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>
                        {formatDate(payment.recordedAt, locale)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === "reversed" && (
                          <span className="text-xs text-orange-600">Annulé</span>
                        )}
                        {payment.status === "failed" && (
                          <span className="text-xs text-destructive">Échoué</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
