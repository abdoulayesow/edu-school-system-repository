import { CenteredFormPage } from "@/components/layout/CenteredFormPage"

export default function UnauthorizedPage() {
  return (
    <CenteredFormPage maxWidth="sm">
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    </CenteredFormPage>
  )
}
