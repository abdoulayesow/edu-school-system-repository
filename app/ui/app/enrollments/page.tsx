"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Upload } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function EnrollmentsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [openNewEnrollment, setOpenNewEnrollment] = useState(false)

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
              <Dialog open={openNewEnrollment} onOpenChange={setOpenNewEnrollment}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.enrollments.newEnrollment}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t.enrollments.newStudentEnrollment}</DialogTitle>
                    <DialogDescription>
                      {t.enrollments.fillStudentInfo}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">{t.enrollments.personalInfo}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t.enrollments.firstName} *</Label>
                          <Input id="firstName" placeholder={t.enrollments.firstNamePlaceholder} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t.enrollments.lastName} *</Label>
                          <Input id="lastName" placeholder={t.enrollments.lastNamePlaceholder} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dob">{t.enrollments.dateOfBirth} *</Label>
                          <Input id="dob" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">{t.enrollments.gender} *</Label>
                          <Select>
                            <SelectTrigger id="gender">
                              <SelectValue placeholder={t.enrollments.selectGender} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t.enrollments.male}</SelectItem>
                              <SelectItem value="female">{t.enrollments.female}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">{t.enrollments.academicInfo}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="grade">{t.common.level} *</Label>
                          <Select>
                            <SelectTrigger id="grade">
                              <SelectValue placeholder={t.enrollments.selectLevel} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">{t.levels["6eme"]}</SelectItem>
                              <SelectItem value="7">7ème</SelectItem>
                              <SelectItem value="8">8ème</SelectItem>
                              <SelectItem value="9">9ème</SelectItem>
                              <SelectItem value="10">10ème</SelectItem>
                              <SelectItem value="11">11ème</SelectItem>
                              <SelectItem value="12">12ème</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="enrollDate">{t.enrollments.enrollmentDate} *</Label>
                          <Input id="enrollDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">{t.enrollments.guardianInfo}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardianName">{t.enrollments.guardianName} *</Label>
                          <Input id="guardianName" placeholder={t.enrollments.guardianNamePlaceholder} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianPhone">{t.enrollments.phone} *</Label>
                          <Input id="guardianPhone" type="tel" placeholder="+224 XXX XX XX XX" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardianEmail">{t.enrollments.email} ({t.common.optional})</Label>
                        <Input id="guardianEmail" type="email" placeholder={t.enrollments.emailPlaceholder} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">{t.enrollments.documents}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="birthCertificate">{t.enrollments.birthCertificate} *</Label>
                        <div className="flex items-center gap-2">
                          <Input id="birthCertificate" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                          <Button variant="outline" size="icon" className="bg-transparent shrink-0">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.enrollments.fileUploadHint}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setOpenNewEnrollment(false)} className="bg-transparent">
                        {t.common.cancel}
                      </Button>
                      <Button onClick={() => setOpenNewEnrollment(false)}>{t.enrollments.createEnrollment}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
