"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import Link from "next/link"

export default function EnrollmentsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  const students = [
    { id: "STU001", name: "Fatoumata Diallo", grade: "10ème", enrollDate: "2024-09-01", paymentStatus: "paid" },
    { id: "STU002", name: "Mamadou Sylla", grade: "11ème", enrollDate: "2024-09-01", paymentStatus: "pending" },
    { id: "STU003", name: "Aminata Touré", grade: "9ème", enrollDate: "2024-09-01", paymentStatus: "paid" },
    { id: "STU004", name: "Oumar Keita", grade: "12ème", enrollDate: "2024-09-01", paymentStatus: "overdue" },
    { id: "STU005", name: "Aissata Conte", grade: "10ème", enrollDate: "2024-09-01", paymentStatus: "paid" },
    { id: "STU006", name: "Ibrahim Bah", grade: "11ème", enrollDate: "2024-09-01", paymentStatus: "pending" },
    { id: "STU007", name: "Mariama Camara", grade: "9ème", enrollDate: "2024-09-01", paymentStatus: "paid" },
    { id: "STU008", name: "Alseny Sow", grade: "10ème", enrollDate: "2024-09-01", paymentStatus: "paid" },
  ]

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

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.enrollments.title}</h1>
          <p className="text-muted-foreground">{t.enrollments.subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{t.enrollments.allStudents}</CardTitle>
                <CardDescription>615 {t.common.students}</CardDescription>
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
                  {students
                    .filter(
                      (student) =>
                        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.id.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.enrollDate}</TableCell>
                        <TableCell>{getPaymentBadge(student.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            {t.common.view}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
