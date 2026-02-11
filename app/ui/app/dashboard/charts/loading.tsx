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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gray-200" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-64 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
