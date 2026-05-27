import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { educationSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { Prisma } from "@prisma/client";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = educationSchema.parse(body);

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

    const education = await prisma.education.update({
      where: { id: parseInt(id) },
      data: {
        ...sanitizedData,
        startDate: new Date(sanitizedData.startDate),
        endDate: sanitizedData.endDate ? new Date(sanitizedData.endDate) : null,
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error("Failed to update education:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update education"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    await prisma.education.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete education:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Education record not found" }, { status: 404 });
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to delete education"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
