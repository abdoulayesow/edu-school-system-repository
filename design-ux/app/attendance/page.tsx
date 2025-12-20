"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, BookOpen, Users } from "lucide-react"

export default function AttendancePage() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "excused">>({})

  const todayActivities = [
    { id: "act1", name: "English Class - Grade 10", time: "08:00 - 09:30", type: "curricular", enrolled: 28 },
    { id: "act2", name: "English Club", time: "14:00 - 15:30", type: "extracurricular", enrolled: 24 },
    { id: "act3", name: "English Class - Grade 11", time: "10:00 - 11:30", type: "curricular", enrolled: 26 },
  ]

  const students = [
    {
      id: "stu1",
      name: "Fatoumata Diallo",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatoumata",
      paymentStatus: "paid",
    },
    {
      id: "stu2",
      name: "Mamadou Sylla",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou",
      paymentStatus: "overdue",
    },
    {
      id: "stu3",
      name: "Aminata Touré",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata",
      paymentStatus: "paid",
    },
    {
      id: "stu4",
      name: "Oumar Keita",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar",
      paymentStatus: "paid",
    },
    {
      id: "stu5",
      name: "Aissata Conte",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aissata",
      paymentStatus: "overdue",
    },
    {
      id: "stu6",
      name: "Ibrahim Bah",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim",
      paymentStatus: "paid",
    },
  ]

  // Initialize all students as present by default
  const initializeAttendance = (activityId: string) => {
    const initial: Record<string, "present" | "absent" | "excused"> = {}
    students.forEach((student) => {
      initial[student.id] = "present"
    })
    setAttendance(initial)
    setSelectedActivity(activityId)
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId] || "present"
      let next: "present" | "absent" | "excused"
      if (current === "present") next = "absent"
      else if (current === "absent") next = "excused"
      else next = "present"
      return { ...prev, [studentId]: next }
    })
  }

  const getAttendanceIcon = (status: "present" | "absent" | "excused") => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-6 w-6 text-success" />
      case "absent":
        return <XCircle className="h-6 w-6 text-destructive" />
      case "excused":
        return <AlertCircle className="h-6 w-6 text-warning" />
    }
  }

  const getAttendanceLabel = (status: "present" | "absent" | "excused") => {
    switch (status) {
      case "present":
        return "Présent"
      case "absent":
        return "Absent"
      case "excused":
        return "Excusé"
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === "present").length
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length
  const excusedCount = Object.values(attendance).filter((s) => s === "excused").length

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-20">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Prise de Présence</h1>
          <p className="text-muted-foreground">Bienvenue, Amadou Diallo</p>
        </div>

        {!selectedActivity ? (
          /* Activity List View */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Activités d'Aujourd'hui</h2>
            {todayActivities.map((activity) => (
              <Card
                key={activity.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => initializeAttendance(activity.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {activity.type === "curricular" ? (
                        <div className="p-3 rounded-lg bg-primary/10">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-accent/10">
                          <Users className="h-6 w-6 text-accent" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{activity.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                          <Badge variant="outline" className="text-xs">
                            {activity.enrolled} étudiants
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button>Prendre Présence</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Attendance Taking View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{todayActivities.find((a) => a.id === selectedActivity)?.name || "Activity"}</CardTitle>
                    <CardDescription>Tapez sur un étudiant pour changer le statut de présence</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedActivity(null)} className="bg-transparent">
                    Retour
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Attendance Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{presentCount}</p>
                  <p className="text-sm text-muted-foreground">Présents</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{absentCount}</p>
                  <p className="text-sm text-muted-foreground">Absents</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{excusedCount}</p>
                  <p className="text-sm text-muted-foreground">Excusés</p>
                </CardContent>
              </Card>
            </div>

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Étudiants</CardTitle>
                <CardDescription>Tous les étudiants sont marqués présents par défaut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => {
                    const status = attendance[student.id] || "present"
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleAttendance(student.id)}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all min-h-[80px] ${
                          status === "present"
                            ? "border-success bg-success/5 hover:bg-success/10"
                            : status === "absent"
                              ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
                              : "border-warning bg-warning/5 hover:bg-warning/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={student.photo || "/placeholder.svg"}
                            alt={student.name}
                            className="h-12 w-12 rounded-full bg-muted"
                          />
                          <div>
                            <p className="font-medium text-foreground text-lg">{student.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">{getAttendanceLabel(status)}</p>
                              {student.paymentStatus === "overdue" && (
                                <Badge variant="outline" className="text-xs text-destructive border-destructive">
                                  Paiement en retard
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">{getAttendanceIcon(status)}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button size="lg" className="w-full h-14 text-lg">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Soumettre la Présence
            </Button>

            {/* Instructions */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Tapez sur un étudiant pour changer son statut</li>
                  <li>• Présent (vert) → Absent (rouge) → Excusé (orange) → Présent</li>
                  <li>• Les étudiants avec paiements en retard sont marqués d'un badge</li>
                  <li>• Cliquez sur "Soumettre" pour enregistrer la présence</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
