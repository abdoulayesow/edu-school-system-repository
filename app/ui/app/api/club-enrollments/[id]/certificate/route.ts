import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { EnrollmentCertificate } from "@/components/club-enrollment/enrollment-certificate"
import React from "react"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/club-enrollments/[id]/certificate
 * Generate and download the enrollment certificate as PDF
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params
    const searchParams = req.nextUrl.searchParams
    const locale = searchParams.get("locale") || "en"

    // Fetch enrollment with all required data
    const enrollment = await prisma.clubEnrollment.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            category: {
              select: {
                name: true,
                nameFr: true,
              },
            },
          },
        },
        studentProfile: {
          include: {
            person: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
            currentGrade: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 })
    }

    // Only allow certificate generation for active enrollments
    if (enrollment.status !== "active") {
      return NextResponse.json(
        { message: "Certificate is only available for active enrollments" },
        { status: 400 }
      )
    }

    // Build the student full name
    const person = enrollment.studentProfile.person
    const studentName = [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ")

    // Get grade info
    const studentGrade = enrollment.studentProfile.currentGrade?.name || "N/A"

    // Get category name based on locale
    const categoryName = locale === "fr"
      ? enrollment.club.category?.nameFr || enrollment.club.category?.name || null
      : enrollment.club.category?.name || null

    // Generate enrollment number if not present
    const enrollmentNumber = enrollment.enrollmentNumber || `ENR-${enrollment.id.slice(0, 8).toUpperCase()}`

    // Create the certificate element
    const certificateElement = React.createElement(EnrollmentCertificate, {
      studentName,
      studentGrade,
      clubName: enrollment.club.name,
      clubNameFr: enrollment.club.nameFr,
      categoryName,
      enrollmentNumber,
      enrollmentDate: enrollment.createdAt.toISOString(),
      locale,
    })

    // Render the PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(certificateElement as any)

    // Create filename
    const sanitizedStudentName = studentName.replace(/[^a-zA-Z0-9]/g, "_")
    const sanitizedClubName = enrollment.club.name.replace(/[^a-zA-Z0-9]/g, "_")
    const filename = `Certificate_${sanitizedStudentName}_${sanitizedClubName}.pdf`

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer)

    // Return the PDF as a downloadable file
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error("Error generating certificate:", err)
    return NextResponse.json(
      { message: "Failed to generate certificate" },
      { status: 500 }
    )
  }
}
