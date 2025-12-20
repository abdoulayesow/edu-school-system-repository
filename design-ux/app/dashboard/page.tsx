"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Users, DollarSign, AlertTriangle, TrendingUp, FileText, CheckCircle2, Clock, BarChart3 } from "lucide-react"
import { Bar, BarChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts"

export default function DirectorDashboard() {
  const enrollmentData = [
    { grade: "6ème", count: 95 },
    { grade: "7ème", count: 102 },
    { grade: "8ème", count: 98 },
    { grade: "9ème", count: 89 },
    { grade: "10ème", count: 87 },
    { grade: "11ème", count: 76 },
    { grade: "12ème", count: 68 },
  ]

  const revenueData = [
    { category: "Scolarité", value: 45000000, color: "hsl(var(--chart-1))" },
    { category: "Activités Extra", value: 12000000, color: "hsl(var(--chart-2))" },
    { category: "Cantine", value: 8500000, color: "hsl(var(--chart-3))" },
    { category: "Transport", value: 6200000, color: "hsl(var(--chart-4))" },
  ]

  const pendingApprovals = [
    {
      id: 1,
      type: "Remise de Paiement",
      student: "Fatoumata Diallo",
      submittedBy: "Ibrahima Bah (Comptable)",
      date: "2024-12-18",
      reason: "Situation familiale difficile - demande 20% réduction",
      amount: "150,000 GNF",
    },
    {
      id: 2,
      type: "Inscription Tardive",
      student: "Mamadou Sylla",
      submittedBy: "Mariama Camara (Secrétaire)",
      date: "2024-12-17",
      reason: "Transfert d'une autre école - documents en règle",
      amount: null,
    },
    {
      id: 3,
      type: "Annulation de Frais",
      student: "Aminata Touré",
      submittedBy: "Ibrahima Bah (Comptable)",
      date: "2024-12-17",
      reason: "Erreur de facturation - double paiement",
      amount: "200,000 GNF",
    },
    {
      id: 4,
      type: "Plan de Paiement",
      student: "Oumar Keita",
      submittedBy: "Ibrahima Bah (Comptable)",
      date: "2024-12-16",
      reason: "Étalement sur 3 mois demandé",
      amount: "450,000 GNF",
    },
    {
      id: 5,
      type: "Modification d'Activité",
      student: "Aissata Conte",
      submittedBy: "Mariama Camara (Secrétaire)",
      date: "2024-12-16",
      reason: "Changement de club sportif",
      amount: null,
    },
  ]

  const recentActivity = [
    {
      action: "Période Financière Clôturée",
      user: "Ibrahima Bah",
      time: "Il y a 2 heures",
      type: "success",
    },
    {
      action: "Inscription en Masse Traitée (23 étudiants)",
      user: "Mariama Camara",
      time: "Il y a 4 heures",
      type: "info",
    },
    {
      action: "Rapport Académique Généré",
      user: "Fatoumata Diallo",
      time: "Il y a 5 heures",
      type: "info",
    },
    {
      action: "Discordance Bancaire Signalée",
      user: "Ibrahima Bah",
      time: "Hier à 16:30",
      type: "warning",
    },
    {
      action: "Validation de 12 Paiements",
      user: "Ibrahima Bah",
      time: "Hier à 14:20",
      type: "success",
    },
  ]

  const chartConfig = {
    count: {
      label: "Étudiants",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-20">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord du Directeur</h1>
          <p className="text-muted-foreground">Bonjour, Ousmane Sylla</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inscription Totale</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">615</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+5% vs mois dernier</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenu (Cette Période)</CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">71.7M GNF</div>
              <p className="text-xs text-muted-foreground mt-1">En attente: 8.2M GNF</p>
            </CardContent>
          </Card>

          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-warning">Approbations en Attente</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">5</div>
              <Button variant="link" className="p-0 h-auto text-xs text-warning hover:text-warning/80 mt-1">
                Voir les exceptions →
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Drapeaux de Réconciliation</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">2</div>
              <p className="text-xs text-destructive/80 mt-1">Nécessite attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Tickets d'Exception en Attente
              </CardTitle>
              <CardDescription>Demandes nécessitant votre approbation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.slice(0, 5).map((approval) => (
                  <div key={approval.id} className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {approval.type}
                        </Badge>
                        {approval.amount && (
                          <span className="text-sm font-semibold text-foreground">{approval.amount}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{approval.student}</p>
                      <p className="text-xs text-muted-foreground">{approval.reason}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <span>Par: {approval.submittedBy}</span>
                        <span>•</span>
                        <span>{approval.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="h-8">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approuver
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 bg-transparent">
                        Réviser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Activité Récente
              </CardTitle>
              <CardDescription>Événements importants et actions du système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-success"
                          : activity.type === "warning"
                            ? "bg-warning"
                            : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4">
                Voir tout l'historique
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Inscriptions par Niveau
              </CardTitle>
              <CardDescription>Répartition des étudiants par classe</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={enrollmentData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Revenu par Catégorie
              </CardTitle>
              <CardDescription>Distribution des revenus par type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={revenueData}
                    cx={150}
                    cy={150}
                    labelLine={false}
                    label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString()} GNF`} hideLabel />
                    }
                  />
                </PieChart>
              </div>
              <Button variant="link" className="w-full mt-4">
                Voir tous les rapports
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
