import { redirect } from 'next/navigation'

export default function TreasuryTransactionsRedirect() {
  redirect('/accounting/safe/transactions')
}
