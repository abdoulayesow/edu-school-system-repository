"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import Link from "next/link"

interface Enrollment {
  id: string
  enrollmentNumber: string
  firstName: string
  lastName: string
  status: string
  createdAt: string
  grade: {
    name: string
    level: number
  }
  totalPaid: number
  tuitionFee: number
}

export default function EnrollmentsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const response = await fetch("/api/enrollments")
        if (!response.ok) {
          throw new Error("Failed to fetch enrollments")
        }
        const data = await response.json()
        setEnrollments(data)
      } catch (err) {
        console.error("Error fetching enrollments:", err)
        setError("Failed to load enrollments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  const getPaymentStatus = (enrollment: Enrollment) => {
    if (enrollment.status === "draft") return "pending"
    if (enrollment.totalPaid >= enrollment.tuitionFee) return "paid"
    if (enrollment.totalPaid > 0) return "pending"
    return "overdue"
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">{t.enrollments.paid}</Badge>
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">{t.enrollments.pendingPayment}</Badge>
      case "overdue":
        return <Badge variant="destructive">{t.enrollments.overdue}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      `${enrollment.firstName} ${enrollment.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.enrollmentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.enrollments.title}</h1>
        <p className="text-muted-foreground">{t.enrollments.subtitle}</p>
      </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{t.enrollments.allStudents}</CardTitle>
                <CardDescription>{enrollments.length} {t.common.students}</CardDescription>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/enrollments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.enrollments.newEnrollment}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.enrollments.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.enrollments.studentId}</TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.enrollments.enrollmentDate}</TableHead>
                      <TableHead>{t.enrollments.paymentStatus}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No enrollments found matching your search" : "No enrollments yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.enrollmentNumber}</TableCell>
                          <TableCell>{enrollment.firstName} {enrollment.lastName}</TableCell>
                          <TableCell>{enrollment.grade?.name}</TableCell>
                          <TableCell>{new Date(enrollment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getPaymentBadge(getPaymentStatus(enrollment))}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/enrollments/${enrollment.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                {t.common.view}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </PageContainer>
  )
}
