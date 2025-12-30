import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Users, DollarSign, AlertTriangle, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { sizing } from "@/lib/design-tokens"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"

// Mock data
const stats = [
  {
    title: "Total Students",
    value: "1,248",
    change: "+12% from last month",
    icon: Users,
    trend: "up"
  },
  {
    title: "Total Revenue",
    value: "45.2M GNF",
    change: "+8% from last month",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "Pending Payments",
    value: "127",
    change: "23 due this week",
    icon: AlertTriangle,
    trend: "warning"
  },
  {
    title: "Active Teachers",
    value: "86",
    change: "+3 new this month",
    icon: TrendingUp,
    trend: "up"
  }
]

const recentEnrollments = [
  { id: 1, student: "Alice Camara", class: "Grade 10-A", date: "2024-12-28", status: "approved" },
  { id: 2, student: "Mohamed Diallo", class: "Grade 9-B", date: "2024-12-27", status: "pending" },
  { id: 3, student: "Fatima Bah", class: "Grade 11-C", date: "2024-12-27", status: "approved" },
  { id: 4, student: "Ibrahim Sow", class: "Grade 8-A", date: "2024-12-26", status: "approved" },
  { id: 5, student: "Aissatou Diaby", class: "Grade 10-B", date: "2024-12-26", status: "pending" },
]

const pendingPayments = [
  { id: 1, student: "John Doe", amount: "500,000 GNF", dueDate: "2024-12-30", status: "overdue" },
  { id: 2, student: "Jane Smith", amount: "450,000 GNF", dueDate: "2025-01-02", status: "upcoming" },
  { id: 3, student: "Bob Johnson", amount: "500,000 GNF", dueDate: "2025-01-05", status: "upcoming" },
]

export function Dashboard() {
  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your school management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={sizing.icon.lg} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                  stat.trend === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                  'text-muted-foreground'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Enrollments */}
        <ContentCard
          title="Recent Enrollments"
          description="Latest student registrations"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.student}</TableCell>
                  <TableCell>{enrollment.class}</TableCell>
                  <TableCell>{enrollment.date}</TableCell>
                  <TableCell>
                    {enrollment.status === 'approved' ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className={`${sizing.icon.xs} mr-1`} />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>

        {/* Pending Payments */}
        <ContentCard
          title="Pending Payments"
          description="Outstanding student fees"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.student}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>
                    {payment.status === 'overdue' ? (
                      <Badge variant="destructive">
                        <AlertTriangle className={`${sizing.icon.xs} mr-1`} />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className={`${sizing.icon.xs} mr-1`} />
                        Upcoming
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      </div>
    </PageContainer>
  )
}