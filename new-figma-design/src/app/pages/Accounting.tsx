import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import {
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Download,
} from "lucide-react"
import { sizing } from "@/lib/design-tokens"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

// Mock data
const financialSummary = [
  {
    title: "Total Revenue",
    value: "125.4M GNF",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "Pending Payments",
    value: "18.2M GNF",
    change: "127 invoices",
    icon: Clock,
    trend: "warning"
  },
  {
    title: "Collected This Month",
    value: "32.8M GNF",
    change: "+8.2%",
    icon: CheckCircle2,
    trend: "up"
  },
  {
    title: "Overdue",
    value: "5.6M GNF",
    change: "23 invoices",
    icon: AlertCircle,
    trend: "down"
  }
]

const transactions = [
  { 
    id: "INV-2024-1248",
    student: "Alice Camara",
    class: "Grade 10-A",
    amount: "500,000 GNF",
    dueDate: "2024-12-30",
    status: "paid",
    paidDate: "2024-12-28",
    method: "Mobile Money"
  },
  {
    id: "INV-2024-1247",
    student: "Mohamed Diallo",
    class: "Grade 9-B",
    amount: "450,000 GNF",
    dueDate: "2024-12-29",
    status: "pending",
    paidDate: null,
    method: null
  },
  {
    id: "INV-2024-1246",
    student: "Fatima Bah",
    class: "Grade 11-C",
    amount: "550,000 GNF",
    dueDate: "2024-12-25",
    status: "overdue",
    paidDate: null,
    method: null
  },
  {
    id: "INV-2024-1245",
    student: "Ibrahim Sow",
    class: "Grade 8-A",
    amount: "400,000 GNF",
    dueDate: "2024-12-27",
    status: "paid",
    paidDate: "2024-12-26",
    method: "Cash"
  },
  {
    id: "INV-2024-1244",
    student: "Aissatou Diaby",
    class: "Grade 10-B",
    amount: "500,000 GNF",
    dueDate: "2025-01-05",
    status: "pending",
    paidDate: null,
    method: null
  },
]

const expenses = [
  { id: 1, category: "Salaries", amount: "45.2M GNF", date: "2024-12-25", status: "paid" },
  { id: 2, category: "Utilities", amount: "2.5M GNF", date: "2024-12-20", status: "paid" },
  { id: 3, category: "Supplies", amount: "1.8M GNF", date: "2024-12-18", status: "paid" },
  { id: 4, category: "Maintenance", amount: "3.2M GNF", date: "2024-12-15", status: "paid" },
]

export function Accounting() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Accounting & Finance</h1>
        <p className="text-muted-foreground">
          Manage payments, invoices, and financial records
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {financialSummary.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className={sizing.icon.lg} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className={`text-xs ${
                  item.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                  item.trend === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                  item.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground'
                }`}>
                  {item.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <ContentCard
            title="Payment Transactions"
            description="View and manage all student payment transactions"
            headerAction={
              <div className="flex gap-2">
                <Button>
                  <Download className={`${sizing.icon.sm} mr-2`} />
                  Export
                </Button>
                <Button>
                  <Plus className={`${sizing.icon.sm} mr-2`} />
                  New Invoice
                </Button>
              </div>
            }
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder="Search by student name or invoice ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell className="font-medium">{transaction.student}</TableCell>
                      <TableCell>{transaction.class}</TableCell>
                      <TableCell className="font-semibold">{transaction.amount}</TableCell>
                      <TableCell>{transaction.dueDate}</TableCell>
                      <TableCell>
                        {transaction.status === 'paid' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
                            Paid
                          </Badge>
                        )}
                        {transaction.status === 'pending' && (
                          <Badge variant="secondary">
                            <Clock className={`${sizing.icon.xs} mr-1`} />
                            Pending
                          </Badge>
                        )}
                        {transaction.status === 'overdue' && (
                          <Badge variant="destructive">
                            <AlertCircle className={`${sizing.icon.xs} mr-1`} />
                            Overdue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{transaction.method || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ContentCard>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <ContentCard
            title="School Expenses"
            description="Track and manage operational expenses"
            headerAction={
              <Button>
                <Plus className={`${sizing.icon.sm} mr-2`} />
                Add Expense
              </Button>
            }
          >
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell className="font-semibold">{expense.amount}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
                          Paid
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ContentCard>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <ContentCard
            title="Financial Reports"
            description="Generate and download financial reports"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Monthly Revenue Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed breakdown of monthly revenue
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className={`${sizing.icon.sm} mr-2`} />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Outstanding Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    List of all pending and overdue payments
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className={`${sizing.icon.sm} mr-2`} />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Expense Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Summary of all operational expenses
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className={`${sizing.icon.sm} mr-2`} />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ContentCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}