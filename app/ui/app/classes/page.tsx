"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, BookOpen, User, MapPin, Plus, Download, Edit } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"

interface ScheduleEntry {
  time: string
  subject: string
  teacher: string
  room: string
  class: string
}

interface ClassInfo {
  name: string
  level: string
  students: number
  teacher: string
}

export default function ClassesPage() {
  const { t } = useI18n()
  const [selectedClass, setSelectedClass] = useState("6eme-a")
  const [selectedDay, setSelectedDay] = useState("lundi")

  const classes: ClassInfo[] = [
    { name: "6ème A", level: "6ème", students: 38, teacher: "M. Diallo" },
    { name: "6ème B", level: "6ème", students: 35, teacher: "Mme Camara" },
    { name: "5ème A", level: "5ème", students: 40, teacher: "M. Barry" },
    { name: "5ème B", level: "5ème", students: 37, teacher: "Mme Sow" },
    { name: "4ème A", level: "4ème", students: 42, teacher: "M. Keita" },
  ]

  const schedule: Record<string, ScheduleEntry[]> = {
    lundi: [
      { time: "08:00 - 09:00", subject: t.grades.subjects.mathematics, teacher: "M. Diallo", room: "Salle 201", class: "6ème A" },
      { time: "09:00 - 10:00", subject: t.grades.subjects.french, teacher: "Mme Camara", room: "Salle 102", class: "6ème A" },
      { time: "10:30 - 11:30", subject: t.grades.subjects.sciences, teacher: "M. Barry", room: "Lab 1", class: "6ème A" },
      { time: "11:30 - 12:30", subject: "Histoire-Géo", teacher: "Mme Sow", room: "Salle 105", class: "6ème A" },
      { time: "14:00 - 15:00", subject: t.grades.subjects.english, teacher: "M. Keita", room: "Salle 203", class: "6ème A" },
      { time: "15:00 - 16:00", subject: "Sport", teacher: "M. Touré", room: "Gymnase", class: "6ème A" },
    ],
    mardi: [
      { time: "08:00 - 09:00", subject: t.grades.subjects.french, teacher: "Mme Camara", room: "Salle 102", class: "6ème A" },
      { time: "09:00 - 10:00", subject: t.grades.subjects.mathematics, teacher: "M. Diallo", room: "Salle 201", class: "6ème A" },
      { time: "10:30 - 11:30", subject: t.grades.subjects.english, teacher: "M. Keita", room: "Salle 203", class: "6ème A" },
      { time: "11:30 - 12:30", subject: t.grades.subjects.sciences, teacher: "M. Barry", room: "Lab 1", class: "6ème A" },
      { time: "14:00 - 15:00", subject: "Arts", teacher: "Mme Diallo", room: "Atelier", class: "6ème A" },
      { time: "15:00 - 16:00", subject: "Informatique", teacher: "M. Sow", room: "Salle Info", class: "6ème A" },
    ],
    mercredi: [
      { time: "08:00 - 09:00", subject: t.grades.subjects.mathematics, teacher: "M. Diallo", room: "Salle 201", class: "6ème A" },
      { time: "09:00 - 10:00", subject: "Histoire-Géo", teacher: "Mme Sow", room: "Salle 105", class: "6ème A" },
      { time: "10:30 - 11:30", subject: t.grades.subjects.sciences, teacher: "M. Barry", room: "Lab 1", class: "6ème A" },
      { time: "11:30 - 12:30", subject: t.grades.subjects.french, teacher: "Mme Camara", room: "Salle 102", class: "6ème A" },
    ],
  }

  const currentSchedule = schedule[selectedDay] || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.classes.title}</h1>
              <p className="text-sm text-muted-foreground">{t.classes.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="size-4 mr-2" />
                {t.classes.exportPdf}
              </Button>
              <Button>
                <Plus className="size-4 mr-2" />
                {t.classes.addCourse}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Class List Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.classes.classes}</CardTitle>
                <CardDescription>{t.grades.selectClass}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {classes.map((classInfo) => (
                  <button
                    key={classInfo.name}
                    onClick={() => setSelectedClass(classInfo.name.toLowerCase().replace(" ", "-"))}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedClass === classInfo.name.toLowerCase().replace(" ", "-")
                        ? "bg-primary/10 border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{classInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{classInfo.teacher}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {classInfo.students}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.classes.statistics}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.classes.totalClasses}</span>
                  <span className="text-xl font-bold">{classes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.classes.totalStudents}</span>
                  <span className="text-xl font-bold">{classes.reduce((sum, c) => sum + c.students, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.classes.coursesToday}</span>
                  <span className="text-xl font-bold text-primary">24</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule View */}
          <div className="lg:col-span-5 space-y-4">
            {/* Day Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Calendar className="size-5 text-muted-foreground" />
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.classes.selectDay} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lundi">{t.classes.days.monday}</SelectItem>
                      <SelectItem value="mardi">{t.classes.days.tuesday}</SelectItem>
                      <SelectItem value="mercredi">{t.classes.days.wednesday}</SelectItem>
                      <SelectItem value="jeudi">{t.classes.days.thursday}</SelectItem>
                      <SelectItem value="vendredi">{t.classes.days.friday}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Grid */}
            <Card>
              <CardHeader>
                <CardTitle>{interpolate(t.classes.scheduleForDay, { day: t.classes.days[selectedDay as keyof typeof t.classes.days] })}</CardTitle>
                <CardDescription>6ème A - M. Diallo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentSchedule.length > 0 ? (
                  currentSchedule.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg bg-muted">
                        <Clock className="size-4 text-muted-foreground mb-1" />
                        <span className="text-xs font-medium">{entry.time}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              <BookOpen className="size-4 text-primary" />
                              {entry.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="size-3" />
                              {entry.teacher}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <Edit className="size-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="size-3 mr-1" />
                            {entry.room}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.classes.noCoursesForDay}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}