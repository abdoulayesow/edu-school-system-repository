import { Skeleton } from "@/components/ui/skeleton"
import { PageContainer } from "@/components/layout"

export default function Loading() {
  return (
    <PageContainer>
      {/* Page Header */}
      <div className="rounded-2xl border border-border bg-card shadow-sm mb-6">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gray-200" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border-2 border-border bg-card shadow-sm">
            <div className="px-6 py-4 border-b-2 border-border">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-20" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1 bg-gray-200" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-4 w-56 mb-4" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
