import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Plus, Search, Mail, Phone, Eye, BookOpen } from "lucide-react"
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
const teachers = [
  {
    id: 1,
    name: "Dr. Samba Keita",
    email: "samba.keita@gspn.edu",
    phone: "+224 621 111 222",
    subject: "Mathematics",
    classes: ["Grade 10-A", "Grade 11-A"],
    hireDate: "2020-09-01",
    status: "active",
    avatar: "SK"
  },
  {
    id: 2,
    name: "Prof. Mariama Diallo",
    email: "mariama.diallo@gspn.edu",
    phone: "+224 622 222 333",
    subject: "Physics",
    classes: ["Grade 11-B", "Grade 12-A"],
    hireDate: "2019-09-01",
    status: "active",
    avatar: "MD"
  },
  {
    id: 3,
    name: "Mr. Boubacar Bah",
    email: "boubacar.bah@gspn.edu",
    phone: "+224 623 333 444",
    subject: "English",
    classes: ["Grade 9-A", "Grade 9-B", "Grade 10-B"],
    hireDate: "2021-09-01",
    status: "active",
    avatar: "BB"
  },
  {
    id: 4,
    name: "Mrs. Fatoumata Sow",
    email: "fatoumata.sow@gspn.edu",
    phone: "+224 624 444 555",
    subject: "French",
    classes: ["Grade 8-A", "Grade 8-B"],
    hireDate: "2022-09-01",
    status: "active",
    avatar: "FS"
  },
  {
    id: 5,
    name: "Mr. Alpha Conde",
    email: "alpha.conde@gspn.edu",
    phone: "+224 625 555 666",
    subject: "Chemistry",
    classes: ["Grade 11-C", "Grade 12-B"],
    hireDate: "2018-09-01",
    status: "active",
    avatar: "AC"
  },
  {
    id: 6,
    name: "Ms. Kadiatou Barry",
    email: "kadiatou.barry@gspn.edu",
    phone: "+224 626 666 777",
    subject: "History",
    classes: ["Grade 9-C", "Grade 10-A"],
    hireDate: "2023-09-01",
    status: "active",
    avatar: "KB"
  },
]

export function Teachers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || teacher.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Teachers</h1>
        <p className="text-muted-foreground">
          Manage teacher profiles and assignments
        </p>
      </div>

      {/* Main Content */}
      <ContentCard
        title={`All Teachers (${filteredTeachers.length})`}
        description="View and manage teacher information"
        headerAction={
          <Button>
            <Plus className={`${sizing.icon.sm} mr-2`} />
            Add Teacher
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
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="History">History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Teachers Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={sizing.avatar.md}>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {teacher.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {teacher.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className={sizing.icon.xs} />
                        {teacher.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className={sizing.icon.xs} />
                        {teacher.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className={sizing.icon.xs} />
                      {teacher.subject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{teacher.hireDate}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
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