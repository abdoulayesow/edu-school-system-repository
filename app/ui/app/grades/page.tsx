"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, TrendingUp, TrendingDown, Trophy, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"

interface Student {
  id: string
  name: string
  grade: number | null
  previousGrade: number | null
  status: "saved" | "pending" | "synced"
}

export default function GradesPage() {
  const { t } = useI18n()
  const [pendingChanges, setPendingChanges] = useState(3)
  const [selectedClass, setSelectedClass] = useState("6eme-A")
  const [selectedSubject, setSelectedSubject] = useState("mathematiques")
  const [selectedTerm, setSelectedTerm] = useState("trimestre-1")

  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Diallo Mamadou", grade: 16, previousGrade: 14, status: "synced" },
    { id: "2", name: "Camara Aissatou", grade: 18, previousGrade: 17, status: "synced" },
    { id: "3", name: "Bah Fatoumata", grade: 15, previousGrade: 16, status: "pending" },
    { id: "4", name: "Sow Ibrahim", grade: 12, previousGrade: 11, status: "synced" },
    { id: "5", name: "Keita Mariama", grade: 17, previousGrade: 15, status: "synced" },
    { id: "6", name: "Barry Mohamed", grade: 14, previousGrade: 14, status: "pending" },
    { id: "7", name: "Diaby Hawa", grade: 19, previousGrade: 18, status: "synced" },
    { id: "8", name: "Touré Amadou", grade: 11, previousGrade: 13, status: "pending" },
  ])

  const classAverage = students.reduce((sum, s) => sum + (s.grade || 0), 0) / students.length
  const topStudents = [...students].sort((a, b) => (b.grade || 0) - (a.grade || 0)).slice(0, 3)
  const needsAttention = students.filter((s) => (s.grade || 0) < 10)

  const handleGradeChange = (studentId: string, newGrade: string) => {
    const gradeValue = newGrade === "" ? null : Number.parseFloat(newGrade)
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, grade: gradeValue, status: "pending" as const } : s)),
    )
    setPendingChanges((prev) => prev + 1)
  }

  const handleSaveAll = () => {
    // Simulate saving grades
    setStudents((prev) => prev.map((s) => ({ ...s, status: "synced" as const })))
    setPendingChanges(0)
  }

  const getTrendIcon = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null
    if (current > previous) return <TrendingUp className="size-3 text-success" />
    if (current < previous) return <TrendingDown className="size-3 text-destructive" />
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.grades.title}</h1>
            <p className="text-muted-foreground">{interpolate(t.grades.subtitle, { teacherName: "Amara", subjectName: t.grades.subjects.mathematics })}</p>
          </div>
          <Button onClick={handleSaveAll} disabled={pendingChanges === 0}>
            <Save className="size-4 mr-2" />
            {interpolate(t.grades.saveChanges, { count: pendingChanges })}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="class">{t.common.level}</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="class">
                      <SelectValue placeholder={t.grades.selectClass} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6eme-A">6ème A</SelectItem>
                      <SelectItem value="6eme-B">6ème B</SelectItem>
                      <SelectItem value="5eme-A">5ème A</SelectItem>
                      <SelectItem value="5eme-B">5ème B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.grades.subject}</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder={t.grades.selectSubject} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematiques">{t.grades.subjects.mathematics}</SelectItem>
                      <SelectItem value="francais">{t.grades.subjects.french}</SelectItem>
                      <SelectItem value="anglais">{t.grades.subjects.english}</SelectItem>
                      <SelectItem value="sciences">{t.grades.subjects.sciences}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">{t.grades.period}</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger id="term">
                      <SelectValue placeholder={t.grades.selectPeriod} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trimestre-1">{t.grades.terms.term1}</SelectItem>
                      <SelectItem value="trimestre-2">{t.grades.terms.term2}</SelectItem>
                      <SelectItem value="trimestre-3">{t.grades.terms.term3}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Performance Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.grades.classAverage}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{classAverage.toFixed(1)}/20</div>
                <p className="text-xs text-muted-foreground mt-1">{interpolate(t.grades.onNStudents, { count: students.length })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="size-4 text-accent" />
                  {t.grades.top3Students}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topStudents.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {index + 1}. {student.name.split(" ")[0]}
                      </span>
                      <Badge variant="outline" className="text-success border-success">
                        {student.grade}/20
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  {t.grades.needsAttention}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{needsAttention.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{t.grades.studentsBelow10}</p>
              </CardContent>
            </Card>
          </div>

          {pendingChanges > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-warning" />
                  <span className="font-medium text-warning">{interpolate(t.grades.pendingChanges, { count: pendingChanges })}</span>
                  <span className="text-muted-foreground">
                    {t.grades.clickToSave}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Entry Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.grades.gradeEntry}</CardTitle>
              <CardDescription>
                {t.grades.gradeEntryDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.common.student}</TableHead>
                    <TableHead className="text-center">{t.grades.previousGrade}</TableHead>
                    <TableHead className="text-center">{t.grades.currentGrade}</TableHead>
                    <TableHead className="text-center">{t.grades.trend}</TableHead>
                    <TableHead className="text-center">{t.common.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        {student.previousGrade ? (
                          <span className="text-muted-foreground">{student.previousGrade}/20</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={student.grade ?? ""}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          className="w-20 mx-auto text-center"
                          placeholder="0-20"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(student.grade, student.previousGrade)}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.status === "synced" && (
                          <Badge variant="outline" className="text-success border-success">
                            <CheckCircle2 className="size-3 mr-1" />
                            {t.grades.synced}
                          </Badge>
                        )}
                        {student.status === "pending" && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <Clock className="size-3 mr-1" />
                            {t.grades.pending}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}