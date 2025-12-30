import { useState } from "react"
import { ThemeProvider } from "./components/ThemeProvider"
import { Navigation } from "./components/Navigation"
import { Dashboard, Students, Teachers, Accounting, Attendance, Profile } from "./pages"

type Page = 'dashboard' | 'students' | 'teachers' | 'accounting' | 'attendance' | 'profile'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'students':
        return <Students />
      case 'teachers':
        return <Teachers />
      case 'accounting':
        return <Accounting />
      case 'attendance':
        return <Attendance />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </ThemeProvider>
  )
}