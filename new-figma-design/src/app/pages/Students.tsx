import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Plus, Search, Mail, Phone, Eye } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"

// Mock data
const students = [
  {
    id: 1,
    name: "Alice Camara",
    email: "alice.camara@example.com",
    phone: "+224 621 234 567",
    class: "Grade 10-A",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "AC"
  },
  {
    id: 2,
    name: "Mohamed Diallo",
    email: "mohamed.diallo@example.com",
    phone: "+224 622 345 678",
    class: "Grade 9-B",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "MD"
  },
  {
    id: 3,
    name: "Fatima Bah",
    email: "fatima.bah@example.com",
    phone: "+224 623 456 789",
    class: "Grade 11-C",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "FB"
  },
  {
    id: 4,
    name: "Ibrahim Sow",
    email: "ibrahim.sow@example.com",
    phone: "+224 624 567 890",
    class: "Grade 8-A",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "IS"
  },
  {
    id: 5,
    name: "Aissatou Diaby",
    email: "aissatou.diaby@example.com",
    phone: "+224 625 678 901",
    class: "Grade 10-B",
    enrollmentDate: "2024-09-01",
    status: "inactive",
    avatar: "AD"
  },
  {
    id: 6,
    name: "Mamadou Conte",
    email: "mamadou.conte@example.com",
    phone: "+224 626 789 012",
    class: "Grade 12-A",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "MC"
  },
  {
    id: 7,
    name: "Hadja Toure",
    email: "hadja.toure@example.com",
    phone: "+224 627 890 123",
    class: "Grade 9-A",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "HT"
  },
  {
    id: 8,
    name: "Thierno Barry",
    email: "thierno.barry@example.com",
    phone: "+224 628 901 234",
    class: "Grade 11-B",
    enrollmentDate: "2024-09-01",
    status: "active",
    avatar: "TB"
  },
]

export function Students() {
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = classFilter === "all" || student.class.includes(classFilter)
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    return matchesSearch && matchesClass && matchesStatus
  })

  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Students</h1>
        <p className="text-muted-foreground">
          Manage student records and information
        </p>
      </div>

      {/* Main Content */}
      <ContentCard
        title={`All Students (${filteredStudents.length})`}
        description="View and manage student profiles"
        headerAction={
          <Button>
            <Plus className={`${sizing.icon.sm} mr-2`} />
            Add Student
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={sizing.avatar.md}>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {student.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className={sizing.icon.xs} />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className={sizing.icon.xs} />
                        {student.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.class}</Badge>
                  </TableCell>
                  <TableCell>{student.enrollmentDate}</TableCell>
                  <TableCell>
                    {student.status === 'active' ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className={sizing.icon.sm} />
                    </Button>
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