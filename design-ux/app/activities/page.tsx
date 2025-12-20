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

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    {
      id: 1,
      name: "Club d'Anglais",
      type: "extracurricular",
      teacher: "Amadou Diallo",
      enrolled: 24,
      capacity: 30,
    },
    {
      id: 2,
      name: "Mathématiques Avancées",
      type: "curricular",
      teacher: "Fatoumata Sow",
      enrolled: 28,
      capacity: 30,
    },
    {
      id: 3,
      name: "Football",
      type: "extracurricular",
      teacher: "Ibrahim Conte",
      enrolled: 32,
      capacity: 35,
    },
    {
      id: 4,
      name: "Sciences Physiques",
      type: "curricular",
      teacher: "Mariama Bah",
      enrolled: 26,
      capacity: 30,
    },
    {
      id: 5,
      name: "Club de Lecture",
      type: "extracurricular",
      teacher: "Aissata Camara",
      enrolled: 18,
      capacity: 25,
    },
    {
      id: 6,
      name: "Informatique",
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
    <div className="min-h-screen bg-background pt-20 lg:pt-20">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Activités</h1>
          <p className="text-muted-foreground">Gérer les activités scolaires et extrascolaires</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="curricular">Scolaires</TabsTrigger>
            <TabsTrigger value="extracurricular">Extrascolaires</TabsTrigger>
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
                        {activity.type === "curricular" ? "Scolaire" : "Extra"}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Enseignant:</span>
                        <span className="font-medium text-foreground">{activity.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {activity.enrolled}/{activity.capacity} étudiants
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
                          Assigner un Étudiant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assigner un Étudiant</DialogTitle>
                          <DialogDescription>Recherchez et ajoutez un étudiant à {activity.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Rechercher un étudiant par nom ou ID..." className="pl-10" />
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
                                    <AlertCircle className="h-4 w-4 text-warning" title="Paiements en retard" />
                                  )}
                                  <Button size="sm">Ajouter</Button>
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
                          Scolaire
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Enseignant:</span>
                          <span className="font-medium text-foreground">{activity.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {activity.enrolled}/{activity.capacity} étudiants
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Assigner un Étudiant
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
                          Extra
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Enseignant:</span>
                          <span className="font-medium text-foreground">{activity.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {activity.enrolled}/{activity.capacity} étudiants
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Assigner un Étudiant
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
