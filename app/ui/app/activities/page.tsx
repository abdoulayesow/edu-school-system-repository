"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Users, Plus, Search, AlertCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"

export default function ActivitiesPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    {
      id: 1,
      name: t.activities.englishClub,
      type: "extracurricular",
      teacher: "Amadou Diallo",
      enrolled: 24,
      capacity: 30,
    },
    {
      id: 2,
      name: t.activities.advancedMath,
      type: "curricular",
      teacher: "Fatoumata Sow",
      enrolled: 28,
      capacity: 30,
    },
    {
      id: 3,
      name: t.activities.football,
      type: "extracurricular",
      teacher: "Ibrahim Conte",
      enrolled: 32,
      capacity: 35,
    },
    {
      id: 4,
      name: t.activities.physics,
      type: "curricular",
      teacher: "Mariama Bah",
      enrolled: 26,
      capacity: 30,
    },
    {
      id: 5,
      name: t.activities.readingClub,
      type: "extracurricular",
      teacher: "Aissata Camara",
      enrolled: 18,
      capacity: 25,
    },
    {
      id: 6,
      name: t.activities.computerScience,
      type: "curricular",
      teacher: "Oumar Sylla",
      enrolled: 22,
      capacity: 25,
    },
  ]

  const mockStudents = [
    { id: "STU001", name: "Fatoumata Diallo", grade: "10ème", paymentStatus: "paid" },
    { id: "STU002", name: "Mamadou Sylla", grade: "11ème", paymentStatus: "overdue" },
    { id: "STU003", name: "Aminata Touré", grade: "9ème", paymentStatus: "paid" },
  ]

  return (
    <PageContainer maxWidth="full">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.activities.title}</h1>
          <p className="text-muted-foreground">{t.activities.subtitle}</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">{t.activities.tabAll}</TabsTrigger>
            <TabsTrigger value="curricular">{t.activities.tabAcademic}</TabsTrigger>
            <TabsTrigger value="extracurricular">{t.activities.tabExtra}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {activity.type === "curricular" ? (
                          <BookOpen className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-accent" />
                        )}
                        <CardTitle className="text-lg">{activity.name}</CardTitle>
                      </div>
                      <Badge variant={activity.type === "curricular" ? "default" : "secondary"} className="text-xs">
                        {activity.type === "curricular" ? t.activities.academic : t.activities.extra}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{t.common.teacher}:</span>
                        <span className="font-medium text-foreground">{activity.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {activity.enrolled}/{activity.capacity} {t.common.students}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog
                      open={openAssignStudent && selectedActivity === activity.name}
                      onOpenChange={setOpenAssignStudent}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedActivity(activity.name)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t.activities.assignStudent}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.activities.assignStudentTitle}</DialogTitle>
                          <DialogDescription>{t.activities.searchAndAdd} {activity.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder={t.activities.searchStudentPlaceholder} className="pl-10" />
                          </div>

                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {mockStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {student.id} • {student.grade}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {student.paymentStatus === "overdue" && (
                                    <AlertCircle
                                      className="h-4 w-4 text-warning"
                                      aria-label={t.activities.overduePayments}
                                    />
                                  )}
                                  <Button size="sm">{t.common.add}</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="curricular" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activities
                .filter((a) => a.type === "curricular")
                .map((activity) => (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {t.activities.academic}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{t.common.teacher}:</span>
                          <span className="font-medium text-foreground">{activity.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {activity.enrolled}/{activity.capacity} {t.common.students}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        {t.activities.assignStudent}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="extracurricular" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activities
                .filter((a) => a.type === "extracurricular")
                .map((activity) => (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-accent" />
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {t.activities.extra}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{t.common.teacher}:</span>
                          <span className="font-medium text-foreground">{activity.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {activity.enrolled}/{activity.capacity} {t.common.students}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        {t.activities.assignStudent}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
    </PageContainer>
  )
}
