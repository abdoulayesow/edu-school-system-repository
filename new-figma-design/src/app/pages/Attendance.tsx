import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Download } from "lucide-react"
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
import { Calendar } from "@/app/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data
const attendanceStats = [
  {
    title: "Present Today",
    value: "1,156",
    total: "1,248",
    percentage: "92.6%",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400"
  },
  {
    title: "Absent Today",
    value: "67",
    total: "1,248",
    percentage: "5.4%",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400"
  },
  {
    title: "Late Today",
    value: "25",
    total: "1,248",
    percentage: "2.0%",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400"
  }
]

const attendanceRecords = [
  {
    id: 1,
    student: "Alice Camara",
    class: "Grade 10-A",
    date: "2024-12-29",
    status: "present",
    checkInTime: "07:45 AM"
  },
  {
    id: 2,
    student: "Mohamed Diallo",
    class: "Grade 9-B",
    date: "2024-12-29",
    status: "absent",
    checkInTime: null
  },
  {
    id: 3,
    student: "Fatima Bah",
    class: "Grade 11-C",
    date: "2024-12-29",
    status: "present",
    checkInTime: "07:50 AM"
  },
  {
    id: 4,
    student: "Ibrahim Sow",
    class: "Grade 8-A",
    date: "2024-12-29",
    status: "late",
    checkInTime: "08:15 AM"
  },
  {
    id: 5,
    student: "Aissatou Diaby",
    class: "Grade 10-B",
    date: "2024-12-29",
    status: "present",
    checkInTime: "07:40 AM"
  },
  {
    id: 6,
    student: "Mamadou Conte",
    class: "Grade 12-A",
    date: "2024-12-29",
    status: "present",
    checkInTime: "07:55 AM"
  },
  {
    id: 7,
    student: "Hadja Toure",
    class: "Grade 9-A",
    date: "2024-12-29",
    status: "absent",
    checkInTime: null
  },
  {
    id: 8,
    student: "Thierno Barry",
    class: "Grade 11-B",
    date: "2024-12-29",
    status: "late",
    checkInTime: "08:20 AM"
  },
]

export function Attendance() {
  const [date, setDate] = useState<Date>(new Date())
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesClass = classFilter === "all" || record.class.includes(classFilter)
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesClass && matchesStatus
  })

  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Tracking</h1>
        <p className="text-muted-foreground">
          Monitor and manage student attendance records
        </p>
      </div>

      {/* Attendance Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {attendanceStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={cn(sizing.icon.lg, stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  <span className="text-sm text-muted-foreground ml-1">/ {stat.total}</span>
                </div>
                <p className={cn("text-xs", stat.color)}>
                  {stat.percentage} of total students
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <ContentCard
        title="Attendance Records"
        description={`Viewing records for ${format(date, "MMMM dd, yyyy")}`}
        headerAction={
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className={`${sizing.icon.sm} mr-2`} />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button>
              <Download className={`${sizing.icon.sm} mr-2`} />
              Export
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="Grade 8">Grade 8</SelectItem>
              <SelectItem value="Grade 9">Grade 9</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attendance Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.class}</Badge>
                  </TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    {record.checkInTime ? (
                      <span className="text-sm">{record.checkInTime}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.status === 'present' && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
                        Present
                      </Badge>
                    )}
                    {record.status === 'absent' && (
                      <Badge variant="destructive">
                        <XCircle className={`${sizing.icon.xs} mr-1`} />
                        Absent
                      </Badge>
                    )}
                    {record.status === 'late' && (
                      <Badge variant="secondary" className="bg-amber-500 text-white">
                        <Clock className={`${sizing.icon.xs} mr-1`} />
                        Late
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ContentCard>
    </PageContainer>
  )
}