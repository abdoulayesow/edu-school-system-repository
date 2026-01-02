"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface DataPaginationProps {
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  onPrevPage: () => void
  onNextPage: () => void
  className?: string
}

export function DataPagination({
  pagination,
  onPrevPage,
  onNextPage,
  className,
}: DataPaginationProps) {
  const { t } = useI18n()

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  if (totalPages <= 1) return null

  const pageText = t.common.pagination.pageOf
    .replace("{current}", String(currentPage))
    .replace("{total}", String(totalPages))
    .replace("{count}", String(pagination.total))

  return (
    <div className={cn("flex items-center justify-between mt-4", className)}>
      <p className="text-sm text-muted-foreground">{pageText}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={pagination.offset === 0}
          className="bg-transparent"
        >
          <ChevronLeft className="size-4 mr-1" />
          {t.common.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!pagination.hasMore}
          className="bg-transparent"
        >
          {t.common.next}
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
