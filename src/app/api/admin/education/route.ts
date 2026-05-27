import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { educationSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const skip = (page - 1) * limit;

    const [education, total] = await Promise.all([
      prisma.education.findMany({
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.education.count(),
    ]);

    return NextResponse.json({
      items: education,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch education:", error);
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = educationSchema.parse(body);

    // Validate startDate is not empty
    if (!validatedData.startDate || validatedData.startDate === "") {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      degree: sanitizeText(validatedData.degree),
      degreeTh: validatedData.degreeTh ? sanitizeText(validatedData.degreeTh) : undefined,
      institution: sanitizeText(validatedData.institution),
      fieldOfStudy: validatedData.fieldOfStudy
        ? sanitizeText(validatedData.fieldOfStudy)
        : undefined,
      fieldOfStudyTh: validatedData.fieldOfStudyTh
        ? sanitizeText(validatedData.fieldOfStudyTh)
        : undefined,
      description: validatedData.description ? sanitizeText(validatedData.description) : undefined,
      descriptionTh: validatedData.descriptionTh
        ? sanitizeText(validatedData.descriptionTh)
        : undefined,
    };

    const education = await prisma.education.create({
      data: {
        ...sanitizedData,
        startDate: new Date(sanitizedData.startDate),
        endDate:
          sanitizedData.endDate && sanitizedData.endDate !== ""
            ? new Date(sanitizedData.endDate)
            : null,
        gpa: sanitizedData.gpa && sanitizedData.gpa !== "" ? sanitizedData.gpa : null,
      },
    });

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error("Failed to create education:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create education"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
