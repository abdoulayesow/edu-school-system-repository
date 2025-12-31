import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageContainer } from "@/components/layout"

export default function PaymentsLoading() {
  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
            <Skeleton className="h-9 w-[180px]" />
            <Skeleton className="h-9 w-[180px]" />
            <Skeleton className="h-9 w-[320px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
