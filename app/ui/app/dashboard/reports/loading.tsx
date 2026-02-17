import { Skeleton } from "@/components/ui/skeleton"
import { PageContainer } from "@/components/layout"

export default function Loading() {
  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="rounded-2xl border border-border bg-card shadow-sm mb-6">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gray-200" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Skeleton className="h-10 w-80" />
      </div>

      {/* Filter */}
      <div className="rounded-2xl border-2 border-border bg-card shadow-sm mb-6">
        <div className="px-6 py-4 border-b-2 border-border">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-4">
          <Skeleton className="h-10 w-[300px]" />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </PageContainer>
  )
}
