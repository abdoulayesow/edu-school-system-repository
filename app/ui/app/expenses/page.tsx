"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Loader2,
  Receipt,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  MoreHorizontal,
  Check,
  X,
  DollarSign,
  Trash2,
  FileText,
  Building,
  Wrench,
  Zap,
  Users,
  Truck,
  Phone,
  HelpCircle
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate as formatDateUtil } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
}

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  method: string
  date: string
  vendorName?: string | null
  receiptUrl?: string | null
  status: string
  rejectionReason?: string | null
  createdAt: string
  approvedAt?: string | null
  paidAt?: string | null
  requester?: User | null
  approver?: User | null
}

interface Pagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

type ExpenseCategory = "supplies" | "maintenance" | "utilities" | "salary" | "transport" | "communication" | "other"
type ExpenseStatus = "pending" | "approved" | "rejected" | "paid"
type PaymentMethod = "cash" | "orange_money"

export default function ExpensesPage() {
  const { t, locale } = useI18n()

  // Hydration guard - prevents SSR/client mismatch with Radix IDs
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Data states
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Dialog states
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | "mark_paid" | "delete" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // New expense form - initialize date only on client to avoid hydration mismatch
  const [newExpense, setNewExpense] = useState({
    category: "" as ExpenseCategory | "",
    description: "",
    amount: "",
    method: "cash" as PaymentMethod,
    date: "",
    vendorName: "",
  })

  // Set the date on client mount
  useEffect(() => {
    setNewExpense(prev => ({
      ...prev,
      date: new Date().toISOString().split("T")[0]
    }))
  }, [])

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter !== "all") params.set("category", categoryFilter)

      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch expenses")

      const data = await response.json()
      setExpenses(data.expenses || [])
      setPagination(data.pagination || null)
    } catch (err) {
      console.error("Error fetching expenses:", err)
      setError("Failed to load expenses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [statusFilter, categoryFilter])

  // Client-side search filtering
  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses
    const query = searchQuery.toLowerCase()
    return expenses.filter(expense =>
      expense.description.toLowerCase().includes(query) ||
      expense.vendorName?.toLowerCase().includes(query) ||
      expense.requester?.name.toLowerCase().includes(query)
    )
  }, [expenses, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const pending = expenses.filter(e => e.status === "pending")
    const approved = expenses.filter(e => e.status === "approved")
    const paid = expenses.filter(e => e.status === "paid")
    const rejected = expenses.filter(e => e.status === "rejected")

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
    const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0)
    const approvedAmount = approved.reduce((sum, e) => sum + e.amount, 0)
    const paidAmount = paid.reduce((sum, e) => sum + e.amount, 0)

    return {
      total: expenses.length,
      pending: pending.length,
      approved: approved.length,
      paid: paid.length,
      rejected: rejected.length,
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
    }
  }, [expenses])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' GNF'
  }

  // Format date
  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString, locale)
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
      supplies: FileText,
      maintenance: Wrench,
      utilities: Zap,
      salary: Users,
      transport: Truck,
      communication: Phone,
      other: HelpCircle,
    }
    const Icon = icons[category] || HelpCircle
    return <Icon className="size-4" />
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      supplies: t.expenses.categories.supplies,
      maintenance: t.expenses.categories.maintenance,
      utilities: t.expenses.categories.utilities,
      salary: t.expenses.categories.salary,
      transport: t.expenses.categories.transport,
      communication: t.expenses.categories.communication,
      other: t.expenses.categories.other,
    }
    return categories[category] || category
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string; icon: React.ElementType }> = {
      pending: {
        className: "bg-warning/10 text-warning border-warning/30",
        label: t.expenses.pending,
        icon: Clock
      },
      approved: {
        className: "bg-primary/10 text-primary border-primary/30",
        label: t.expenses.approved,
        icon: CheckCircle
      },
      rejected: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: t.expenses.rejected,
        icon: XCircle
      },
      paid: {
        className: "bg-success/10 text-success border-success/30",
        label: t.expenses.paid,
        icon: CreditCard
      },
    }
    const { className, label, icon: Icon } = config[status] || config.pending
    return (
      <Badge variant="outline" className={className}>
        <Icon className="size-3 mr-1" />
        {label}
      </Badge>
    )
  }

  // Get payment method label
  const getMethodLabel = (method: string) => {
    return method === "orange_money" ? "Orange Money" : "Espèces"
  }

  // Handle create expense
  const handleCreateExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          method: newExpense.method,
          date: newExpense.date,
          vendorName: newExpense.vendorName || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to create expense")

      setIsNewExpenseOpen(false)
      setNewExpense({
        category: "",
        description: "",
        amount: "",
        method: "cash",
        date: new Date().toISOString().split("T")[0],
        vendorName: "",
      })
      fetchExpenses()
    } catch (err) {
      console.error("Error creating expense:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle expense action (approve, reject, mark_paid)
  const handleExpenseAction = async () => {
    if (!selectedExpense || !actionType) return

    try {
      setIsSubmitting(true)

      if (actionType === "delete") {
        const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete expense")
      } else {
        const body: Record<string, string> = { action: actionType }
        if (actionType === "reject" && rejectionReason) {
          body.rejectionReason = rejectionReason
        }

        const response = await fetch(`/api/expenses/${selectedExpense.id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!response.ok) throw new Error(`Failed to ${actionType} expense`)
      }

      setSelectedExpense(null)
      setActionType(null)
      setRejectionReason("")
      fetchExpenses()
    } catch (err) {
      console.error("Error processing expense action:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent hydration mismatch by not rendering interactive components until mounted
  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.expenses.title}</h1>
            <p className="text-muted-foreground">{t.expenses.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.expenses.title}</h1>
            <p className="text-muted-foreground">{t.expenses.subtitle}</p>
          </div>

          <Dialog open={isNewExpenseOpen} onOpenChange={setIsNewExpenseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                {t.expenses.newExpense}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t.expenses.newExpense}</DialogTitle>
                <DialogDescription>
                  {t.expenses.subtitle}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t.expenses.category} *</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value as ExpenseCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplies">{t.expenses.categories.supplies}</SelectItem>
                      <SelectItem value="maintenance">{t.expenses.categories.maintenance}</SelectItem>
                      <SelectItem value="utilities">{t.expenses.categories.utilities}</SelectItem>
                      <SelectItem value="salary">{t.expenses.categories.salary}</SelectItem>
                      <SelectItem value="transport">{t.expenses.categories.transport}</SelectItem>
                      <SelectItem value="communication">{t.expenses.categories.communication}</SelectItem>
                      <SelectItem value="other">{t.expenses.categories.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>{t.expenses.description} *</Label>
                  <Textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Description de la dépense..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t.common.amount} (GNF) *</Label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t.common.date}</Label>
                    <Input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Méthode de paiement</Label>
                    <Select
                      value={newExpense.method}
                      onValueChange={(value) => setNewExpense({ ...newExpense, method: value as PaymentMethod })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="orange_money">Orange Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t.expenses.vendor}</Label>
                    <Input
                      value={newExpense.vendorName}
                      onChange={(e) => setNewExpense({ ...newExpense, vendorName: e.target.value })}
                      placeholder="Nom du fournisseur"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewExpenseOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleCreateExpense}
                  disabled={isSubmitting || !newExpense.category || !newExpense.description || !newExpense.amount}
                >
                  {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                  {t.common.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="py-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="size-4" />
                Total dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.total} dépense(s)</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="size-4" />
                {t.expenses.pending}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pending} en attente</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="size-4" />
                {t.expenses.approved}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(stats.approvedAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.approved} approuvée(s)</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="size-4" />
                {t.expenses.paid}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(stats.paidAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.paid} payée(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par description, fournisseur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">{t.expenses.pending}</SelectItem>
                  <SelectItem value="approved">{t.expenses.approved}</SelectItem>
                  <SelectItem value="rejected">{t.expenses.rejected}</SelectItem>
                  <SelectItem value="paid">{t.expenses.paid}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="supplies">{t.expenses.categories.supplies}</SelectItem>
                  <SelectItem value="maintenance">{t.expenses.categories.maintenance}</SelectItem>
                  <SelectItem value="utilities">{t.expenses.categories.utilities}</SelectItem>
                  <SelectItem value="salary">{t.expenses.categories.salary}</SelectItem>
                  <SelectItem value="transport">{t.expenses.categories.transport}</SelectItem>
                  <SelectItem value="communication">{t.expenses.categories.communication}</SelectItem>
                  <SelectItem value="other">{t.expenses.categories.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des dépenses</CardTitle>
            <CardDescription>
              {filteredExpenses.length} dépense(s)
              {pagination && ` sur ${pagination.total}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.expenses.category}</TableHead>
                      <TableHead>{t.expenses.description}</TableHead>
                      <TableHead>{t.expenses.vendor}</TableHead>
                      <TableHead className="text-right">{t.common.amount}</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>{t.common.status}</TableHead>
                      <TableHead>Demandeur</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Aucune dépense enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm">
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(expense.category)}
                              <span>{getCategoryLabel(expense.category)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {expense.description}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {expense.vendorName || "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getMethodLabel(expense.method)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(expense.status)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {expense.requester?.name || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {expense.status === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedExpense(expense)
                                        setActionType("approve")
                                      }}
                                    >
                                      <Check className="size-4 mr-2" />
                                      {t.expenses.approveExpense}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedExpense(expense)
                                        setActionType("reject")
                                      }}
                                    >
                                      <X className="size-4 mr-2" />
                                      {t.expenses.rejectExpense}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedExpense(expense)
                                        setActionType("delete")
                                      }}
                                    >
                                      <Trash2 className="size-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {expense.status === "approved" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedExpense(expense)
                                      setActionType("mark_paid")
                                    }}
                                  >
                                    <CreditCard className="size-4 mr-2" />
                                    {t.expenses.markAsPaid}
                                  </DropdownMenuItem>
                                )}
                                {expense.status === "rejected" && expense.rejectionReason && (
                                  <DropdownMenuItem disabled>
                                    <span className="text-xs text-muted-foreground">
                                      Raison: {expense.rejectionReason}
                                    </span>
                                  </DropdownMenuItem>
                                )}
                                {(expense.status === "paid" || expense.status === "rejected") && (
                                  <DropdownMenuItem disabled>
                                    <span className="text-xs text-muted-foreground">
                                      Aucune action disponible
                                    </span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <AlertDialog
          open={!!selectedExpense && !!actionType}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedExpense(null)
              setActionType(null)
              setRejectionReason("")
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "approve" && t.expenses.approveExpense}
                {actionType === "reject" && t.expenses.rejectExpense}
                {actionType === "mark_paid" && t.expenses.markAsPaid}
                {actionType === "delete" && "Supprimer la dépense"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "approve" && (
                  <>
                    Voulez-vous approuver cette dépense de{" "}
                    <strong>{selectedExpense && formatCurrency(selectedExpense.amount)}</strong>?
                  </>
                )}
                {actionType === "reject" && (
                  <div className="space-y-4">
                    <p>Voulez-vous rejeter cette dépense?</p>
                    <div className="grid gap-2">
                      <Label>{t.expenses.rejectionReason} *</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Raison du rejet..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                {actionType === "mark_paid" && (
                  <>
                    Confirmer que cette dépense de{" "}
                    <strong>{selectedExpense && formatCurrency(selectedExpense.amount)}</strong>{" "}
                    a été payée?
                  </>
                )}
                {actionType === "delete" && (
                  <>
                    Voulez-vous supprimer cette dépense? Cette action est irréversible.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleExpenseAction}
                disabled={isSubmitting || (actionType === "reject" && !rejectionReason)}
                className={actionType === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                {actionType === "approve" && "Approuver"}
                {actionType === "reject" && "Rejeter"}
                {actionType === "mark_paid" && "Marquer payée"}
                {actionType === "delete" && "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </PageContainer>
  )
}
