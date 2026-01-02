"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
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
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  className?: string
}

export function DataPagination({
  pagination,
  onPrevPage,
  onNextPage,
  onPageChange,
  onLimitChange,
  className,
}: DataPaginationProps) {
  const { t } = useI18n()
  const [pageInput, setPageInput] = useState("")

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  if (totalPages <= 1 && !onLimitChange) return null

  const pageText = t.common.pagination.pageOf
    .replace("{current}", String(currentPage))
    .replace("{total}", String(totalPages))
    .replace("{count}", String(pagination.total))

  const handlePageJump = () => {
    const page = parseInt(pageInput)
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page)
      setPageInput("")
    }
  }

  const handleFirstPage = () => {
    if (onPageChange) {
      onPageChange(1)
    }
  }

  const handleLastPage = () => {
    if (onPageChange) {
      onPageChange(totalPages)
    }
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4", className)}>
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground whitespace-nowrap">{pageText}</p>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t.common.pagination.itemsPerPage || "Items per page:"}
            </span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onPageChange && totalPages > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              className="bg-transparent hidden sm:flex"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          </>
        )}

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

        {onPageChange && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePageJump()
                }
              }}
              placeholder={t.common.pagination.goToPage || "Go to..."}
              className="w-24 h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePageJump}
              disabled={!pageInput || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages}
              className="bg-transparent"
            >
              {t.common.pagination.go || "Go"}
            </Button>
          </div>
        )}

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

        {onPageChange && totalPages > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="bg-transparent hidden sm:flex"
          >
            <ChevronsRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
