import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/payments/next-receipt-number
 * Generate the next receipt number based on payment method and current year
 * Format: GSPN-2025-CASH-00001 or GSPN-2025-OM-00001
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const method = searchParams.get("method")

  if (!method || !["cash", "orange_money"].includes(method)) {
    return NextResponse.json(
      { message: "Invalid payment method. Must be 'cash' or 'orange_money'" },
      { status: 400 }
    )
  }

  try {
    const currentYear = new Date().getFullYear()
    const prefix = method === "cash" ? "CASH" : "OM"
    const pattern = `GSPN-${currentYear}-${prefix}-%`

    // Find the highest receipt number for this year and method
    const lastPayment = await prisma.payment.findFirst({
      where: {
        receiptNumber: {
          startsWith: `GSPN-${currentYear}-${prefix}-`,
        },
      },
      orderBy: {
        receiptNumber: "desc",
      },
      select: {
        receiptNumber: true,
      },
    })

    let nextNumber = 1
    if (lastPayment?.receiptNumber) {
      // Extract the number from the end of the receipt number
      const match = lastPayment.receiptNumber.match(/-(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    // Format the next receipt number with zero-padding
    const nextReceiptNumber = `GSPN-${currentYear}-${prefix}-${nextNumber.toString().padStart(5, "0")}`

    return NextResponse.json({
      receiptNumber: nextReceiptNumber,
      method,
      year: currentYear,
      sequenceNumber: nextNumber,
    })
  } catch (err) {
    console.error("Error generating receipt number:", err)
    return NextResponse.json(
      { message: "Failed to generate receipt number" },
      { status: 500 }
    )
  }
}
