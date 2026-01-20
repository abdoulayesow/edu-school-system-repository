import { Metadata } from "next"
import { ClubEnrollmentWizard } from "@/components/club-enrollment/club-enrollment-wizard"
import { ClubEnrollmentWizardProvider } from "@/components/club-enrollment/wizard-context"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"

export const metadata: Metadata = {
  title: "Club Enrollment | School Management",
  description: "Enroll students in extracurricular clubs",
}

export default function ClubEnrollPage() {
  return (
    <PermissionGuard resource="club-enrollments" action="create">
      <ClubEnrollmentWizardProvider>
        <ClubEnrollmentWizard />
      </ClubEnrollmentWizardProvider>
      <NoPermission
        resource="club-enrollments"
        action="create"
        description="You don't have permission to enroll students in clubs."
      />
    </PermissionGuard>
  )
}
