import { redirect } from "next/navigation"

// Redirect to new hierarchical route structure
export default function LegacyNewPaymentPage() {
  redirect("/accounting/payments/new")
}
