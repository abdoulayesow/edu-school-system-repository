import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { ExpenseCategory } from "@prisma/client";

// GET /api/suppliers - Fetch suppliers with optional category filter
export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Build query based on category filter
    const suppliers = await prisma.supplier.findMany({
      where: category
        ? {
            OR: [
              { category: category as ExpenseCategory },
              { category: null }, // Include suppliers available for all categories
            ],
          }
        : {},
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        category: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    return NextResponse.json({ suppliers });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const createSupplierSchema = z.object({
      name: z.string().min(1, "Supplier name is required"),
      category: z
        .enum([
          "supplies",
          "maintenance",
          "utilities",
          "salary",
          "transport",
          "communication",
          "other",
        ])
        .optional()
        .nullable(),
      phone: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      address: z.string().optional().nullable(),
    });

    const body = await req.json();
    const validatedData = createSupplierSchema.parse(body);

    // Check if supplier already exists with same name and category
    const existing = await prisma.supplier.findFirst({
      where: {
        name: validatedData.name,
        category: validatedData.category as ExpenseCategory | null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A supplier with this name already exists for this category" },
        { status: 400 }
      );
    }

    // Create the supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: validatedData.name,
        category: validatedData.category as ExpenseCategory | null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
      },
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }

    console.error("Error creating supplier:", err);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
