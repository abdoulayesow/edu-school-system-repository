import { User, Period, Activity, Student, Payment } from "./schema";

// #region Sample Data

export const sampleUsers: User[] = [
  { id: 1, email: "ousmane.d@gspn.edu", first_name: "Ousmane", last_name: "Diop", role: "director", avatar_url: "/placeholder-user.jpg" },
  { id: 2, email: "mariama.b@gspn.edu", first_name: "Mariama", last_name: "Ba", role: "secretary" },
  { id: 3, email: "ibrahima.k@gspn.edu", first_name: "Ibrahima", last_name: "Keita", role: "accountant" },
  { id: 4, email: "amadou.s@gspn.edu", first_name: "Amadou", last_name: "Sow", role: "teacher", avatar_url: "/placeholder-user.jpg" },
  { id: 5, email: "fatoumata.g@gspn.edu", first_name: "Fatoumata", last_name: "Gaye", role: "academic_director" },
  { id: 6, email: "aisha.c@gspn.edu", first_name: "Aisha", last_name: "Camara", role: "teacher" },
];

export const samplePeriods: Period[] = [
  { id: 1, name: "2023-2024", start_date: "2023-09-01", end_date: "2024-06-30", is_active: false },
  { id: 2, name: "2024-2025", start_date: "2024-09-01", end_date: "2025-06-30", is_active: true },
];

export const sampleActivities: Activity[] = [
    { id: 101, name: "6ème A", type: 'class', teacher_id: 4, period_id: 2 },
    { id: 102, name: "5ème B", type: 'class', teacher_id: 6, period_id: 2 },
    { id: 103, name: "Terminale L2", type: 'class', teacher_id: 4, period_id: 2 },
    { id: 201, name: "Football Club", type: 'club', teacher_id: 4, period_id: 2, description: "Boys football team practice" },
    { id: 202, name: "STEM Club", type: 'club', teacher_id: 6, period_id: 2, description: "Science and technology projects" },
];


export const sampleStudents: Student[] = [
  { id: 1001, first_name: "Mamadou", last_name: "Diallo", date_of_birth: "2012-05-10", guardian_name: "Hassan Diallo", guardian_phone: "77 123 45 67", guardian_email: "h.diallo@email.com", status: "active", class_id: 101, enrollment_date: "2024-09-05", balance: -50000, avatar_url: "/placeholder-user.jpg" },
  { id: 1002, first_name: "Aissatou", last_name: "Ndiaye", date_of_birth: "2011-11-22", guardian_name: "Fatou Ndiaye", guardian_phone: "78 234 56 78", guardian_email: "f.ndiaye@email.com", status: "active", class_id: 102, enrollment_date: "2024-09-05", balance: 0 },
  { id: 1003, first_name: "Cheikh", last_name: "Fall", date_of_birth: "2013-01-30", guardian_name: "Moussa Fall", guardian_phone: "76 345 67 89", guardian_email: "m.fall@email.com", status: "active", class_id: 101, enrollment_date: "2024-09-06", balance: 150000 },
  { id: 1004, first_name: "Khadija", last_name: "Sylla", date_of_birth: "2007-08-15", guardian_name: "Aminata Sylla", guardian_phone: "70 456 78 90", guardian_email: "a.sylla@email.com", status: "active", class_id: 103, enrollment_date: "2024-09-07", balance: 0 },
  { id: 1005, first_name: "Oumar", last_name: "Traoré", date_of_birth: "2012-03-25", guardian_name: "Adama Traoré", guardian_phone: "77 567 89 01", guardian_email: "a.traore@email.com", status: "withdrawn", class_id: 102, enrollment_date: "2023-09-10", balance: 0 },
  { id: 1006, first_name: "Marietou", last_name: "Cissé", date_of_birth: "2011-06-18", guardian_name: "Coumba Cissé", guardian_phone: "78 678 90 12", guardian_email: "c.cisse@email.com", status: "pending", class_id: 102, enrollment_date: "2024-08-20", balance: 300000 },
];

export const samplePayments: Payment[] = [
    { id: 2001, student_id: 1001, period_id: 2, amount: 150000, status: "paid", category: "tuition", due_date: "2024-10-01", paid_at: "2024-09-28", transaction_id: "TXN12345", description: "First installment" },
    { id: 2002, student_id: 1001, period_id: 2, amount: 50000, status: "overdue", category: "transport", due_date: "2024-11-01", description: "November transport fee" },
    { id: 2003, student_id: 1002, period_id: 2, amount: 150000, status: "paid", category: "tuition", due_date: "2024-10-01", paid_at: "2024-09-30", transaction_id: "TXN12346", description: "First installment" },
    { id: 2004, student_id: 1003, period_id: 2, amount: 150000, status: "pending", category: "tuition", due_date: "2024-10-01", description: "First installment" },
    { id: 2005, student_id: 1004, period_id: 2, amount: 300000, status: "paid", category: "tuition", due_date: "2024-10-15", paid_at: "2024-10-10", transaction_id: "TXN12347", description: "Full year tuition" },
    { id: 2006, student_id: 1006, period_id: 2, amount: 300000, status: "pending", category: "fees", due_date: "2024-09-01", description: "Registration & enrollment fees" },
];
