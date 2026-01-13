import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/payments/next-receipt-number
 * Generate the next receipt number based on payment method and current year
 * Format: GSPN-2025-CASH-00001 or GSPN-2025-OM-00001
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("receipts", "view")
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
    let nextReceiptNumber = `GSPN-${currentYear}-${prefix}-${nextNumber.toString().padStart(5, "0")}`

    // Ensure uniqueness by checking if the generated number already exists
    let attempts = 0
    const maxAttempts = 100
    while (attempts < maxAttempts) {
      const existing = await prisma.payment.findUnique({
        where: { receiptNumber: nextReceiptNumber },
        select: { id: true },
      })

      if (!existing) {
        // Number is unique, break out of loop
        break
      }

      // Number exists, increment and try again
      nextNumber++
      nextReceiptNumber = `GSPN-${currentYear}-${prefix}-${nextNumber.toString().padStart(5, "0")}`
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { message: "Failed to generate unique receipt number after multiple attempts" },
        { status: 500 }
      )
    }

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
