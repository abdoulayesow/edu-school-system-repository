export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don’t have permission to access this page.
        </p>
      </div>
    </main>
  )
}
